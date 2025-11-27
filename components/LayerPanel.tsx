
import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Eye, EyeOff, Lock, Unlock, 
  Layers, Sliders, Type, ImageIcon, Sparkles,
  Eclipse, AlignCenter, Droplet, GripVertical
} from 'lucide-react';

export const LayerPanel: React.FC = () => {
  const { 
    layers, selectedLayerId, selectLayer, 
    updateLayer, moveLayer,
    toggleLayerVisibility, toggleLayerLock,
    canvasSettings, resizeCanvas, updateCanvasSettings
  } = useStore();

  const [activeTab, setActiveTab] = useState<'layers' | 'settings'>('layers');
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);

  // Layers are stored bottom-to-top. Display top-to-bottom for list (Reverse for UI).
  // Note: dragging logic needs to account for this visual reversal.
  const displayLayers = [...layers].reverse();
  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLayerId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent ghost image
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedLayerId || draggedLayerId === targetId) {
       setDraggedLayerId(null);
       return;
    }

    // Find original indices
    const fromIndex = layers.findIndex(l => l.id === draggedLayerId);
    const toIndex = layers.findIndex(l => l.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
        moveLayer(fromIndex, toIndex);
    }
    setDraggedLayerId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-holy-200">
      
      {/* Tabs */}
      <div className="flex border-b border-holy-200 bg-holy-50">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'layers' 
              ? 'text-holy-800 bg-white border-b-2 border-holy-600' 
              : 'text-gray-500 hover:text-holy-700'
          }`}
        >
          <Layers size={16} /> Layers
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'settings' 
              ? 'text-holy-800 bg-white border-b-2 border-holy-600' 
              : 'text-gray-500 hover:text-holy-700'
          }`}
        >
          <Sliders size={16} /> Adjust
        </button>
      </div>

      {/* CONTENT: LAYERS LIST */}
      {activeTab === 'layers' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-holy-50/30">
           <div className="px-2 py-1 flex justify-between items-center text-xs text-gray-400 uppercase font-bold">
              <span>Stack Order</span>
              <span>{layers.length} items</span>
           </div>
          {displayLayers.map((layer) => {
            const isSelected = selectedLayerId === layer.id;
            const isDragging = draggedLayerId === layer.id;

            return (
              <div 
                key={layer.id}
                draggable
                onDragStart={(e) => handleDragStart(e, layer.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, layer.id)}
                onClick={() => selectLayer(layer.id)}
                className={`relative flex items-center p-2 rounded-lg border transition-all cursor-pointer group ${
                  isSelected 
                    ? 'bg-holy-100 border-holy-400 shadow-sm' 
                    : 'bg-white border-holy-100 hover:border-holy-300'
                } ${isDragging ? 'opacity-50 border-dashed border-holy-400' : ''}`}
              >
                {/* Drag Handle */}
                <div className="mr-2 text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500">
                    <GripVertical size={14} />
                </div>

                {/* Thumbnail */}
                <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 mr-3 flex items-center justify-center select-none">
                  {layer.type === 'text' ? (
                     <Type size={18} className="text-gray-400" />
                  ) : (
                     <img src={layer.src} alt={layer.name} className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 select-none">
                  <div className="text-sm font-medium text-gray-900 truncate">{layer.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{layer.type}</div>
                </div>

                {/* Quick Controls */}
                <div className="flex items-center space-x-1 ml-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                    className="p-1 hover:text-holy-700 rounded hover:bg-holy-200"
                  >
                    {layer.visible ? <Eye size={14} /> : <EyeOff size={14} className="text-gray-400" />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                    className="p-1 hover:text-holy-700 rounded hover:bg-holy-200"
                  >
                    {layer.locked ? <Lock size={14} className="text-holy-600" /> : <Unlock size={14} />}
                  </button>
                </div>
              </div>
            );
          })}

          {layers.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              <p>No layers yet.</p>
              <p className="text-xs mt-1">Add assets from the Library.</p>
            </div>
          )}
        </div>
      )}

      {/* CONTENT: SETTINGS / ADJUST */}
      {activeTab === 'settings' && (
        <div className="flex-1 overflow-y-auto bg-gray-50">
           {selectedLayer ? (
              <div className="p-4 space-y-6">
                 
                 {/* Basic Info */}
                 <div className="text-center pb-4 border-b border-gray-200">
                    <div className="w-20 h-20 mx-auto bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden mb-2">
                       {selectedLayer.type === 'text' ? <Type size={32} className="text-gray-400" /> : <img src={selectedLayer.src} className="w-full h-full object-cover" />}
                    </div>
                    <h3 className="font-serif font-bold text-gray-800">{selectedLayer.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{selectedLayer.type}</p>
                 </div>

                 {/* Text Properties */}
                 {selectedLayer.type === 'text' && (
                    <div className="space-y-3">
                       <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                          <Type size={12} /> Typography
                       </h4>
                       <div>
                          <label className="text-xs text-gray-500 block mb-1">Content</label>
                          <textarea 
                             value={selectedLayer.text}
                             onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                             className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-1 focus:ring-holy-400 resize-none h-20"
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <div>
                             <label className="text-xs text-gray-500 block mb-1">Font</label>
                             <select 
                                value={selectedLayer.fontFamily}
                                onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                                className="w-full text-xs border border-gray-300 rounded p-1.5"
                             >
                                <option value="Cinzel">Cinzel</option>
                                <option value="Lato">Lato</option>
                                <option value="serif">Serif</option>
                                <option value="sans-serif">Sans Serif</option>
                                <option value="cursive">Cursive</option>
                             </select>
                          </div>
                          <div>
                             <label className="text-xs text-gray-500 block mb-1">Color</label>
                             <div className="flex items-center gap-2">
                                <input 
                                   type="color" 
                                   value={selectedLayer.fill}
                                   onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
                                   className="h-8 w-full rounded cursor-pointer border-gray-300"
                                />
                             </div>
                          </div>
                       </div>
                       {/* Stroke / Outline */}
                       <div className="pt-2 border-t border-gray-100">
                            <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center gap-1">
                                <AlignCenter size={12} /> Outline / Stroke
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-gray-400 block mb-1">Color</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            value={selectedLayer.stroke || '#000000'}
                                            onChange={(e) => updateLayer(selectedLayer.id, { stroke: e.target.value })}
                                            className="h-8 w-full rounded cursor-pointer border-gray-300"
                                        />
                                        {/* Clear Stroke Button */}
                                        <button 
                                            onClick={() => updateLayer(selectedLayer.id, { stroke: '' })}
                                            className="text-[10px] text-red-500 hover:underline"
                                        >
                                            None
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 block mb-1">Width</label>
                                    <input 
                                        type="number" min="0" max="20"
                                        value={selectedLayer.strokeWidth || 0}
                                        onChange={(e) => updateLayer(selectedLayer.id, { strokeWidth: parseInt(e.target.value) })}
                                        className="w-full text-xs p-1.5 border rounded"
                                    />
                                </div>
                            </div>
                       </div>
                    </div>
                 )}

                 {/* Transform */}
                 <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                       <ImageIcon size={12} /> Transform
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                       <div>
                          <label className="text-[10px] text-gray-400 block">X Position</label>
                          <input 
                             type="number" 
                             value={Math.round(selectedLayer.x)}
                             onChange={(e) => updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                             className="w-full text-xs p-1 border rounded"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] text-gray-400 block">Y Position</label>
                          <input 
                             type="number" 
                             value={Math.round(selectedLayer.y)}
                             onChange={(e) => updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                             className="w-full text-xs p-1 border rounded"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] text-gray-400 block">Scale X</label>
                          <input 
                             type="number" step="0.1"
                             value={selectedLayer.scaleX.toFixed(2)}
                             onChange={(e) => updateLayer(selectedLayer.id, { scaleX: Number(e.target.value) })}
                             className="w-full text-xs p-1 border rounded"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] text-gray-400 block">Rotation</label>
                          <input 
                             type="number"
                             value={Math.round(selectedLayer.rotation)}
                             onChange={(e) => updateLayer(selectedLayer.id, { rotation: Number(e.target.value) })}
                             className="w-full text-xs p-1 border rounded"
                          />
                       </div>
                    </div>
                 </div>

                 {/* Filters */}
                 {selectedLayer.type !== 'text' && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                       <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                          <Sparkles size={12} /> Effects
                       </h4>
                       
                       {/* Opacity */}
                       <div>
                          <div className="flex justify-between text-xs mb-1">
                             <span className="text-gray-600">Opacity</span>
                             <span className="text-gray-400">{Math.round(selectedLayer.opacity * 100)}%</span>
                          </div>
                          <input 
                             type="range" min="0" max="1" step="0.05"
                             value={selectedLayer.opacity}
                             onChange={(e) => updateLayer(selectedLayer.id, { opacity: parseFloat(e.target.value) })}
                             className="w-full accent-holy-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                       </div>

                       {/* Blur */}
                       <div>
                          <div className="flex justify-between text-xs mb-1">
                             <span className="text-gray-600">Blur</span>
                             <span className="text-gray-400">{selectedLayer.blur || 0}px</span>
                          </div>
                          <input 
                             type="range" min="0" max="20" step="1"
                             value={selectedLayer.blur || 0}
                             onChange={(e) => updateLayer(selectedLayer.id, { blur: parseInt(e.target.value) })}
                             className="w-full accent-holy-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                       </div>

                       {/* Brightness */}
                       <div>
                          <div className="flex justify-between text-xs mb-1">
                             <span className="text-gray-600">Brightness</span>
                             <span className="text-gray-400">{((selectedLayer.brightness || 0) * 100).toFixed(0)}%</span>
                          </div>
                          <input 
                             type="range" min="-1" max="1" step="0.05"
                             value={selectedLayer.brightness || 0}
                             onChange={(e) => updateLayer(selectedLayer.id, { brightness: parseFloat(e.target.value) })}
                             className="w-full accent-holy-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                       </div>

                       {/* Contrast */}
                       <div>
                          <div className="flex justify-between text-xs mb-1">
                             <span className="text-gray-600">Contrast</span>
                             <span className="text-gray-400">{selectedLayer.contrast || 0}</span>
                          </div>
                          <input 
                             type="range" min="-100" max="100" step="5"
                             value={selectedLayer.contrast || 0}
                             onChange={(e) => updateLayer(selectedLayer.id, { contrast: parseInt(e.target.value) })}
                             className="w-full accent-holy-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                       </div>

                       {/* Boolean Filters */}
                       <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => updateLayer(selectedLayer.id, { grayscale: !selectedLayer.grayscale })}
                            className={`flex flex-col items-center justify-center p-2 rounded border text-[10px] font-bold transition-all ${
                                selectedLayer.grayscale ? 'bg-holy-600 text-white border-holy-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                             <Droplet size={14} className={selectedLayer.grayscale ? 'fill-current' : ''} />
                             B&W
                          </button>
                          <button
                            onClick={() => updateLayer(selectedLayer.id, { sepia: !selectedLayer.sepia })}
                            className={`flex flex-col items-center justify-center p-2 rounded border text-[10px] font-bold transition-all ${
                                selectedLayer.sepia ? 'bg-amber-700 text-white border-amber-700' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                             <Droplet size={14} className={selectedLayer.sepia ? 'fill-current' : ''} />
                             Sepia
                          </button>
                          <button
                            onClick={() => updateLayer(selectedLayer.id, { invert: !selectedLayer.invert })}
                            className={`flex flex-col items-center justify-center p-2 rounded border text-[10px] font-bold transition-all ${
                                selectedLayer.invert ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                             <Droplet size={14} className={selectedLayer.invert ? 'fill-current' : ''} />
                             Invert
                          </button>
                       </div>
                    </div>
                 )}

                 {/* Drop Shadow Controls */}
                 <div className="space-y-4 pt-4 border-t border-gray-200">
                     <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                        <Eclipse size={12} /> Drop Shadow
                     </h4>
                     
                     <div className="grid grid-cols-2 gap-3">
                         {/* Shadow Color */}
                         <div className="col-span-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Color</span>
                            <div className="flex items-center gap-2">
                                <input 
                                   type="color" 
                                   value={selectedLayer.shadowColor || '#000000'}
                                   onChange={(e) => updateLayer(selectedLayer.id, { shadowColor: e.target.value })}
                                   className="h-6 w-12 rounded cursor-pointer border-gray-300"
                                />
                            </div>
                         </div>

                         {/* Shadow Blur */}
                         <div className="col-span-2">
                            <div className="flex justify-between text-xs mb-1">
                               <span className="text-gray-600">Blur</span>
                               <span className="text-gray-400">{selectedLayer.shadowBlur || 0}px</span>
                            </div>
                            <input 
                               type="range" min="0" max="50" step="1"
                               value={selectedLayer.shadowBlur || 0}
                               onChange={(e) => updateLayer(selectedLayer.id, { shadowBlur: parseInt(e.target.value) })}
                               className="w-full accent-holy-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                         </div>
                         
                         {/* Offset X */}
                         <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Offset X</label>
                            <input 
                               type="number" 
                               value={selectedLayer.shadowOffsetX || 0}
                               onChange={(e) => updateLayer(selectedLayer.id, { shadowOffsetX: parseInt(e.target.value) })}
                               className="w-full text-xs p-1 border rounded"
                            />
                         </div>

                         {/* Offset Y */}
                         <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Offset Y</label>
                            <input 
                               type="number" 
                               value={selectedLayer.shadowOffsetY || 0}
                               onChange={(e) => updateLayer(selectedLayer.id, { shadowOffsetY: parseInt(e.target.value) })}
                               className="w-full text-xs p-1 border rounded"
                            />
                         </div>

                         {/* Shadow Opacity */}
                         <div className="col-span-2">
                            <div className="flex justify-between text-xs mb-1">
                               <span className="text-gray-600">Opacity</span>
                               <span className="text-gray-400">{((selectedLayer.shadowOpacity ?? 0.5) * 100).toFixed(0)}%</span>
                            </div>
                            <input 
                               type="range" min="0" max="1" step="0.05"
                               value={selectedLayer.shadowOpacity ?? 0.5}
                               onChange={(e) => updateLayer(selectedLayer.id, { shadowOpacity: parseFloat(e.target.value) })}
                               className="w-full accent-holy-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                         </div>
                     </div>
                 </div>

              </div>
           ) : (
              // CANVAS SETTINGS WHEN NO LAYER SELECTED
              <div className="p-4 space-y-6">
                 <div className="text-center pb-4 border-b border-gray-200">
                    <div className="w-20 h-20 mx-auto bg-holy-50 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center mb-2">
                       <AlignCenter size={32} className="text-holy-400" />
                    </div>
                    <h3 className="font-serif font-bold text-gray-800">Canvas Settings</h3>
                    <p className="text-xs text-gray-500">Global Properties</p>
                 </div>

                 <div className="space-y-4">
                    {/* Dimensions */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2">
                          Dimensions
                       </h4>
                       <div className="grid grid-cols-2 gap-3">
                          <div>
                             <label className="text-[10px] text-gray-400 block mb-1">Width (px)</label>
                             <input 
                                type="number" 
                                value={canvasSettings.width}
                                onChange={(e) => resizeCanvas(parseInt(e.target.value) || 100, canvasSettings.height)}
                                className="w-full text-sm p-1.5 border rounded focus:ring-holy-400 focus:outline-none"
                             />
                          </div>
                          <div>
                             <label className="text-[10px] text-gray-400 block mb-1">Height (px)</label>
                             <input 
                                type="number" 
                                value={canvasSettings.height}
                                onChange={(e) => resizeCanvas(canvasSettings.width, parseInt(e.target.value) || 100)}
                                className="w-full text-sm p-1.5 border rounded focus:ring-holy-400 focus:outline-none"
                             />
                          </div>
                       </div>
                    </div>

                    {/* Background */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2">
                          Background
                       </h4>
                       <div>
                             <label className="text-[10px] text-gray-400 block mb-1">Fill Color</label>
                             <div className="flex items-center gap-2">
                                <input 
                                   type="color" 
                                   value={canvasSettings.backgroundColor}
                                   onChange={(e) => updateCanvasSettings({ backgroundColor: e.target.value })}
                                   className="h-9 w-full rounded cursor-pointer border-gray-300"
                                />
                             </div>
                       </div>
                    </div>
                 </div>
                 
                 <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
                    <p className="text-xs text-blue-700 leading-relaxed">
                       <strong>Tip:</strong> Uploading an image or using "Edit Full Canvas" will automatically resize the canvas to match.
                    </p>
                 </div>
              </div>
           )}
        </div>
      )}
    </div>
  );
};
