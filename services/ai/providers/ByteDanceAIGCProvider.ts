import { BaseAIProvider } from '../BaseProvider';
import {
  AIProviderConfig,
  GenerationRequest,
  GenerationResponse,
  GeneratedImage,
} from '../types';

const BYTEDANCE_AIGC_CONFIG: AIProviderConfig = {
  id: 'bytedance-aigc',
  name: 'ByteDance AIGC',
  description: 'ByteDance AI Generative Content with image processing capabilities',
  icon: 'bytedance',
  supportedModes: ['background-removal', 'image-to-image'],
  supportedSizes: ['512x512', '1024x1024'],
  models: [
    {
      id: 'segment',
      name: 'Human Segmentation',
      capabilities: ['background-removal'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 8,
      costPerImage: 0, // Free?
    },
    {
      id: 'remove-bg',
      name: 'Remove Background',
      capabilities: ['background-removal'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 6,
      costPerImage: 0,
    },
    {
      id: 'face-beautify',
      name: 'Face Beautify',
      capabilities: ['image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 7,
      costPerImage: 0,
    },
    {
      id: 'super-resolution',
      name: 'Super Resolution',
      capabilities: ['image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 10,
      costPerImage: 0,
    },
    {
      id: 'style-transfer',
      name: 'Style Transfer',
      capabilities: ['image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 12,
      costPerImage: 0,
    },
  ],
  requiresApiKey: true,
  pricingInfo: {
    currency: 'USD',
    pricePerImage: 0, // Free?
    billingUrl: 'https://www.google.com/search?q=ByteDance+AIGC+API+key',
  },
  rateLimit: {
    requestsPerWindow: 50,
    windowMs: 60000, // 1 minute
    imagesPerRequest: 1,
  },
};

export class ByteDanceAIGCProvider extends BaseAIProvider {
  private baseUrl = 'https://sgp-aigc-boe.bytetos.com'; // Example base URL, may need adjustment

  constructor() {
    super(BYTEDANCE_AIGC_CONFIG);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // Note: ByteDance AIGC API documentation is limited, this is a basic validation
      const response = await fetch(`${this.baseUrl}/api/v1/segment`, {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Test with empty body
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
      case 'background-removal':
        return this.processSegmentation(request);
      case 'image-to-image':
        return this.processImage(request);
      default:
        throw new Error(`Mode ${request.mode} not supported`);
    }
  }

  async removeBackground(request: GenerationRequest): Promise<GenerationResponse> {
    return this.processSegmentation(request);
  }

  async editImage(request: GenerationRequest): Promise<GenerationResponse> {
    return this.processImage(request);
  }

  private async processSegmentation(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error('ByteDance AIGC API key not configured');
    }

    if (!request.sourceImage) {
      throw new Error('Source image is required');
    }

    const startTime = Date.now();

    try {
      const endpoint = this.getEndpoint(request.model);
      const base64Data = await this.prepareImage(request.sourceImage);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          // Add other parameters as needed based on documentation
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`ByteDance AIGC API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      let images: GeneratedImage[] = [];

      if (data.output_url) {
        // URL response
        images = [{
          id: crypto.randomUUID(),
          url: data.output_url,
          width: request.width || 1024,
          height: request.height || 1024,
        }];
      } else if (data.image) {
        // Base64 response
        images = [{
          id: crypto.randomUUID(),
          base64: `data:image/png;base64,${data.image}`,
          width: request.width || 1024,
          height: request.height || 1024,
        }];
      } else {
        throw new Error('No image data in response');
      }

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      return this.createErrorResponse(error as Error, request);
    }
  }

  private async processImage(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error('ByteDance AIGC API key not configured');
    }

    if (!request.sourceImage) {
      throw new Error('Source image is required');
    }

    const startTime = Date.now();

    try {
      const endpoint = this.getEndpoint(request.model);
      const base64Data = await this.prepareImage(request.sourceImage);

      const payload: any = {
        image: base64Data,
      };

      // Add style prompt for style transfer
      if (request.model === 'style-transfer' && request.prompt) {
        payload.style = request.prompt;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`ByteDance AIGC API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      let images: GeneratedImage[] = [];

      if (data.output_url) {
        images = [{
          id: crypto.randomUUID(),
          url: data.output_url,
          width: request.width || 1024,
          height: request.height || 1024,
        }];
      } else if (data.image) {
        images = [{
          id: crypto.randomUUID(),
          base64: `data:image/png;base64,${data.image}`,
          width: request.width || 1024,
          height: request.height || 1024,
        }];
      } else {
        throw new Error('No image data in response');
      }

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      return this.createErrorResponse(error as Error, request);
    }
  }

  private getEndpoint(model: string): string {
    switch (model) {
      case 'segment':
        return '/api/v1/segment';
      case 'face-beautify':
        return '/api/v1/face-beautify';
      case 'super-resolution':
        return '/api/v1/super-resolution';
      case 'style-transfer':
        return '/api/v1/style-transfer';
      case 'remove-bg':
        return '/api/v1/remove-bg';
      default:
        return '/api/v1/segment'; // fallback
    }
  }
}

export default ByteDanceAIGCProvider;
