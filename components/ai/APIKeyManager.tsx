import React, { useState, useEffect } from 'react';
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
  
  // Track if we should show the masked input (when API key exists but user hasn't focused)
  const [hasApiKey, setHasApiKey] = useState(() => {
    return aiManager.getConfiguredProviders().some(p => p.id === provider);
  });
  
  // The actual input value
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(() => {
    return aiManager.getConfiguredProviders().some(p => p.id === provider);
  });

  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);
  const [skipValidation, setSkipValidation] = useState(false);

  // Update state when provider configuration changes
  useEffect(() => {
    const isConfigured = aiManager.getConfiguredProviders().some(p => p.id === provider);
    setHasApiKey(isConfigured);
    setIsSaved(isConfigured);
    
    // Reset input if API key was removed
    if (!isConfigured) {
      setApiKey('');
      setValidationResult(null);
    }
  }, [provider]);

  const handleSave = async () => {
    if (!apiKey || apiKey.includes('•')) return;

    setIsValidating(true);
    setValidationResult(null);

    if (skipValidation) {
      // Save without validation
      aiManager.setApiKeyWithoutValidation(provider, apiKey, true);
      setIsSaved(true);
      setHasApiKey(true);
      setApiKey('');
      setIsValidating(false);
    } else {
      // Validate first, then save
      try {
        const isValid = await aiManager.validateApiKey(provider, apiKey);
        setValidationResult(isValid);

        if (isValid) {
          aiManager.setApiKey(provider, apiKey);
          setIsSaved(true);
          setHasApiKey(true);
          setApiKey('');
        }
      } catch (error) {
        setValidationResult(false);
      } finally {
        setIsValidating(false);
      }
    }
  };

  const handleRemove = () => {
    aiManager.removeApiKey(provider);
    setApiKey('');
    setIsSaved(false);
    setHasApiKey(false);
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
      'deepai': {
        url: 'https://www.google.com/search?q=DeepAI+API+key',
        steps: [
          'Go to DeepAI website',
          'Sign up for account',
          'Get API Key from dashboard',
          'Copy and paste here',
        ],
      },
      'huggingface': {
        url: 'https://www.google.com/search?q=HuggingFace+API+token',
        steps: [
          'Go to HuggingFace',
          'Create account (if needed)',
          'Go to Settings > Access Tokens',
          'Create new token (Role: Read)',
          'Copy and paste here',
        ],
      },
      'clipdrop': {
        url: 'https://www.google.com/search?q=Clipdrop+API+key',
        steps: [
          'Go to Clipdrop website',
          'Sign in with Stability AI account',
          'Go to API section',
          'Generate API key',
          'Copy and paste here',
        ],
      },
      'bytedance-aigc': {
        url: 'https://www.google.com/search?q=ByteDance+AIGC+API+key',
        steps: [
          'Search for ByteDance AIGC API',
          'Find official documentation',
          'Register for API access',
          'Obtain API key',
          'Copy and paste here',
        ],
      },
      'removebg': {
        url: 'https://www.google.com/search?q=Remove.bg+API+key',
        steps: [
          'Go to Remove.bg',
          'Sign up for account',
          'Go to API section',
          'Get API key',
          'Copy and paste here',
        ],
      },
    };

    return guides[provider] || { url: '', steps: [] };
  };

  const guide = getProviderGuide();

  // Determine what to show in the input
  const getInputValue = () => {
    if (showKey && hasApiKey && !apiKey) {
      // Show masked version when user wants to see but we don't have the actual key
      return '••••••••••••••••••••';
    }
    return apiKey || (hasApiKey && !showKey ? '••••••••••••••••••••' : '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setApiKey(newValue);
    setValidationResult(null);
    
    // If user is typing something different from the mask, they want to update
    if (newValue !== '••••••••••••••••••••') {
      setIsSaved(false);
    }
  };

  const handleInputFocus = () => {
    // Clear input when user wants to enter a new key
    if (hasApiKey) {
      setApiKey('');
      setHasApiKey(false);
      setIsSaved(false);
      setValidationResult(null);
    }
  };

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
                value={getInputValue()}
                autoComplete="off"
                onFocus={handleInputFocus}
                onChange={handleInputChange}
                placeholder="Paste API key here..."
                className="w-full px-4 py-2.5 pr-20 bg-white border border-gray-300 
                           rounded-lg focus:border-holy-500 focus:ring-1 focus:ring-holy-400 focus:outline-none text-gray-800"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-400"
                  tabIndex={-1}
                  disabled={!hasApiKey}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Status Info */}
            {hasApiKey && !showKey && !apiKey && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Check className="w-4 h-4 text-green-500" />
                <span>API key is configured</span>
              </div>
            )}

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

          {/* Skip Validation Checkbox */}
          {!isSaved && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="skip-validation"
                checked={skipValidation}
                onChange={(e) => setSkipValidation(e.target.checked)}
                className="w-4 h-4 text-holy-600 border-gray-300 rounded focus:ring-holy-500"
              />
              <label htmlFor="skip-validation" className="text-sm text-gray-600">
                Skip validation (preserve daily quota)
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!apiKey || apiKey.includes('•') || isValidating}
              className="flex-1 py-2.5 bg-holy-600 hover:bg-holy-700 disabled:bg-gray-300
                         disabled:text-gray-500 rounded-lg font-medium transition-colors
                         flex items-center justify-center gap-2 text-white"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {skipValidation ? 'Saving...' : 'Validating...'}
                </>
              ) : isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : skipValidation ? (
                'Save (Skip Validation)'
              ) : (
                'Validate & Save'
              )}
            </button>
            
            {hasApiKey && (
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
