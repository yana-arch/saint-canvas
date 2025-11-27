
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

class AIProviderManager {
  private providers: Map<AIProviderType, BaseAIProvider> = new Map();
  private credentials: Map<AIProviderType, string> = new Map();
  private defaultProvider: AIProviderType = 'google-gemini';

  constructor() {
    this.initializeProviders();
    this.loadStoredCredentials();
  }

  private initializeProviders(): void {
    this.providers.set('google-gemini', new GoogleGeminiProvider());
    this.providers.set('openai-dalle', new OpenAIProvider());
    this.providers.set('stability-ai', new StabilityAIProvider());
    this.providers.set('replicate', new ReplicateProvider());
    this.providers.set('together-ai', new TogetherAIProvider());
  }

  private loadStoredCredentials(): void {
    try {
      const stored = localStorage.getItem('ai-credentials');
      if (stored) {
        const creds = JSON.parse(stored) as ProviderCredentials[];
        creds.forEach(cred => {
          this.setApiKey(cred.provider, cred.apiKey);
        });
      }
    } catch (error) {
      console.warn('Failed to load stored credentials:', error);
    }
  }

  // Public Methods

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
    const p = this.providers.get(provider);
    if (p) {
      p.setApiKey(apiKey);
      this.credentials.set(provider, apiKey);
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
      this.saveCredentials();
    }
  }

  private saveCredentials(): void {
    const creds: ProviderCredentials[] = Array.from(this.credentials.entries())
      .map(([provider, apiKey]) => ({ provider, apiKey }));
    
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

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const provider = this.providers.get(request.provider);
    
    if (!provider) {
      throw new Error(`Provider ${request.provider} not found`);
    }

    if (!provider.isConfigured()) {
      throw new Error(`Provider ${request.provider} is not configured. Please add API key.`);
    }

    // Route to appropriate method based on mode
    switch (request.mode) {
      case 'inpainting':
        return provider.inpaint(request);
      case 'image-to-image':
        return provider.editImage(request);
      default:
        return provider.generate(request);
    }
  }
}

// Singleton instance
export const aiManager = new AIProviderManager();
export default aiManager;
