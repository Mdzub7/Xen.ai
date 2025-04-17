import React, { useState, useRef, useEffect } from 'react';
import { Send, Hash, Sparkles } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { Message, AIModel } from '../types';
import MarkdownWithCodeButtons from './Markdown';
import { LoadingSpinner } from './widget/LoadingSpinner';
import { getFirebaseToken } from '../auth/firebaseToken';
import { builderService } from '../services/builderService';

// Builder component for code generation and project manipulation

interface BuilderResponse {
  status: string;
  code?: string;
  message?: string;
}

type Model = 'gemini' | 'llama2-70b' | 'deepseek';

export const Builder: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getFirebaseToken();
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  const {
    messages,
    addMessage,
    currentFile,
    files,
    selectedModel,
    setSelectedModel,
    toggleAIPanel
  } = useEditorStore();

  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [builderMessages, setBuilderMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 150); // Max height of 150px
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [builderMessages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    // Check authentication first
    const token = await getFirebaseToken();
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    // Add user message to chat
    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setBuilderMessages(prev => [...prev, userMessage]);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Prepare context with current file and project structure
      const context = {
        currentFile: currentFile ? {
          name: currentFile.name,
          content: currentFile.content,
          language: currentFile.language
        } : null,
        projectStructure: files.map(file => ({
          name: file.name,
          language: file.language,
          path: file.path || ''
        })),
        model: selectedModel // Pass the selected model to the backend
      };

      // Call the builder service
      const response = await builderService.generateCode({
        prompt: input,
        context
      });

      // Add assistant response to chat
      if (response.data.status === 'success' && response.data.code) {
        const assistantMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: response.data.code,
          timestamp: new Date().toISOString(),
        };
        setBuilderMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.data.message || 'Failed to generate code');
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
      setBuilderMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model as AIModel);
    setShowModelDropdown(false);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black">

      {/* Main content area - scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Empty State with Did You Know panel - Centered */}
        {isAuthenticated && builderMessages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-semibold text-[#e6edf3] mb-2">
              Xen AI
            </h1>
            <p className="text-[#7d8590] text-sm max-w-md mb-8">
              Feel free to describe what you want to build, and I'll help you create it.
            </p>
            
            {/* Did You Know panel */}
            <div className="w-full max-w-md bg-[#161b22]/70 rounded-lg p-4 border border-[#30363d] mt-4">
              <div className="flex items-center mb-2">
                <div className="mr-2 text-yellow-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-[#e6edf3]">Did you know?</h3>
              </div>
              <p className="text-sm text-[#e6edf3]">Press Ctrl+Space to trigger code completion suggestions.</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="px-4 py-6">
          {builderMessages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
              <div className={`rounded-lg p-6 shadow-md ${message.role === 'user' ? 'bg-[#2d333b] text-[#e6edf3] max-w-[85%]' : 'bg-[#22272e] text-[#e6edf3] max-w-[90%]'}`}>
                {message.content ? (
                  <MarkdownWithCodeButtons content={message.content} />
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                )}
                <p className="text-xs text-[#7d8590] mt-4 pt-2 border-t border-[#30363d]">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {/* Loading Spinner */}
          {isLoading && (
            <div className="flex justify-left items-center my-6">
              <LoadingSpinner />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="relative">
          <div className="flex flex-col rounded-lg border border-blue-500/50 bg-black/40 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                const textarea = textareaRef.current;
                if (textarea) {
                  textarea.style.height = 'auto';
                  const newHeight = Math.min(Math.max(44, textarea.scrollHeight), 200);
                  textarea.style.height = `${newHeight}px`;
                }
              }}
              placeholder="Describe what you want to build..."
              className="flex-1 bg-transparent text-white px-4 py-3 text-sm focus:outline-none resize-none min-h-[44px] max-h-[200px] overflow-y-auto"
              disabled={isLoading || !isAuthenticated}
              onKeyDown={handleKeyDown}
            />
            
            <div className="flex items-center justify-between px-3 py-2 border-t border-white/10 bg-black/30">
              <div className="flex items-center space-x-2">
                <button 
                  className="text-[#7d8590] hover:text-[#e6edf3] p-1 flex items-center space-x-1 rounded hover:bg-[#21262d] text-xs"
                >
                  <Hash size={14} />
                  <span>Content</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                {/* Model selector with updated icon */}
                <div className="relative" ref={modelDropdownRef}>
                  <button 
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="text-xs text-[#7d8590] hover:text-[#e6edf3] p-2 py-1 rounded flex items-center"
                  >
                    {selectedModel === 'gemini' ? 'Gemini' : 
                     selectedModel === 'llama2-70b' ? 'LLaMA 2 70B' : 
                     selectedModel === 'deepseek' ? 'DeepSeek Coder' : selectedModel}
                    <Sparkles size={14} className="ml-1 text-yellow-400" />
                  </button>
                  
                  {showModelDropdown && (
                    <ModelDropdown 
                      selectedModel={selectedModel}
                      handleModelSelect={handleModelSelect}
                      buttonRef={modelDropdownRef}
                    />
                  )}
                </div>
                
                <button
                  onClick={handleSendMessage} 
                  disabled={isLoading || !input.trim() || !isAuthenticated}
                  className="text-white p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-600/50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10 hover:border-blue-400/30 hover:bg-gray-800/80 transition-all duration-200">
    <div className="text-blue-400 mb-2">{icon}</div>
    <h3 className="text-white font-medium mb-1">{title}</h3>
    <p className="text-white/60 text-sm">{description}</p>
  </div>
);

const ModelDropdown = ({ 
  selectedModel, 
  handleModelSelect, 
  buttonRef 
}: { 
  selectedModel: string, 
  handleModelSelect: (model: string) => void,
  buttonRef: React.RefObject<HTMLDivElement>
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Calculate position based on button location
  useEffect(() => {
    if (buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      
      // Position the dropdown above the button
      setPosition({
        top: buttonRect.top - dropdownRef.current.offsetHeight - 10,
        left: buttonRect.right - dropdownRef.current.offsetWidth
      });
    }
  }, [buttonRef]);
  
  return (
    <div 
      ref={dropdownRef}
      className="fixed bg-[#1c2128] border border-[#30363d] rounded-lg shadow-lg overflow-hidden z-[9999] max-h-[300px] overflow-y-auto w-64"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px` 
      }}
    >
      <div className="p-2">
        <div className="text-xs font-medium text-[#7d8590] px-2 py-1">Model</div>
        <button
          onClick={() => handleModelSelect('gemini')}
          className={`w-full text-left px-2 py-1.5 text-sm rounded ${selectedModel === 'gemini' ? 'bg-[#388bfd]/10 text-[#388bfd]' : 'text-[#e6edf3] hover:bg-[#21262d]'}`}
        >
          <div className="flex items-center">
            <span>Gemini</span>
            <span className="ml-1 text-xs bg-blue-500/20 text-blue-400 px-1.5 rounded">Default</span>
          </div>
        </button>
        <button
          onClick={() => handleModelSelect('llama2-70b')}
          className={`w-full text-left px-2 py-1.5 text-sm rounded ${selectedModel === 'llama2-70b' ? 'bg-[#388bfd]/10 text-[#388bfd]' : 'text-[#e6edf3] hover:bg-[#21262d]'}`}
        >
          <div className="flex items-center">
            <span>LLaMA 2 70B</span>
            <span className="ml-1 text-xs bg-green-500/20 text-green-400 px-1.5 rounded">Fast</span>
          </div>
        </button>
        <button
          onClick={() => handleModelSelect('deepseek')}
          className={`w-full text-left px-2 py-1.5 text-sm rounded ${selectedModel === 'deepseek' ? 'bg-[#388bfd]/10 text-[#388bfd]' : 'text-[#e6edf3] hover:bg-[#21262d]'}`}
        >
          <div className="flex items-center">
            <span>DeepSeek Coder</span>
            <span className="ml-1 text-xs bg-purple-500/20 text-purple-400 px-1.5 rounded">Precise</span>
          </div>
        </button>
      </div>
    </div>
  );
};

const toggleAIPanel = () => {
  useEditorStore.getState().toggleAIPanel();
};