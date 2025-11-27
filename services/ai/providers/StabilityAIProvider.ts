
import { BaseAIProvider } from '../BaseProvider';
import {
  AIProviderConfig,
  GenerationRequest,
  GenerationResponse,
  GeneratedImage,
} from '../types';

const STABILITY_CONFIG: AIProviderConfig = {
  id: 'stability-ai',
  name: 'Stability AI',
  description: 'Stable Diffusion and advanced image models',
  icon: 'stability',
  supportedModes: ['text-to-image', 'image-to-image'],
  supportedSizes: ['512x512', '1024x1024'],
  models: [
    {
      id: 'sd3.5-large',
      name: 'SD 3.5 Large',
      capabilities: ['text-to-image', 'image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 4,
      estimatedTime: 10,
      costPerImage: 0.065,
    },
    {
      id: 'stable-image-core',
      name: 'Stable Image Core',
      capabilities: ['text-to-image'],
      defaultSize: '1024x1024',
      maxImages: 4,
      estimatedTime: 8,
      costPerImage: 0.03,
    },
    {
      id: 'stable-image-ultra',
      name: 'Stable Image Ultra',
      description: 'Highest quality, photorealistic',
      capabilities: ['text-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 15,
      costPerImage: 0.08,
    },
  ],
  requiresApiKey: true,
  pricingInfo: {
    currency: 'USD',
    pricePerImage: 0.04,
    billingUrl: 'https://platform.stability.ai/account/credits',
  },
  rateLimit: {
    requestsPerMinute: 10,
    imagesPerRequest: 4,
  },
};

export class StabilityAIProvider extends BaseAIProvider {
  private baseUrl = 'https://api.stability.ai/v2beta';

  constructor() {
    super(STABILITY_CONFIG);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user/account`, {
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
      throw new Error('Stability AI API key not configured');
    }

    const startTime = Date.now();

    try {
      const enhancedPrompt = this.enhancePrompt(request.prompt, request.style);
      
      const endpoint = this.getEndpoint(request.model);
      
      const formData = new FormData();
      formData.append('prompt', enhancedPrompt);
      formData.append('output_format', 'png');
      
      if (request.model.includes('sd3')) {
        formData.append('model', request.model);
      }

      if (request.sourceImage && request.mode === 'image-to-image') {
        const res = await fetch(request.sourceImage);
        const blob = await res.blob();
        formData.append('image', blob);
        formData.append('strength', String(request.strength || 0.7));
      }

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'image/*',
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Generation failed' }));
        throw new Error(error.message || 'Stability AI generation failed');
      }

      const imageBuffer = await response.arrayBuffer();
      const base64 = this.arrayBufferToBase64(imageBuffer);
      
      const images: GeneratedImage[] = [{
        id: crypto.randomUUID(),
        base64: `data:image/png;base64,${base64}`,
        width: request.width || 1024,
        height: request.height || 1024,
        seed: parseInt(response.headers.get('seed') || '0'),
      }];

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      return this.createErrorResponse(error as Error, request);
    }
  }

  async editImage(request: GenerationRequest): Promise<GenerationResponse> {
    return this.generate({ ...request, mode: 'image-to-image' });
  }

  private getEndpoint(model: string): string {
    if (model.includes('sd3')) {
      return 'stable-image/generate/sd3';
    }
    if (model === 'stable-image-ultra') {
      return 'stable-image/generate/ultra';
    }
    return 'stable-image/generate/core';
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

export default StabilityAIProvider;
