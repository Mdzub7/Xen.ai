import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { Message } from '../types';
import { CodeBlock } from './CodeBlock';
import { formatAIResponse, parseResponse } from '../utils/formatResponse';
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import Markdown from 'react-markdown';
import '../styles/codeBlock.css';
import rehypeRaw from 'rehype-raw';
import { LoadingSpinner } from './LoadingSpinner';
import '../styles/loadingSpinner.css';
import { getFirebaseToken } from '../auth/firebaseToken'; 

interface Section {
  type: 'code' | 'text';
  content: string;
  language?: string;
  label?: string;
}

// Add a close button to the top of the panel
export const AIPanel: React.FC = () => {
  const { isAIPanelOpen, toggleAIPanel, messages, addMessage, selectedModel, setSelectedModel } = useEditorStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessage = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }

      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        content: match[2].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return parts;
  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model as any); // Cast to AIModel type
  };

  const handleSendMessage = async () => {
    const token = await getFirebaseToken();
    console.log('token is',token)
    if (!token) {
        throw new Error("User not authenticated");
    }
    if (!input.trim()) return;
    setIsLoading(true);

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);
    setInput('');

    try {
      const response = await fetch('http://127.0.0.1:8000/ai/get-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization':`Bearer ${token}`

        },
        body: JSON.stringify({ 
          code: input,
          service_choice: selectedModel
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const rawResponse = await response.text();
      const formattedResponse = formatAIResponse(rawResponse);
      
      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: formattedResponse,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMessage);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeAction = async (action: string, codeBlock: any) => {
    try {
      let cleanCode = '';
      
      if (typeof codeBlock === 'string') {
        cleanCode = codeBlock;
      } else if (Array.isArray(codeBlock)) {
        cleanCode = codeBlock.reduce((acc: string, curr: any) => {
          if (typeof curr === 'string') return acc + curr;
          if (curr?.props?.children) {
            return acc + (Array.isArray(curr.props.children) 
              ? curr.props.children.join('') 
              : curr.props.children);
          }
          return acc;
        }, '');
      }
      
      cleanCode = cleanCode
        .replace(/^\s*\/\*\*[\s\S]*?\*\/\s*/m, '')
        .trim();
    
      switch(action) {
        case 'copy':
          await navigator.clipboard.writeText(cleanCode);
          // Add notification handling here if needed
          break;
          
        case 'apply':
          // Handle code application
          break;
          
        case 'new-file':
          const blob = new Blob([cleanCode], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'code-snippet.js';
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
          break;
      }
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  // Update the code component type definition
  interface CodeProps extends React.HTMLAttributes<HTMLElement> {
    node?: any;
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  }

  const renderMessageContent = (content: string) => {
    return (
      <Markdown
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          code: ({ node, inline, className, children, ...props }: CodeProps) => {
            if (inline) {
              return <code className={className} {...props}>{children}</code>;
            }
  
            // Process the code content
            const codeContent = React.Children.toArray(children)
              .map(child => 
                typeof child === 'object' && child !== null && 'props' in child 
                  ? child.props.children 
                : child
              )
              .join('')
              .replace(/\\n/g, '\n')     // Convert \n to newlines
              .replace(/\\t/g, '  ')     // Convert \t to spaces
              .replace(/\t/g, '  ');     // Convert actual tabs to spaces
  
            // Extract language from className
            const language = className?.replace(/language-/, '') || 'plaintext';
  
            return (
              <div className="code-block-container">
                <pre className={`hljs language-${language}`}>
                  <code className={className} {...props}>
                    {codeContent}
                  </code>
                </pre>
                <div className="code-actions">
                  <button 
                    onClick={() => handleCodeAction('copy', codeContent)}
                    title="Copy to clipboard"
                  >
                    Copy
                  </button>
                  <button 
                    onClick={() => handleCodeAction('apply', codeContent)}
                    title="Apply changes"
                  >
                    Apply
                  </button>
                  <button 
                    onClick={() => handleCodeAction('new-file', codeContent)}
                    title="Download as file"
                  >
                    New File
                  </button>
                </div>
              </div>
            );
          }
        }}
      >
        {content.replace(/\\n/g, '\n').replace(/\\t/g, '  ')}
      </Markdown>
    );
  };

  return (
    <div className="fixed right-0 top-0 h-[97.3vh] w-[30vw] flex flex-col bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black border-l border-white/10 shadow-lg z-50">
      {/* Header with horizontal gradient */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-black/20 to-black">
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Chat</span>
          <span className="text-white/70">Builder <span className="text-xs px-1.5 py-0.5 rounded bg-black/20">Beta</span></span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-[#21262d] text-[#7d8590]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z"></path></svg>
          </button>
          <button className="p-1.5 rounded-lg hover:bg-[#21262d] text-[#7d8590]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2 2a.75.75 0 0 0 1.06 0Z"></path></svg>
          </button>
          <button 
            onClick={toggleAIPanel}
            className="p-1.5 rounded-lg hover:bg-[#21262d] text-[#7d8590]"
            title="Close AI Panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Empty state - centered content */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-semibold text-[#e6edf3] mb-2">Xen.ai Mode</h1>
          <p className="text-[#7d8590] text-sm max-w-md">
            Feel free to ask questions or seek advice about your codebase or coding in general.
          </p>
        </div>
      )}

      {/* Messages area */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-6 last:mb-2`}
            >
              <div
                className={`${
                  message.role === 'user'
                    ? 'ml-auto bg-[#2d333b] text-[#e6edf3] max-w-[85%]'
                    : 'mr-auto bg-[#22272e] text-[#e6edf3] max-w-[90%]'
                } rounded-lg p-6 shadow-md`}
              >
                {renderMessageContent(message.content)}
                <p className="text-xs text-[#7d8590] mt-4 pt-2 border-t border-[#30363d]">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="mr-auto bg-[#161b22] rounded-lg p-6 max-w-[90%] shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#4f8cc9] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-[#4f8cc9] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-[#4f8cc9] rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[#7d8590]">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          {isLoading && <LoadingSpinner />}
          <div ref={messagesEndRef} />
        </div>
      )}
        
      {/* Input area with model selection dropdown */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'inherit';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask the AI assistant..."
            className="flex-1 bg-black/40 text-white rounded-lg px-4 py-3 text-sm focus:outline-none 
              border border-white/10 focus:border-[#4f8cc9] resize-none min-h-[44px] max-h-[150px] overflow-y-auto"
            disabled={isLoading}
            rows={1}
          />
          
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative group">
              <button 
                className="px-3 py-2 rounded bg-black/40 text-white hover:bg-gradient-to-r hover:from-[#0A192F] hover:to-[#0F1A2B] transition-colors duration-200 text-sm font-medium"
              >
                {selectedModel === 'gemini' ? 'Gemini' : 
                 selectedModel === 'deepseek' ? 'DeepSeek' : 'Qwen'}
              </button>
              
              <div 
                className="absolute bottom-full mb-1 right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                bg-[#161b22] rounded-md shadow-lg overflow-hidden z-50 transition-all duration-300 transform translate-y-1 
                group-hover:translate-y-0 min-w-[120px]"
              >
                <div className="py-1">
                  <button
                    className={`w-full px-4 py-2 text-left text-sm ${
                      selectedModel === 'gemini' ? 'bg-[#4f8cc9] text-white' : 'text-[#e6edf3] hover:bg-[#21262d]'
                    } transition-colors duration-150`}
                    onClick={() => handleModelSelect('gemini')}
                  >
                    Gemini
                  </button>
                  <button
                    className={`w-full px-4 py-2 text-left text-sm ${
                      selectedModel === 'deepseek' ? 'bg-[#4f8cc9] text-white' : 'text-[#e6edf3] hover:bg-[#21262d]'
                    } transition-colors duration-150`}
                    onClick={() => handleModelSelect('deepseek')}
                  >
                    DeepSeek
                  </button>
                  <button
                    className={`w-full px-4 py-2 text-left text-sm ${
                      selectedModel === 'qwen-2.5' ? 'bg-[#4f8cc9] text-white' : 'text-[#e6edf3] hover:bg-[#21262d]'
                    } transition-colors duration-150`}
                    onClick={() => handleModelSelect('qwen-2.5')}
                  >
                    Qwen
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSendMessage}
              className="px-3 py-2 rounded bg-black/40 text-white/70 hover:bg-black/60 disabled:opacity-50"
              disabled={isLoading}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};