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


interface Section {
  type: 'code' | 'text';
  content: string;
  language?: string;
  label?: string;
}

export const AIPanel: React.FC = () => {
  // Add loading state
  const { isAIPanelOpen, toggleAIPanel, messages, addMessage } = useEditorStore();
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

  const handleSendMessage = async () => {
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
      const response = await fetch('http://localhost:3000/ai/get-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: input }),
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
    <div className="fixed right-0 top-[48px] bottom-[22px] w-[30%] bg-[#1e1e1e] border-l border-[#3c3c3c] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <h3 className="text-white font-semibold">AI Assistant</h3>
        <button onClick={toggleAIPanel} className="text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 p-6 text-gray-300 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center mt-4">
            Start a conversation with the AI assistant
          </div>
        ) : (
          <div className="space-y-8">
            {messages.map((message: Message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[95%] rounded-lg p-6 ${
                    message.role === 'user'
                      ? 'bg-[#595959] text-gray-100 shadow-md'  // Light blue tint for user
                      : 'bg-[#323130] text-gray-200 shadow-md'  // Dark blue tint for AI
                  }`}
                >
                  {renderMessageContent(message.content)}
                  <p className="text-xs text-gray-400 mt-4 pt-2 border-t border-[#ffffff1a]">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#2d2d45] rounded-lg p-6 max-w-[95%] shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {isLoading && <LoadingSpinner />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="p-4 border-t border-[#3c3c3c]">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask the AI assistant..."
            className="flex-1 bg-[#3c3c3c] text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-[#2d2d2d] hover:bg-[#3c3c3c] rounded text-gray-300 hover:text-white transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};