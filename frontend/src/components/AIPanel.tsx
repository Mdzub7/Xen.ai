import React, { useState, useEffect, useRef } from "react";
import { X, Send, Hash, FileText, Sparkles } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { Message, File } from "../types";
import MarkdownWithCodeButtons from "./Markdown"; // Import the new component
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { LoadingSpinner } from "./LoadingSpinner";
import { getFirebaseToken } from "../auth/firebaseToken";
import "highlight.js/styles/github-dark.css";
import "../styles/codeBlock.css";
import "../styles/loadingSpinner.css";
import { Link } from "react-router-dom";

interface Section {
  type: "code" | "text";
  content: string;
  language?: string;
}

// Tips for the "Did You Know" panel
const TIPS = [
  "You can use the Terminal to run your code directly in the browser.",
  "Press Ctrl+Space to trigger code completion suggestions.",
  "Encountering errors in the terminal? Try 'Add to Chat', and AI will help you resolve them.",
  "You can create folders to organize your files in the Explorer.",
  "Use the Search feature to find code across all your files.",
  "Different AI models have different strengths - try them all!",
  "You can format your code automatically with the Format Code button.",
  "Save your work regularly to avoid losing changes.",
  "Use keyboard shortcuts for faster coding - try Ctrl+S to save.",
  "You can drag and drop files into the editor to open them."
];

// Interface for selected file with reference
interface SelectedFile extends File {
  reference: string; // Unique reference ID for the file
}

export const AIPanel: React.FC = () => {
  const {
    isAIPanelOpen,
    toggleAIPanel,
    messages,
    addMessage,
    updateMessage, // Add this line to destructure the function
    selectedModel,
    setSelectedModel,
    isReviewLoading,
    setIsReviewLoading,
    files,
    currentFile,
  } = useEditorStore();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentTip, setCurrentTip] = useState(0);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const fileSelectorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rotate tips every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getFirebaseToken();
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close model dropdown and file selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
      if (fileSelectorRef.current && !fileSelectorRef.current.contains(event.target as Node)) {
        setShowFileSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 150); // Max height of 150px
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleModelSelect = (model: string) => {
    setSelectedModel(model as any);
    setShowModelDropdown(false);
  };
  
  // Generate a unique reference ID for a file
  const generateFileReference = (file: File): string => {
    return `file-${file.id}-${Date.now()}`;
  };
  
  // Remove a file from selected files
  const removeSelectedFile = (reference: string) => {
    setSelectedFiles(prev => prev.filter(file => file.reference !== reference));
  };
  
  const handleFileSelect = (file: File) => {
    // Add file to selected files with a unique reference
    const reference = generateFileReference(file);
    const selectedFile: SelectedFile = { ...file, reference };
    
    setSelectedFiles(prev => [...prev, selectedFile]);
    setShowFileSelector(false);
    
    // Focus textarea after adding file
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };
  
  const toggleFileSelector = () => {
    setShowFileSelector(prev => !prev);
    setShowModelDropdown(false);
  };

  // Prepare message content with selected files
  const prepareMessageContent = (inputText: string): string => {
    let content = inputText;
    
    // Add file content as code blocks if there are selected files
    if (selectedFiles.length > 0) {
      const fileBlocks = selectedFiles.map(file => {
        return `\n\n\`\`\`${file.language}\n// File: ${file.name}\n${file.content}\n\`\`\`\n`;
      }).join('');
      
      content += fileBlocks;
    }
    
    return content;
  };
  
  // Modify the handleSendMessage function to properly handle streaming
  const handleSendMessage = async () => {
    if (!input.trim() && selectedFiles.length === 0) return;
    setIsLoading(true);
  
    const token = await getFirebaseToken();
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    
    // Prepare message content with selected files
    const messageContent = prepareMessageContent(input);
    
    // Create a user-friendly display message (without file content)
    let displayContent = input;
    
    // Add file references to display content if there are selected files
    if (selectedFiles.length > 0) {
      const fileNames = selectedFiles.map(file => file.name).join(', ');
      displayContent += `\n[Attached files: ${fileNames}]`;
    }
  
    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: displayContent, // Show input text and file references to the user
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);
    setInput("");
    setSelectedFiles([]);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  
    try {
      // Use fetch with streaming
      const response = await fetch("http://127.0.0.1:8000/ai/get-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: messageContent, // Send the full content with file code
          service_choice: selectedModel,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to get AI response");
  
      // Process the response
      const data = await response.json();
      const responseContent = data.response || "";
      
      // Only add the assistant message when we have content
      if (responseContent) {
        addMessage({
          id: Math.random().toString(36).substr(2, 9),
          role: "assistant",
          content: responseContent,
          timestamp: new Date().toISOString(),
        });
        
        // Scroll to the bottom to show new content
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error:", error);
      addMessage({
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request.",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-[97.3vh] w-[30vw] flex flex-col bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black border-l border-white/10 shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-black/20 to-black">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">Xen.ai</span>
          <span className="text-blue-300 rounded-full bg-grey px-2 py-1 text-xs font-medium shadow-sm">
            Beta
          </span>
        </div>
        <button
          onClick={toggleAIPanel}
          className="p-1.5 rounded-lg hover:bg-[#21262d] text-[#7d8590]"
          title="Close AI Panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main content area - scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* If not authenticated, show blur effect */}
        {!isAuthenticated && (
          <div className="absolute inset-0 flex flex-col items-center justify-center 
         bg-black/30 backdrop-blur-sm text-white text-lg font-semibold 
         text-center p-6">
            <p className="text-white/90">Please login to use the AI assistant.</p>
            <Link
              to="/login"
              className="mt-4 px-6 py-2 border border-white/50 text-white/80 rounded-lg 
                   hover:bg-white hover:text-black transition-all duration-300 ease-in-out"
            >
              Login!
            </Link>
          </div>
        )}

        {/* Empty State with Did You Know panel - Centered */}
        {isAuthenticated && messages.length === 0 && !isLoading && !isReviewLoading && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-semibold text-[#e6edf3] mb-2">
              Xen AI
            </h1>
            <p className="text-[#7d8590] text-sm max-w-md mb-8">
              Feel free to ask questions or seek advice about your codebase or coding in general.
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
                <button className="ml-auto text-[#7d8590] hover:text-[#e6edf3]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-[#e6edf3]">{TIPS[currentTip]}</p>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isAuthenticated && messages.length === 0 && (isLoading || isReviewLoading) && (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {/* Messages */}
        {isAuthenticated && messages.length > 0 && (
          <div className="px-4 py-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-6`}>
                <div className={`rounded-lg p-6 shadow-md ${message.role === "user" ? "bg-[#2d333b] text-[#e6edf3] max-w-[85%]" : "bg-[#22272e] text-[#e6edf3] max-w-[90%]"}`}>
                  {message.content ? (
                    <MarkdownWithCodeButtons content={message.content} />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="loader"></div>
                      <span className="text-gray-400">AI is thinking...</span>
                    </div>
                  )}
                  <p className="text-xs text-[#7d8590] mt-4 pt-2 border-t border-[#30363d]">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {/* Only show the standalone loading spinner when there's no assistant message yet */}
            {(isLoading || isReviewLoading) && messages.filter(m => m.role === "assistant").length === 0 && <LoadingSpinner />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Redesigned with isolated bottom toolbar */}
      {isAuthenticated && (
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="relative">
            <div className="flex flex-col rounded-lg border border-blue-500/50 bg-black/40 overflow-hidden">
              {/* Selected files display area */}
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1">
                  {selectedFiles.map(file => (
                    <div 
                      key={file.reference}
                      className="flex items-center bg-[#1c2128] text-[#e6edf3] text-xs rounded px-2 py-1 border border-[#30363d]"
                    >
                      <FileText size={12} className="mr-1 text-blue-400" />
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button 
                        onClick={() => removeSelectedFile(file.reference)}
                        className="ml-1.5 text-[#7d8590] hover:text-[#e6edf3]"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Text input area that expands up to a certain height */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize the textarea as text grows
                  const textarea = textareaRef.current;
                  if (textarea) {
                    textarea.style.height = 'auto';
                    const newHeight = Math.min(Math.max(44, textarea.scrollHeight), 200); // Min 44px, max 200px
                    textarea.style.height = `${newHeight}px`;
                  }
                }}
                placeholder={selectedFiles.length > 0 ? "Ask about the selected files..." : "Ask the AI assistant..."}
                className="flex-1 bg-transparent text-white px-4 py-3 text-sm focus:outline-none 
                resize-none min-h-[44px] max-h-[200px] overflow-y-auto"
                disabled={isLoading || isReviewLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              
              {/* Isolated bottom toolbar */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-white/10 bg-black/30">
                <div className="flex items-center space-x-2">
                  {/* Hash button with Content label */}
                  <button 
                    onClick={toggleFileSelector}
                    className="text-[#7d8590] hover:text-[#e6edf3] p-1 flex items-center space-x-1 rounded hover:bg-[#21262d] text-xs"
                  >
                    <Hash size={14} />
                    <span>Content</span>
                  </button>
                  
                  {/* File selector dropdown - unchanged */}
                  {showFileSelector && (
                    <div 
                      ref={fileSelectorRef}
                      className="absolute bottom-full left-0 mb-1 w-64 bg-[#1c2128] border border-[#30363d] rounded-lg shadow-lg overflow-hidden z-10 max-h-[300px] overflow-y-auto"
                    >
                      <div className="p-2">
                        <div className="text-xs font-medium text-[#7d8590] px-2 py-1">Select a file to include</div>
                        {files.length === 0 ? (
                          <div className="px-2 py-3 text-sm text-[#7d8590]">No files available</div>
                        ) : (
                          files.map(file => (
                            <button
                              key={file.id}
                              onClick={() => handleFileSelect(file)}
                              className="w-full text-left px-2 py-1.5 text-sm rounded flex items-center space-x-2 hover:bg-[#21262d] text-[#e6edf3]"
                            >
                              <FileText size={14} />
                              <span className="truncate">{file.name}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Model selector with updated icon */}
                  <div className="relative" ref={modelDropdownRef}>
                    <button 
                      onClick={() => setShowModelDropdown(!showModelDropdown)}
                      className="text-xs text-[#7d8590] hover:text-[#e6edf3] px-2 py-1 rounded flex items-center"
                    >
                      {selectedModel === 'gemini' ? 'Gemini' : 
                       selectedModel === 'deepseek' ? 'DeepSeek' : 
                       selectedModel === 'qwen-2.5' ? 'Qwen-2.5' : selectedModel}
                      <Sparkles size={14} className="ml-1 text-yellow-400" />
                    </button>
                    
                    {/* Use only the independent ModelDropdown component */}
                    {showModelDropdown && (
                      <ModelDropdown 
                        selectedModel={selectedModel}
                        handleModelSelect={handleModelSelect}
                        buttonRef={modelDropdownRef}
                      />
                    )}
                  </div>
                  
                  {/* Send button - unchanged */}
                  <button 
                    onClick={handleSendMessage} 
                    className="text-white p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-600/50"
                    disabled={isLoading || isReviewLoading || !input.trim()}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add this component at the end of the file, before the closing export statement

// Model dropdown component that positions itself independently
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
            {selectedModel === 'gemini' && (
              <span className="ml-1 text-xs bg-blue-500/20 text-blue-400 px-1.5 rounded">New</span>
            )}
          </div>
        </button>
        <button
          onClick={() => handleModelSelect('deepseek')}
          className={`w-full text-left px-2 py-1.5 text-sm rounded ${selectedModel === 'deepseek' ? 'bg-[#388bfd]/10 text-[#388bfd]' : 'text-[#e6edf3] hover:bg-[#21262d]'}`}
        >
          <div className="flex items-center">
            <span>DeepSeek-Reasoner (R1)</span>
          </div>
        </button>
        <button
          onClick={() => handleModelSelect('qwen-2.5')}
          className={`w-full text-left px-2 py-1.5 text-sm rounded ${selectedModel === 'qwen-2.5' ? 'bg-[#388bfd]/10 text-[#388bfd]' : 'text-[#e6edf3] hover:bg-[#21262d]'}`}
        >
          <div className="flex items-center">
            <span>Qwen 2.5</span>
          </div>
        </button>
        <button
          onClick={() => handleModelSelect('qwq-32b')}
          className={`w-full text-left px-2 py-1.5 text-sm rounded ${selectedModel === 'qwq-32b' ? 'bg-[#388bfd]/10 text-[#388bfd]' : 'text-[#e6edf3] hover:bg-[#21262d]'}`}
        >
          <div className="flex items-center">
            <span>QwQ 32B</span>
            <span className="ml-1 text-xs bg-purple-500/20 text-purple-400 px-1.5 rounded">New</span>
          </div>
        </button>
      </div>
    </div>
  );
};
