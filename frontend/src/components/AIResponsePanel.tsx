import React from 'react';
import { Bot, Code2, Lightbulb, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIResponsePanelProps {
  response: string;
  type: 'review' | 'explain' | 'suggest' | 'complete';
  onClose: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'review':
      return <Bot className="w-5 h-5" />;
    case 'explain':
      return <Code2 className="w-5 h-5" />;
    case 'suggest':
      return <Lightbulb className="w-5 h-5" />;
    case 'complete':
      return <Play className="w-5 h-5" />;
    default:
      return <Bot className="w-5 h-5" />;
  }
};

const getTitle = (type: string) => {
  switch (type) {
    case 'review':
      return 'Code Review';
    case 'explain':
      return 'Code Explanation';
    case 'suggest':
      return 'Improvement Suggestions';
    case 'complete':
      return 'Code Completion';
    default:
      return 'AI Response';
  }
};

export const AIResponsePanel: React.FC<AIResponsePanelProps> = ({ response, type, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed bottom-4 right-4 w-96 bg-[#1E293B] rounded-lg shadow-xl border border-white/10 overflow-hidden"
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-blue-400">
            {getIcon(type)}
          </div>
          <h3 className="text-white font-medium">{getTitle(type)}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="prose prose-invert prose-sm">
          {response.split('\n').map((line, index) => (
            <p key={index} className="text-white/70 mb-2">
              {line}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}; 