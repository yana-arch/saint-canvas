import { GoogleGenAI } from '@google/genai';
import { BaseAIProvider } from '../BaseProvider';
import {
  AIProviderConfig,
  GenerationRequest,
  GenerationResponse,
  GeneratedImage,
} from '../types';

const GEMINI_CONFIG: AIProviderConfig = {
  id: 'google-gemini',
  name: 'Google Gemini',
  description: 'Google\'s multimodal AI models with image generation',
  icon: 'gemini',
  supportedModes: ['text-to-image', 'image-to-image'],
  supportedSizes: ['512x512', '1024x1024'],
  models: [
    {
      id: 'gemini-2.5-flash-image',
      name: 'Gemini 2.5 Flash',
      capabilities: ['text-to-image', 'image-to-image'],
      defaultSize: '1024x1024',
      maxImages: 1,
      estimatedTime: 5,
    },
    {
        id: 'gemini-3-pro-image-preview',
        name: 'Gemini 3.0 Pro',
        capabilities: ['text-to-image', 'image-to-image'],
        defaultSize: '1024x1024',
        maxImages: 1,
        estimatedTime: 10
    }
  ],
  requiresApiKey: true,
  rateLimit: {
    requestsPerMinute: 10,
    imagesPerRequest: 1,
  },
};

export class GoogleGeminiProvider extends BaseAIProvider {
  constructor() {
    super(GEMINI_CONFIG);
  }

  isConfigured(): boolean {
    // Now only uses user-provided API key
    return !!this.apiKey;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const testClient = new GoogleGenAI({ apiKey });
      // Minimal test
      await testClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'test',
      });
      return true;
    } catch (e) {
        console.error(e);
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    return this.config.models.map(m => m.id);
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    // Now only uses user-provided API key
    if (!this.apiKey) {
      throw new Error('API key not configured for Gemini. Please add your API key in Settings.');
    }

    const client = new GoogleGenAI({ apiKey: this.apiKey });
    const startTime = Date.now();

    try {
      const enhancedPrompt = this.enhancePrompt(request.prompt, request.style);
      
      const parts: any[] = [];
      
      // Image to Image / Edit Logic
      if (request.sourceImage) {
        const base64Data = await this.prepareImage(request.sourceImage);
        parts.push({
            inlineData: {
                data: base64Data,
                mimeType: 'image/png'
            }
        });
        parts.push({ text: `Edit this image. ${enhancedPrompt}. Maintain the composition but apply these changes.` });
      } else {
        parts.push({ text: enhancedPrompt });
      }

      const response = await client.models.generateContent({
          model: request.model,
          contents: { parts: parts },
          config: {
              // Gemini doesn't strictly support aspect ratio config in generateContent for standard models yet
              // but we can prompt it.
          }
      });

      const images: GeneratedImage[] = [];
      
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            images.push({
              id: crypto.randomUUID(),
              base64: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
              width: request.width || 1024,
              height: request.height || 1024,
            });
          }
        }
      }

      if (images.length === 0) {
          throw new Error("No image generated. The model might have refused the request or encountered a safety block.");
      }

      return this.createResponse(images, Date.now() - startTime, request);
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      return this.createErrorResponse(error as Error, request);
    }
  }

  async editImage(request: GenerationRequest): Promise<GenerationResponse> {
    return this.generate(request);
  }
}

export default GoogleGeminiProvider;
