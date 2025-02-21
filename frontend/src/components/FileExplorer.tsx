import React, { useState } from 'react';
import {
  FolderPlus,
  FilePlus,
  Trash2,
  ChevronRight,
  ChevronDown,
  File as FileIcon,
  Folder as FolderIcon,
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

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

export const FileExplorer: React.FC = () => {
  const { files, folders, currentFile, setCurrentFile, deleteFile, createNewFile, createNewFolder } = useEditorStore();
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);

  const handleCreateFile = () => {
    if (newItemName) {
      const extension = newItemName.includes('.') ? newItemName.split('.').pop() || 'txt' : 'txt';
      const language = extension === 'js' ? 'javascript' : 
                      extension === 'ts' ? 'typescript' :
                      extension === 'py' ? 'python' :
                      extension === 'html' ? 'html' :
                      extension === 'css' ? 'css' : 'plaintext';
      
      const fileName = newItemName.includes('.') ? newItemName : `${newItemName}${getFileExtension('')}`;
      createNewFile(fileName, language, selectedFolderId);
      setNewItemName('');
      setIsCreatingFile(false);
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleCreateFolder = () => {
    if (newItemName) {
      createNewFolder(newItemName);
      setNewItemName('');
      setIsCreatingFolder(false);
    }
  };

  const handleFolderClick = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFolderId(folderId);
    toggleFolder(folderId);
  };

  const handleNewFileClick = () => {
    setIsCreatingFile(true);
    setIsCreatingFolder(false);
    // If a folder is selected and expanded, the new file will be created inside it
  };

  return (
    <div className="h-full bg-[#252526] text-white overflow-y-auto border-r border-[#3c3c3c]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase">Explorer</h2>
          <div className="flex space-x-2">
            <button
              className="p-1 hover:bg-[#3c3c3c] rounded"
              title="New File"
              onClick={handleNewFileClick}
            >
              <FilePlus size={16} />
            </button>
            <button
              className="p-1 hover:bg-[#3c3c3c] rounded"
              title="New Folder"
              onClick={() => setIsCreatingFolder(true)}
            >
              <FolderPlus size={16} />
            </button>
          </div>
        </div>

        {(isCreatingFile || isCreatingFolder) && (
          <div className="mb-4">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={isCreatingFile ? "filename.ext" : "folder name"}
              className="w-full bg-[#3c3c3c] text-white px-2 py-1 rounded text-sm mb-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  isCreatingFile ? handleCreateFile() : handleCreateFolder();
                } else if (e.key === 'Escape') {
                  setIsCreatingFile(false);
                  setIsCreatingFolder(false);
                  setNewItemName('');
                }
              }}
            />
            <div className="flex space-x-2">
              <button
                className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                onClick={isCreatingFile ? handleCreateFile : handleCreateFolder}
              >
                Create
              </button>
              <button
                className="text-xs bg-[#3c3c3c] hover:bg-[#4c4c4c] px-2 py-1 rounded"
                onClick={() => {
                  setIsCreatingFile(false);
                  setIsCreatingFolder(false);
                  setNewItemName('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {folders.map((folder) => (
          <div key={folder.id} className="mb-2">
            <div 
              className={`flex items-center space-x-1 text-sm py-1 px-2 hover:bg-[#3c3c3c] cursor-pointer ${
                selectedFolderId === folder.id ? 'bg-[#37373d]' : ''
              }`}
              onClick={(e) => handleFolderClick(folder.id, e)}
            >
              {expandedFolders[folder.id] ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              <FolderIcon size={16} />
              <span>{folder.name}</span>
            </div>
            {expandedFolders[folder.id] && (
              <div className="ml-4">
                {files
                  .filter(file => file.folderId === folder.id)
                  .map(file => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between text-sm py-1 px-2 cursor-pointer group ${
                        currentFile?.id === file.id ? 'bg-[#37373d]' : 'hover:bg-[#3c3c3c]'
                      }`}
                      onClick={() => setCurrentFile(file)}
                    >
                      <div className="flex items-center space-x-2">
                        <FileIcon size={16} />
                        <span>{file.name}</span>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                        <button
                          className="p-1 hover:bg-[#3c3c3c] rounded text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}

        {files
          .filter(file => !file.folderId)
          .map((file) => (
            <div
              key={file.id}
              className={`flex items-center justify-between text-sm py-1 px-2 cursor-pointer group ${
                currentFile?.id === file.id ? 'bg-[#37373d]' : 'hover:bg-[#3c3c3c]'
              }`}
              onClick={() => setCurrentFile(file)}
            >
              <div className="flex items-center space-x-2">
                <FileIcon size={16} />
                <span>{file.name}</span>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                <button
                  className="p-1 hover:bg-[#3c3c3c] rounded text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};