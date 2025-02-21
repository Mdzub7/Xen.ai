import React from 'react';
import { useEditorStore } from '../store/editorStore';
import { FileExplorer } from './FileExplorer';
import { SearchView } from './views/SearchView';
import { SourceControlView } from './views/SourceControlView';
import { ExtensionsView } from './views/ExtensionsView';
import { SettingsView } from './views/SettingsView';
import { ProfileView } from './views/ProfileView';

export const SidePanel: React.FC = () => {
  const { currentView } = useEditorStore();

  const renderView = () => {
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
      case 'none':
        return null;
      default:
        return <FileExplorer />;
    }
  };

  return currentView !== 'none' ? (
    <div className="w-64">
      {renderView()}
    </div>
  ) : null;
};