import React from 'react';
import { FileExplorer } from './FileExplorer';
import { Editor } from './Editor';
import { Terminal } from './Terminal';
import { AIPanel } from './AIPanel';
import { ActivityBar } from './ActivityBar';
import { useEditorStore } from '../store/editorStore';
import { SearchView } from './views/SearchView';
import { SettingsView } from './views/SettingsView';
import { ProfileView } from './views/ProfileView';
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

  const renderSidePanel = () => {
    switch (currentView) {
      case 'explorer':
        return <FileExplorer />;
      case 'search':
        return <SearchView />;
      case 'settings':
        return <SettingsView />;
      case 'profile':
        return <ProfileView />;
      case 'logout':
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black">
      {/* Activity Bar */}
      <div className="fixed left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black border-r border-white/10">
        <ActivityBar />
      </div>
      
      {/* Side Panel */}
      {currentView !== 'none' && (
        <div className="fixed left-12 top-0 bottom-0 w-60 border-r border-white/10 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black z-10">
          {renderSidePanel()}
        </div>
      )}

      {/* Main Content Area */}
      <div className={`ml-[288px] flex-1 flex flex-col ${isAIPanelOpen ? 'mr-[30vw]' : ''}`}>
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
  );
};

export default Layout;