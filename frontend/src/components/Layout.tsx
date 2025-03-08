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
import { logOut } from './auth/firebase';

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
        logOut()
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d1117]">
      {/* Activity Bar */}
      <div className="fixed left-0 top-0 bottom-0 w-12 z-10 bg-[#161b22] border-r border-[#30363d]">
        <ActivityBar />
      </div>
      
      {/* Side Panel */}
      {currentView !== 'none' && (
        <div className="fixed left-12 top-0 bottom-0 w-60 border-r border-[#30363d] bg-[#0d1117] z-10">
          {renderSidePanel()}
        </div>
      )}

      {/* Main Content Area */}
      <div className={`ml-[288px] flex-1 flex flex-col ${isAIPanelOpen ? 'mr-[30vw]' : ''}`}>
        <div className="flex-grow h-[70vh] overflow-hidden bg-[#0d1117]">
          <Editor />
        </div>
        <div className="h-[30vh] border-t border-black bg-black/40">
          <Terminal />
        </div>
      </div>

      {/* AI Panel */}
      {isAIPanelOpen && (
        <div className="fixed right-0 top-0 h-[70vh] w-[30vw] border-l border-[#30363d] bg-[#0d1117] z-50">
          <AIPanel />
        </div>
      )}
    </div>
  );
};

export default Layout;