import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface CodeRequest {
  code: string;
  model?: string;
}

export interface AIResponse {
  status: string;
  review?: string;
  explanation?: string;
  suggestions?: string;
  completion?: string;
  model: string;
  message?: string;
}

class AIService {
  private static instance: AIService;
  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async reviewCode(request: CodeRequest): Promise<AIResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/review`, request);
      return response.data;
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to review code',
        model: request.model || 'gemini'
      };
    }
  }

  async explainCode(request: CodeRequest): Promise<AIResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/explain`, request);
      return response.data;
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to explain code',
        model: request.model || 'gemini'
      };
    }
  }

  async suggestImprovements(request: CodeRequest): Promise<AIResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/suggest`, request);
      return response.data;
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to suggest improvements',
        model: request.model || 'gemini'
      };
    }
  }

  async completeCode(request: CodeRequest): Promise<AIResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/complete`, request);
      return response.data;
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to complete code',
        model: request.model || 'gemini'
      };
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai/models`);
      return response.data.models;
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      return ['gemini']; // Fallback to Gemini if API call fails
    }
  }
}

export const aiService = AIService.getInstance(); 