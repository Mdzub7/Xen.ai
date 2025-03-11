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
  };

  const handleNewFolderClick = () => {
    setIsCreatingFolder(true);
    setIsCreatingFile(false);
  };

  return (
    <div className="h-full bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black text-white overflow-y-auto">
      <div className="p-2 border-b border-white/10 bg-gradient-to-r from-from-[#0A192F] via-[#0F1A2B] to-black/40">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-medium">Explorer</h2>
          <div className="flex space-x-1">
            <button
              className="p-1 hover:bg-black/30 rounded text-white/70 hover:text-white"
              title="New File"
              onClick={handleNewFileClick}
            >
              <FilePlus size={14} className="text-white" />
            </button>
            <button
              className="p-1 hover:bg-black/30 rounded text-white/70 hover:text-white"
              title="New Folder"
              onClick={handleNewFolderClick}
            >
              <FolderPlus size={14} className="text-white" />
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
              className="w-full bg-black/30 text-white px-2 py-1 rounded text-sm mb-2 border border-white/10"
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
                className="text-xs bg-black/30 hover:bg-black/50 px-2 py-1 rounded border border-white/10"
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
              className={`flex items-center space-x-1 text-sm py-1 px-2 hover:bg-black/30 cursor-pointer ${
                selectedFolderId === folder.id ? 'bg-black/40 border-l-2 border-l-blue-500' : ''
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
                        currentFile?.id === file.id ? 'bg-black/40 border-l-2 border-l-blue-500' : 'hover:bg-black/30'
                      }`}
                      onClick={() => setCurrentFile(file)}
                    >
                      <div className="flex items-center space-x-2">
                        <FileIcon size={16} />
                        <span>{file.name}</span>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                        <button
                          className="p-1 hover:bg-black/40 rounded text-red-400"
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
                currentFile?.id === file.id ? 'bg-black/40 border-l-2 border-l-blue-500' : 'hover:bg-black/30'
              }`}
              onClick={() => setCurrentFile(file)}
            >
              <div className="flex items-center space-x-2">
                <FileIcon size={16} />
                <span>{file.name}</span>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                <button
                  className="p-1 hover:bg-black/40 rounded text-red-400"
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