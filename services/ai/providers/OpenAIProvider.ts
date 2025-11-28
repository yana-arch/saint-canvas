
import { BaseAIProvider } from '../BaseProvider';
import {
  AIProviderConfig,
  GenerationRequest,
  GenerationResponse,
  GeneratedImage,
} from '../types';

const OPENAI_CONFIG: AIProviderConfig = {
  id: 'openai-dalle',
  name: 'OpenAI DALL-E',
  description: 'State-of-the-art image generation from OpenAI',
  icon: 'openai',
  supportedModes: ['text-to-image', 'image-to-image'],
  supportedSizes: ['1024x1024', '1024x1792', '1792x1024'],
  models: [
    {
      id: 'dall-e-3',
      name: 'DALL-E 3',
      description: 'Latest model with best quality',
      capabilities: ['text-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 20,
      costPerImage: 0.04,
    },
    {
      id: 'dall-e-2',
      name: 'DALL-E 2',
      description: 'Supports editing',
      capabilities: ['text-to-image', 'image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 4,
      estimatedTime: 15,
      costPerImage: 0.02,
    }
  ],
  requiresApiKey: true,
  pricingInfo: {
    currency: 'USD',
    pricePerImage: 0.04,
    billingUrl: 'https://platform.openai.com/usage',
  },
  rateLimit: {
    requestsPerWindow: 5,
    windowMs: 60000, // 1 minute
    imagesPerRequest: 4,
  },
};

export class OpenAIProvider extends BaseAIProvider {
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    super(OPENAI_CONFIG);
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
      throw new Error('OpenAI API key not configured');
    }

    const startTime = Date.now();

    try {
      const enhancedPrompt = this.enhancePrompt(request.prompt, request.style);
      
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          prompt: enhancedPrompt,
          n: request.model === 'dall-e-3' ? 1 : (request.numImages || 1),
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid',
          response_format: 'b64_json',
        }),
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
        revisedPrompt: img.revised_prompt,
      }));

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      return this.createErrorResponse(error as Error, request);
    }
  }

  async editImage(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey || !request.sourceImage) {
      throw new Error('API key and source image required');
    }

    const startTime = Date.now();

    try {
      // Convert base64 to blob
      const res = await fetch(request.sourceImage);
      const imageBlob = await res.blob();
      
      const formData = new FormData();
      formData.append('image', imageBlob, 'image.png');
      formData.append('prompt', this.enhancePrompt(request.prompt, request.style));
      formData.append('n', String(request.numImages || 1));
      formData.append('size', '1024x1024');
      formData.append('response_format', 'b64_json');

      const response = await fetch(`${this.baseUrl}/images/edits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Edit failed');
      }

      const data = await response.json();
      
      const images: GeneratedImage[] = data.data.map((img: any) => ({
        id: crypto.randomUUID(),
        base64: `data:image/png;base64,${img.b64_json}`,
        width: request.width || 1024,
        height: request.height || 1024,
      }));

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      return this.createErrorResponse(error as Error, request);
    }
  }
}

export default OpenAIProvider;
