import React from 'react';
import { FileExplorer } from './FileExplorer';
import Editor from './Editor';
import { Terminal } from './Terminal';
import { AIPanel } from './AIPanel';
import { ActivityBar } from './ActivityBar';
import { useEditorStore } from '../store/editorStore';
import { SidePanel } from './SidePanel';
import { useParams, useNavigate } from 'react-router-dom';
import  CollabEditor  from './CollabEditor';
import { Toolbar } from './Toolbar';

const Layout: React.FC = () => {
  const { isAIPanelOpen, toggleAIPanel, currentView } = useEditorStore();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  console.log('Layout Room ID:', roomId)

  React.useEffect(() => {
    if (!isAIPanelOpen) {
      setTimeout(() => {
        toggleAIPanel();
      }, 100);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black">
      <Toolbar />

      <div className="flex flex-1 overflow-hidden relative">

        {/* Activity Bar */}
        <div className="w-12 flex-shrink-0 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black border-r border-white/10 z-10">
          <ActivityBar />
        </div>

        {/* Side Panel */}
        {currentView !== 'none' && (
          <div className="hidden md:block w-60 flex-shrink-0 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black border-r border-white/10 z-10">
            <SidePanel />
          </div>
        )}

        {/* Main Content Area */}
        <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${isAIPanelOpen ? 'mr-[30vw]' : ''}`}>
          <div className="flex-grow overflow-hidden">
            {roomId ? <CollabEditor /> : <Editor />}
          </div>
          <div className="h-[30vh] border-t border-white/10 overflow-hidden">
            <Terminal />
          </div>
        </div>

        {/* AI Panel */}
        {isAIPanelOpen && (
          <div className="hidden lg:block absolute top-0 right-0 h-[70vh] w-[30vw] bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black border-l border-white/10 z-20">
            <AIPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
