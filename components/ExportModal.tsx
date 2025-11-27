
import React, { useState } from 'react';
import Konva from 'konva';
import { X, Download, Image as ImageIcon, Type, Sparkles } from 'lucide-react';
import { useStore } from '../store';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageRef: React.RefObject<Konva.Stage>;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, stageRef }) => {
  const { canvasSettings } = useStore();
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(2); // Default to 2x for better quality
  const [watermark, setWatermark] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    if (!stageRef.current) return;
    
    const stage = stageRef.current;
    
    // We want to export exactly the 'virtual' canvas area.
    // The Group inside EditorCanvas is named 'workArea'.
    const layer = stage.getLayers()[0];
    const contentGroup = layer.findOne('.workArea') as Konva.Group;
    
    if (!contentGroup) {
        console.error("Could not find workArea group");
        return;
    }

    // Cache the current transform to restore later
    const oldScale = contentGroup.scale();
    const oldPos = contentGroup.position();
    
    // Reset transform to 1:1 at 0,0 for clean export
    contentGroup.scale({ x: 1, y: 1 });
    contentGroup.position({ x: 0, y: 0 });
    
    // Temporary watermark
    let watermarkNode: Konva.Text | null = null;
    if (watermark) {
      watermarkNode = new Konva.Text({
        text: 'SaintCanvas',
        x: canvasSettings.width - 20,
        y: canvasSettings.height - 20,
        fontSize: 24,
        fontFamily: 'Cinzel',
        fill: 'rgba(255, 255, 255, 0.7)',
        stroke: 'rgba(0,0,0,0.5)',
        strokeWidth: 1,
        align: 'right',
        offsetY: 24,
        offsetX: 150 // approximate width
      });
      contentGroup.add(watermarkNode);
    }
    
    // Export the group
    const uri = contentGroup.toDataURL({
        pixelRatio: scale,
        mimeType: `image/${format}`,
        quality: format === 'jpeg' ? quality : undefined,
        width: canvasSettings.width,
        height: canvasSettings.height,
        x: 0,
        y: 0
    });

    // Cleanup: Restore transform and remove watermark
    contentGroup.scale(oldScale);
    contentGroup.position(oldPos);
    
    if (watermarkNode) {
        watermarkNode.destroy();
    }

    // Trigger Download
    const link = document.createElement('a');
    link.download = `saint-canvas-${Date.now()}.${format}`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-holy-50">
          <div className="flex items-center gap-2">
            <Download className="text-holy-600" size={20} />
            <h2 className="text-lg font-serif font-bold text-holy-900">Export Image</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <ImageIcon size={14} /> Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('png')}
                className={`py-2 px-4 rounded-lg text-sm font-medium border transition-all ${
                  format === 'png'
                    ? 'bg-holy-100 border-holy-500 text-holy-800'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-holy-300'
                }`}
              >
                PNG (High Quality)
              </button>
              <button
                onClick={() => setFormat('jpeg')}
                className={`py-2 px-4 rounded-lg text-sm font-medium border transition-all ${
                  format === 'jpeg'
                    ? 'bg-holy-100 border-holy-500 text-holy-800'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-holy-300'
                }`}
              >
                JPEG (Smaller Size)
              </button>
            </div>
          </div>

          {/* Quality Slider (JPEG only) */}
          {format === 'jpeg' && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <label className="font-bold text-gray-500 uppercase">Quality</label>
                <span className="text-holy-700 font-mono">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-holy-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          {/* Scale Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase">Size / Scale</label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${
                    scale === s
                      ? 'bg-white text-holy-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Watermark Toggle */}
          <div className="flex items-center justify-between pt-2">
             <div className="flex items-center gap-2">
                <Type size={16} className="text-holy-500" />
                <span className="text-sm font-medium text-gray-700">Add Watermark</span>
             </div>
             <button
               onClick={() => setWatermark(!watermark)}
               className={`w-11 h-6 rounded-full transition-colors relative ${
                 watermark ? 'bg-holy-600' : 'bg-gray-300'
               }`}
             >
               <span 
                 className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                   watermark ? 'translate-x-5' : 'translate-x-0'
                 }`}
               />
             </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleExport}
            className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-holy-600 to-holy-500 hover:from-holy-700 hover:to-holy-600 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Sparkles size={16} /> Export Now
          </button>
        </div>
      </div>
    </div>
  );
};
