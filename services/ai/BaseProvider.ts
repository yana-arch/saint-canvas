
import {
  AIProviderConfig,
  GenerationRequest,
  GenerationResponse,
  GeneratedImage,
  GenerationMode,
} from './types';
import { CATHOLIC_ART_STYLES } from './presets/catholicStyles';

export abstract class BaseAIProvider {
  protected apiKey: string | null = null;
  protected config: AIProviderConfig;
  
  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  // Abstract methods - must implement
  abstract generate(request: GenerationRequest): Promise<GenerationResponse>;
  abstract validateApiKey(apiKey: string): Promise<boolean>;
  abstract getAvailableModels(): Promise<string[]>;
  
  // Optional overrides
  async editImage(request: GenerationRequest): Promise<GenerationResponse> {
    throw new Error(`${this.config.name} does not support image editing`);
  }
  
  async inpaint(request: GenerationRequest): Promise<GenerationResponse> {
    throw new Error(`${this.config.name} does not support inpainting`);
  }

  // Common methods
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  getConfig(): AIProviderConfig {
    return this.config;
  }

  isConfigured(): boolean {
    return !this.config.requiresApiKey || !!this.apiKey;
  }

  supportsMode(mode: GenerationMode): boolean {
    return this.config.supportedModes.includes(mode);
  }

  estimateCost(request: GenerationRequest): number {
    const model = this.config.models.find(m => m.id === request.model);
    if (!model?.costPerImage) return 0;
    return model.costPerImage * (request.numImages || 1);
  }

  // Enhance prompt with Catholic context
  protected enhancePrompt(prompt: string, styleId?: string): string {
    const baseEnhancement = 'sacred, religious, Catholic, holy, divine light, high quality';
    const styleObj = CATHOLIC_ART_STYLES.find(s => s.id === styleId);
    
    const stylePrompt = styleObj && styleObj.prompt ? `, ${styleObj.prompt}` : '';
    return `${prompt}, ${baseEnhancement}${stylePrompt}`;
  }

  // Convert base64 to standard format (strip prefix)
  protected async prepareImage(base64: string): Promise<string> {
    return base64.replace(/^data:image\/\w+;base64,/, '');
  }

  // Create standard response
  protected createResponse(
    images: GeneratedImage[],
    duration: number,
    request: GenerationRequest
  ): GenerationResponse {
    return {
      success: true,
      provider: this.config.id,
      model: request.model,
      images,
      metadata: {
        requestId: crypto.randomUUID(),
        timestamp: Date.now(),
        duration,
        cost: this.estimateCost(request),
      },
    };
  }

  // Create error response
  protected createErrorResponse(
    error: Error,
    request: GenerationRequest
  ): GenerationResponse {
    return {
      success: false,
      provider: this.config.id,
      model: request.model,
      images: [],
      metadata: {
        requestId: crypto.randomUUID(),
        timestamp: Date.now(),
        duration: 0,
      },
      error: {
        code: 'GENERATION_FAILED',
        message: error.message,
        retryable: this.isRetryableError(error),
      },
    };
  }

  protected isRetryableError(error: Error): boolean {
    const retryablePatterns = [
      'rate limit',
      'timeout',
      'temporarily unavailable',
      '503',
      '429',
      'quota',
    ];
    return retryablePatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    );
  }
}
