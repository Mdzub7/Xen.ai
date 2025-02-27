import React from 'react';
import {
  Play,
  Code2,
  Copy,
  Save,
  Bot,
  Loader2,
  Bug,
  Wand2
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import type { Message } from '../types';

export const Toolbar: React.FC = () => {
  const { 
    currentFile, 
    toggleAIPanel, 
    formatCode, 
    saveFile, 
    runCode, 
    isAIPanelOpen,
    setCurrentView,
    addMessage 
  } = useEditorStore();

  const handleCopyCode = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.content);
    }
  };

  const handleDebug = () => {
    setCurrentView('debug');
  };

  const handleCodeReview = async () => {
    if (!currentFile) return;
    
    if (!isAIPanelOpen) {
      toggleAIPanel();
    }

    addMessage({
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: `Please review this code:\n\n${currentFile.content}`,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await fetch('http://127.0.0.1:8000/ai/get-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: currentFile.content }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const aiResponse = await response.text();
      addMessage({
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error:', error);
      addMessage({
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="h-12 bg-[#1e1e1e] border-b border-[#3c3c3c] flex items-center px-4 space-x-2">
      <button
        className="p-2 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentFile}
        onClick={runCode}
        title="Run Code"
      >
        <Play size={18} />
      </button>
      <button
        className="p-2 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentFile}
        onClick={handleDebug}
        title="Debug"
      >
        <Bug size={18} />
      </button>
      <button
        className="p-2 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentFile}
        onClick={formatCode}
        title="Format Code"
      >
        <Wand2 size={18} />
      </button>
      <button
        className="p-2 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentFile}
        onClick={handleCopyCode}
        title="Copy Code"
      >
        <Copy size={18} />
      </button>
      <button
        className="p-2 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentFile}
        onClick={saveFile}
        title="Save"
      >
        <Save size={18} />
      </button>
      <button
        className="p-2 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentFile}
        onClick={handleCodeReview}
        title="Code Review"
      >
        <Code2 size={18} />
      </button>
      <div className="flex-1" />
      <button
        className={`p-2 rounded text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
          isAIPanelOpen ? 'bg-[#2d2d2d] hover:bg-[#3c3c3c]' : 'hover:bg-[#3c3c3c]'
        }`}
        disabled={!currentFile}
        onClick={() => toggleAIPanel()}
        title="AI Assistant"
      >
        <Bot size={18} />
        <span className="text-sm font-medium">AI Assistant</span>
      </button>
    </div>
  );
};