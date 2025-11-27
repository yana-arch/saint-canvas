
import React, { useRef, useState } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { LayerPanel } from './components/LayerPanel';
import { EditorCanvas } from './components/EditorCanvas';
import { TopBar } from './components/TopBar';
import { ToolBar } from './components/ToolBar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Konva from 'konva';

const App: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  
  // Initialize global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-gray-800">
      {/* Header */}
      <TopBar 
        stageRef={stageRef} 
        onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar - Library & AI (Mobile Drawer / Desktop Sidebar) */}
        <aside 
            className={`
                fixed inset-y-0 left-0 z-30 w-80 bg-white shadow-[2px_0_15px_rgba(0,0,0,0.1)] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
          <div className="h-full pt-16 md:pt-0"> {/* Add padding for TopBar on mobile */}
             <LeftSidebar stageRef={stageRef} />
          </div>
        </aside>

        {/* Center Canvas Area */}
        <main className="flex-1 flex flex-col relative z-0 bg-stone-100 min-w-0">
          {/* Toolbar for Tools/History */}
          <ToolBar />
          
          {/* Actual Canvas */}
          <div className="flex-1 relative overflow-hidden">
             <EditorCanvas stageRef={stageRef} />
          </div>
        </main>

        {/* Right Sidebar - Layers (Mobile Drawer / Desktop Sidebar) */}
        <aside 
             className={`
                fixed inset-y-0 right-0 z-30 w-72 bg-white shadow-[-2px_0_5px_rgba(0,0,0,0.05)] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
        >
          <div className="h-full pt-16 md:pt-0"> {/* Add padding for TopBar on mobile */}
             <LayerPanel />
          </div>
        </aside>

        {/* Mobile Overlay Backdrop */}
        {(leftSidebarOpen || rightSidebarOpen) && (
            <div 
                className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
                onClick={() => {
                    setLeftSidebarOpen(false);
                    setRightSidebarOpen(false);
                }}
            />
        )}
      </div>
    </div>
  );
};

export default App;
