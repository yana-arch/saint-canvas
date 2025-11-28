import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Loader2,
  ChevronDown,
  Info,
  DollarSign,
  Settings2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useAIStore } from '../store/aiStore';
import { useStore } from '../store';
import aiManager from '../services/ai/AIProviderManager';
import ProviderSelector from './ai/ProviderSelector';
import APIKeyManager from './ai/APIKeyManager';
import { CATHOLIC_ART_STYLES } from '../services/ai/presets/catholicStyles';
import { DEPARTMENT_TRANSFORMS, DEPARTMENT_CATEGORIES } from '../services/ai/presets/departmentTransforms';
import { 
  AIProviderType, 
  GenerationMode, 
} from '../services/ai/types';
import Konva from 'konva';

interface PromptPanelProps {
  stageRef?: React.RefObject<Konva.Stage>;
}

// Rate Limit Status Component
const RateLimitStatus: React.FC<{ provider: AIProviderType }> = ({ provider }) => {
  const rateLimitStatus = aiManager.getRateLimitStatus(provider);

  if (!rateLimitStatus) return null;

  const { currentUsage, limit, remainingTime } = rateLimitStatus;
  const isApproachingLimit = currentUsage / limit > 0.8;
  const isNearLimit = currentUsage / limit > 0.9;

  if (!isApproachingLimit) return null;

  return (
    <div className={`mb-3 p-2 rounded-lg text-xs ${
      isNearLimit
        ? 'bg-red-50 border border-red-200'
        : 'bg-yellow-50 border border-yellow-200'
    }`}>
      <div className="flex items-center gap-2">
        {isNearLimit ? (
          <AlertTriangle className="w-4 h-4 text-red-600" />
        ) : (
          <Clock className="w-4 h-4 text-yellow-600" />
        )}
        <span className={`font-medium ${
          isNearLimit ? 'text-red-800' : 'text-yellow-800'
        }`}>
          Rate Limit: {currentUsage}/{limit} requests
        </span>
      </div>
      <div className="text-gray-600 mt-1">
        {remainingTime > 0 && `${Math.ceil(remainingTime / 1000)}s until reset`}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
        <div
          className={`h-1 rounded-full transition-all ${
            isNearLimit ? 'bg-red-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${Math.min((currentUsage / limit) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
};

export const PromptPanel: React.FC<PromptPanelProps> = ({ stageRef }) => {
  const {
    activeProvider,
    isGenerating,
    generationProgress,
    generate,
    defaultStyle,
    updateSettings,
  } = useAIStore();

  const { addLayer } = useStore();

  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GenerationMode>('text-to-image');
  const [selectedStyle, setSelectedStyle] = useState<string>(defaultStyle);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState<AIProviderType | null>(null);

  // Department transformation state
  const [selectedDepartment, setSelectedDepartment] = useState<string>('none');
  const [showDepartmentTransform, setShowDepartmentTransform] = useState(false);

  // Advanced options
  const [numImages, setNumImages] = useState(1);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [guidanceScale, setGuidanceScale] = useState(7.5);

  const providerConfig = aiManager.getProvider(activeProvider)?.getConfig();
  const availableModels = providerConfig?.models || [];
  const isConfigured = aiManager.getConfiguredProviders().some(p => p.id === activeProvider);

  // Set default model when provider changes
  React.useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0].id);
    }
  }, [activeProvider, availableModels]);

  const getCanvasDataURL = async () => {
    if (stageRef?.current) {
        const stage = stageRef.current;
        const layer = stage.getLayers()[0];
        const contentGroup = layer.findOne('.workArea') as Konva.Group;
        
        if (contentGroup) {
           const oldScale = contentGroup.scale();
           const oldPos = contentGroup.position();
           
           contentGroup.scale({ x: 1, y: 1 });
           contentGroup.position({ x: 0, y: 0 });
           
           const dataUrl = contentGroup.toDataURL({ pixelRatio: 1 });
           
           contentGroup.scale(oldScale);
           contentGroup.position(oldPos);
           
           return dataUrl;
        }
    }
    return undefined;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !isConfigured) return;

    try {
      let sourceImage: string | undefined;
      let finalPrompt = prompt.trim();
      
      if (mode === 'image-to-image') {
        sourceImage = await getCanvasDataURL();
        if (!sourceImage) {
            alert("Could not capture canvas. Please try again.");
            return;
        }

        // Apply department transformation if selected
        if (selectedDepartment !== 'none') {
          const department = DEPARTMENT_TRANSFORMS.find(d => d.id === selectedDepartment);
          if (department) {
            finalPrompt = `${finalPrompt}. ${department.prompt}`;
          }
        }
      }

      const response = await generate({
        model: selectedModel,
        mode,
        prompt: finalPrompt,
        negativePrompt: negativePrompt.trim() || undefined,
        style: selectedStyle,
        numImages,
        guidanceScale,
        sourceImage,
      });

      if (response.success && response.images.length > 0) {
        // Add generated images as layers
        for (const image of response.images) {
          const imgSrc = image.base64 || image.url;
          if (imgSrc) {
            addLayer({
              id: crypto.randomUUID(),
              category: 'ai-generated',
              name: `AI: ${prompt.slice(0, 20)}...`,
              src: imgSrc,
              description: finalPrompt
            });
          }
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const estimatedCost = React.useMemo(() => {
    if (!selectedModel) return 0;
    const model = availableModels.find(m => m.id === selectedModel);
    return (model?.costPerImage || 0) * numImages;
  }, [selectedModel, numImages, availableModels]);

  const selectedDepartmentData = DEPARTMENT_TRANSFORMS.find(d => d.id === selectedDepartment);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-holy-200 bg-holy-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-serif font-bold flex items-center gap-2 text-holy-900">
            <Sparkles className="w-5 h-5 text-holy-600" />
            Divine AI
          </h2>
          <ProviderSelector 
            onSettingsClick={(provider) => setShowAPIKeyModal(provider)} 
          />
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 bg-holy-100 p-1 rounded-lg">
          <button
            onClick={() => setMode('text-to-image')}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all
                       ${mode === 'text-to-image' 
                         ? 'bg-white shadow-sm text-holy-800' 
                         : 'text-gray-500 hover:bg-white/60'}`}
          >
            <Wand2 className="w-4 h-4 inline mr-2" />
            Generate
          </button>
          <button
            onClick={() => setMode('image-to-image')}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all
                       ${mode === 'image-to-image' 
                         ? 'bg-white shadow-sm text-holy-800' 
                         : 'text-gray-500 hover:bg-white/60'}`}
          >
            <ImageIcon className="w-4 h-4 inline mr-2" />
            Transform
          </button>
        </div>
      </div>

      {/* Not Configured Warning */}
      {!isConfigured && (
        <div className="mx-4 mt-4 p-3 bg-gold-400/10 border border-gold-400/30 rounded-lg">
          <p className="text-sm text-gold-600">
            An API key for {providerConfig?.name} is required.
          </p>
          <button
            onClick={() => setShowAPIKeyModal(activeProvider)}
            className="mt-2 text-sm text-gold-500 hover:text-gold-600 underline"
          >
            Set API Key →
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-holy-50/30">
        {/* Model Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg
                       focus:border-holy-500 focus:ring-1 focus:ring-holy-400 focus:outline-none text-gray-800"
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} {model.costPerImage ? `($${model.costPerImage})` : '(Free)'}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt Input */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={mode === 'text-to-image' 
              ? "Describe the image you want to create...\ne.g., The Virgin Mary with a halo, Byzantine style"
              : "Describe how you want to transform the current canvas..."}
            rows={4}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg
                       focus:border-holy-500 focus:ring-1 focus:ring-holy-400 focus:outline-none resize-none text-gray-800"
          />
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Art Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATHOLIC_ART_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-2 rounded-lg border transition-all text-xs flex flex-col items-center h-full
                           ${selectedStyle === style.id
                             ? 'border-holy-500 bg-holy-100 text-holy-800 font-bold'
                             : 'border-gray-200 bg-white hover:border-holy-300 hover:bg-holy-50 text-gray-600'}`}
              >
                <span className="text-lg block mb-1">{style.icon}</span>
                <span className="text-center leading-tight">{style.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Department Transform Section - Only show in Transform mode */}
        {mode === 'image-to-image' && (
          <div>
            <button
              onClick={() => setShowDepartmentTransform(!showDepartmentTransform)}
              className="flex items-center gap-2 text-sm text-holy-700 hover:text-holy-900 font-medium"
            >
              <Settings2 className="w-4 h-4" />
              Vocational Department Transform
              <ChevronDown className={`w-4 h-4 transition-transform ${showDepartmentTransform ? 'rotate-180' : ''}`} />
            </button>

            {showDepartmentTransform && (
              <div className="mt-3 space-y-3">
                {/* Department Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Select Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg
                               focus:border-holy-500 focus:ring-1 focus:ring-holy-400 focus:outline-none text-gray-800"
                  >
                    <option value="none">None - Manual Transform Only</option>
                    {DEPARTMENT_CATEGORIES.map((category) => (
                      <optgroup key={category.name} label={category.name}>
                        {category.departments.map((deptId) => {
                          const dept = DEPARTMENT_TRANSFORMS.find(d => d.id === deptId);
                          return dept ? (
                            <option key={dept.id} value={dept.id}>
                              {dept.icon} {dept.name}
                            </option>
                          ) : null;
                        })}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Department Description */}
                {selectedDepartmentData && (
                  <div className="p-3 bg-holy-100 rounded-lg border border-holy-200">
                    <h4 className="text-sm font-medium text-holy-800 mb-1">
                      {selectedDepartmentData.icon} {selectedDepartmentData.name}
                    </h4>
                    <p className="text-xs text-holy-700 mb-2">
                      {selectedDepartmentData.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedDepartmentData.contextTags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-holy-200 text-holy-800 text-xs rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info Notice */}
                <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-800">
                    Department transform adds workshop/industry context to your canvas transformation. 
                    The selected department's environment will be integrated with your transformation prompt.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced Options */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-holy-700"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            Advanced Options
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-4 p-3 bg-holy-100 rounded-lg border border-holy-200">
              {/* Number of Images */}
              <div>
                <label className="flex items-center justify-between text-xs text-gray-500">
                  <span>Number of Images</span>
                  <span className="text-gray-800 font-medium">{numImages}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={numImages}
                  onChange={(e) => setNumImages(parseInt(e.target.value))}
                  className="w-full mt-1 accent-holy-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Guidance Scale */}
              <div>
                <label className="flex items-center justify-between text-xs text-gray-500">
                  <span>Guidance Scale</span>
                  <span className="text-gray-800 font-medium">{guidanceScale}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={guidanceScale}
                  onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                  className="w-full mt-1 accent-holy-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Negative Prompt */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Negative Prompt
                </label>
                <textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="What you DON'T want in the image..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-gray-300 
                             rounded-lg text-sm resize-none text-gray-800"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Generate Button */}
      <div className="p-4 border-t border-holy-200 bg-white">
        {/* Rate Limit Status */}
        <RateLimitStatus provider={activeProvider} />

        {/* Cost Estimate */}
        {estimatedCost > 0 && (
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-gray-500 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Estimated Cost
            </span>
            <span className="text-holy-700 font-medium">
              ${estimatedCost.toFixed(3)}
            </span>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating || !isConfigured}
          className="w-full py-3 bg-gradient-to-r from-holy-600 to-holy-500 
                     hover:from-holy-700 hover:to-holy-600
                     disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500
                     rounded-lg font-bold transition-all text-white
                     flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating... {generationProgress}%
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {mode === 'text-to-image' ? 'Generate Image' : 'Transform Canvas'}
              {selectedDepartmentData && mode === 'image-to-image' ? ` + ${selectedDepartmentData.name}` : ''}
            </>
          )}
        </button>
      </div>

      {/* API Key Modal */}
      {showAPIKeyModal && (
        <APIKeyManager
          provider={showAPIKeyModal}
          onClose={() => setShowAPIKeyModal(null)}
        />
      )}
    </div>
  );
};
