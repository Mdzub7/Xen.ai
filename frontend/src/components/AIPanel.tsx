import React, { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { Message } from "../types";
import Markdown from "react-markdown";
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

export const AIPanel: React.FC = () => {
  const {
    isAIPanelOpen,
    toggleAIPanel,
    messages,
    addMessage,
    selectedModel,
    setSelectedModel,
    isReviewLoading,
    setIsReviewLoading,
  } = useEditorStore();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleModelSelect = (model: string) => {
    setSelectedModel(model as any);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    const token = await getFirebaseToken();
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);
    setInput("");

    try {
      const response = await fetch("http://127.0.0.1:8000/ai/get-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: input,
          service_choice: selectedModel,
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const rawResponse = await response.text();
      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: rawResponse,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMessage);
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
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">ChatBot</span>
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

      {/* Empty State */}
      {isAuthenticated && messages.length === 0 && !isLoading && !isReviewLoading && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-semibold text-[#e6edf3] mb-2">
            Xen.ai Mode
          </h1>
          <p className="text-[#7d8590] text-sm max-w-md">
            Feel free to ask questions or seek advice about your codebase.
          </p>
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
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-6`}>
              <div className={`rounded-lg p-6 shadow-md ${message.role === "user" ? "bg-[#2d333b] text-[#e6edf3] max-w-[85%]" : "bg-[#22272e] text-[#e6edf3] max-w-[90%]"}`}>
                <Markdown rehypePlugins={[rehypeRaw, rehypeHighlight]}>{message.content}</Markdown>
                <p className="text-xs text-[#7d8590] mt-4 pt-2 border-t border-[#30363d]">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {(isLoading || isReviewLoading) && <LoadingSpinner />}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      {isAuthenticated && (
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI assistant..."
              className="flex-1 bg-black/40 text-white rounded-lg px-4 py-3 text-sm focus:outline-none 
              border border-white/10 focus:border-[#4f8cc9] resize-none min-h-[44px] max-h-[150px] overflow-y-auto"
              disabled={isLoading || isReviewLoading}
            />
            <button onClick={handleSendMessage} className="px-3 py-2 rounded bg-black/40 text-white hover:bg-black/60 disabled:opacity-50" disabled={isLoading || isReviewLoading}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
