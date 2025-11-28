import { BaseAIProvider } from '../BaseProvider';
import {
  AIProviderConfig,
  GenerationRequest,
  GenerationResponse,
  GeneratedImage,
} from '../types';

const CLIPDROP_CONFIG: AIProviderConfig = {
  id: 'clipdrop',
  name: 'Clipdrop (Stability AI)',
  description: 'Advanced image editing with object removal, inpainting, and relighting',
  icon: 'clipdrop',
  supportedModes: ['inpainting', 'background-removal', 'image-to-image'],
  supportedSizes: ['512x512', '1024x1024'],
  models: [
    {
      id: 'cleanup',
      name: 'Object Removal / Cleanup',
      capabilities: ['inpainting', 'background-removal'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 8,
      costPerImage: 0.01,
    },
    {
      id: 'inpainting',
      name: 'Inpainting',
      capabilities: ['inpainting'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 10,
      costPerImage: 0.015,
    },
    {
      id: 'relight',
      name: 'Relighting',
      capabilities: ['image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 12,
      costPerImage: 0.02,
    },
    {
      id: 'upscale',
      name: 'Upscale',
      capabilities: ['image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 6,
      costPerImage: 0.005,
    },
  ],
  requiresApiKey: true,
  pricingInfo: {
    currency: 'USD',
    pricePerImage: 0.01,
    billingUrl: 'https://www.google.com/search?q=Clipdrop+API+key',
  },
  rateLimit: {
    requestsPerWindow: 100,
    windowMs: 60000, // 1 minute
    imagesPerRequest: 1,
  },
};

export class ClipdropProvider extends BaseAIProvider {
  private baseUrl = 'https://clipdrop-api.co';

  constructor() {
    super(CLIPDROP_CONFIG);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/cleanup/v1`, {
        method: 'POST',
        headers: { 'x-api-key': apiKey },
        body: new FormData(),
      });
      return response.status !== 401 && response.status !== 403;
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
      case 'background-removal':
        return this.processCleanup(request);
      case 'image-to-image':
        return this.processImage(request);
      default:
        throw new Error(`Mode ${request.mode} not supported`);
    }
  }

  async inpaint(request: GenerationRequest): Promise<GenerationResponse> {
    return this.processCleanup(request);
  }

  async removeBackground(request: GenerationRequest): Promise<GenerationResponse> {
    // Use cleanup without mask to remove background areas
    return this.processCleanup(request);
  }

  async editImage(request: GenerationRequest): Promise<GenerationResponse> {
    return this.processImage(request);
  }

  private async processCleanup(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error('Clipdrop API key not configured');
    }

    if (!request.sourceImage) {
      throw new Error('Source image is required');
    }

    const startTime = Date.now();

    try {
      const formData = new FormData();
      const imageBlob = await this.base64ToBlob(request.sourceImage);
      formData.append('image_file', imageBlob);

      // For inpainting, mask is required
      if (request.maskImage && (request.mode === 'inpainting' || request.model === 'inpainting')) {
        const maskBlob = await this.base64ToBlob(request.maskImage);
        formData.append('mask_file', maskBlob);
      }

      const endpoint = request.model === 'inpainting' ? 'inpainting/v1' : 'cleanup/v1';

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Clipdrop API error: ${response.status} - ${errorText}`);
      }

      // Clipdrop returns binary blob directly
      const buffer = await response.arrayBuffer();
      const base64 = this.arrayBufferToBase64(buffer);

      const images: GeneratedImage[] = [{
        id: crypto.randomUUID(),
        base64: `data:image/png;base64,${base64}`,
        width: request.width || 1024,
        height: request.height || 1024,
      }];

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      return this.createErrorResponse(error as Error, request);
    }
  }

  private async processImage(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error('Clipdrop API key not configured');
    }

    if (!request.sourceImage) {
      throw new Error('Source image is required');
    }

    const startTime = Date.now();

    try {
      const formData = new FormData();
      const imageBlob = await this.base64ToBlob(request.sourceImage);
      formData.append('image_file', imageBlob);

      // Add prompt for relighting
      if (request.model === 'relight' && request.prompt) {
        // Note: Clipdrop relight may not use prompts this way, adjust as needed
        // This is a placeholder implementation
      }

      const endpoint = this.getEndpoint(request.model);

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Clipdrop API error: ${response.status} - ${errorText}`);
      }

      const buffer = await response.arrayBuffer();
      const base64 = this.arrayBufferToBase64(buffer);

      const images: GeneratedImage[] = [{
        id: crypto.randomUUID(),
        base64: `data:image/png;base64,${base64}`,
        width: request.width || 1024,
        height: request.height || 1024,
      }];

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      return this.createErrorResponse(error as Error, request);
    }
  }

  private getEndpoint(model: string): string {
    switch (model) {
      case 'relight':
        return 'relight/v1';
      case 'upscale':
        return 'image-upscaling/v1';
      case 'cleanup':
        return 'cleanup/v1';
      case 'inpainting':
        return 'inpainting/v1';
      default:
        return 'cleanup/v1'; // fallback
    }
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

export default ClipdropProvider;
