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
      <div className="flex-1 bg-[#0d1117] flex items-center justify-center text-[#7d8590]">
        <p>Select a file to start editing</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        width="100%"
        theme="github-dark"
        language={currentFile.language}
        value={currentFile.content}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          padding: { top: 0, bottom: 8 },
          renderLineHighlight: 'all',
          scrollbar: {
            useShadows: false,
            verticalScrollbarSize: 10,
            vertical: 'visible',
            horizontal: 'visible'
          }
        }}
        beforeMount={(monaco) => {
          monaco.editor.defineTheme('github-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
              { token: 'comment', foreground: '#7d8590' },
              { token: 'keyword', foreground: '#ff7b72' },
              { token: 'string', foreground: '#a5d6ff' },
              { token: 'number', foreground: '#79c0ff' },
              { token: 'type', foreground: '#ff7b72' }
            ],
            colors: {
              'editor.background': '#0d1117',
              'editor.foreground': '#e6edf3',
              'editorCursor.foreground': '#e6edf3',
              'editor.lineHighlightBackground': '#161b22',
              'editorLineNumber.foreground': '#7d8590',
              'editor.selectionBackground': '#2d4f7c',
              'editor.inactiveSelectionBackground': '#21262d',
              'editorIndentGuide.background': '#21262d',
              'scrollbarSlider.background': '#21262d',
              'scrollbarSlider.hoverBackground': '#30363d',
              'scrollbarSlider.activeBackground': '#30363d',
              'minimap.background': '#0d1117',
              'minimap.foregroundOpacity': '#30363d'
            }
          });
        }}
      />
    </div>
  );
};