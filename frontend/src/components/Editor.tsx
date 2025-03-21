import React, { useCallback, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useEditorStore } from '../store/editorStore';
import { useSettingsStore } from '../store/settingsStore';
import { TypeAnimation } from 'react-type-animation';
import InlineCodeDiffViewer from './InlineCodeDiffViewer';
import { defineMonacoThemes } from './MonacoThemes';

// Add this interface to handle the non-standard webkitdirectory attribute
interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
}

export const Editor: React.FC = () => {
  const { currentFile, updateFile, showCodeDiff, codeDiffs, acceptCodeChanges, rejectCodeChanges } = useEditorStore();
  const { theme, fontSize, wordWrap, autoSave } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileType, setFileType] = useState('javascript');  // Default file type
  const [fileName, setFileName] = useState('untitled');    // Default file name

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (currentFile && value !== undefined) {
        if (autoSave) {
          updateFile(currentFile.id, value);
        } else {
          currentFile.content = value;
        }
      }
    },
    [currentFile, updateFile, autoSave]
  );

  const { createNewFile, createNewFolder, setCurrentView } = useEditorStore();

  const handleNewFile = () => {
    const extension = fileType === 'javascript' ? 'js' : 
                      fileType === 'python' ? 'py' : 
                      fileType === 'cpp' ? 'cpp':
                      fileType === 'java' ? 'java':
                      fileType === 'c' ? 'c':
                      'txt';

    createNewFile(`${fileName}.${extension}`, fileType);
  }

  const handleOpenFolder = () => {
    fileInputRef.current?.click();
  };

  const handleFolderSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setCurrentView('explorer');
    }
  };

  if (!currentFile) {
    return (
      <div className="flex-1 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black flex flex-col items-center justify-center h-screen">
        <div className="text-center space-y-8 max-w-md px-6">
          <div className="mb-4">
            <TypeAnimation
              sequence={[
                'Welcome to Xen AI',
                2000,
                'Your intelligent Coding Environment',
                2000,
              ]}
              wrapper="h2"
              speed={25}
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
              repeat={1}
            />
          </div>

          <p className="text-white/70 text-sm">
            Select a file from the explorer or create a new one to begin.
          </p>

          <div className="flex flex-col space-y-4 mt-4">
            <button
              onClick={handleOpenFolder}
              className="px-4 py-2 bg-blue-600/90 hover:bg-blue-600 rounded-md text-white transition-colors"
            >
              Open Folder
            </button>

            <div className="flex space-x-2">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="File name"
                className="flex-1 px-3 py-2 bg-[#1e1e1e] text-gray-300 rounded-md outline-none"
              />

              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="px-3 py-2 bg-[#1e1e1e] text-gray-300 rounded-md outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="text">Text</option>
              </select>

              <button
  onClick={handleNewFile}
  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
>
  Create
</button>
            </div>
          </div>

          <div className="text-xs text-white/50 mt-12">
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
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <MonacoEditor
        height="100%"
        width="100%"
        theme={theme === 'github-dark' ? 'xen-dark' :
               theme === 'github-light' ? 'github-light' :
               theme === 'vs-dark' ? 'vs-dark' :
               theme === 'vs-light' ? 'vs-light' :
               theme === 'monokai' ? 'monokai' : 'xen-dark'}
        language={currentFile.language}
        value={currentFile.content}
        onChange={handleEditorChange}
        options={{
          minimap: {
            enabled: true,
            scale: 1.5,
            showSlider: "always",
            renderCharacters: true,
            maxColumn: 120
          },
          scrollbar: {
            useShadows: true,
            verticalScrollbarSize: 12,
            horizontalScrollbarSize: 12,
            vertical: 'auto',
            horizontal: 'auto'
          },
          acceptSuggestionOnEnter: 'smart',
          fontSize: fontSize,
          wordWrap: wordWrap ? 'on' : 'off',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 0,
          dragAndDrop: true,
          lineNumbersMinChars: 3,
          padding: { top: 0, bottom: 8 },
          renderLineHighlight: 'all',
          cursorBlinking: "expand",
          cursorSmoothCaretAnimation: "on",
          formatOnPaste: true,
          formatOnType: true,
          selectionHighlight: true,
          inlineSuggest: { enabled: true },
          occurrencesHighlight: "off",
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true
          },
          parameterHints: { enabled: true },
          suggestOnTriggerCharacters: true,
          lightbulb: { enabled: true }
        }}
        beforeMount={(monaco) => defineMonacoThemes(monaco)}
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

export default Editor;