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
      <div className="flex-1 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black flex flex-col items-center justify-center h-screen">
        <div className="text-center space-y-4 -mt-32"> {/* Added negative margin top */}
          <h2 className="text-2xl font-semibold text-white">No File Open</h2>
          <p className="text-white/70">Select a file from the explorer or create a new one to start editing</p>
          <div className="space-y-2">
            <button className="px-4 py-2 bg-black/30 hover:bg-black/40 rounded-lg border border-white/10 w-48">
              Open Folder
            </button>
            <button className="px-4 py-2 bg-black/30 hover:bg-black/40 rounded-lg border border-white/10 w-48">
              New File
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        width="100%"
        theme="xen-dark"
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
          monaco.editor.defineTheme('xen-dark', {
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
              'editor.background': '#0A192F',
              'editor.foreground': '#e6edf3',
              'editorCursor.foreground': '#e6edf3',
              'editor.lineHighlightBackground': '#0F1A2B',
              'editorLineNumber.foreground': '#7d8590',
              'editor.selectionBackground': '#2d4f7c',
              'editor.inactiveSelectionBackground': '#1a2333',
              'editorIndentGuide.background': '#1a2333',
              'scrollbarSlider.background': '#1a2333',
              'scrollbarSlider.hoverBackground': '#243044',
              'scrollbarSlider.activeBackground': '#243044',
              'minimap.background': '#0A192F',
              'minimap.foregroundOpacity': '#243044'
            }
          });
        }}
      />
    </div>
  );
};