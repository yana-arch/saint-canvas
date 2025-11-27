
import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Settings,
  ChevronDown,
  Zap,
  DollarSign 
} from 'lucide-react';
import { useAIStore } from '../../store/aiStore';
import aiManager from '../../services/ai/AIProviderManager';
import { AIProviderType, AIProviderConfig } from '../../services/ai/types';

interface ProviderSelectorProps {
  onSettingsClick?: (provider: AIProviderType) => void;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({ onSettingsClick }) => {
  const { activeProvider, setActiveProvider } = useAIStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const allProviders = aiManager.getAllProviders();
  const configuredProviders = aiManager.getConfiguredProviders();
  
  const activeConfig = allProviders.find(p => p.id === activeProvider);

  const getProviderIcon = (id: AIProviderType): React.ReactNode => {
    // Simple visual indicators or emojis for providers
    const icons: Record<string, React.ReactNode> = {
      'google-gemini': <span className="text-blue-500 font-bold">G</span>,
      'openai-dalle': <span className="text-green-500 font-bold">O</span>,
      'stability-ai': <span className="text-purple-500 font-bold">S</span>,
      'replicate': <span className="text-orange-500 font-bold">R</span>,
      'together-ai': <span className="text-cyan-500 font-bold">T</span>,
      'fal-ai': <span className="text-pink-500 font-bold">F</span>,
      'leonardo-ai': <span className="text-yellow-500 font-bold">L</span>,
    };
    return icons[id] || <Sparkles className="w-4 h-4" />;
  };

  const isConfigured = (id: AIProviderType): boolean => {
    return configuredProviders.some(p => p.id === id);
  };

  return (
    <div className="relative z-50">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg 
                   border border-holy-200 hover:border-holy-300 transition-colors"
      >
        <div className="w-5 h-5 flex items-center justify-center rounded bg-holy-100">
          {getProviderIcon(activeProvider)}
        </div>
        <span className="text-sm font-medium text-holy-800">{activeConfig?.name}</span>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl 
                          border border-holy-200 shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-holy-200 bg-holy-50">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Providers</h3>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {allProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-holy-100 last:border-none
                  ${activeProvider === provider.id ? 'bg-holy-100' : 'hover:bg-holy-50'}
                  ${!isConfigured(provider.id) ? 'opacity-80' : ''}`}
                  onClick={() => {
                    setActiveProvider(provider.id);
                    setIsOpen(false);
                  }}
                >
                  <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg 
                       ${activeProvider === provider.id ? 'bg-holy-200' : 'bg-gray-100'}`}>
                     {getProviderIcon(provider.id)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800">{provider.name}</span>
                      {activeProvider === provider.id && <Check className="w-3 h-3 text-holy-600" />}
                    </div>
                    
                    {!isConfigured(provider.id) ? (
                         <span className="text-[10px] text-gold-600 flex items-center gap-1">
                            Requires Setup
                         </span>
                    ) : (
                         <div className="flex items-center gap-2 mt-0.5">
                            {provider.pricingInfo && (
                                <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                                <DollarSign className="w-3 h-3" />
                                {provider.pricingInfo.pricePerImage}
                                </span>
                            )}
                            <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                                <Zap className="w-3 h-3" />
                                {provider.models[0]?.estimatedTime}s
                            </span>
                         </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSettingsClick?.(provider.id);
                      setIsOpen(false);
                    }}
                    className="p-1.5 hover:bg-holy-100 rounded-lg transition-colors text-gray-500 hover:text-holy-700"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProviderSelector;
