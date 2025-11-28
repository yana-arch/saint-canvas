import { BaseAIProvider } from '../BaseProvider';
import {
  AIProviderConfig,
  GenerationRequest,
  GenerationResponse,
  GeneratedImage,
} from '../types';

const DEEPAI_CONFIG: AIProviderConfig = {
  id: 'deepai',
  name: 'DeepAI',
  description: 'Simple, fast image processing with remove background, super resolution, etc.',
  icon: 'deepai',
  supportedModes: ['background-removal', 'image-to-image'],
  supportedSizes: ['512x512', '1024x1024'],
  models: [
    {
      id: 'remove-bg',
      name: 'Remove Background',
      capabilities: ['background-removal'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 5,
      costPerImage: 0, // Free
    },
    {
      id: 'super-resolution',
      name: 'Super Resolution',
      capabilities: ['image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 8,
      costPerImage: 0, // Free
    },
    {
      id: 'colorize',
      name: 'Colorization',
      capabilities: ['image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 6,
      costPerImage: 0,
    },
    {
      id: 'face-enhancement',
      name: 'Face Enhancement',
      capabilities: ['image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 7,
      costPerImage: 0,
    },
  ],
  requiresApiKey: true,
  pricingInfo: {
    currency: 'USD',
    pricePerImage: 0, // Free
    billingUrl: 'https://www.google.com/search?q=DeepAI+API+key',
  },
  rateLimit: {
    requestsPerWindow: 30,
    windowMs: 60000, // 1 minute
    imagesPerRequest: 1,
  },
};

export class DeepAIProvider extends BaseAIProvider {
  private baseUrl = 'https://api.deepai.org/api';

  constructor() {
    super(DEEPAI_CONFIG);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/torch-srgan`, {
        method: 'POST',
        headers: { 'api-key': apiKey },
        body: new FormData(), // Empty body for test
      });
      return response.status !== 401;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    return this.config.models.map(m => m.id);
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    switch (request.mode) {
      case 'background-removal':
        return this.removeBackground(request);
      case 'image-to-image':
        return this.processImage(request);
      default:
        throw new Error(`Mode ${request.mode} not supported`);
    }
  }

  async removeBackground(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error('DeepAI API key not configured');
    }

    if (!request.sourceImage) {
      throw new Error('Source image is required for background removal');
    }

    const startTime = Date.now();

    try {
      const formData = new FormData();
      const blob = await this.base64ToBlob(request.sourceImage);
      formData.append('image', blob);

      const response = await fetch(`${this.baseUrl}/remove-bg`, {
        method: 'POST',
        headers: { 'api-key': this.apiKey },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`DeepAI API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.output_url) {
        throw new Error('No output URL returned from DeepAI');
      }

      const images: GeneratedImage[] = [{
        id: crypto.randomUUID(),
        url: data.output_url,
        width: request.width || 1024,
        height: request.height || 1024,
      }];

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      return this.createErrorResponse(error as Error, request);
    }
  }

  async processImage(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error('DeepAI API key not configured');
    }

    if (!request.sourceImage) {
      throw new Error('Source image is required');
    }

    const startTime = Date.now();

    try {
      const endpoint = this.getEndpoint(request.model);
      const formData = new FormData();
      const blob = await this.base64ToBlob(request.sourceImage);
      formData.append('image', blob);

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'api-key': this.apiKey },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`DeepAI API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.output_url) {
        throw new Error('No output URL returned from DeepAI');
      }

      const images: GeneratedImage[] = [{
        id: crypto.randomUUID(),
        url: data.output_url,
        width: request.width || 1024,
        height: request.height || 1024,
      }];

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      return this.createErrorResponse(error as Error, request);
    }
  }

  async editImage(request: GenerationRequest): Promise<GenerationResponse> {
    return this.processImage(request);
  }

  private getEndpoint(model: string): string {
    switch (model) {
      case 'super-resolution':
        return 'torch-srgan';
      case 'colorize':
        return 'colorizer';
      case 'face-enhancement':
        return 'enhance';
      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  }

  private async base64ToBlob(base64: string): Promise<Blob> {
    const response = await fetch(base64);
    return response.blob();
  }
}

export default DeepAIProvider;
