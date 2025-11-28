
import {
  AIProviderType,
  AIProviderConfig,
  GenerationRequest,
  GenerationResponse,
  ProviderCredentials,
} from './types';
import { BaseAIProvider } from './BaseProvider';

// Import all providers
import { GoogleGeminiProvider } from './providers/GoogleGeminiProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { StabilityAIProvider } from './providers/StabilityAIProvider';
import { ReplicateProvider } from './providers/ReplicateProvider';
import { TogetherAIProvider } from './providers/TogetherAIProvider';
import { DeepAIProvider } from './providers/DeepAIProvider';
import { HuggingFaceProvider } from './providers/HuggingFaceProvider';
import { ClipdropProvider } from './providers/ClipdropProvider';
import { ByteDanceAIGCProvider } from './providers/ByteDanceAIGCProvider';
import { RemoveBGProvider } from './providers/RemoveBGProvider';

interface RateLimitEntry {
  timestamp: number;
  count: number;
}

interface QueuedRequest {
  request: GenerationRequest;
  resolve: (response: GenerationResponse) => void;
  reject: (error: Error) => void;
  priority: 'high' | 'normal';
}

class AIProviderManager {
  private providers: Map<AIProviderType, BaseAIProvider> = new Map();
  private credentials: Map<AIProviderType, string> = new Map();
  private skipValidationFlags: Map<AIProviderType, boolean> = new Map();
  private defaultProvider: AIProviderType = 'google-gemini';

  // Rate limiting data
  private rateLimits: Map<AIProviderType, RateLimitEntry[]> = new Map();
  private requestQueues: Map<AIProviderType, QueuedRequest[]> = new Map();
  private processingQueue: boolean = false;

  constructor() {
    this.initializeProviders();
    this.loadStoredCredentials();
    this.startQueueProcessor();
  }

  private initializeProviders(): void {
    this.providers.set('google-gemini', new GoogleGeminiProvider());
    this.providers.set('openai-dalle', new OpenAIProvider());
    this.providers.set('stability-ai', new StabilityAIProvider());
    this.providers.set('replicate', new ReplicateProvider());
    this.providers.set('together-ai', new TogetherAIProvider());
    this.providers.set('deepai', new DeepAIProvider());
    this.providers.set('huggingface', new HuggingFaceProvider());
    this.providers.set('clipdrop', new ClipdropProvider());
    this.providers.set('bytedance-aigc', new ByteDanceAIGCProvider());
    this.providers.set('removebg', new RemoveBGProvider());
  }

  private loadStoredCredentials(): void {
    try {
      const stored = localStorage.getItem('ai-credentials');
      if (stored) {
        const creds = JSON.parse(stored) as ProviderCredentials[];
        creds.forEach(cred => {
          this.skipValidationFlags.set(cred.provider, cred.skipValidation || false);
          this.setApiKey(cred.provider, cred.apiKey);
        });
      }
    } catch (error) {
      console.warn('Failed to load stored credentials:', error);
    }
  }

  // Public Methods

  async removeBackground(request: GenerationRequest): Promise<GenerationResponse> {
    const provider = this.providers.get(request.provider);
    if (!provider) {
      throw new Error(`Provider ${request.provider} not found`);
    }

    if (!provider.isConfigured()) {
      throw new Error(`Provider ${request.provider} is not configured. Please add API key.`);
    }

    const startTime = Date.now();

    if (provider.removeBackground) {
      return provider.removeBackground(request);
    } else if (provider.editImage) {
      // Fallback: use image-to-image with background removal prompt
      const bgRemovalRequest: GenerationRequest = {
        ...request,
        mode: 'image-to-image',
        prompt: 'Remove the background, make it transparent, keep the main subject',
        strength: 0.8
      };
      return provider.editImage(bgRemovalRequest);
    } else {
      throw new Error('Background removal requires a provider that supports image-to-image editing');
    }
  }

  getProvider(type: AIProviderType): BaseAIProvider | undefined {
    return this.providers.get(type);
  }

  getAllProviders(): AIProviderConfig[] {
    return Array.from(this.providers.values()).map(p => p.getConfig());
  }

  getConfiguredProviders(): AIProviderConfig[] {
    return Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.isConfigured())
      .map(([_, provider]) => provider.getConfig());
  }

  setApiKey(provider: AIProviderType, apiKey: string): void {
    this.setApiKeyWithoutValidation(provider, apiKey, false);
  }

  setApiKeyWithoutValidation(provider: AIProviderType, apiKey: string, skipValidation: boolean = false): void {
    const p = this.providers.get(provider);
    if (p) {
      p.setApiKey(apiKey);
      this.credentials.set(provider, apiKey);
      this.skipValidationFlags.set(provider, skipValidation);
      this.saveCredentials();
    }
  }

  async validateApiKey(provider: AIProviderType, apiKey: string): Promise<boolean> {
    const p = this.providers.get(provider);
    if (!p) return false;
    return p.validateApiKey(apiKey);
  }

  removeApiKey(provider: AIProviderType): void {
    const p = this.providers.get(provider);
    if (p) {
      p.setApiKey('');
      this.credentials.delete(provider);
      this.skipValidationFlags.delete(provider);
      this.saveCredentials();
    }
  }

  private saveCredentials(): void {
    const creds: ProviderCredentials[] = Array.from(this.credentials.entries())
      .map(([provider, apiKey]) => ({
        provider,
        apiKey,
        skipValidation: this.skipValidationFlags.get(provider) || undefined
      }));

    // Note: In production, use secure storage, not localStorage
    localStorage.setItem('ai-credentials', JSON.stringify(creds));
  }

  setDefaultProvider(provider: AIProviderType): void {
    this.defaultProvider = provider;
    localStorage.setItem('default-ai-provider', provider);
  }

  getDefaultProvider(): AIProviderType {
    return localStorage.getItem('default-ai-provider') as AIProviderType || this.defaultProvider;
  }

  // Rate Limiting Methods
  private startQueueProcessor(): void {
    setInterval(() => {
      this.processQueues();
    }, 1000); // Process queues every second
  }

  private async processQueues(): Promise<void> {
    if (this.processingQueue) return;
    this.processingQueue = true;

    try {
      for (const [providerType, queue] of this.requestQueues.entries()) {
        if (queue.length === 0) continue;

        // Check if we can process a request for this provider
        if (this.canMakeRequest(providerType)) {
          const queuedRequest = queue.shift(); // Take first request
          if (queuedRequest) {
            try {
              const response = await this.executeRequest(queuedRequest.request);
              queuedRequest.resolve(response);
            } catch (error) {
              queuedRequest.reject(error as Error);
            }
          }
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  private canMakeRequest(providerType: AIProviderType): boolean {
    const provider = this.providers.get(providerType);
    if (!provider) return false;

    const config = provider.getConfig();
    if (!config.rateLimit) return true; // No rate limit configured

    const entries = this.rateLimits.get(providerType) || [];
    const now = Date.now();
    const windowMs = config.rateLimit.windowMs;

    // Clean old entries outside the window
    const validEntries = entries.filter(entry => now - entry.timestamp < windowMs);
    this.rateLimits.set(providerType, validEntries);

    // Check if we're under the limit
    const totalRequests = validEntries.reduce((sum, entry) => sum + entry.count, 0);
    return totalRequests < config.rateLimit.requestsPerWindow;
  }

  private recordRequest(providerType: AIProviderType): void {
    const entries = this.rateLimits.get(providerType) || [];
    const now = Date.now();

    // Find or create entry for current minute
    const minuteTimestamp = Math.floor(now / 60000) * 60000; // Round to nearest minute
    const existingEntry = entries.find(entry => entry.timestamp === minuteTimestamp);

    if (existingEntry) {
      existingEntry.count++;
    } else {
      entries.push({ timestamp: minuteTimestamp, count: 1 });
    }

    this.rateLimits.set(providerType, entries);
  }

  private async executeRequest(request: GenerationRequest): Promise<GenerationResponse> {
    // Validate provider
    const provider = this.providers.get(request.provider);
    if (!provider) {
      throw new Error(`Provider ${request.provider} not found`);
    }

    if (!provider.isConfigured()) {
      throw new Error(`Provider ${request.provider} is not configured. Please add API key.`);
    }

    // Record the request for rate limiting
    this.recordRequest(request.provider);

    // Route to appropriate method based on mode
    switch (request.mode) {
      case 'inpainting':
        return provider.inpaint(request);
      case 'image-to-image':
        return provider.editImage(request);
      case 'background-removal':
        return provider.removeBackground(request);
      default:
        return provider.generate(request);
    }
  }

  getRateLimitStatus(providerType: AIProviderType): { currentUsage: number; limit: number; remainingTime: number } | null {
    const provider = this.providers.get(providerType);
    if (!provider) return null;

    const config = provider.getConfig();
    if (!config.rateLimit) return null;

    const entries = this.rateLimits.get(providerType) || [];
    const now = Date.now();
    const windowMs = config.rateLimit.windowMs;

    // Clean old entries outside the window
    const validEntries = entries.filter(entry => now - entry.timestamp < windowMs);

    const totalRequests = validEntries.reduce((sum, entry) => sum + entry.count, 0);
    const remainingTime = validEntries.length > 0
      ? Math.max(0, windowMs - (now - validEntries[0].timestamp))
      : 0;

    return {
      currentUsage: totalRequests,
      limit: config.rateLimit.requestsPerWindow,
      remainingTime
    };
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        request,
        resolve,
        reject,
        priority: 'normal'
      };

      // Get or create queue for this provider
      const queue = this.requestQueues.get(request.provider) || [];
      queue.push(queuedRequest);
      this.requestQueues.set(request.provider, queue);

      // Try to process immediately if possible
      setTimeout(() => this.processQueues(), 0);
    });
  }
}

// Singleton instance
export const aiManager = new AIProviderManager();
export default aiManager;
