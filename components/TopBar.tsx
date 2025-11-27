
import React, { useRef, useState } from 'react';
import { Download, Upload, RefreshCcw, Type, Save, FolderOpen, Menu, Layers } from 'lucide-react';
import { useStore } from '../store';
import Konva from 'konva';
import { ExportModal } from './ExportModal';
import { ProjectFile } from '../types';

interface TopBarProps {
  stageRef: React.RefObject<Konva.Stage>;
  onToggleLeftSidebar?: () => void;
  onToggleRightSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ stageRef, onToggleLeftSidebar, onToggleRightSidebar }) => {
  const { setBaseImage, resetCanvas, addTextLayer, layers, canvasSettings, baseImage, loadProject } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const [showExport, setShowExport] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setBaseImage(event.target?.result as string, img.width, img.height);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProject = () => {
    const projectState: ProjectFile = {
      version: '1.0',
      timestamp: Date.now(),
      state: {
        baseImage,
        layers,
        canvasSettings
      }
    };
    
    const jsonString = JSON.stringify(projectState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `saintcanvas-project-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          const projectData: ProjectFile = JSON.parse(jsonString);
          
          if (projectData.state) {
            // Confirm replacement
            if(window.confirm("This will replace your current canvas. Are you sure?")) {
               loadProject(projectData.state);
            }
          } else {
            alert("Invalid project file structure.");
          }
        } catch (err) {
          console.error(err);
          alert("Failed to load project file.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <div className="h-16 bg-white border-b border-holy-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-20 relative">
        <div className="flex items-center gap-3">
          {/* Mobile Left Toggle */}
          <button 
             className="md:hidden text-gray-500 hover:text-holy-700"
             onClick={onToggleLeftSidebar}
          >
             <Menu size={24} />
          </button>

          <div className="w-8 h-8 bg-holy-600 rounded-full flex items-center justify-center text-white font-serif font-bold flex-shrink-0">
            SC
          </div>
          <h1 className="text-xl font-serif font-bold text-holy-900 tracking-wide hidden sm:block">SaintCanvas</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Project Management */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200 hidden sm:flex">
             <button 
                onClick={() => projectInputRef.current?.click()}
                className="p-2 text-gray-600 hover:text-holy-700 hover:bg-white rounded transition-colors"
                title="Open Project"
             >
                <FolderOpen size={18} />
                <input 
                  type="file" 
                  ref={projectInputRef} 
                  className="hidden" 
                  accept=".json"
                  onChange={handleLoadProject}
                />
             </button>
             <div className="w-px h-4 bg-gray-300"></div>
             <button 
                onClick={handleSaveProject}
                className="p-2 text-gray-600 hover:text-holy-700 hover:bg-white rounded transition-colors"
                title="Save Project"
             >
                <Save size={18} />
             </button>
          </div>

          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

          <button 
            onClick={addTextLayer}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-holy-700 hover:bg-holy-50 rounded-lg transition-colors border border-transparent hover:border-holy-200 hidden sm:flex"
          >
            <Type size={18} /> <span className="hidden lg:inline">Add Text</span>
          </button>

          <button 
            onClick={resetCanvas}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors hidden md:flex"
          >
            <RefreshCcw size={16} /> Reset
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-holy-800 bg-holy-50 hover:bg-holy-100 rounded-lg border border-holy-200 transition-all"
          >
            <Upload size={18} /> <span className="hidden sm:inline">Upload Base</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </button>
          
          <button 
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-holy-600 to-holy-500 hover:from-holy-700 hover:to-holy-600 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Download size={18} /> <span className="hidden sm:inline">Export</span>
          </button>

          {/* Mobile Right Toggle */}
          <button 
             className="md:hidden text-gray-500 hover:text-holy-700 ml-2"
             onClick={onToggleRightSidebar}
          >
             <Layers size={24} />
          </button>
        </div>
      </div>

      <ExportModal 
        isOpen={showExport} 
        onClose={() => setShowExport(false)} 
        stageRef={stageRef} 
      />
    </>
  );
};
