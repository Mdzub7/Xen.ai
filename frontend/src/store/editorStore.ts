import { create } from 'zustand';
import type { File, Folder, Message, View } from '../types';
import { getLanguageBoilerplate, extensionToLanguage, getFileExtension } from './boilerplate';

interface EditorState {
  currentFile: File | null;
  files: File[];
  folders: Folder[];
  isAIPanelOpen: boolean;
  messages: Message[];
  currentView: View;
  terminalCommands: string[];
  terminalHistory: TerminalEntry[];
  selectedModel: AIModel;
  isAuthenticated: boolean;
  user: UserData | null;
  isReviewLoading:boolean;
  
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Improved language ID mapping for Judge0
const getLanguageId = (language: string): number => {
  // Normalize the language string
  const normalizedLanguage = language.toLowerCase().trim();
  
  const languageMap: { [key: string]: number } = {
    python: 71,      // Python 3
    javascript: 63,  // JavaScript Node.js
    java: 62,        // Java
    c: 50,           // C (GCC)
    cpp: 54,         // C++ (GCC)
    typescript: 74,  // TypeScript
    ruby: 72,        // Ruby
    go: 60,          // Go
    php: 68,         // PHP
    rust: 73,        // Rust
    csharp: 51,      // C#
    plaintext: 71,   // Default to Python for plaintext
    txt: 71,         // Default to Python for .txt files
    scala: 81,       // Added Scala
    kotlin: 78,      // Added Kotlin
    swift: 83,       // Added Swift
    dart: 55,        // Added Dart
    lua: 64,         // Added Lua
    perl: 67,        // Added Perl
    r: 70,           // Added R
    haskell: 61,     // Added Haskell
  };
  
  console.log(`Getting language ID for: "${normalizedLanguage}"`);
  return languageMap[normalizedLanguage] || 71; // Default to Python if unknown
};




const defaultContent="Default";
// Get language from file extension
const getLanguageFromExtension = (fileName: string): string => {
  const ext = '.' + fileName.split('.').pop();
  return extensionToLanguage[ext] || 'plaintext';
};


type TerminalEntry = {
  command: string;
  output: string;
};

// Add AIModel type definition
type AIModel = 'gemini' | 'deepseek' | 'qwen-2.5';

type EditorStateWithMethods = EditorState & {
  setCurrentView: (view: View) => void;
  addFile: (file: File) => void;
  addFolder: (folder: Folder) => void;
  deleteFile: (fileId: string) => void;
  updateFile: (fileId: string, content: string) => void;
  setCurrentFile: (file: File | null) => void;
  toggleAIPanel: () => void;
  addMessage: (message: Message) => void;
  createNewFile: (name: string, language: string, folderId?: string) => void;
  createNewFolder: (name: string, parentId?: string) => void;
  addTerminalCommand: (entry: TerminalEntry) => void;
  formatCode: () => void;
  saveFile: () => void;
  runCode: () => void;
  initializeDefaultFile: () => void;
  updateFileLanguage: (fileId: string, language: string) => void;
  setSelectedModel: (model: AIModel) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  setIsReviewLoading: (isLoading: boolean) => void;
  clearTerminalHistory: () => void;
  setTerminalHistory: (history: TerminalEntry[]) => void; // Add this line
};

const isAIView = (view: View): boolean => ['ai', 'debug'].includes(view);

export const useEditorStore = create<EditorStateWithMethods>((set, get) => ({
  // Initial state
  currentFile: null,
  files: [],
  folders: [],
  isAIPanelOpen: false,
  messages: [],
  currentView: 'explorer',
  terminalCommands: [],
  terminalHistory: [],
  selectedModel: 'gemini',
  isAuthenticated: false,
  user: null,
  isReviewLoading: false,
  setIsReviewLoading: (isLoading) => set({ isReviewLoading: isLoading }),

  
  // Authentication methods
  login: async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await response.json();
      set(state => ({ 
        ...state, 
        isAuthenticated: true,
        user: userData
      }));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  signup: async (userData: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const user = await response.json();
      set(state => ({ 
        ...state, 
        isAuthenticated: true,
        user: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email
        }
      }));
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  },

  logout: () => {
    set(state => ({ 
      ...state, 
      isAuthenticated: false,
      user: null,
      currentFile: null,
      files: [],
      folders: [],
      messages: [],
      isAIPanelOpen: false,
      currentView: 'explorer'
    }));
  },

  // Add model setter
  setSelectedModel: (model: AIModel) => set((state) => ({
    ...state,
    selectedModel: model
  })),

  clearTerminalHistory: () => set({ terminalHistory: [] }),

  // Single implementation of addMessage with model information
  addMessage: (message: Message) => set((state) => ({
    ...state,
    messages: [...state.messages, {
      ...message,
      model: state.selectedModel
    }]
  })),

  setCurrentView: (view: View) => {
    set((state) => ({
      ...state,
      currentView: view,
      isAIPanelOpen: isAIView(view) || (isAIView(state.currentView) ? false : state.isAIPanelOpen),
    }));
  },

  addFile: (file: File) => set((state) => ({ ...state, files: [...state.files, file] })),

  addFolder: (folder: Folder) => set((state) => ({ ...state, folders: [...state.folders, folder] })),

  deleteFile: (fileId: string) => set((state) => ({
    ...state,
    files: state.files.filter((file) => file.id !== fileId),
    currentFile: state.currentFile?.id === fileId ? null : state.currentFile,
  })),

  updateFile: (fileId: string, content: string) => set((state) => ({
    ...state,
    files: state.files.map((file) => file.id === fileId ? { ...file, content } : file),
    currentFile: state.currentFile?.id === fileId ? { ...state.currentFile, content } : state.currentFile,
  })),

  updateFileLanguage: (fileId: string, language: string) => set((state) => ({
    ...state,
    files: state.files.map((file) => 
      file.id === fileId ? { ...file, language: language.toLowerCase() } : file
    ),
    currentFile: state.currentFile?.id === fileId 
      ? { ...state.currentFile, language: language.toLowerCase() } 
      : state.currentFile,
  })),

  setCurrentFile: (file: File | null) => {
    // If setting a new file, ensure the language is correctly set based on extension
    if (file && (!file.language || file.language === 'plaintext')) {
      const language = getLanguageFromExtension(file.name);
      file.language = language;
      console.log(`Setting file language to ${language} based on extension`);
    }
    set((state) => ({ ...state, currentFile: file }));
  },

  toggleAIPanel: () => set((state) => ({ ...state, isAIPanelOpen: !state.isAIPanelOpen })),

  createNewFile: (name: string, language: string, folderId?: string) => {
    // If no language is specified, try to infer from the file extension
    let detectedLanguage = language;
    if (!detectedLanguage || detectedLanguage === 'plaintext') {
      detectedLanguage = getLanguageFromExtension(name);
    }
    
    // Ensure file has correct extension based on language
    let fileName = name;
    if (!fileName.includes('.')) {
      // Get the appropriate extension for the language
      const languageToExt = Object.entries(extensionToLanguage).find(([_, lang]) => lang === detectedLanguage.toLowerCase());
      const defaultExt = languageToExt ? languageToExt[0] : '.txt';
      fileName = `${name}${defaultExt}`;
    }
    
    // Generate boilerplate content based on language
    const boilerplateContent = getLanguageBoilerplate(detectedLanguage.toLowerCase(), fileName);
    
    // Create the new file with the proper language and boilerplate
    const newFile: File = { 
      id: generateId(), 
      name: fileName, 
      content: boilerplateContent, 
      language: detectedLanguage.toLowerCase(), 
      folderId 
    };
    
    console.log(`Created new file: ${fileName} with language: ${detectedLanguage}`);
    get().addFile(newFile);
    get().setCurrentFile(newFile);
  },

  createNewFolder: (name: string, parentId?: string) => {
    const newFolder: Folder = { id: generateId(), name, parentId, files: [] };
    get().addFolder(newFolder);
  },

  addTerminalCommand: (entry: TerminalEntry) => set((state) => ({
    ...state,
    terminalCommands: [...state.terminalCommands, entry.command],
    terminalHistory: [...state.terminalHistory, entry],
  })),

  setTerminalHistory: (history: any) => set(() => ({
    terminalHistory: history,
  })),

  
  formatCode: () => {
    const { currentFile } = get();
    if (!currentFile) return;
    
    // Basic formatting - a more sophisticated formatter could be used here
    const formatted = currentFile.content
      .split('\n')
      .map(line => line.trimRight()) // Remove trailing whitespace
      .join('\n');
      
    get().updateFile(currentFile.id, formatted);
  },

  saveFile: () => {
    const { currentFile } = get();
    if (!currentFile) return;
    localStorage.setItem(`file_${currentFile.id}`, currentFile.content);
  },

  runCode: async () => {
    const { currentFile, addTerminalCommand } = get();
    if (!currentFile) {
      addTerminalCommand({ command: "Execution Error:", output: "No file selected." });
      return;
    }
  
    // Determine the language from the file extension if not specified
    const fileExtension = `.${currentFile.name.split('.').pop()}`;
    const fileLanguage = currentFile.language || extensionToLanguage[fileExtension] || 'plaintext';
    
    // If language is still plaintext but we have a specific extension, try to get the language
    let language = fileLanguage;
    if (language === 'plaintext' && fileExtension !== '.txt') {
      language = extensionToLanguage[fileExtension] || 'plaintext';
      // Update the file with the correct language
      get().updateFileLanguage(currentFile.id, language);
    }
                     
    const languageId = getLanguageId(language);
    
    // Add detailed debugging information
    console.log("Running code with:", {
      fileName: currentFile.name,
      fileExtension: fileExtension,
      detectedLanguage: language,
      storedLanguage: currentFile.language,
      languageId: languageId,
      contentPreview: currentFile.content.substring(0, 100) + "..."
    });
  
    try {
      addTerminalCommand({ 
        command: `Running ${currentFile.name} (${language})...`, 
        output: "" 
      });
  
      // For Java files, ensure they have a proper class structure
      if (language === 'java' && !currentFile.content.includes('public class')) {
        // Auto-wrap simple Java code in a class if needed
        if (!currentFile.content.includes('class')) {
          const className = currentFile.name.replace('.java', '');
          const wrappedCode = `
public class ${className} {
    public static void main(String[] args) {
${currentFile.content.split('\n').map(line => '        ' + line).join('\n')}
    }
}`;
          get().updateFile(currentFile.id, wrappedCode);
          console.log("Auto-wrapped Java code in a class");
        }
      }

      const response = await fetch("http://127.0.0.1:8000/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: currentFile.content,
          language_id: languageId,
          stdin: "", // Standard input if needed
        }),
      });
  
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Response body:", result);
  
      // Handle the execution results
      if (result.output !== undefined) {
        addTerminalCommand({ 
          command: `Output (${language}):`, 
          output: result.output || "[No output]" 
        });
      } else if (result.error) {
        addTerminalCommand({ 
          command: `Error (${language}):`, 
          output: result.error 
        });
      } else if (result.stderr) {
        addTerminalCommand({ 
          command: `Error (${language}):`, 
          output: result.stderr 
        });
      } else if (result.compile_output) {
        addTerminalCommand({ 
          command: `Compilation Error (${language}):`, 
          output: result.compile_output 
        });
      } else {
        addTerminalCommand({ 
          command: `Execution completed (${language}):`, 
          output: "No output returned." 
        });
      }
    } catch (error: unknown) {
      console.error("Execution error:", error);
      addTerminalCommand({ 
        command: "Execution Error:", 
        output: error instanceof Error ? error.message : String(error)
      });
    }
  },

  initializeDefaultFile: () => {
    const extension = getFileExtension(defaultContent);
    const language = extensionToLanguage[extension] || 'plaintext';
    
    const defaultFile: File = {
      id: generateId(),
      name: `untitled${extension}`,
      content: defaultContent,
      language: language,
      folderId: undefined,
    };
    
    console.log(`Initialized default file with language: ${language}`);
    set((state) => ({ 
      ...state, 
      currentFile: defaultFile, 
      files: [defaultFile] 
    }));
  },
}));