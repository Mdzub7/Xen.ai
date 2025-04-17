// hooks/useFileExplorerSync.ts
import { useEffect, useState, useCallback } from 'react';

export interface File {
  id: string;
  name: string;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
}

export const useFileExplorerSync = (socket: WebSocket | null) => {
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'file_explorer_state') {
        setFiles(msg.files);
        setFolders(msg.folders);
      }

      if (msg.type === 'file_created') {
        setFiles(prev => [...prev, msg.file]);
      }

      if (msg.type === 'file_deleted') {
        setFiles(prev => prev.filter(f => f.id !== msg.fileId));
      }

      if (msg.type === 'folder_created') {
        setFolders(prev => [...prev, msg.folder]);
      }

      if (msg.type === 'folder_deleted') {
        setFolders(prev => prev.filter(f => f.id !== msg.folderId));
        setFiles(prev => prev.filter(f => f.folderId !== msg.folderId));
      }
    };
  }, [socket]);

  const createFile = useCallback((name: string, folderId?: string) => {
    socket?.send(JSON.stringify({ type: 'create_file', name, folderId }));
  }, [socket]);

  const createFolder = useCallback((name: string) => {
    socket?.send(JSON.stringify({ type: 'create_folder', name }));
  }, [socket]);

  const deleteFile = useCallback((id: string) => {
    socket?.send(JSON.stringify({ type: 'delete_file', fileId: id }));
  }, [socket]);

  const deleteFolder = useCallback((id: string) => {
    socket?.send(JSON.stringify({ type: 'delete_folder', folderId: id }));
  }, [socket]);

  return { files, folders, createFile, createFolder, deleteFile, deleteFolder };
};
