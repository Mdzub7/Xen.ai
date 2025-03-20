import React, { useState } from 'react';
import {
  Files,
  Search,
  Settings,
  UserCircle,
  Bot,
  LogOut,
  Check
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import type { View } from '../types';
import { logOut } from './auth/firebase';
import { useNavigate } from "react-router-dom";
import ConfirmLogout from "./widget/confirmLogout"

type AIView = Extract<View, 'ai' | 'debug'>;

export const ActivityBar: React.FC = () => {
  const navigate = useNavigate();
  const { currentView, setCurrentView, isAIPanelOpen, toggleAIPanel } = useEditorStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logoutFeedback, setLogoutFeedback] = useState(false);

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

  const handleLogout = async () => {
    setIsModalOpen(true);  // Open the confirmation modal
  };

  const confirmLogout = async () => {
    setIsModalOpen(false);
    setLogoutFeedback(true);

    try {
      setTimeout(async () => {
        await logOut();
        navigate("/");
      }, 800);
    } catch (error) {
      console.error("Failed to log out:", error);
      setLogoutFeedback(false);
    }
  };

  const cancelLogout = () => {
    setIsModalOpen(false);  // Close the modal on cancel
  };

  

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black text-white/70">
      <div className="flex-1 flex flex-col items-center py-2 space-y-4">
        <button
          className={`p-2 rounded hover:bg-[#21262d] hover:text-[#e6edf3] ${
            currentView === 'explorer' ? 'bg-[#21262d] text-[#e6edf3]' : ''
          }`}
          onClick={() => handleViewChange('explorer')}
          title="Explorer"
        >
          <Files size={24} />
        </button>
        <button
          className={`p-2 rounded hover:bg-[#21262d] hover:text-[#e6edf3] ${
            isAIPanelOpen ? 'bg-[#21262d] text-[#e6edf3]' : ''
          }`}
          onClick={() => handleViewChange('ai')}
          title="AI Assistant"
        >
          <Bot size={24} />
        </button>
        <button
          className={`p-2 rounded hover:bg-[#21262d] hover:text-[#e6edf3] ${
            currentView === 'search' ? 'bg-[#21262d] text-[#e6edf3]' : ''
          }`}
          onClick={() => handleViewChange('search')}
          title="Search"
        >
          <Search size={24} />
        </button>
        <div className="flex-1" />  {/* This creates space between top and bottom buttons */}
        
        <button
        className={`p-2 rounded transition-colors duration-300 ${
          logoutFeedback
            ? "bg-blue-1000 text-white"
            : "hover:bg-[#21262d] hover:text-[#e6edf3]"
        }`}
        onClick={handleLogout}
        title="Logout"
        disabled={logoutFeedback}
      >
        {logoutFeedback ? <Check size={24} /> : <LogOut size={24} />}
      </button>

      {/* Modal */}
      <ConfirmLogout
        isOpen={isModalOpen}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        message="Are you sure you want to logout?"
      />
        
        <button
          className={`p-2 rounded hover:bg-[#21262d] hover:text-[#e6edf3] ${
            currentView === 'settings' ? 'bg-[#21262d] text-[#e6edf3]' : ''
          }`}
          onClick={() => handleViewChange('settings')}
          title="Settings"
        >
          <Settings size={24} />
        </button>
        <button
          className={`p-2 rounded hover:bg-[#21262d] hover:text-[#e6edf3] ${
            currentView === 'profile' ? 'bg-[#21262d] text-[#e6edf3]' : ''
          }`}
          onClick={() => handleViewChange('profile')}
          title="Profile"
        >
          <UserCircle size={24} />
        </button>
      </div>
    </div>
  );
};