import axios from 'axios';
import { getFirebaseToken } from '../auth/firebaseToken';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface BuilderContext {
  currentFile?: {
    name: string;
    content: string;
    language: string;
  } | null;
  projectStructure?: Array<{
    name: string;
    language: string;
    path: string;
  }>;
  model?: string;
}

interface GenerateCodeParams {
  prompt: string;
  context?: BuilderContext;
}

interface BuilderResponse {
  status: string;
  code?: string;
  message?: string;
  data?: {
    code?: string;
    message?: string;
  };
}

interface FileModificationParams {
  file_path: string;
  changes: Record<string, any>;
}

interface CommandExecutionParams {
  command: string;
}

class BuilderService {
  async generateCode(params: GenerateCodeParams) {
    const token = await getFirebaseToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await axios.post<BuilderResponse>(
        `${API_BASE_URL}/builder/generate`,
        {
          prompt: params.prompt,
          context: {
            ...params.context,
            model: params.context?.model?.toLowerCase() || 'gemini'
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Check if we have a successful response with data
      if (response.data && response.data.status === 'success') {
        const responseCode = response.data.data?.code || response.data.code;
        
        if (!responseCode) {
          throw new Error('No code received in the response');
        }

        // Don't try to parse the response here, just return it
        return {
          data: {
            status: 'success',
            code: responseCode,
            message: response.data.data?.message || response.data.message
          }
        };
      }
      
      throw new Error(response.data.message || 'Failed to generate code');
    } catch (err: any) {
      // Handle any error that occurs during the request
      const errorMessage = err?.response?.data?.message || err?.message || 'An unknown error occurred';
      throw new Error(errorMessage);
    }
  }

  private async applyGeneratedCode(code: string) {
    if (!code || typeof code !== 'string') {
      console.error('Invalid code received:', code);
      return;
    }

    try {
      // First try to parse as JSON in case it's a structured response
      try {
        const parsed = JSON.parse(code);
        if (parsed.files) {
          // Handle multiple files
          for (const file of parsed.files) {
            await this.modifyFile({
              file_path: file.path,
              changes: {
                content: file.content
              }
            });
          }
          return;
        }
      } catch (e) {
        // Not JSON, continue with regular parsing
      }

      // Try to find file markers in the text
      const filePattern = /File:\s*([^\n]+)\n```[\w]*\n([\s\S]+?)\n```/g;
      let match;
      let foundFiles = false;

      while ((match = filePattern.exec(code)) !== null) {
        foundFiles = true;
        const [_, filePath, content] = match;
        await this.modifyFile({
          file_path: filePath.trim(),
          changes: {
            content: content.trim()
          }
        });
      }

      if (!foundFiles) {
        // If no file markers found, log for debugging
        console.log("No file markers found in response:", code);
      }
    } catch (error) {
      console.error('Error applying generated code:', error);
      throw error;
    }
  }

  async modifyFile(params: FileModificationParams) {
    const token = await getFirebaseToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return axios.post<BuilderResponse>(
      `${API_BASE_URL}/builder/modify-file`,
      params,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }

  async executeCommand(params: CommandExecutionParams) {
    const token = await getFirebaseToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return axios.post<BuilderResponse>(
      `${API_BASE_URL}/builder/execute-command`,
      params,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }

  async getFileStructure() {
    const token = await getFirebaseToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return axios.get<BuilderResponse>(
      `${API_BASE_URL}/builder/file-structure`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }
}

export const builderService = new BuilderService();