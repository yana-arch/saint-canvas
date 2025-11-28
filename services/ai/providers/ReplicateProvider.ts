
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
  description: 'Access to Flux, SDXL, and advanced image editing models',
  icon: 'replicate',
  supportedModes: ['text-to-image', 'image-to-image', 'inpainting', 'outpainting'],
  supportedSizes: ['512x512', '768x768', '1024x1024'],
  models: [
    {
      id: 'black-forest-labs/flux-schnell',
      name: 'Flux Schnell',
      description: 'Fast generation, good quality',
      capabilities: ['text-to-image', 'image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 5,
      costPerImage: 0.003,
    },
    {
      id: 'black-forest-labs/flux-dev',
      name: 'Flux Dev',
      capabilities: ['text-to-image', 'image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 20,
      costPerImage: 0.025,
    },
    {
      id: 'black-forest-labs/flux-fill-pro',
      name: 'Flux Fill Pro',
      description: 'Advanced inpainting and outpainting',
      capabilities: ['image-to-image', 'inpainting', 'outpainting'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 15,
      costPerImage: 0.02,
    },
    {
      id: 'black-forest-labs/flux-dev-inpainting',
      name: 'Flux Dev Inpainting',
      description: 'Precise inpainting for photo editing',
      capabilities: ['image-to-image', 'inpainting'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 25,
      costPerImage: 0.035,
    }
  ],
  requiresApiKey: true,
  pricingInfo: {
    currency: 'USD',
    pricePerImage: 0.01,
    billingUrl: 'https://replicate.com/account/billing',
  },
  rateLimit: {
    requestsPerWindow: 60,
    windowMs: 60000, // 1 minute window
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

      // Build input parameters based on model and mode
      const input: any = {
        output_format: 'png'
      };

      // Handle different editing modes
      if (request.mode === 'image-to-image' && request.sourceImage) {
        input.image = request.sourceImage; // Replicate expects data URL or blob URL
        input.prompt = enhancedPrompt;
        input.image_to_image_strength = request.strength || 0.75;
      } else if ((request.mode === 'inpainting' || request.mode === 'outpainting') && request.sourceImage) {
        if (request.model.includes('inpainting') || request.model.includes('fill')) {
          input.image = request.sourceImage;
          input.prompt = enhancedPrompt;
          input.mask = request.maskImage;
          input.strength = request.strength || 0.8;

          if (request.model.includes('fill-pro')) {
            input.mask_prompt = request.maskImage ? "user mask" : "subject";
          }
        } else {
          // Fallback to image-to-image for models that don't support inpainting
          input.image = request.sourceImage;
          input.prompt = enhancedPrompt;
          input.image_to_image_strength = request.strength || 0.75;
        }
      } else {
        // Text-to-image
        input.prompt = enhancedPrompt;
        if (request.model.includes('flux-schnell')) {
          input.go_fast = true;
          input.num_inference_steps = 4;
        } else if (request.model.includes('flux-dev')) {
          input.num_inference_steps = request.steps || 28;
        }
        input.aspect_ratio = request.aspectRatio || '1:1';
      }

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

  async editImage(request: GenerationRequest): Promise<GenerationResponse> {
    return this.generate({ ...request, mode: 'image-to-image' });
  }

  async inpaint(request: GenerationRequest): Promise<GenerationResponse> {
    return this.generate({ ...request, mode: 'inpainting' });
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
