import React, { useState, useRef } from 'react';
import {
  Upload,
  Wand2,
  X,
  Image as ImageIcon,
  Palette,
  Scissors,
  Expand,
  Eye,
  Download,
  Save,
  RotateCcw
} from 'lucide-react';
import { useAIStore } from '../store/aiStore';
import { useStore } from '../store';
import aiManager from '../services/ai/AIProviderManager';
import ProviderSelector from './ai/ProviderSelector';
import APIKeyManager from './ai/APIKeyManager';
import Konva from 'konva';
import { CATHOLIC_ART_STYLES } from '../services/ai/presets/catholicStyles';
import { GenerationMode, AIProviderType } from '../services/ai/types';

interface ImageEditingPanelProps {
  initialImage?: string;
  onClose?: () => void;
}

// Editing modes
const EDITING_MODES = [
  { id: 'image-to-image', name: 'Transform', icon: <Wand2 className="w-4 h-4" />, description: 'Change overall style and composition' },
  { id: 'inpainting', name: 'Inpaint', icon: <Palette className="w-4 h-4" />, description: 'Fill in or replace specific areas' },
  { id: 'outpainting', name: 'Outpaint', icon: <Expand className="w-4 h-4" />, description: 'Extend image beyond borders' },
  { id: 'background-removal', name: 'Remove BG', icon: <Scissors className="w-4 h-4" />, description: 'Remove background from subject' },
];

export const ImageEditingPanel: React.FC<ImageEditingPanelProps> = ({
  initialImage,
  onClose
}) => {
  const {
    activeProvider,
    isGenerating,
    generate: aiGenerate
  } = useAIStore();

  const { addLayer } = useStore();

  const [currentImage, setCurrentImage] = useState<string | null>(initialImage || null);
  const [originalImage, setOriginalImage] = useState<string | null>(initialImage || null);
  const [editingMode, setEditingMode] = useState<GenerationMode>('image-to-image');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('renaissance');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [strength, setStrength] = useState(0.75);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState<AIProviderType | null>(null);

  const providerConfig = aiManager.getProvider(activeProvider)?.getConfig();
  const availableModels = providerConfig?.models || [];
  const isConfigured = aiManager.getConfiguredProviders().some(p => p.id === activeProvider);

  // Set default model when provider changes
  React.useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0].id);
    }
  }, [activeProvider, availableModels]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgSrc = e.target?.result as string;
        setCurrentImage(imgSrc);
        setOriginalImage(imgSrc);
        setMaskImage(null); // Clear mask when new image is loaded
      };
      reader.readAsDataURL(file);
    }
  };

  const canvasToDataURL = () => {
    if (canvasRef.current) {
      return canvasRef.current.toDataURL();
    }
    return null;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (editingMode === 'inpainting' && currentImage && isDrawing) {
      setIsDrawing(true);
      drawOnCanvas(e);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDrawing && editingMode === 'inpainting') {
      drawOnCanvas(e);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const drawOnCanvas = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Red mask
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    // Update mask image data URL
    setMaskImage(canvas.toDataURL());
  };

  const clearMask = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setMaskImage(null);
    }
  };

  const undoChanges = () => {
    setCurrentImage(originalImage);
    clearMask();
  };

  const handleEdit = async () => {
    if (!currentImage || !prompt.trim() || !isConfigured) return;

    try {
      const response = await aiGenerate({
        model: selectedModel,
        mode: editingMode,
        prompt: prompt.trim(),
        style: selectedStyle,
        sourceImage: currentImage,
        maskImage: editingMode === 'inpainting' ? maskImage : undefined,
        strength,
        numImages: 1,
      });

      if (response.success && response.images.length > 0) {
        const newImage = response.images[0].base64 || response.images[0].url;
        if (newImage) {
          setCurrentImage(newImage);
          setOriginalImage(newImage); // Update original for undo
          clearMask();
        }
      }
    } catch (error) {
      console.error('Editing failed:', error);
    }
  };

  const addToCanvas = () => {
    if (currentImage) {
      addLayer({
        id: crypto.randomUUID(),
        category: 'ai-generated',
        name: `Edited: ${prompt.slice(0, 20)}...`,
        src: currentImage,
        description: `Edited image: ${prompt}`
      });
    }
  };

  const downloadImage = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.download = `edited-image-${Date.now()}.png`;
      link.href = currentImage;
      link.click();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-holy-200 bg-holy-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-serif font-bold flex items-center gap-2 text-holy-900">
            <ImageIcon className="w-5 h-5 text-holy-600" />
            Image Editor
          </h2>
          <div className="flex items-center gap-2">
            <ProviderSelector onSettingsClick={(provider) => setShowAPIKeyModal(provider)} />
            {onClose && (
              <button onClick={onClose} className="p-1 hover:bg-holy-100 rounded">
                <X className="w-5 h-5 text-holy-600" />
              </button>
            )}
          </div>
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
        {/* Image Upload/Preview */}
        <div className="bg-white border-2 border-dashed border-holy-200 rounded-lg p-4">
          {!currentImage ? (
            <div className="text-center">
              <Upload className="w-12 h-12 text-holy-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Upload an image to edit</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-holy-600 text-white rounded-lg hover:bg-holy-700"
              >
                Choose Image
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image preview with overlay for editing */}
              <div className="relative">
                <img
                  src={currentImage}
                  alt="Preview"
                  className="w-full max-h-80 object-contain rounded-lg border border-holy-200"
                />
                {/* Mask overlay for inpainting */}
                {editingMode === 'inpainting' && maskImage && (
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={200}
                    className="absolute inset-0 w-full h-full cursor-crosshair border-2 border-holy-400 rounded-lg"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                )}
              </div>

              {/* Image Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-holy-100 text-holy-700 rounded text-sm hover:bg-holy-200"
                >
                  Change Image
                </button>
                {maskImage && (
                  <button
                    onClick={clearMask}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    Clear Mask
                  </button>
                )}
                {currentImage !== originalImage && (
                  <button
                    onClick={undoChanges}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Undo
                  </button>
                )}
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Editing Modes */}
        {currentImage && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Editing Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EDITING_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setEditingMode(mode.id as GenerationMode)}
                  className={`p-3 rounded-lg border transition-all text-left
                             ${editingMode === mode.id
                               ? 'border-holy-500 bg-holy-100 text-holy-800'
                               : 'border-gray-200 bg-white hover:border-holy-300 hover:bg-holy-50 text-gray-600'}`}
                >
                  <div className="flex items-start gap-2">
                    {mode.icon}
                    <div>
                      <div className="font-medium text-sm">{mode.name}</div>
                      <div className="text-xs text-gray-500">{mode.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tool Settings */}
        {currentImage && editingMode === 'inpainting' && (
          <div className="bg-white rounded-lg p-4 border border-holy-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Inpainting Tools</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Brush Size: {brushSize}px</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full accent-holy-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Strength: {(strength * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={strength}
                  onChange={(e) => setStrength(parseFloat(e.target.value))}
                  className="w-full accent-holy-600"
                />
              </div>
              <p className="text-xs text-gray-500">Click and drag on the image to mark areas to edit</p>
            </div>
          </div>
        )}

        {/* Model Selection */}
        {currentImage && (
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
        )}

        {/* Prompt Input */}
        {currentImage && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              {editingMode === 'inpainting' ? 'What to put in the marked areas?' : 'Describe the transformation'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                editingMode === 'inpainting'
                  ? "Describe what's in the areas you marked..."
                  : editingMode === 'outpainting'
                  ? "Describe what to add around the image..."
                  : "Describe how to transform this image..."
              }
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg
                         focus:border-holy-500 focus:ring-1 focus:ring-holy-400 focus:outline-none resize-none text-gray-800"
            />
          </div>
        )}

        {/* Style Selection */}
        {currentImage && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Art Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATHOLIC_ART_STYLES.slice(0, 6).map((style) => (
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
        )}
      </div>

      {/* Footer - Action Buttons */}
      {currentImage && (
        <div className="p-4 border-t border-holy-200 bg-white">
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              disabled={!prompt.trim() || isGenerating || !isConfigured}
              className="flex-1 py-3 bg-gradient-to-r from-holy-600 to-holy-500
                         hover:from-holy-700 hover:to-holy-600
                         disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500
                         rounded-lg font-bold transition-all text-white
                         flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  {editingMode === 'inpainting' ? 'Fill Areas' : editingMode === 'outpainting' ? 'Extend Image' : 'Transform'}
                </>
              )}
            </button>

            <div className="flex gap-1">
              <button
                onClick={downloadImage}
                className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                title="Download image"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={addToCanvas}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title="Add to canvas"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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
