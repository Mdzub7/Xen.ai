import React, { useState, useEffect } from 'react';
import { aiService, CodeRequest, AIResponse } from '../services/aiService';
import { Bot, Code2, Zap, Lightbulb, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIAssistantProps {
  code: string;
  onResponse: (response: string, type: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ code, onResponse }) => {
  const [selectedModel, setSelectedModel] = useState<string>('gemini');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableModels();
  }, []);

  const loadAvailableModels = async () => {
    try {
      const models = await aiService.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const handleAIRequest = async (feature: string) => {
    if (!code) return;
    
    setLoading(true);
    setActiveFeature(feature);
    
    try {
      const request: CodeRequest = {
        code,
        model: selectedModel
      };

      let response: AIResponse;
      switch (feature) {
        case 'review':
          response = await aiService.reviewCode(request);
          break;
        case 'explain':
          response = await aiService.explainCode(request);
          break;
        case 'suggest':
          response = await aiService.suggestImprovements(request);
          break;
        case 'complete':
          response = await aiService.completeCode(request);
          break;
        default:
          throw new Error('Invalid feature');
      }

      if (response.status === 'success') {
        onResponse(response[feature as keyof AIResponse] as string, feature);
      } else {
        onResponse(`Error: ${response.message}`, feature);
      }
    } catch (error) {
      onResponse(`Error: ${error instanceof Error ? error.message : 'An error occurred'}`, feature);
    } finally {
      setLoading(false);
      setActiveFeature(null);
    }
  };

  const features = [
    {
      id: 'review',
      name: 'Code Review',
      icon: <Bot className="w-5 h-5" />,
      description: 'Get detailed feedback on your code quality and best practices'
    },
    {
      id: 'explain',
      name: 'Code Explanation',
      icon: <Code2 className="w-5 h-5" />,
      description: 'Understand how your code works with detailed explanations'
    },
    {
      id: 'suggest',
      name: 'Improvement Suggestions',
      icon: <Lightbulb className="w-5 h-5" />,
      description: 'Get actionable suggestions to improve your code'
    },
    {
      id: 'complete',
      name: 'Code Completion',
      icon: <Play className="w-5 h-5" />,
      description: 'Get AI-powered code completion suggestions'
    }
  ];

  return (
    <div className="bg-[#1E293B] rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">AI Assistant</h2>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="bg-[#0F172A] text-white rounded-lg px-4 py-2 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          {availableModels.map((model) => (
            <option key={model} value={model}>
              {model.charAt(0).toUpperCase() + model.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <motion.button
            key={feature.id}
            onClick={() => handleAIRequest(feature.id)}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg border transition-all ${
              loading && activeFeature === feature.id
                ? 'bg-blue-500/20 border-blue-500'
                : 'bg-[#0F172A] border-white/10 hover:border-blue-500'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`${
                loading && activeFeature === feature.id
                  ? 'text-blue-400'
                  : 'text-white/70'
              }`}>
                {feature.icon}
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">{feature.name}</h3>
                <p className="text-white/50 text-sm">{feature.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center space-x-2 text-blue-400">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}; 