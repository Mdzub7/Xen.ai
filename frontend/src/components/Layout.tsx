import React from 'react';
import { FileExplorer } from './FileExplorer';
import { Editor } from './Editor';
import { Terminal } from './Terminal';
import { AIPanel } from './AIPanel';
import { ActivityBar } from './ActivityBar';
import { useEditorStore } from '../store/editorStore';
import { SidePanel } from './SidePanel';
import { Toolbar } from './Toolbar';


const Layout: React.FC = () => {
  const { isAIPanelOpen, toggleAIPanel, currentView } = useEditorStore();

  React.useEffect(() => {
    // Ensure AI Panel is open on initial load
    if (!isAIPanelOpen) {
      setTimeout(() => {
        toggleAIPanel();
      }, 100);
    }
  }, []);

  // const renderSidePanel = () => {
  //   switch (currentView) {
  //     case 'explorer':
  //       return <FileExplorer />;
  //     case 'search':
  //       return <SearchView />;
  //     case 'settings':
  //       return <SettingsView />;
  //     case 'profile':
  //       return <ProfileView />;
  //     case 'logout':
  //       return null;
  //     default:
  //       return null;
  //   }
  // };

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
          <div className="hidden md:block w-65 flex-shrink-0 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black border-r border-white/10 z-10">
            <SidePanel />
          </div>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col ${isAIPanelOpen ? 'mr-[30vw]' : ''}`}>
          <div className="flex-grow h-[70vh] overflow-hidden bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black">
            <Editor />
          </div>
          <div className="h-[30vh] border-t border-white/10 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black">
            <Terminal />
          </div>
        </div>

        {/* AI Panel */}
        {isAIPanelOpen && (
          <div className="fixed right-0 top-0 h-[70vh] w-[30vw] border-l border-white/10 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black z-50">
            <AIPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;