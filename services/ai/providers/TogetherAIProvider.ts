
import { BaseAIProvider } from '../BaseProvider';
import {
  AIProviderConfig,
  GenerationRequest,
  GenerationResponse,
  GeneratedImage,
} from '../types';

const TOGETHER_CONFIG: AIProviderConfig = {
  id: 'together-ai',
  name: 'Together AI',
  description: 'Fast and affordable image generation with editing',
  icon: 'together',
  supportedModes: ['text-to-image', 'image-to-image', 'inpainting'],
  supportedSizes: ['512x512', '768x768', '1024x1024'],
  models: [
    {
      id: 'black-forest-labs/FLUX.1-schnell-Free',
      name: 'Flux Schnell (Free)',
      description: 'Free tier, fast generation',
      capabilities: ['text-to-image', 'image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 4,
      estimatedTime: 5,
      costPerImage: 0,
    },
    {
      id: 'black-forest-labs/FLUX.1.1-pro',
      name: 'Flux 1.1 Pro',
      capabilities: ['text-to-image', 'image-to-image', 'inpainting'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 10,
      costPerImage: 0.04,
    },
    {
      id: 'black-forest-labs/FLUX.1-dev-Inpainting',
      name: 'Flux Dev Inpainting',
      description: 'Precise image editing and inpainting',
      capabilities: ['image-to-image', 'inpainting'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 15,
      costPerImage: 0.08,
    }
  ],
  requiresApiKey: true,
  pricingInfo: {
    currency: 'USD',
    pricePerImage: 0.003,
    freeCredits: 25,
    billingUrl: 'https://api.together.xyz/settings/billing',
  },
  rateLimit: {
    requestsPerWindow: 60,
    windowMs: 60000, // 1 minute window
    imagesPerRequest: 4,
  },
};

export class TogetherAIProvider extends BaseAIProvider {
  private baseUrl = 'https://api.together.xyz/v1';

  constructor() {
    super(TOGETHER_CONFIG);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
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
      throw new Error('Together AI API key not configured');
    }

    const startTime = Date.now();

    try {
      const enhancedPrompt = this.enhancePrompt(request.prompt, request.style);

      let body: any = {
        model: request.model,
        prompt: enhancedPrompt,
        width: request.width || 1024,
        height: request.height || 1024,
        n: request.numImages || 1,
        response_format: 'b64_json',
      };

      // Handle image-to-image editing
      if ((request.mode === 'image-to-image' || request.mode === 'inpainting') && request.sourceImage) {
        if (request.model.includes('Inpainting') && request.maskImage && request.mode === 'inpainting') {
          // For inpainting models with mask
          body.image = request.sourceImage;
          body.mask = request.maskImage;
          body.strength = request.strength || 0.8;
        } else if (request.model.includes('FLUX') && request.mode === 'image-to-image') {
          // Image-to-image for Flux models
          body.image = request.sourceImage;
          body.strength = request.strength || 0.75;
        }
      }

      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Generation failed');
      }

      const data = await response.json();

      const images: GeneratedImage[] = data.data.map((img: any) => ({
        id: crypto.randomUUID(),
        base64: `data:image/png;base64,${img.b64_json}`,
        width: request.width || 1024,
        height: request.height || 1024,
        seed: img.seed,
      }));

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      return this.createErrorResponse(error as Error, request);
    }
  }

  async editImage(request: GenerationRequest): Promise<GenerationResponse> {
    return this.generate({ ...request, mode: 'image-to-image' });
  }

  async inpaint(request: GenerationRequest): Promise<GenerationResponse> {
    return this.generate({ ...request, mode: 'inpainting' });
  }
}

export default TogetherAIProvider;
