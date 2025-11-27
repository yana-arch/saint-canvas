
import React from 'react';
import { useStore } from '../store';
import { 
  Undo, Redo, Trash2, Lock, Unlock, 
  MoveUp, MoveDown, Type, Layers,
  FlipHorizontal, FlipVertical
} from 'lucide-react';

const BLEND_MODES = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'difference', label: 'Difference' },
];

export const ToolBar: React.FC = () => {
  const { 
    undo, redo, past, future, 
    selectedLayerId, layers, updateLayer, removeLayer,
    toggleLayerLock, moveLayer
  } = useStore();

  const selectedLayer = layers.find(l => l.id === selectedLayerId);
  const selectedIndex = layers.findIndex(l => l.id === selectedLayerId);

  return (
    <div className="h-12 bg-white border-b border-holy-200 flex items-center px-4 justify-between shadow-sm z-10 overflow-x-auto scrollbar-hide">
      {/* History Controls */}
      <div className="flex items-center gap-2 border-r border-holy-200 pr-4 flex-shrink-0">
        <button 
          onClick={undo}
          disabled={past.length === 0}
          className="p-1.5 text-gray-600 hover:text-holy-700 hover:bg-holy-50 rounded disabled:opacity-30 disabled:hover:bg-transparent"
          title="Undo (Ctrl+Z)"
        >
          <Undo size={18} />
        </button>
        <button 
          onClick={redo}
          disabled={future.length === 0}
          className="p-1.5 text-gray-600 hover:text-holy-700 hover:bg-holy-50 rounded disabled:opacity-30 disabled:hover:bg-transparent"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo size={18} />
        </button>
      </div>

      {/* Contextual Controls */}
      {selectedLayer ? (
        <div className="flex items-center gap-4 flex-1 pl-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-bold text-gray-400 uppercase hidden sm:inline">
                {selectedLayer.type === 'text' ? 'Text' : 'Layer'}
            </span>
            <span className="text-sm font-medium text-holy-900 truncate max-w-[100px] sm:max-w-[150px]">
                {selectedLayer.name}
            </span>
          </div>

          <div className="h-4 w-px bg-gray-200 flex-shrink-0"></div>

          {/* Opacity */}
          <div className="flex items-center gap-2 flex-shrink-0 group relative">
            <span className="text-xs text-gray-500 hidden sm:inline">Opacity</span>
            <input 
              type="range" 
              min="0" max="1" step="0.05"
              value={selectedLayer.opacity}
              onChange={(e) => updateLayer(selectedLayer.id, { opacity: parseFloat(e.target.value) }, false)} // Don't save on drag
              onMouseUp={(e) => updateLayer(selectedLayer.id, { opacity: parseFloat(e.currentTarget.value) }, true)} // Save on release
              className="w-16 sm:w-20 accent-holy-600 cursor-pointer"
            />
          </div>

          <div className="h-4 w-px bg-gray-200 flex-shrink-0"></div>

          {/* Blend Mode */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Layers size={14} className="text-gray-500" />
            <select
              value={selectedLayer.blendMode || 'source-over'}
              onChange={(e) => updateLayer(selectedLayer.id, { blendMode: e.target.value }, true)}
              className="text-xs border border-gray-300 rounded p-1 focus:ring-holy-400 focus:outline-none bg-white max-w-[80px] sm:max-w-none"
            >
              {BLEND_MODES.map(mode => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-gray-200 flex-shrink-0"></div>

          {/* Text Specific */}
          {selectedLayer.type === 'text' && (
            <>
               <div className="flex items-center gap-2 flex-shrink-0">
                  <Type size={14} className="text-gray-500"/>
                  <input 
                    type="number"
                    value={selectedLayer.fontSize}
                    onChange={(e) => updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) }, true)}
                    className="w-12 p-1 text-xs border border-gray-300 rounded focus:ring-holy-400 focus:border-holy-400"
                    min="8" max="200"
                  />
                  <input 
                    type="color"
                    value={selectedLayer.fill}
                    onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value }, true)}
                    className="w-6 h-6 rounded cursor-pointer border-none p-0"
                  />
               </div>
               <div className="h-4 w-px bg-gray-200 flex-shrink-0"></div>
            </>
          )}

          {/* Transform & Arrange */}
          <div className="flex items-center gap-1 flex-shrink-0">
             {/* Flip Controls */}
             <button
               onClick={() => updateLayer(selectedLayer.id, { scaleX: selectedLayer.scaleX * -1 }, true)}
               className="p-1.5 hover:bg-holy-50 rounded text-gray-600"
               title="Flip Horizontal"
             >
                <FlipHorizontal size={16} />
             </button>
             <button
               onClick={() => updateLayer(selectedLayer.id, { scaleY: selectedLayer.scaleY * -1 }, true)}
               className="p-1.5 hover:bg-holy-50 rounded text-gray-600"
               title="Flip Vertical"
             >
                <FlipVertical size={16} />
             </button>
             
             <div className="h-4 w-px bg-gray-200 mx-1"></div>

             {/* Order Controls */}
             <button
               onClick={() => moveLayer(selectedIndex, selectedIndex + 1)}
               disabled={selectedIndex === layers.length - 1}
               className="p-1.5 hover:bg-holy-50 rounded text-gray-600 disabled:opacity-30"
               title="Bring Forward"
             >
                <MoveUp size={16} />
             </button>
             <button
               onClick={() => moveLayer(selectedIndex, selectedIndex - 1)}
               disabled={selectedIndex === 0}
               className="p-1.5 hover:bg-holy-50 rounded text-gray-600 disabled:opacity-30"
               title="Send Backward"
             >
                <MoveDown size={16} />
             </button>
          </div>

          <div className="h-4 w-px bg-gray-200 flex-shrink-0"></div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button 
              onClick={() => toggleLayerLock(selectedLayer.id)}
              className={`p-1.5 rounded ${selectedLayer.locked ? 'text-holy-600 bg-holy-50' : 'text-gray-400 hover:text-gray-600'}`}
              title={selectedLayer.locked ? "Unlock" : "Lock"}
            >
              {selectedLayer.locked ? <Lock size={16} /> : <Unlock size={16} />}
            </button>
            <button 
              onClick={() => removeLayer(selectedLayer.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 text-center text-xs text-gray-400 italic">
          Select an object to edit properties
        </div>
      )}
    </div>
  );
};
