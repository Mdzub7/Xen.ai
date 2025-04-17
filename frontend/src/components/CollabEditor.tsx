import React, { useCallback, useRef, useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useEditorStore } from '../store/editorStore';
import { useSettingsStore } from '../store/settingsStore';
import InlineCodeDiffViewer from './InlineCodeDiffViewer';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { MonacoBinding } from 'y-monaco';

export const CollabEditor: React.FC = () => {
  const { 
    currentFile, 
    updateFile, 
    showCodeDiff, 
    codeDiffs, 
    acceptCodeChanges, 
    rejectCodeChanges 
  } = useEditorStore();
  
  const { theme, fontSize, wordWrap, autoSave } = useSettingsStore();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  // Setup YJS collaboration when a file is loaded
  useEffect(() => {
    if (currentFile) {
      // Initialize YJS document and WebRTC provider for the current file
      ydocRef.current = new Y.Doc();
      providerRef.current = new WebrtcProvider(`monaco-${currentFile.id}`, ydocRef.current);
      
      return () => {
        // Clean up YJS resources when component unmounts or file changes
        if (bindingRef.current) {
          bindingRef.current.destroy();
          bindingRef.current = null;
        }
        
        if (providerRef.current) {
          providerRef.current.destroy();
          providerRef.current = null;
        }
        
        if (ydocRef.current) {
          ydocRef.current.destroy();
          ydocRef.current = null;
        }
      };
    }
  }, [currentFile?.id]);

  // Handle editor changes
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (currentFile && value !== undefined && autoSave) {
        updateFile(currentFile.id, value);
      }
    },
    [currentFile, updateFile, autoSave]
  );

  // Handle editor mount
  const handleEditorDidMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      
      if (currentFile && ydocRef.current && providerRef.current) {
        const model = editor.getModel();
        const yText = ydocRef.current.getText('monaco');
        
        // Set initial content if the YJS document is empty
        if (yText.toString() === '' && currentFile.content) {
          yText.insert(0, currentFile.content);
        }
        
        // Create Monaco binding
        bindingRef.current = new MonacoBinding(
          yText,
          model,
          new Set([editor]),
          providerRef.current.awareness
        );
      }
    },
    [currentFile]
  );

  if (!currentFile) {
    return (
      <div className="flex-1 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black flex flex-col items-center justify-center h-screen">
        <h2 className="text-white text-xl mb-4">No file selected</h2>
        <p className="text-gray-400">Please select or create a file from the explorer.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <MonacoEditor
        language={currentFile.language || 'javascript'}
        value={currentFile.content || ''}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme === 'github-dark' ? 'vs-dark' : 'light'}
        options={{
          fontSize,
          wordWrap: wordWrap ? 'on' : 'off',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
        }}
      />
      {showCodeDiff && (
        <InlineCodeDiffViewer
          diffs={codeDiffs}
          onAccept={acceptCodeChanges}
          onReject={rejectCodeChanges}
        />
      )}
    </div>
  );
};

export default CollabEditor;