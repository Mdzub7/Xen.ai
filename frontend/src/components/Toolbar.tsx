import React from 'react';
import {
  Play,
  Code2,
  Copy,
  Save,
  Bot,
  Bug,
  Wand2
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { getFirebaseToken } from "../auth/firebaseToken";
import { formatAIResponse} from '../utils/formatResponse';
import { executeCode } from "../components/Terminal";
export const Toolbar: React.FC = () => {
  const { 
    currentFile, 
    toggleAIPanel, 
    formatCode, 
    saveFile,  
    isAIPanelOpen,
    setCurrentView,
    addMessage ,
    setIsReviewLoading
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

    setIsReviewLoading(true);
  
    try {
      const token = await getFirebaseToken(); // 🔹 Fetch Firebase Token
      if (!token) {
        throw new Error("No Firebase token available.");
      }
      const response = await fetch('http://127.0.0.1:8000/ai/get-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          code: currentFile.content,
          service_choice: "gemini"  // This will be the default model
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
  
      const aiResponse = await response.text();
      const formattedResponse = formatAIResponse(aiResponse);
      console.log(formattedResponse)
      addMessage({
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: formattedResponse,
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
    finally{
      setIsReviewLoading(false);
    }
  };

  return (
    <div className="h-12 bg-gradient-to-r from-[#0A192F] via-[#0F1A2B] to-black border-b border-white/10 flex items-center px-4 space-x-2">
      <button
        className="p-2 hover:bg-[#21262d] rounded text-[#7d8590] hover:text-[#e6edf3] disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentFile}
        onClick={executeCode}
        title="Run Code"
      >
        <Play size={18} />
      </button>
      <button
        className="p-2 hover:bg-[#21262d] rounded text-[#7d8590] hover:text-[#e6edf3] disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentFile}
        onClick={handleDebug}
        title="Debug"
      >
        <Bug size={18} />
      </button>
      <button
        className="p-2 hover:bg-[#21262d] rounded text-[#7d8590] hover:text-[#e6edf3] disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentFile}
        onClick={formatCode}
        title="Format Code"
      >
        <Wand2 size={18} />
      </button>
      <button
        className="p-2 hover:bg-[#21262d] rounded text-[#7d8590] hover:text-[#e6edf3] disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentFile}
        onClick={handleCopyCode}
        title="Copy Code"
      >
        <Copy size={18} />
      </button>
      <button
        className="p-2 hover:bg-[#21262d] rounded text-[#7d8590] hover:text-[#e6edf3] disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentFile}
        onClick={saveFile}
        title="Save"
      >
        <Save size={18} />
      </button>
      <button
        className="p-2 hover:bg-[#21262d] rounded text-[#7d8590] hover:text-[#e6edf3] disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!currentFile}
        onClick={handleCodeReview}
        title="Code Review"
      >
        <Code2 size={18} />
      </button>
      <div className="flex-1" />
      <button
        className={`p-2 rounded text-[#e6edf3] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
          isAIPanelOpen ? 'bg-[#21262d] hover:bg-[#30363d]' : 'hover:bg-[#21262d]'
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