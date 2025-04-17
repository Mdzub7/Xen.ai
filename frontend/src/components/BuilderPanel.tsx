import React, { useState } from 'react';
import { Builder } from './Builder';
import { AIAssistant } from './AIAssistant';
import { Sparkles, Bot } from 'lucide-react';

export const BuilderPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assistant' | 'builder'>('assistant');

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex items-center gap-2 px-4 py-3 ${activeTab === 'assistant' ? 'border-b-2 border-blue-400 text-blue-400' : 'text-white/70 hover:text-white/90'}`}
        >
          <Bot size={16} />
          <span>Assistant</span>
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-2 px-4 py-3 ${activeTab === 'builder' ? 'border-b-2 border-blue-400 text-blue-400' : 'text-white/70 hover:text-white/90'}`}
        >
          <Sparkles size={16} />
          <span>Builder</span>
          <span className="text-blue-300 rounded-full bg-grey px-2 py-0.5 text-xs font-medium shadow-sm ml-1">
            Beta
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'assistant' ? (
          <div className="h-full">
            {/* Render the existing AI Assistant panel */}
            <AIAssistant 
              code="" 
              onResponse={(response, type) => {
                // Handle response from AI Assistant
                console.log(response, type);
              }} 
            />
          </div>
        ) : (
          <div className="h-full">
            {/* Render the new Builder component */}
            <Builder />
          </div>
        )}
      </div>
    </div>
  );
};