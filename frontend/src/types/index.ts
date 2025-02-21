export interface File {
  id: string;
  name: string;
  content: string;
  language: string;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  files: File[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface TerminalHistory {
  command: string;
  output: string;
}

export type View = 'explorer' | 'search' | 'git' | 'extensions' | 'settings';

export interface EditorState {
  currentFile: File | null;
  files: File[];
  folders: Folder[];
  isAIPanelOpen: boolean;
  messages: Message[];
  currentView: View;
  terminalCommands: string[];
  terminalHistory: TerminalHistory[];
  addFile: (file: File) => void;
  addFolder: (folder: Folder) => void;
  deleteFile: (fileId: string) => void;
  updateFile: (fileId: string, content: string) => void;
  setCurrentFile: (file: File | null) => void;
  toggleAIPanel: () => void;
  addMessage: (message: Message) => void;
  createNewFile: (name: string, language: string, folderId?: string) => void;
  createNewFolder: (name: string, parentId?: string) => void;
  setCurrentView: (view: View) => void;
  addTerminalCommand: (command: string) => void;
  formatCode: () => void;
  saveFile: () => void;
  runCode: () => void;
}