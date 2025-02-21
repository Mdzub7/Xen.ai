import React, { useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useEditorStore } from '../store/editorStore';

export const Editor: React.FC = () => {
  const { currentFile, updateFile } = useEditorStore();

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (currentFile && value !== undefined) {
        updateFile(currentFile.id, value);
      }
    },
    [currentFile, updateFile]
  );

  if (!currentFile) {
    return (
      <div className="flex-1 bg-[#1e1e1e] flex items-center justify-center text-gray-400">
        <p>Select a file to start editing</p>
      </div>
    );
  }

  return (
    <MonacoEditor
      height="100%"
      language={currentFile.language}
      value={currentFile.content}
      theme="vs-dark"
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        glyphMargin: false,
        folding: true,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 3,
        padding: { top: 8, bottom: 8 },
        renderLineHighlight: 'all',
        scrollbar: {
          useShadows: false,
          verticalScrollbarSize: 10,
        }
      }}
    />
  );
};