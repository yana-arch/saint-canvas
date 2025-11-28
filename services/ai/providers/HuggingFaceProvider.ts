import { BaseAIProvider } from '../BaseProvider';
import {
  AIProviderConfig,
  GenerationRequest,
  GenerationResponse,
  GeneratedImage,
} from '../types';

const HUGGINGFACE_CONFIG: AIProviderConfig = {
  id: 'huggingface',
  name: 'HuggingFace',
  description: 'Powerful open-source models for image inpainting and processing',
  icon: 'huggingface',
  supportedModes: ['inpainting', 'image-to-image', 'background-removal'],
  supportedSizes: ['512x512', '1024x1024'],
  models: [
    {
      id: 'Sanster/lama-cleaner',
      name: 'LAMA Cleaner',
      capabilities: ['inpainting'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 10,
      costPerImage: 0, // Free
    },
    {
      id: 'runwayml/stable-diffusion-inpainting',
      name: 'Stable Diffusion Inpainting',
      capabilities: ['inpainting'],
      defaultSize: '512x512',
      maxImages: 1,
      estimatedTime: 20,
      costPerImage: 0, // Free
    },
    {
      id: 'CompVis/stable-diffusion-v1-4',
      name: 'Stable Diffusion Image-to-Image',
      capabilities: ['image-to-image'],
      defaultSize: '512x512',
      maxImages: 1,
      estimatedTime: 15,
      costPerImage: 0,
    },
  ],
  requiresApiKey: true,
  pricingInfo: {
    currency: 'USD',
    pricePerImage: 0, // Free
    billingUrl: 'https://www.google.com/search?q=HuggingFace+API+token',
  },
  rateLimit: {
    requestsPerWindow: 10,
    windowMs: 60000, // 1 minute
    imagesPerRequest: 1,
  },
};

export class HuggingFaceProvider extends BaseAIProvider {
  private baseUrl = 'https://api-inference.huggingface.co/models';

  constructor() {
    super(HUGGINGFACE_CONFIG);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.huggingface.co/models', {
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
    switch (request.mode) {
      case 'inpainting':
        return this.inpaintImage(request);
      case 'image-to-image':
        return this.editImage(request);
      case 'background-removal':
        return this.removeBackground(request);
      default:
        throw new Error(`Mode ${request.mode} not supported`);
    }
  }

  async inpaintImage(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error('HuggingFace API key not configured');
    }

    if (!request.sourceImage) {
      throw new Error('Source image is required for inpainting');
    }

    if (!request.maskImage) {
      throw new Error('Mask image is required for inpainting');
    }

    const startTime = Date.now();

    try {
      const formData = new FormData();
      const imageBlob = await this.base64ToBlob(request.sourceImage);
      const maskBlob = await this.base64ToBlob(request.maskImage);

      formData.append('inputs', imageBlob);
      formData.append('mask', maskBlob);

      // Add prompt for models that support it
      if (request.prompt && this.supportsPrompt(request.model)) {
        formData.append('prompt', request.prompt);
      }

      const response = await fetch(`${this.baseUrl}/${request.model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      // HuggingFace returns binary blob directly
      const buffer = await response.arrayBuffer();
      const base64 = this.arrayBufferToBase64(buffer);

      const images: GeneratedImage[] = [{
        id: crypto.randomUUID(),
        base64: `data:image/png;base64,${base64}`,
        width: request.width || 512,
        height: request.height || 512,
      }];

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      return this.createErrorResponse(error as Error, request);
    }
  }

  async editImage(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error('HuggingFace API key not configured');
    }

    if (!request.sourceImage) {
      throw new Error('Source image is required');
    }

    const startTime = Date.now();

    try {
      const formData = new FormData();
      const imageBlob = await this.base64ToBlob(request.sourceImage);

      formData.append('inputs', imageBlob);
      formData.append('prompt', this.enhancePrompt(request.prompt, request.style));
      formData.append('strength', String(request.strength || 0.7));

      if (request.maskImage) {
        const maskBlob = await this.base64ToBlob(request.maskImage);
        formData.append('mask', maskBlob);
      }

      const response = await fetch(`${this.baseUrl}/${request.model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const base64 = this.arrayBufferToBase64(buffer);

      const images: GeneratedImage[] = [{
        id: crypto.randomUUID(),
        base64: `data:image/png;base64,${base64}`,
        width: request.width || 512,
        height: request.height || 512,
      }];

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      return this.createErrorResponse(error as Error, request);
    }
  }

  async removeBackground(request: GenerationRequest): Promise<GenerationResponse> {
    // Fallback to using remove-bg prompt with image-to-image model
    const bgRemovalRequest: GenerationRequest = {
      ...request,
      mode: 'image-to-image',
      prompt: 'Remove the background, make it transparent, keep the main subject intact',
      strength: 0.8,
      model: 'CompVis/stable-diffusion-v1-4', // Use SD for background removal
    };
    return this.editImage(bgRemovalRequest);
  }

  private supportsPrompt(model: string): boolean {
    // Some models don't support prompts (like Lama which only supports inpainting)
    return model.includes('stable-diffusion');
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private async base64ToBlob(base64: string): Promise<Blob> {
    const response = await fetch(base64);
    return response.blob();
  }
}

export default HuggingFaceProvider;
