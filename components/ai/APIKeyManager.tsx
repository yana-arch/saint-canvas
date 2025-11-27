
import React, { useState } from 'react';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Loader2,
  ExternalLink,
  Trash2 
} from 'lucide-react';
import aiManager from '../../services/ai/AIProviderManager';
import { AIProviderType } from '../../services/ai/types';

interface APIKeyManagerProps {
  provider: AIProviderType;
  onClose: () => void;
}

const APIKeyManager: React.FC<APIKeyManagerProps> = ({ provider, onClose }) => {
  const config = aiManager.getAllProviders().find(p => p.id === provider);
  
  // Use lazy initialization for state to check configuration only once on mount.
  // This prevents the input from resetting to the mask if the parent component re-renders.
  const [apiKey, setApiKey] = useState(() => {
    const isConfigured = aiManager.getConfiguredProviders().some(p => p.id === provider);
    return isConfigured ? '••••••••••••••••••••' : '';
  });

  const [isSaved, setIsSaved] = useState(() => {
    return aiManager.getConfiguredProviders().some(p => p.id === provider);
  });

  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);

  const handleValidate = async () => {
    if (!apiKey || apiKey.includes('•')) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const isValid = await aiManager.validateApiKey(provider, apiKey);
      setValidationResult(isValid);
      
      if (isValid) {
        aiManager.setApiKey(provider, apiKey);
        setIsSaved(true);
        setApiKey('••••••••••••••••••••');
      }
    } catch (error) {
      setValidationResult(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    aiManager.removeApiKey(provider);
    setApiKey('');
    setIsSaved(false);
    setValidationResult(null);
  };

  const getProviderGuide = (): { url: string; steps: string[] } => {
    const guides: Record<string, { url: string; steps: string[] }> = {
      'google-gemini': {
        url: 'https://aistudio.google.com/app/apikey',
        steps: [
          'Go to Google AI Studio',
          'Get API Key > Create API Key',
          'Copy and paste here',
        ],
      },
      'openai-dalle': {
        url: 'https://platform.openai.com/api-keys',
        steps: [
          'Go to OpenAI Platform',
          'Create new secret key',
          'Copy key immediately',
        ],
      },
      'stability-ai': {
        url: 'https://platform.stability.ai/account/keys',
        steps: [
          'Go to Stability AI Platform',
          'Account > API Keys',
          'Create API Key',
        ],
      },
      'replicate': {
        url: 'https://replicate.com/account/api-tokens',
        steps: [
          'Go to Replicate',
          'Account > API Tokens',
          'Create token',
        ],
      },
      'together-ai': {
        url: 'https://api.together.xyz/settings/api-keys',
        steps: [
          'Go to Together AI',
          'Settings > API Keys',
          'Create API Key',
        ],
      },
    };

    return guides[provider] || { url: '', steps: [] };
  };

  const guide = getProviderGuide();

  if (!config) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl border border-holy-200">
        {/* Header */}
        <div className="p-4 border-b border-holy-200 flex items-center justify-between bg-holy-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-holy-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-holy-600" />
            </div>
            <div>
              <h2 className="font-semibold text-holy-900">{config.name}</h2>
              <p className="text-xs text-gray-500">Configure API Key</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-holy-100 rounded-lg text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* API Key Input */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                autoComplete="off"
                onFocus={() => {
                  if (apiKey === '••••••••••••••••••••') {
                    setApiKey('');
                  }
                }}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setValidationResult(null);
                  if (e.target.value !== '••••••••••••••••••••') {
                    setIsSaved(false);
                  }
                }}
                placeholder="Paste API key here..."
                className="w-full px-4 py-2.5 pr-20 bg-white border border-gray-300 
                           rounded-lg focus:border-holy-500 focus:ring-1 focus:ring-holy-400 focus:outline-none text-gray-800"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-400"
                  tabIndex={-1}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Validation Status */}
            {validationResult !== null && (
              <div className={`flex items-center gap-2 mt-2 text-sm
                              ${validationResult ? 'text-green-600' : 'text-red-600'}`}>
                {validationResult ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Key is valid!</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    <span>Invalid key</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleValidate}
              disabled={!apiKey || apiKey.includes('•') || isValidating}
              className="flex-1 py-2.5 bg-holy-600 hover:bg-holy-700 disabled:bg-gray-300 
                         disabled:text-gray-500 rounded-lg font-medium transition-colors
                         flex items-center justify-center gap-2 text-white"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : isSaved && !apiKey.includes('•') ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : (
                'Validate & Save'
              )}
            </button>
            
            {isSaved && (
              <button
                onClick={handleRemove}
                className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 
                           text-red-500 rounded-lg transition-colors border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Guide */}
          <div className="bg-holy-50 rounded-lg p-4 border border-holy-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              How to get API Key:
            </h4>
            <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
              {guide.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            {guide.url && (
                <a
                href={guide.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs text-holy-700 
                            hover:text-holy-800 underline"
                >
                Get API Key
                <ExternalLink className="w-3 h-3" />
                </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIKeyManager;
