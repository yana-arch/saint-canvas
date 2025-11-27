import React, { useState } from 'react';
import { ASSETS } from '../constants';
import { useStore } from '../store';
import { AssetCategory } from '../types';
import { Search, PlusCircle, Calendar, Info, GripHorizontal } from 'lucide-react';

const CATEGORIES: { id: AssetCategory; label: string; icon: string }[] = [
  { id: 'saints', label: 'Saints', icon: '✝️' },
  { id: 'vestments', label: 'Vestments', icon: '👘' },
  { id: 'backgrounds', label: 'Backdrops', icon: '🏛️' },
  { id: 'objects', label: 'Objects', icon: '🕯️' },
];

export const AssetLibrary: React.FC = () => {
  const [activeCat, setActiveCat] = useState<AssetCategory>('saints');
  const [search, setSearch] = useState('');
  const addLayer = useStore(state => state.addLayer);

  const filteredAssets = ASSETS.filter(
    a => a.category === activeCat && a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, asset: typeof ASSETS[0]) => {
     e.dataTransfer.setData('application/json', JSON.stringify(asset));
     e.dataTransfer.effectAllowed = 'copy';
     
     // Optional: Set a drag image if we wanted a custom ghost, 
     // but default browser ghost is usually good enough for images.
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search */}
      <div className="p-4 border-b border-holy-100 bg-holy-50 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-holy-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-holy-200 rounded-lg focus:ring-2 focus:ring-holy-400 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-holy-200 bg-white scrollbar-hide shrink-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
              activeCat === cat.id 
                ? 'text-holy-800 border-b-2 border-holy-600 bg-holy-50' 
                : 'text-gray-500 hover:text-holy-600'
            }`}
          >
            <span className="mr-1">{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 bg-holy-50/30">
        {filteredAssets.map(asset => (
          <div 
            key={asset.id}
            draggable
            onDragStart={(e) => handleDragStart(e, asset)}
            onClick={() => addLayer(asset)}
            className="group relative flex flex-col bg-white rounded-xl shadow-sm border border-holy-100 overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-md hover:border-holy-300 transition-all h-full"
          >
            {/* Image */}
            <div className="aspect-square w-full relative overflow-hidden bg-gray-50">
               <img src={asset.src} alt={asset.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="text-white text-xs font-bold flex flex-col items-center gap-1">
                      <GripHorizontal size={20} />
                      Drag to Canvas
                  </span>
               </div>
            </div>
            
            {/* Info */}
            <div className="p-3 flex flex-col flex-1">
               <div className="flex justify-between items-start mb-1">
                 <h3 className="text-sm font-bold text-gray-900 leading-tight">{asset.name}</h3>
               </div>
               
               {asset.subCategory && (
                 <span className="text-[10px] uppercase tracking-wider text-holy-600 font-semibold mb-1">
                   {asset.subCategory}
                 </span>
               )}
               
               {asset.feastDay && (
                 <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                   <Calendar size={10} />
                   <span>{asset.feastDay}</span>
                 </div>
               )}

               {asset.description && (
                 <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                   {asset.description}
                 </p>
               )}
               
               {asset.symbolism && (
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-start gap-1">
                     <Info size={10} className="text-holy-400 mt-0.5 flex-shrink-0" />
                     <p className="text-[10px] text-gray-400 italic leading-tight">{asset.symbolism}</p>
                  </div>
               )}
            </div>
          </div>
        ))}
        {filteredAssets.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
            No assets found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};