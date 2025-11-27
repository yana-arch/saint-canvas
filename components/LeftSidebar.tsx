

import React, { useState } from 'react';
import { AssetLibrary } from './AssetLibrary';
import { PromptPanel } from './PromptPanel';
import { TemplatesPanel } from './TemplatesPanel';
import { Library, Sparkles, LayoutTemplate } from 'lucide-react';
import Konva from 'konva';

interface LeftSidebarProps {
  stageRef: React.RefObject<Konva.Stage>;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ stageRef }) => {
  const [activeTab, setActiveTab] = useState<'library' | 'ai' | 'templates'>('library');

  return (
    <div className="flex flex-col h-full bg-white border-r border-holy-200 shadow-xl w-80">
      {/* Tabs */}
      <div className="flex border-b border-holy-200 bg-holy-50 shrink-0">
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'library' 
              ? 'text-holy-800 bg-white border-b-2 border-holy-600' 
              : 'text-gray-500 hover:text-holy-700'
          }`}
          title="Assets"
        >
          <Library size={18} />
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'templates' 
              ? 'text-holy-800 bg-white border-b-2 border-holy-600' 
              : 'text-gray-500 hover:text-holy-700'
          }`}
          title="Templates"
        >
          <LayoutTemplate size={18} />
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'ai' 
              ? 'text-holy-800 bg-white border-b-2 border-holy-600' 
              : 'text-gray-500 hover:text-holy-700'
          }`}
          title="AI Generator"
        >
          <Sparkles size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-white">
        <div className={`absolute inset-0 transition-opacity duration-200 flex flex-col ${activeTab === 'library' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
             <AssetLibrary />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 flex flex-col ${activeTab === 'templates' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
             <TemplatesPanel />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 flex flex-col ${activeTab === 'ai' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
             <PromptPanel stageRef={stageRef} />
        </div>
      </div>
    </div>
  );
};