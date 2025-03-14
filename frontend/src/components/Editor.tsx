import React, { useCallback, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useEditorStore } from '../store/editorStore';
import { TypeAnimation } from 'react-type-animation';

// Add this interface to handle the non-standard webkitdirectory attribute
interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
}

export const Editor: React.FC = () => {
  const { currentFile, updateFile } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (currentFile && value !== undefined) {
        updateFile(currentFile.id, value);
      }
    },
    [currentFile, updateFile]
  );

  const { createNewFile, createNewFolder, setCurrentView } = useEditorStore();

  const handleNewFile = () => {
    createNewFile('untitled.js', 'javascript');
  };

  const handleOpenFolder = () => {
    // Use the file input to open a folder picker
    fileInputRef.current?.click();
  };

  const handleFolderSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Set the explorer view to show the selected folder
      setCurrentView('explorer');
      // You would typically process the selected folder here
      // For now, we just switch to the explorer view
    }
  };

  if (!currentFile) {
    return (
      <div className="flex-1 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black flex flex-col items-center justify-center h-screen">
        <div className="text-center space-y-6 -mt-20 max-w-md px-6">
          <div className="mb-6">
            <TypeAnimation
              sequence={[
                'Welcome to Xen AI',
                2000, // Increased pause time
                'Your intelligent Coding Environment',
                2000, // Increased pause time
              ]}
              wrapper="h2"
              speed={25} // Reduced speed (higher number = slower typing)
              className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
              repeat={1}
            />
          </div>
          <p className="text-white/80 text-sm leading-relaxed mt-4">
            Select a file from the explorer or create a new one to start your coding journey with AI-powered assistance.
          </p>
          <div className="space-y-3 mt-6">
            <button 
              onClick={handleOpenFolder}
              className="w-full px-3 py-2 bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-600 hover:to-blue-700 rounded-lg border border-blue-500/30 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              <span>Open Folder</span>
            </button>
            <button 
              onClick={handleNewFile}
              className="w-full px-3 py-2 bg-black/40 hover:bg-black/50 rounded-lg border border-white/20 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              <span>New File</span>
            </button>
          </div>
          <div className="mt-8 text-xs text-white/50">
            <p>Xen AI is ready to assist with your coding tasks</p>
          </div>
          
          {/* Hidden file input for folder selection */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFolderSelected} 
            style={{ display: 'none' }} 
            webkitdirectory="" 
            directory="" 
            multiple 
            {...{} as CustomInputProps} // Type assertion to handle non-standard attributes
          />
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