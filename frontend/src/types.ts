export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type File = {
  id: string;
  name: string;
  content: string;
  language: string;
  folderId?: string;
  path?: string;  // Add path as optional property
};

import { StateCreator } from 'zustand';

export type EditorState = {
  currentFile: File | null;
  files: File[];
  folders: Folder[];
  isAIPanelOpen: boolean;
  messages: Message[];
  currentView: View;
  terminalCommands: string[];
  terminalHistory: { command: string; output: string }[];
};

export type EditorStore = EditorState & {
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
  addTerminalCommand: (command: string) => void;
  formatCode: () => void;
  saveFile: () => void;
  runCode: () => void;
  initializeDefaultFile: () => void;
};

export type View = 'explorer' | 'search' | 'sourceControl' | 'extensions' | 'settings' | 'profile' | 'ai' | 'debug' | 'none';

export type Folder = {
  id: string;
  name: string;
  parentId?: string;
  files: string[];
};