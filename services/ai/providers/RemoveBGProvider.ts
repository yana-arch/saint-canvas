import { BaseAIProvider } from '../BaseProvider';
import {
  AIProviderConfig,
  GenerationRequest,
  GenerationResponse,
  GeneratedImage,
} from '../types';

const REMOVEBG_CONFIG: AIProviderConfig = {
  id: 'removebg',
  name: 'Remove.bg',
  description: 'Specialized background removal service with high quality output',
  icon: 'removebg',
  supportedModes: ['background-removal'],
  supportedSizes: ['512x512', '1024x1024'],
  models: [
    {
      id: 'auto',
      name: 'Auto Background Removal',
      capabilities: ['background-removal'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 5,
      costPerImage: 0.01, // Based on their pricing
    },
    {
      id: 'standard',
      name: 'Standard Quality',
      capabilities: ['background-removal'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 3,
      costPerImage: 0.02,
    },
    {
      id: 'hd',
      name: 'HD Quality',
      capabilities: ['background-removal'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 8,
      costPerImage: 0.05,
    },
  ],
  requiresApiKey: true,
  pricingInfo: {
    currency: 'USD',
    pricePerImage: 0.02,
    billingUrl: 'https://www.google.com/search?q=Remove.bg+API+key',
  },
  rateLimit: {
    requestsPerWindow: 50,
    windowMs: 60000, // 1 minute
    imagesPerRequest: 1,
  },
};

export class RemoveBGProvider extends BaseAIProvider {
  private baseUrl = 'https://api.remove.bg/v1.0';

  constructor() {
    super(REMOVEBG_CONFIG);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/account`, {
        headers: { 'X-Api-Key': apiKey },
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
    if (request.mode === 'background-removal') {
      return this.removeBackground(request);
    }
    throw new Error(`Mode ${request.mode} not supported by Remove.bg`);
  }

  async removeBackground(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error('Remove.bg API key not configured');
    }

    if (!request.sourceImage) {
      throw new Error('Source image is required for background removal');
    }

    const startTime = Date.now();

    try {
      const formData = new FormData();
      const imageBlob = await this.base64ToBlob(request.sourceImage);
      formData.append('image_file', imageBlob);

      // Add size parameter based on model
      let size = 'auto';
      if (request.model === 'standard') size = 'medium';
      else if (request.model === 'hd') size = 'preview'; // Remove.bg uses different sizing
      formData.append('size', size);

      // Output format
      formData.append('format', 'png');

      const response = await fetch(`${this.baseUrl}/removebg`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = `Remove.bg API error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg += ` - ${errorData.errors?.[0]?.title || 'Unknown error'}`;
        } catch {
          // Continue with generic error
        }
        throw new Error(errorMsg);
      }

      // Remove.bg returns binary PNG data directly
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

  // Remove.bg doesn't support other operations
  async editImage(): Promise<GenerationResponse> {
    throw new Error('Remove.bg only supports background removal');
  }

  async inpaint(): Promise<GenerationResponse> {
    throw new Error('Remove.bg only supports background removal');
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

export default RemoveBGProvider;
