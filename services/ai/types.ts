
export type AIProviderType = 
  | 'google-gemini'
  | 'openai-dalle'
  | 'stability-ai'
  | 'replicate'
  | 'together-ai'
  | 'fal-ai'
  | 'leonardo-ai';

export type GenerationMode = 'text-to-image' | 'image-to-image' | 'inpainting' | 'outpainting' | 'background-removal';

export type ImageSize = '512x512' | '768x768' | '1024x1024' | '1024x1792' | '1792x1024';

export interface AIModel {
  id: string;
  name: string;
  description?: string;
  capabilities: GenerationMode[];
  defaultSize: ImageSize;
  maxImages: number;
  estimatedTime: number; // seconds
  costPerImage?: number; // USD
}

export interface PricingInfo {
  currency: 'USD';
  pricePerImage: number;
  freeCredits?: number;
  billingUrl?: string;
}

export interface RateLimitConfig {
  requestsPerWindow: number;
  windowMs: number;  // Time window in milliseconds (e.g., 60000 for 1 minute)
  requestsPerDay?: number;
  imagesPerRequest: number;
}

export interface AIProviderConfig {
  id: AIProviderType;
  name: string;
  description: string;
  icon: string;
  supportedModes: GenerationMode[];
  supportedSizes: ImageSize[];
  models: AIModel[];
  requiresApiKey: boolean;
  pricingInfo?: PricingInfo;
  rateLimit?: RateLimitConfig;
}

export interface CatholicArtStyle {
  id: string;
  name: string;
  icon: string;
  prompt: string;
}

export interface GenerationRequest {
  provider: AIProviderType;
  model: string;
  mode: GenerationMode;
  prompt: string;
  negativePrompt?: string;
  
  // Image dimensions
  width?: number;
  height?: number;
  aspectRatio?: string;
  
  // For image-to-image / editing
  sourceImage?: string; // base64
  maskImage?: string;   // base64 for inpainting
  strength?: number;    // 0-1, how much to transform
  
  // Generation params
  numImages?: number;
  seed?: number;
  guidanceScale?: number;
  steps?: number;
  
  // Style
  style?: string; // ID of the style
  styleStrength?: number;
  
  // Advanced
  scheduler?: string;
  sampler?: string;
}

export interface GeneratedImage {
  id: string;
  url?: string;          // Remote URL
  base64?: string;       // Base64 data
  width: number;
  height: number;
  seed?: number;
  revisedPrompt?: string; // Some providers revise prompts
}

export interface GenerationMetadata {
  requestId: string;
  timestamp: number;
  duration: number;      // ms
  cost?: number;         // USD
  tokensUsed?: number;
  remainingCredits?: number;
}

export interface GenerationError {
  code: string;
  message: string;
  retryable: boolean;
  retryAfter?: number;   // seconds
}

export interface GenerationResponse {
  success: boolean;
  provider: AIProviderType;
  model: string;
  images: GeneratedImage[];
  metadata: GenerationMetadata;
  error?: GenerationError;
}

export interface ProviderCredentials {
  provider: AIProviderType;
  apiKey: string;
  organizationId?: string;  // For OpenAI
  projectId?: string;       // For Google
}
