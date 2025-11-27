import React from 'react';
import { TEMPLATES } from '../constants';
import { useStore } from '../store';
import { LayoutTemplate, Monitor, Smartphone, Maximize } from 'lucide-react';

export const TemplatesPanel: React.FC = () => {
  const loadTemplate = useStore(state => state.loadTemplate);

  const getIcon = (width: number, height: number) => {
    if (width === height) return <Maximize size={16} />;
    if (width > height) return <Monitor size={16} />;
    return <Smartphone size={16} />;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 bg-gradient-to-br from-holy-50 to-white border-b border-holy-100 shrink-0">
        <h2 className="text-xl font-serif text-holy-900 font-bold flex items-center gap-2">
          <LayoutTemplate className="text-holy-500" />
          Templates
        </h2>
        <p className="text-sm text-holy-600 mt-2 italic font-serif">
          Start with a divine foundation.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-4 bg-holy-50/30">
        {TEMPLATES.map(template => (
          <div 
            key={template.id}
            onClick={() => {
                if(window.confirm("This will replace your current canvas. Continue?")) {
                    loadTemplate(template);
                }
            }}
            className="group relative flex flex-col bg-white rounded-xl shadow-sm border border-holy-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-holy-300 transition-all"
          >
            {/* Preview Area */}
            <div className="h-32 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                 {template.baseImageSrc ? (
                    <img src={template.baseImageSrc} className="w-full h-full object-cover opacity-80" />
                 ) : (
                    <div className="w-full h-full" style={{backgroundColor: template.backgroundColor}}></div>
                 )}
                 
                 {/* Mini Overlay simulating text layers */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                     {template.layers.filter(l => l.type === 'text').map((l, i) => (
                         <div key={i} className="h-1 bg-gray-400 rounded w-1/2 mb-1 opacity-50"></div>
                     ))}
                 </div>

                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-holy-800 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                        Load Template
                    </span>
                 </div>
            </div>
            
            {/* Info */}
            <div className="p-3">
               <div className="flex justify-between items-center mb-1">
                 <h3 className="text-sm font-bold text-gray-900">{template.name}</h3>
                 <span className="text-gray-400" title={`${template.width}x${template.height}`}>
                    {getIcon(template.width, template.height)}
                 </span>
               </div>
               <p className="text-xs text-gray-500 line-clamp-2">
                   {template.description}
               </p>
               <div className="mt-2 text-[10px] text-holy-600 font-mono bg-holy-50 inline-block px-1.5 py-0.5 rounded">
                   {template.width} x {template.height}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
