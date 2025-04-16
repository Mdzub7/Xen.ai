import React from 'react';
import { useEditorStore } from '../store/editorStore';
import { FileExplorer } from './FileExplorer';
import { SearchView } from './views/SearchView';
import { SettingsView } from './views/SettingsView';
import { ProfileView } from './views/ProfileView';

export const SidePanel: React.FC = () => {
  const { currentView, currentFile} = useEditorStore();

  const renderView = () => {
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
      case 'none':
        return null;
    }
  };

  return currentView !== 'none' ? (
    <div className={`w-64 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black border-r border-white/10 ${!currentFile ? 'hidden md:block' : ''}`}>
      {renderView()}
    </div>
  ) : null;
};