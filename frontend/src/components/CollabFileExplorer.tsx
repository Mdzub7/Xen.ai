import React, { useEffect, useState, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import { FiFile, FiFolder, FiFolderPlus, FiFilePlus, FiUsers, FiTrash2, FiArrowDown, FiArrowRight } from 'react-icons/fi';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { v4 as uuidv4 } from 'uuid';

// Define types for file system
export type FileType = {
  id: string;
  name: string;
  content: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FolderType = {
  id: string;
  name: string;
  children: (FileType | FolderType)[];
  isExpanded: boolean;
};

export type FileSystemType = {
  folders: FolderType[];
  files: FileType[];
};

export const CollabFileExplorer: React.FC = () => {
  const { 
    currentFile, 
    setCurrentFile, 
    createNewFile, 
    createNewFolder, 
    deleteFile, 
    deleteFolder 
  } = useEditorStore();

  const [fileSystem, setFileSystem] = useState<FileSystemType>({
    folders: [
      {
        id: 'root',
        name: 'Project Root',
        children: [],
        isExpanded: true
      }
    ],
    files: [
      {
        id: 'welcome',
        name: 'welcome.js',
        content: '// Welcome to the collaborative editor!\n// Start typing to collaborate.',
        language: 'javascript',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  });
  
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ root: true });
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const newItemInputRef = useRef<HTMLInputElement>(null);

  // File selection handler - called when a file is clicked
  const handleFileSelect = (file: FileType) => {
    console.log(`Selected file: ${file.name}`);
    if (setCurrentFile) {
      setCurrentFile(file);
    }
  };

  // Folder toggle - expands/collapses folders
  const toggleFolder = (folderId: string) => {
    console.log(`Toggling folder: ${folderId}`);
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Handler for new file button click
  const handleNewFileClick = (folderId: string) => {
    console.log(`Creating new file in folder: ${folderId}`);
    setIsCreatingFile(true);
    setIsCreatingFolder(false);
    setNewItemName('');
    setCurrentFolderId(folderId);
    
    // Focus the input field when it's rendered
    setTimeout(() => {
      if (newItemInputRef.current) {
        newItemInputRef.current.focus();
      }
    }, 0);
  };

  // Handler for new folder button click
  const handleNewFolderClick = (folderId: string) => {
    console.log(`Creating new folder in folder: ${folderId}`);
    setIsCreatingFile(false);
    setIsCreatingFolder(true);
    setNewItemName('');
    setCurrentFolderId(folderId);
    
    // Focus the input field when it's rendered
    setTimeout(() => {
      if (newItemInputRef.current) {
        newItemInputRef.current.focus();
      }
    }, 0);
  };

  useEffect(() => {
    try {
      console.log("Initializing collaboration...");
      // Create YJS document
      ydocRef.current = new Y.Doc();
      
      // Room name for collaboration - use a fixed room name for all users
      const roomName = 'file-explorer-room';
      console.log(`Using room name: ${roomName}`);
      
      // Connect to local FastAPI signaling server
      const localSignalingServer = 'ws://localhost:8000/ws/';
      
      const connectToServer = async () => {
        try {
          console.log(`Connecting to signaling server: ${localSignalingServer}${roomName}`);
          providerRef.current = new WebrtcProvider(roomName, ydocRef.current, {
            signaling: [`${localSignalingServer}${roomName}`],
            maxConns: 20,
            filterBcConns: false,
            peerOpts: {
              config: {
                iceServers: [
                  { urls: 'stun:stun.l.google.com:19302' },
                  { urls: 'stun:global.stun.twilio.com:3478' }
                ]
              }
            }
          });
          
          console.log("Provider created, setting up event listeners");
          
          // Add event listener to check connection status
          providerRef.current.on('status', (event) => {
            console.log('Connection status changed:', event.status);
            if (event.status === 'connected') {
              console.log('Connected to signaling server');
              setIsConnected(true);
            } else {
              console.log('Connection status:', event.status);
            }
          });
          
          // Handle disconnect
          providerRef.current.on('disconnect', (event) => {
            console.log('Disconnected:', event);
            setIsConnected(false);
          });
          
          // Handle connection error
          providerRef.current.on('error', (error) => {
            console.error('Connection error:', error);
            setIsConnected(false);
          });
          
          // Track users through awareness
          providerRef.current.awareness.on('change', () => {
            const clientsMap = providerRef.current.awareness.getStates();
            const clients = Array.from(clientsMap.keys());
            console.log('Active clients:', clients);
            
            const userList = clients.map(clientId => {
              const state = clientsMap.get(clientId);
              return state?.user?.id || `user-${clientId}`;
            });
            
            setActiveUsers(userList);
          });
          
          // Make sure we're connected by manually setting up a user ID
          const userId = `user-${Math.floor(Math.random() * 1000)}`;
          console.log(`Setting local user ID: ${userId}`);
          providerRef.current.awareness.setLocalState({ 
            user: { id: userId, name: userId }
          });
          
          console.log("Initial setup complete, initializing file system");
          await initializeFileSystem();
          
          return true;
        } catch (err) {
          console.error(`Failed to connect to signaling server: ${err.message}`);
          return false;
        }
      };
      
      const initializeFileSystem = async () => {
        console.log("Setting up file system");
        try {
          const yFileSystem = ydocRef.current.getMap('fileSystem');
          
          // Set up observer for file system changes
          yFileSystem.observe(event => {
            console.log("File system changed:", event);
            try {
              // Get the updated structure
              const yStructure = yFileSystem.get('structure');
              if (yStructure) {
                // Convert Y.js structure to regular JS object
                const folders = [];
                const yFolders = yStructure.get('folders');
                
                if (yFolders && yFolders.length > 0) {
                  for (let i = 0; i < yFolders.length; i++) {
                    const yFolder = yFolders.get(i);
                    const folder = {
                      id: yFolder.get('id'),
                      name: yFolder.get('name'),
                      isExpanded: yFolder.get('isExpanded'),
                      children: []
                    };
                    
                    const yChildren = yFolder.get('children');
                    if (yChildren && yChildren.length > 0) {
                      for (let j = 0; j < yChildren.length; j++) {
                        const yChild = yChildren.get(j);
                        
                        // Determine if child is a file or folder
                        if (yChild.has('content')) {
                          // It's a file
                          folder.children.push({
                            id: yChild.get('id'),
                            name: yChild.get('name'),
                            content: yChild.get('content'),
                            language: yChild.get('language'),
                            createdAt: new Date(yChild.get('createdAt')),
                            updatedAt: new Date(yChild.get('updatedAt'))
                          });
                        } else if (yChild.has('children')) {
                          // It's a folder, recursive processing would happen here
                          const childFolder = {
                            id: yChild.get('id'),
                            name: yChild.get('name'),
                            isExpanded: yChild.get('isExpanded'),
                            children: [] // Simplified for this example
                          };
                          folder.children.push(childFolder);
                        }
                      }
                    }
                    
                    folders.push(folder);
                  }
                }
                
                const files = [];
                const yFiles = yStructure.get('files');
                
                if (yFiles && yFiles.length > 0) {
                  for (let i = 0; i < yFiles.length; i++) {
                    const yFile = yFiles.get(i);
                    files.push({
                      id: yFile.get('id'),
                      name: yFile.get('name'),
                      content: yFile.get('content'),
                      language: yFile.get('language'),
                      createdAt: new Date(yFile.get('createdAt')),
                      updatedAt: new Date(yFile.get('updatedAt'))
                    });
                  }
                }
                
                const newFileSystem = { folders, files };
                console.log("Updated file system from Y.js:", newFileSystem);
                setFileSystem(newFileSystem);
              }
            } catch (e) {
              console.error("Error observing file system changes:", e);
            }
          });
          
          // Initialize the file system if it doesn't exist
          if (!yFileSystem.has('structure')) {
            console.log("Creating new file system structure");
            const initialFileSystem = {
              folders: [
                {
                  id: 'root',
                  name: 'Project Root',
                  children: [],
                  isExpanded: true
                }
              ],
              files: [
                {
                  id: 'welcome',
                  name: 'welcome.js',
                  content: '// Welcome to the collaborative editor!\n// Start typing to collaborate.',
                  language: 'javascript',
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              ]
            };
            
            // Create Y.js structure
            const yStructure = new Y.Map();
            
            // Add folders as a Y.Array
            const yFolders = new Y.Array();
            initialFileSystem.folders.forEach(folder => {
              const yFolder = new Y.Map();
              yFolder.set('id', folder.id);
              yFolder.set('name', folder.name);
              yFolder.set('isExpanded', folder.isExpanded);
              
              // Create Y.Array for children
              const yChildren = new Y.Array();
              folder.children.forEach(child => {
                const yChild = new Y.Map();
                for (const [key, value] of Object.entries(child)) {
                  yChild.set(key, value);
                }
                yChildren.push([yChild]);
              });
              
              yFolder.set('children', yChildren);
              yFolders.push([yFolder]);
            });
            
            // Add files as a Y.Array
            const yFiles = new Y.Array();
            initialFileSystem.files.forEach(file => {
              const yFile = new Y.Map();
              for (const [key, value] of Object.entries(file)) {
                yFile.set(key, value);
              }
              yFiles.push([yFile]);
            });
            
            yStructure.set('folders', yFolders);
            yStructure.set('files', yFiles);
            
            yFileSystem.set('structure', yStructure);
            setFileSystem(initialFileSystem);
          } else {
            // Load existing structure
            console.log("Loading existing file system structure");
            try {
              const yStructure = yFileSystem.get('structure');
              
              // Extract folders
              const folders = [];
              const yFolders = yStructure.get('folders');
              if (yFolders && yFolders.length > 0) {
                for (let i = 0; i < yFolders.length; i++) {
                  const yFolder = yFolders.get(i);
                  const folder = {
                    id: yFolder.get('id'),
                    name: yFolder.get('name'),
                    isExpanded: yFolder.get('isExpanded'),
                    children: []
                  };
                  
                  const yChildren = yFolder.get('children');
                  if (yChildren && yChildren.length > 0) {
                    for (let j = 0; j < yChildren.length; j++) {
                      const yChild = yChildren.get(j);
                      
                      // Determine if child is a file or folder
                      if (yChild.has('content')) {
                        // It's a file
                        folder.children.push({
                          id: yChild.get('id'),
                          name: yChild.get('name'),
                          content: yChild.get('content'),
                          language: yChild.get('language'),
                          createdAt: new Date(yChild.get('createdAt')),
                          updatedAt: new Date(yChild.get('updatedAt'))
                        });
                      } else if (yChild.has('children')) {
                        // It's a folder
                        const childFolder = {
                          id: yChild.get('id'),
                          name: yChild.get('name'),
                          isExpanded: yChild.get('isExpanded'),
                          children: [] // Simplified for this example
                        };
                        folder.children.push(childFolder);
                      }
                    }
                  }
                  
                  folders.push(folder);
                }
              }
              
              // Extract files
              const files = [];
              const yFiles = yStructure.get('files');
              if (yFiles && yFiles.length > 0) {
                for (let i = 0; i < yFiles.length; i++) {
                  const yFile = yFiles.get(i);
                  files.push({
                    id: yFile.get('id'),
                    name: yFile.get('name'),
                    content: yFile.get('content'),
                    language: yFile.get('language'),
                    createdAt: new Date(yFile.get('createdAt')),
                    updatedAt: new Date(yFile.get('updatedAt'))
                  });
                }
              }
              
              const loadedFileSystem = { folders, files };
              console.log("Loaded file system:", loadedFileSystem);
              setFileSystem(loadedFileSystem);
            } catch (e) {
              console.error("Error parsing file system:", e);
            }
          }
        } catch (e) {
          console.error("Error in initializeFileSystem:", e);
        }
      };
      
      // Start the connection process
      const setupConnection = async () => {
        const connected = await connectToServer();
        
        if (!connected) {
          console.warn("Failed to establish connection, falling back to local mode");
          // Set up local-only mode
          await initializeFileSystem();
          // Set at least one active user in local mode
          const userId = `user-local-${Math.floor(Math.random() * 1000)}`;
          setActiveUsers([userId]);
        }
      };
      
      setupConnection();
      
      return () => {
        console.log("Cleaning up resources");
        if (providerRef.current) {
          providerRef.current.destroy();
        }
        if (ydocRef.current) {
          ydocRef.current.destroy();
        }
      };
    } catch (error) {
      console.error("Error in collaboration setup:", error);
      // Already have default state from useState
    }
  }, []);
  
  // Update the fileSystem state directly with proper error handling
  const updateFileSystem = (newFileSystem: FileSystemType) => {
    try {
      console.log("Updating file system:", newFileSystem);
      
      // First, update the local state to ensure UI updates
      setFileSystem(newFileSystem);
      
      // Then update Y.js shared state if available
      if (ydocRef.current) {
        const yFileSystem = ydocRef.current.getMap('fileSystem');
  
        // Get the Y.Map structure
        const yStructure = yFileSystem.get('structure') as Y.Map<any>;
        
        // Update folders array
        const yFolders = new Y.Array();
        newFileSystem.folders.forEach(folder => {
          const yFolder = new Y.Map();
          yFolder.set('id', folder.id);
          yFolder.set('name', folder.name);
          yFolder.set('isExpanded', folder.isExpanded);
          
          // Create Y.Array for children
          const yChildren = new Y.Array();
          folder.children.forEach(child => {
            const yChild = new Y.Map();
            for (const [key, value] of Object.entries(child)) {
              yChild.set(key, value);
            }
            yChildren.push([yChild]);
          });
          
          yFolder.set('children', yChildren);
          yFolders.push([yFolder]);
        });
        
        // Update files array
        const yFiles = new Y.Array();
        newFileSystem.files.forEach(file => {
          const yFile = new Y.Map();
          for (const [key, value] of Object.entries(file)) {
            yFile.set(key, value);
          }
          yFiles.push([yFile]);
        });
        
        // Create a new structure with the updated arrays
        const newYStructure = new Y.Map();
        newYStructure.set('folders', yFolders);
        newYStructure.set('files', yFiles);
        
        // Replace the old structure with the new one
        yFileSystem.set('structure', newYStructure);
        
        console.log("Successfully updated Y.js shared state");
      } else {
        console.warn("Y.js document not available, local state updated only");
      }
    } catch (error) {
      console.error("Error in updateFileSystem:", error);
      // As a last resort, just update the state directly
      setFileSystem(newFileSystem);
    }
  };

  // FIXED: Simplified and more robust handleCreateItem function
  const handleCreateItem = () => {
    if (!newItemName.trim()) {
      console.warn("Item name cannot be empty");
      return;
    }
    
    console.log(`Creating new ${isCreatingFile ? 'file' : 'folder'}: ${newItemName} in folder: ${currentFolderId || 'root'}`);
    
    try {
      // Create a deep copy of the file system
      const newFileSystem = JSON.parse(JSON.stringify(fileSystem));
      
      if (isCreatingFile) {
        // Determine file extension and language
        let extension = 'js'; // Default extension
        if (newItemName.includes('.')) {
          extension = newItemName.split('.').pop()?.toLowerCase() || 'js';
        } else {
          // If no extension provided, add .js by default
          setNewItemName(newItemName + '.js');
        }
        
        const language = extension === 'js' ? 'javascript' : 
                         extension === 'ts' || extension === 'tsx' ? 'typescript' :
                         extension === 'html' ? 'html' :
                         extension === 'css' ? 'css' : 'plaintext';
        
        const newFile: FileType = {
          id: uuidv4(),
          name: newItemName.includes('.') ? newItemName : `${newItemName}.js`,
          content: '',
          language,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log("New file object:", newFile);
        
        // Add to root if no folder is selected
        if (!currentFolderId) {
          newFileSystem.files.push(newFile);
          console.log("Added file to root");
        } else {
          // Function to find folder and add file
          const addFileToFolder = (folders: FolderType[]): boolean => {
            for (const folder of folders) {
              if (folder.id === currentFolderId) {
                folder.children.push(newFile);
                console.log(`Added file to folder: ${folder.name}`);
                return true;
              }
              
              // Check subfolders
              const subfolders = folder.children.filter(c => 'children' in c) as FolderType[];
              if (subfolders.length > 0) {
                const found = addFileToFolder(subfolders);
                if (found) return true;
              }
            }
            return false;
          };
          
          // Try to find folder and add file
          const found = addFileToFolder(newFileSystem.folders);
          
          // Fallback if folder not found
          if (!found) {
            console.warn(`Folder ${currentFolderId} not found, adding to root`);
            newFileSystem.files.push(newFile);
          }
        }
        
        // Call store method if available
        if (createNewFile) {
          try {
            createNewFile(newFile);
          } catch (e) {
            console.error("Error calling createNewFile from store:", e);
          }
        }
        
        // Automatically select the newly created file
        if (setCurrentFile) {
          try {
            setCurrentFile(newFile);
          } catch (e) {
            console.error("Error setting current file:", e);
          }
        }
      } else if (isCreatingFolder) {
        const newFolder: FolderType = {
          id: uuidv4(),
          name: newItemName,
          children: [],
          isExpanded: true // Automatically expand new folders
        };
        
        // Add to root if no folder is selected
        if (!currentFolderId) {
          newFileSystem.folders.push(newFolder);
          console.log("Added folder to root");
        } else {
          // Function to find folder and add subfolder
          const addFolderToFolder = (folders: FolderType[]): boolean => {
            for (const folder of folders) {
              if (folder.id === currentFolderId) {
                folder.children.push(newFolder);
                console.log(`Added subfolder to folder: ${folder.name}`);
                return true;
              }
              
              // Check subfolders
              const subfolders = folder.children.filter(c => 'children' in c) as FolderType[];
              if (subfolders.length > 0) {
                const found = addFolderToFolder(subfolders);
                if (found) return true;
              }
            }
            return false;
          };
          
          // Try to find folder and add subfolder
          const found = addFolderToFolder(newFileSystem.folders);
          
          // Fallback if folder not found
          if (!found) {
            console.warn(`Folder ${currentFolderId} not found, adding to root`);
            newFileSystem.folders.push(newFolder);
          }
        }
        
        // Make sure parent folder is expanded
        setExpandedFolders(prev => ({
          ...prev,
          [currentFolderId || 'root']: true,
          [newFolder.id]: true // Also expand the new folder
        }));
        
        // Call store method if available
        if (createNewFolder) {
          try {
            createNewFolder(newFolder);
          } catch (e) {
            console.error("Error calling createNewFolder from store:", e);
          }
        }
      }
      
      console.log("Updated file system:", newFileSystem);
      
      // Update the file system
      updateFileSystem(newFileSystem);
      
      // Reset state
      setIsCreatingFile(false);
      setIsCreatingFolder(false);
      setNewItemName('');
      setCurrentFolderId(null);
      
    } catch (error) {
      console.error("Error in handleCreateItem:", error);
      alert("Failed to create item. See console for details.");
    }
  };

  // Handle deleting a file with better error handling
  const handleDeleteFile = (fileId: string) => {
    try {
      console.log(`Deleting file: ${fileId}`);
      
      // Create a deep copy of the file system
      const newFileSystem = JSON.parse(JSON.stringify(fileSystem));
      
      // Keep track if we found the file
      let fileFound = false;
      
      // Remove from root files
      const filteredFiles = newFileSystem.files.filter(file => file.id !== fileId);
      if (filteredFiles.length !== newFileSystem.files.length) {
        fileFound = true;
      }
      newFileSystem.files = filteredFiles;
      
      // Remove from folder children
      const removeFromFolders = (folders: FolderType[]) => {
        for (const folder of folders) {
          const originalLength = folder.children.length;
          folder.children = folder.children.filter(child => {
            if ('content' in child && child.id === fileId) {
              fileFound = true;
              return false;
            }
            return true;
          });
          
          // If we found the file in this folder, log it
          if (folder.children.length !== originalLength) {
            console.log(`Removed file from folder: ${folder.name}`);
          }
          
          // Recursively search in subfolders
          const subfolders = folder.children.filter(c => 'children' in c) as FolderType[];
          removeFromFolders(subfolders);
        }
      };
      
      removeFromFolders(newFileSystem.folders);
      
      if (fileFound) {
        console.log("File successfully removed from file system");
        updateFileSystem(newFileSystem);
        
        // Also call store method if available
        if (deleteFile) {
          try {
            deleteFile(fileId);
          } catch (e) {
            console.error("Error calling deleteFile from store:", e);
          }
        }
      } else {
        console.warn(`File ${fileId} not found in file system`);
      }
    } catch (error) {
      console.error("Error in handleDeleteFile:", error);
    }
  };

  // Handle deleting a folder with better error handling
  const handleDeleteFolder = (folderId: string) => {
    try {
      console.log(`Deleting folder: ${folderId}`);
      
      // Don't delete the root folder
      if (folderId === 'root') {
        console.warn("Cannot delete the root folder");
        return;
      }
      
      // Create a deep copy of the file system
      const newFileSystem = JSON.parse(JSON.stringify(fileSystem));
      
      // Keep track if we found the folder
      let folderFound = false;
      
      // Remove from root folders
      const filteredFolders = newFileSystem.folders.filter(folder => folder.id !== folderId);
      if (filteredFolders.length !== newFileSystem.folders.length) {
        folderFound = true;
      }
      newFileSystem.folders = filteredFolders;
      
      // Remove from folder children
      const removeFromFolders = (folders: FolderType[]) => {
        for (const folder of folders) {
          const originalLength = folder.children.length;
          folder.children = folder.children.filter(child => {
            if ('children' in child && child.id === folderId) {
              folderFound = true;
              return false;
            }
            return true;
          });
          
          // If we found the folder in this folder, log it
          if (folder.children.length !== originalLength) {
            console.log(`Removed folder from folder: ${folder.name}`);
          }
          
          // Recursively search in subfolders
          const subfolders = folder.children.filter(c => 'children' in c) as FolderType[];
          removeFromFolders(subfolders);
        }
      };
      
      removeFromFolders(newFileSystem.folders);
      
      if (folderFound) {
        console.log("Folder successfully removed from file system");
        updateFileSystem(newFileSystem);
        
        // Also call store method if available
        if (deleteFolder) {
          try {
            deleteFolder(folderId);
          } catch (e) {
            console.error("Error calling deleteFolder from store:", e);
          }
        }
      } else {
        console.warn(`Folder ${folderId} not found in file system`);
      }
    } catch (error) {
      console.error("Error in handleDeleteFolder:", error);
    }
  };

  // Render file item component
  const FileItem = ({ file }: { file: FileType }) => (
    <div 
      className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-700 rounded ${
        currentFile?.id === file.id ? 'bg-gray-700' : ''
      }`}
      onClick={() => handleFileSelect(file)}
    >
      <FiFile className="mr-2 text-blue-400" />
      <span className="text-gray-200 flex-grow">{file.name}</span>
      <button 
        className="text-gray-400 hover:text-red-400 ml-2"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteFile(file.id);
        }}
      >
        <FiTrash2 size={14} />
      </button>
    </div>
  );

  // Recursively render folder item component
  const FolderItem = ({ folder, depth }: { folder: FolderType, depth: number }) => {
    const isExpanded = expandedFolders[folder.id] || false;
    
    return (
      <div className="mb-1">
        <div 
          className="flex items-center py-1 px-2 cursor-pointer hover:bg-gray-700 rounded"
          onClick={() => toggleFolder(folder.id)}
          style={{ paddingLeft: `${depth * 8 + 8}px` }}
        >
          {isExpanded ? 
            <FiArrowDown className="mr-2 text-yellow-400" /> : 
            <FiArrowRight className="mr-2 text-yellow-400" />
          }
          <FiFolder className="mr-2 text-yellow-400" />
          <span className="text-gray-200 flex-grow">{folder.name}</span>
          
          <div className="flex">
            <button 
              className="text-gray-400 hover:text-blue-400 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                handleNewFileClick(folder.id);
              }}
            >
              <FiFilePlus size={14} />
            </button>
            
            <button 
              className="text-gray-400 hover:text-yellow-400 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                handleNewFolderClick(folder.id);
              }}
            >
              <FiFolderPlus size={14} />
            </button>
            
            {folder.id !== 'root' && (
              <button 
                className="text-gray-400 hover:text-red-400 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.id);
                }}
              >
                <FiTrash2 size={14} />
              </button>
            )}
          </div>
        </div>
        
        {isExpanded && folder.children && (
          <div className="ml-4">
            {folder.children.map(child => {
              if ('children' in child) {
                return (
                  <FolderItem 
                    key={child.id} 
                    folder={child as FolderType} 
                    depth={depth + 1} 
                  />
                );
              } else {
                return <FileItem key={child.id} file={child as FileType} />;
              }
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 text-white p-2 border-r border-gray-700 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium">Project Explorer</h2>
        <div className="flex space-x-2">
          <button
            className="text-gray-300 hover:text-blue-400"
            onClick={() => handleNewFileClick('')}
            title="Create new file"
          >
            <FiFilePlus size={16} />
          </button>
          <button
            className="text-gray-300 hover:text-yellow-400"
            onClick={() => handleNewFolderClick('')}
            title="Create new folder"
          >
            <FiFolderPlus size={16} />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center mb-2 text-xs">
        <FiUsers className={`mr-1 ${isConnected ? 'text-green-400' : 'text-yellow-400'}`} />
        <span className="text-gray-300">
          {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} active
        </span>
        {!isConnected && (
          <span className="ml-1 text-yellow-400">(Offline Mode)</span>
        )}
      </div>

      {/* New Item Form */}
      {(isCreatingFile || isCreatingFolder) && (
        <div className="mb-2">
          <div className="flex items-center space-x-1">
            {isCreatingFile ? (
              <FiFile className="text-blue-400" />
            ) : (
              <FiFolder className="text-yellow-400" />
            )}
            <input
              ref={newItemInputRef}
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateItem();
                } else if (e.key === 'Escape') {
                  setIsCreatingFile(false);
                  setIsCreatingFolder(false);
                  setNewItemName('');
                }
              }}
              className="bg-gray-700 text-white px-2 py-1 text-sm rounded flex-grow"
              placeholder={isCreatingFile ? "filename.js" : "Folder Name"}
              autoFocus
            />
            <button
              className="bg-blue-500 text-white px-2 py-1 text-xs rounded"
              onClick={handleCreateItem}
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* File Tree */}
      <div className="flex-grow overflow-auto">
        {fileSystem.folders && fileSystem.folders.map(folder => (
          <FolderItem key={folder.id} folder={folder} depth={0} />
        ))}
        {fileSystem.files && fileSystem.files.map(file => (
          <FileItem key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
};

export default CollabFileExplorer;