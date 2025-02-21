import React from 'react';
import { FileExplorer } from './FileExplorer';
import { Editor } from './Editor';
import { Terminal } from './Terminal';
import { AIPanel } from './AIPanel';
import { ActivityBar } from './ActivityBar';
import { useEditorStore } from '../store/editorStore';
import { SearchView } from './views/SearchView';
import { SourceControlView } from './views/SourceControlView';
import { ExtensionsView } from './views/ExtensionsView';
import { SettingsView } from './views/SettingsView';
import { ProfileView } from './views/ProfileView';

const Layout: React.FC = () => {
  const { isAIPanelOpen, currentView } = useEditorStore();

  const renderSidePanel = () => {
    switch (currentView) {
      case 'explorer':
        return <FileExplorer />;
      case 'search':
        return <SearchView />;
      case 'sourceControl':
        return <SourceControlView />;
      case 'extensions':
        return <ExtensionsView />;
      case 'settings':
        return <SettingsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      <ActivityBar />
      
      {/* Side Panel */}
      {currentView !== 'none' && (
        <div className="w-[14%] border-r border-gray-700 bg-[#1e1e1e]">
          {renderSidePanel()}
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex flex-col ${isAIPanelOpen ? 'w-[56%]' : 'flex-1'}`}>
        <div className="flex-grow">
          <Editor />
        </div>
        <div className="h-[30%] border-t border-gray-700">
          <Terminal />
        </div>
      </div>

      {/* AI Panel */}
      {isAIPanelOpen && (
        <div className="w-[30%] border-l border-gray-700 bg-[#1e1e1e]">
          <AIPanel />
        </div>
      )}
    </div>
  );
};

export default Layout;