
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AIProviderType,
  GenerationRequest,
  GenerationResponse,
} from '../services/ai/types';
import aiManager from '../services/ai/AIProviderManager';

interface GenerationHistoryItem {
  id: string;
  timestamp: number;
  request: GenerationRequest;
  response: GenerationResponse;
}

interface AIState {
  // Provider state
  activeProvider: AIProviderType;
  setActiveProvider: (provider: AIProviderType) => void;
  
  // Generation state
  isGenerating: boolean;
  generationProgress: number;
  currentRequest: GenerationRequest | null;
  
  // Results
  lastResponse: GenerationResponse | null;
  generationHistory: GenerationHistoryItem[];
  
  // Settings
  defaultStyle: string; // ID of the style
  autoEnhancePrompt: boolean;
  saveToHistory: boolean;
  
  // Actions
  generate: (request: Omit<GenerationRequest, 'provider'>) => Promise<GenerationResponse>;
  cancelGeneration: () => void;
  clearHistory: () => void;
  updateSettings: (settings: Partial<AIState>) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeProvider: 'google-gemini',
      isGenerating: false,
      generationProgress: 0,
      currentRequest: null,
      lastResponse: null,
      generationHistory: [],
      defaultStyle: 'none',
      autoEnhancePrompt: true,
      saveToHistory: true,

      setActiveProvider: (provider) => {
        set({ activeProvider: provider });
        aiManager.setDefaultProvider(provider);
      },

      generate: async (partialRequest) => {
        const state = get();
        
        const request: GenerationRequest = {
          ...partialRequest,
          provider: state.activeProvider,
          style: partialRequest.style || state.defaultStyle,
        };

        set({
          isGenerating: true,
          generationProgress: 0,
          currentRequest: request,
          lastResponse: null // Clear previous errors
        });

        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            set((s) => ({
              generationProgress: Math.min(s.generationProgress + 10, 90),
            }));
          }, 1000);

          const response = await aiManager.generate(request);

          clearInterval(progressInterval);

          set({
            isGenerating: false,
            generationProgress: 100,
            lastResponse: response,
          });

          // Save to history
          if (state.saveToHistory && response.success) {
            const historyItem: GenerationHistoryItem = {
              id: response.metadata.requestId,
              timestamp: Date.now(),
              request,
              response,
            };

            set((s) => ({
              generationHistory: [historyItem, ...s.generationHistory].slice(0, 50),
            }));
          }

          if (!response.success && response.error) {
              throw new Error(response.error.message);
          }

          return response;
        } catch (error) {
          const err = error as Error;
          set({
            isGenerating: false,
            generationProgress: 0,
            lastResponse: {
              success: false,
              provider: state.activeProvider,
              model: request.model,
              images: [],
              metadata: {
                requestId: crypto.randomUUID(),
                timestamp: Date.now(),
                duration: 0,
              },
              error: {
                code: 'GENERATION_FAILED',
                message: err.message,
                retryable: true,
              },
            },
          });
          throw err;
        }
      },

      cancelGeneration: () => {
        set({
          isGenerating: false,
          generationProgress: 0,
          currentRequest: null,
        });
      },

      clearHistory: () => {
        set({ generationHistory: [] });
      },

      updateSettings: (settings) => {
        set(settings);
      },
    }),
    {
      name: 'saintcanvas-ai-store',
      partialize: (state) => ({
        activeProvider: state.activeProvider,
        generationHistory: state.generationHistory.slice(0, 20),
        defaultStyle: state.defaultStyle,
        autoEnhancePrompt: state.autoEnhancePrompt,
        saveToHistory: state.saveToHistory,
      }),
    }
  )
);
