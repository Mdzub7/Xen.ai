import React from 'react';
import {
  Files,
  Search,
  GitBranch,
  Box,
  Settings,
  UserCircle,
  Bot,  // Add Bot import
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import type { View } from '../types';


type AIView = Extract<View, 'ai' | 'debug'>;

export const ActivityBar: React.FC = () => {
  const { currentView, setCurrentView, isAIPanelOpen, toggleAIPanel } = useEditorStore();

  const handleViewChange = (view: View) => {
    if (view === 'ai') {
      toggleAIPanel();
      return;
    }

    if (view === currentView) {
      setCurrentView('none');
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center py-2">
      <button
        className={`p-2 hover:bg-[#3c3c3c] rounded mb-2 ${
          currentView === 'explorer' ? 'bg-[#37373d]' : ''
        }`}
        onClick={() => handleViewChange('explorer')}
        title="Explorer"
      >
        <Files size={24} className="text-gray-400" />
      </button>
      <button
        className={`p-2 hover:bg-[#3c3c3c] rounded mb-2 ${
          isAIPanelOpen ? 'bg-[#37373d]' : ''
        }`}
        onClick={() => handleViewChange('ai')}
        title="AI Assistant"
      >
        <Bot size={24} className="text-gray-400" />
      </button>
      <button
        className={`p-2 hover:bg-[#3c3c3c] rounded mb-2 ${
          currentView === 'search' ? 'bg-[#37373d]' : ''
        }`}
        onClick={() => handleViewChange('search')}
        title="Search"
      >
        <Search size={24} className="text-gray-400" />
      </button>
      <button
        className={`p-2 hover:bg-[#3c3c3c] rounded mb-2 ${
          currentView === 'sourceControl' ? 'bg-[#37373d]' : ''
        }`}
        onClick={() => handleViewChange('sourceControl')}
        title="Source Control"
      >
        <GitBranch size={24} className="text-gray-400" />
      </button>
      <button
        className={`p-2 hover:bg-[#3c3c3c] rounded mb-2 ${
          currentView === 'extensions' ? 'bg-[#37373d]' : ''
        }`}
        onClick={() => handleViewChange('extensions')}
        title="Extensions"
      >
        <Box size={24} className="text-gray-400" />
      </button>
      <div className="flex-1" />  {/* This creates space between top and bottom buttons */}
      <button
        className={`p-2 hover:bg-[#3c3c3c] rounded mb-2 ${
          currentView === 'settings' ? 'bg-[#37373d]' : ''
        }`}
        onClick={() => handleViewChange('settings')}
        title="Settings"
      >
        <Settings size={24} className="text-gray-400" />
      </button>
      <button
        className={`p-2 hover:bg-[#3c3c3c] rounded ${
          currentView === 'profile' ? 'bg-[#37373d]' : ''
        }`}
        onClick={() => handleViewChange('profile')}
        title="Profile"
      >
        <UserCircle size={24} className="text-gray-400" />
      </button>
    </div>
  );
};