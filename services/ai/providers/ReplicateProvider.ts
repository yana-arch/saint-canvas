
import { BaseAIProvider } from '../BaseProvider';
import {
  AIProviderConfig,
  GenerationRequest,
  GenerationResponse,
  GeneratedImage,
} from '../types';

const REPLICATE_CONFIG: AIProviderConfig = {
  id: 'replicate',
  name: 'Replicate',
  description: 'Access to Flux, SDXL, and many open-source models',
  icon: 'replicate',
  supportedModes: ['text-to-image'],
  supportedSizes: ['1024x1024'],
  models: [
    {
      id: 'black-forest-labs/flux-schnell',
      name: 'Flux Schnell',
      description: 'Fast generation, good quality',
      capabilities: ['text-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 5,
      costPerImage: 0.003,
    },
    {
      id: 'black-forest-labs/flux-dev',
      name: 'Flux Dev',
      capabilities: ['text-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 20,
      costPerImage: 0.025,
    }
  ],
  requiresApiKey: true,
  pricingInfo: {
    currency: 'USD',
    pricePerImage: 0.01,
    billingUrl: 'https://replicate.com/account/billing',
  },
  rateLimit: {
    requestsPerMinute: 60,
    imagesPerRequest: 1,
  },
};

export class ReplicateProvider extends BaseAIProvider {
  private baseUrl = 'https://api.replicate.com/v1';

  constructor() {
    super(REPLICATE_CONFIG);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/account`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    return this.config.models.map(m => m.id);
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error('Replicate API key not configured');
    }

    const startTime = Date.now();

    try {
      const enhancedPrompt = this.enhancePrompt(request.prompt, request.style);
      
      const input = {
          prompt: enhancedPrompt,
          go_fast: true,
          output_format: 'png',
          aspect_ratio: '1:1'
      };

      // Create prediction
      const createResponse = await fetch(`${this.baseUrl}/models/${request.model}/predictions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.detail || 'Failed to create prediction');
      }

      const prediction = await createResponse.json();
      
      // Poll for result
      const result = await this.pollPrediction(prediction.id);
      
      if (result.status === 'failed') {
        throw new Error(result.error || 'Generation failed');
      }

      const outputs = Array.isArray(result.output) ? result.output : [result.output];
      
      const images: GeneratedImage[] = outputs.map((url: string) => ({
        id: crypto.randomUUID(),
        url, 
        width: request.width || 1024,
        height: request.height || 1024,
      }));

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      return this.createErrorResponse(error as Error, request);
    }
  }

  private async pollPrediction(id: string, maxAttempts = 60): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`${this.baseUrl}/predictions/${id}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      const prediction = await response.json();

      if (prediction.status === 'succeeded' || prediction.status === 'failed') {
        return prediction;
      }

      // Wait 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Prediction timeout');
  }
}

export default ReplicateProvider;
