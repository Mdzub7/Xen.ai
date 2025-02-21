import { create } from 'zustand';
import type { EditorState, File, Folder, Message, View } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const getFileExtension = (content: string): string => {
  if (content.includes('def ') || content.includes('import ')) return '.py';
  if (content.includes('class ') && content.includes('public ')) return '.java';
  if (content.includes('function') || content.includes('const ')) return '.js';
  if (content.includes('interface') || content.includes('type ')) return '.ts';
  if (content.includes('<div') || content.includes('import React')) return '.tsx';
  if (content.includes('<!DOCTYPE') || content.includes('<html')) return '.html';
  if (content.includes('{') && content.includes(':')) return '.json';
  return '.txt';
};

const defaultContent = `// Welcome to the Code Editor
// Start coding or open a file to begin`;

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
  addTerminalCommand: (command: string) => void;
  formatCode: () => void;
  saveFile: () => void;
  runCode: () => void;
  initializeDefaultFile: () => void;
};

type AIView = Extract<View, 'ai' | 'debug'>;
const isAIView = (view: View): view is AIView => ['ai', 'debug'].includes(view as AIView);

export const useEditorStore = create<EditorStateWithMethods>((set, get) => ({
  currentFile: null,
  files: [],
  folders: [],
  isAIPanelOpen: false,
  messages: [],
  currentView: 'explorer' as View,
  terminalCommands: [],
  terminalHistory: [],

  setCurrentView: (view: View) => {
    set((state: EditorState) => ({
      ...state,
      currentView: view,
      isAIPanelOpen: isAIView(view) || (isAIView(state.currentView) ? false : state.isAIPanelOpen)
    }));
  },

  addFile: (file: File) =>
    set((state: EditorState) => ({
      ...state,
      files: [...state.files, file],
    })),

  addFolder: (folder: Folder) =>
    set((state: EditorState) => ({
      ...state,
      folders: [...state.folders, folder],
    })),

  deleteFile: (fileId: string) =>
    set((state: EditorState) => ({
      ...state,
      files: state.files.filter((file) => file.id !== fileId),
      currentFile: state.currentFile?.id === fileId ? null : state.currentFile,
    })),

  updateFile: (fileId: string, content: string) =>
    set((state: EditorState) => ({
      ...state,
      files: state.files.map((file) =>
        file.id === fileId ? { ...file, content } : file
      ),
      currentFile:
        state.currentFile?.id === fileId
          ? { ...state.currentFile, content }
          : state.currentFile,
    })),

  setCurrentFile: (file: File | null) =>
    set((state: EditorState) => ({
      ...state,
      currentFile: file,
    })),

  toggleAIPanel: () =>
    set((state: EditorState) => ({
      ...state,
      isAIPanelOpen: !state.isAIPanelOpen,
    })),

  addMessage: (message: Message) =>
    set((state: EditorState) => ({
      ...state,
      messages: [...state.messages, message],
    })),

  createNewFile: (name: string, language: string, folderId?: string) => {
    const newFile: File = {
      id: generateId(),
      name,
      content: '',
      language,
      folderId,
    };
    get().addFile(newFile);
    get().setCurrentFile(newFile);
  },

  createNewFolder: (name: string, parentId?: string) => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      parentId,
      files: [],
    };
    get().addFolder(newFolder);
  },

  addTerminalCommand: (command: string) =>
    set((state: EditorState) => ({
      ...state,
      terminalCommands: [...state.terminalCommands, command],
      terminalHistory: [...state.terminalHistory, { command, output: `Executing: ${command}\n` }],
    })),

  formatCode: () => {
    const { currentFile } = get();
    if (!currentFile) return;
    const formatted = currentFile.content
      .split('\n')
      .map((line) => line.trim())
      .join('\n');
    get().updateFile(currentFile.id, formatted);
  },

  saveFile: () => {
    const { currentFile } = get();
    if (!currentFile) return;
    localStorage.setItem(`file_${currentFile.id}`, currentFile.content);
  },

  runCode: () => {
    const { currentFile } = get();
    if (!currentFile) return;
    console.log('Running code:', currentFile.content);
  },

  initializeDefaultFile: () => {
    const extension = getFileExtension(defaultContent);
    const defaultFile: File = {
      id: generateId(),
      name: `untitled${extension}`,
      content: defaultContent,
      language: extension.slice(1),
      folderId: undefined,
    };
    set((state: EditorState) => ({
      ...state,
      currentFile: defaultFile,
      files: [defaultFile]
    }));
  },
}));