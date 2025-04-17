import React, { useState, useEffect, useCallback, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import MonacoEditor from '@monaco-editor/react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditorStore } from '../store/editorStore';
import { defineMonacoThemes } from './MonacoThemes';
import CollabFileExplorer from './CollabFileExplorer';
import '../styles/collabeditor.css';

interface WebSocketMessage {
    type: string;
    content?: string;
    userId?: string;
    username?: string;
    version?: number;
    position?: { lineNumber: number; column: number } | null;
    role?: 'host' | 'guest';
    message?: string; // For error messages
    roomId?: string; // For room_joined confirmations
    fileId?: string; // For file operations
    language?: string;
}

function inferLanguageFromName(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':   return 'javascript';
      case 'jsx':  return 'javascript';
      case 'ts':   return 'typescript';
      case 'tsx':  return 'typescript';
      case 'py':   return 'python';
      case 'java': return 'java';
      case 'cpp':  return 'cpp';
      case 'c':    return 'c';
      case 'cs':   return 'csharp';
      case 'html': return 'html';
      case 'css':  return 'css';
      case 'json': return 'json';
      default:     return 'plaintext';
    }
  }
  

const CollabEditor: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { currentFile, updateFile, setCurrentFile } = useEditorStore();

    // Generate a unique userId for each session
    const [userId] = useState<string>(() => uuidv4());
    const [username] = useState<string>(() => `User-${userId.substring(0, 4)}`);

    // Get stored password if available
    const [password] = useState<string>(localStorage.getItem('roomPassword') || '');

    // Form WebSocket URL from environment or default
    const baseWsUrl = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:8000';
    const socketUrl = roomId ? `${baseWsUrl}/ws/collab/${roomId}/${userId}` : null;

    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
        reconnectAttempts: 10,
        reconnectInterval: 3000,
        shouldReconnect: () => true,
        onOpen: () => {
            console.log('WebSocket connected');
            // If we have a password, send it after connection
            if (password) {
                sendMessage(JSON.stringify({
                    type: 'join',
                    password: password
                }));
            }
        },
        onClose: () => console.log('WebSocket disconnected'),
        onError: (event) => console.error('WebSocket error:', event),
    });

    const editorRef = useRef<any>(null);
    const localChangeRef = useRef<boolean>(false);
    const versionRef = useRef<number>(0);
    const [isHost, setIsHost] = useState<boolean>(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const [typingUsers, setTypingUsers] = useState<{
        userId: string;
        username: string;
        position: { lineNumber: number; column: number };
        color: string
    }[]>([]);

    const userColorMap = useRef<Map<string, string>>(new Map());

    const getUserColor = useCallback((userId: string) => {
        if (!userColorMap.current.has(userId)) {
            const colors = [
                '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2',
                '#EF476F', '#FFC6FF', '#9D4EDD', '#00BBF9', '#F15BB5',
                '#00F5D4', '#3A86FF'
            ];
            const colorIndex = Math.abs(
                userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
            ) % colors.length;
            userColorMap.current.set(userId, colors[colorIndex]);
        }
        return userColorMap.current.get(userId);
    }, []);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting...',
        [ReadyState.OPEN]: 'Connected',
        [ReadyState.CLOSING]: 'Closing...',
        [ReadyState.CLOSED]: 'Disconnected',
        [ReadyState.UNINSTANTIATED]: 'Not Connected',
    }[readyState] ?? 'Unknown';

    useEffect(() => {
        if (!roomId) {
            console.warn("No roomId found, navigating to home.");
            navigate('/');
            return;
        }
    }, [roomId, navigate]);
    useEffect(() => {
        if (lastMessage?.data) {
            try {
                const messageData: WebSocketMessage = JSON.parse(lastMessage.data);
                console.log('Received WebSocket message:', messageData); // Debug log
    
                // Handle error messages
                if (messageData.type === 'error') {
                    setConnectionError(messageData.message || 'Unknown error');
                    console.error('WebSocket error message:', messageData.message);
                    return;
                }
    
                if (messageData.type === 'room_joined' && messageData.role) {
                    console.log('Room joined as:', messageData.role); // Debug log
                    setIsHost(messageData.role === 'host');
                    setConnectionError(null);
                } else if (messageData.type === 'initial_content' && messageData.content !== undefined) {
                    console.log('Received initial content:', messageData.content);
                    // Ensure we set the correct language received from the host
                    const language = messageData.language || 'plaintext';  // Default to 'plaintext' if not specified
                    if (currentFile) {
                        updateFile({ ...currentFile, content: messageData.content, language });
                    } else {
                        setCurrentFile({
                            id: uuidv4(),
                            name: 'initial_file',
                            language: language,
                            content: messageData.content,
                        });
                    }
                } else if (messageData.type === 'text_update' && messageData.userId !== userId && messageData.content !== undefined) {
                    console.log('Processing text update from user:', messageData.userId); // Debug log
                    if (editorRef.current) {
                        const editor = editorRef.current;
                        const model = editor.getModel();
                        if (model) {
                            const selections = editor.getSelections();
                            const scrollTop = editor.getScrollTop();
    
                            localChangeRef.current = true;
    
                            model.pushEditOperations(
                                selections,
                                [{ range: model.getFullModelRange(), text: messageData.content }],
                                () => selections
                            );
    
                            if (currentFile) {
                                updateFile({ ...currentFile, content: messageData.content });
                            }
    
                            editor.setScrollTop(scrollTop);
                            setTimeout(() => {
                                localChangeRef.current = false;
                            }, 100);
                        }
                    }
                } else if (messageData.type === 'host_selects_file' && messageData.userId !== userId &&
                    messageData.content !== undefined && messageData.fileId) {
                    console.log('Host selected a file:', messageData.fileId); // Debug log
                    // Ensure the file's language is set correctly
                    const language = messageData.language || 'plaintext';  // Default to 'plaintext' if not specified
                    setCurrentFile({
                        id: messageData.fileId,
                        name: 'remote_file',
                        language: language,
                        content: messageData.content
                    });
                } else if (messageData.type === 'file_created' || messageData.type === 'file_deleted') {
                    console.log('File system event:', messageData.type, messageData); // Debug log
                } else if (messageData.type === 'notification') {
                    console.log('Notification received:', messageData.content); // Debug log
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        }
    }, [lastMessage, userId, currentFile, updateFile, getUserColor, setCurrentFile, sendMessage]);
    
    const handleEditorChange = useCallback((value: string | undefined) => {
        if (!value || localChangeRef.current || !editorRef.current) return;

        localChangeRef.current = true;

        setTimeout(() => {
            if (value) {
                sendMessage(JSON.stringify({
                    type: 'text_update',
                    content: value,
                    userId: userId,
                    username: username,
                    version: ++versionRef.current
                }));

                // Notify other users about typing position
                const position = editorRef.current.getPosition();
                sendMessage(JSON.stringify({
                    type: 'user_typing',
                    userId: userId,
                    username: username,
                    position: position
                }));

                if (currentFile) {
                    updateFile({ ...currentFile, content: value });
                }
            }
            localChangeRef.current = false;
        }, 300);
    }, [sendMessage, userId, username, currentFile, updateFile]);

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
        editor.focus();
    };

    const getLineHeight = useCallback(() => {
        return editorRef.current ? editorRef.current._configuration.lineHeight : 20;
    }, []);

    const getPositionTop = useCallback((position: { lineNumber: number; column: number }) => {
        if (editorRef.current) {
            return editorRef.current.getTopForLineNumber(position.lineNumber);
        }
        return position.lineNumber * getLineHeight();
    }, [getLineHeight]);

    return (
        <div className="h-full w-full bg-[#1e1e1e] text-white flex flex-col relative">
            <div className="p-4 border-b border-[#333]">
                <h2 className="text-xl font-semibold mb-2">Collaborative Editor</h2>
                <p className="text-sm text-gray-400">
                    Room ID: <span className="font-mono text-yellow-300">{roomId}</span> |
                    Your ID: <span className="font-mono text-cyan-300">{username}</span>
                    {isHost && <span className="ml-2 text-green-400">(Host)</span>}
                    {!isHost && <span className="ml-2 text-yellow-400">(Guest)</span>} |
                    Status: <span className={readyState === ReadyState.OPEN ? 'text-green-400' : 'text-red-400'}>
                        {connectionStatus}
                    </span>
                </p>

                {connectionError && (
                    <div className="mt-2 p-2 bg-red-800 text-white rounded">
                        Error: {connectionError}
                    </div>
                )}
            </div>

            <div className="flex flex-row flex-1">

                <div className="relative flex-1 overflow-hidden">
                    {currentFile ? (
                        <MonacoEditor
                            height="100%"
                            width="100%"
                            theme="vs-dark"
                            language={currentFile.language}
                            value={currentFile.content}
                            onChange={handleEditorChange}
                            onMount={handleEditorDidMount}
                            options={{
                                selectOnLineNumbers: true,
                                automaticLayout: true,
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: 'Consolas, monospace',
                                wordWrap: 'on',
                                lineNumbers: 'on',
                                glyphMargin: false,
                                folding: true,
                                lineDecorationsWidth: 0,
                                scrollBeyondLastLine: false,
                                renderLineHighlight: 'line',
                                cursorBlinking: 'smooth',
                            }}
                            beforeMount={(monaco) => defineMonacoThemes(monaco)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center p-8">
                                <p className="text-gray-400 mb-4">
                                    {connectionStatus === 'Connected'
                                        ? 'Waiting for file content...'
                                        : 'Connecting to room...'}
                                </p>
                                {isHost && (
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                        onClick={() => {
                                            // Create a default file if you're the host
                                            const defaultFile = {
                                                id: uuidv4(),
                                                name: 'main.js',
                                                language: 'test',
                                                content: '// Start coding here\n\nconsole.log("Hello, collaborative world!");\n'
                                            };
                                            setCurrentFile(defaultFile);

                                            // Broadcast the file creation to all users
                                            sendMessage(JSON.stringify({
                                                type: 'host_selects_file',
                                                userId: userId,
                                                fileId: defaultFile.id,
                                                content: defaultFile.content,
                                                language: defaultFile.language
                                            }));
                                        }}
                                    >
                                        Create Default File
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {typingUsers.map((user) => {
                        const lineHeight = getLineHeight();
                        const markerTop = getPositionTop(user.position);

                        return (
                            <div
                                key={user.userId}
                                className="typing-marker"
                                style={{
                                    top: `${markerTop}px`,
                                    left: 'auto',
                                    right: '5px',
                                    zIndex: 100,
                                    pointerEvents: 'none',
                                }}
                            >
                                <div
                                    className="typing-cursor"
                                    style={{
                                        width: '2px',
                                        height: `${lineHeight}px`,
                                        backgroundColor: user.color,
                                        animation: 'blink 1s infinite step-end',
                                    }}
                                />
                                <span
                                    className="typing-username-label"
                                    style={{
                                        position: 'absolute',
                                        top: `-${lineHeight}px`,
                                        right: '5px',
                                        fontSize: '10px',
                                        color: user.color,
                                        backgroundColor: 'rgba(30, 30, 30, 0.7)',
                                        padding: '2px 4px',
                                        borderRadius: '3px',
                                    }}
                                >
                                    {user.username}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                @keyframes blink {
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default CollabEditor;