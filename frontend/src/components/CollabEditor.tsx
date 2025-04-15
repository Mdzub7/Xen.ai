import React, { useState, useEffect, useCallback, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import MonacoEditor from '@monaco-editor/react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditorStore } from '../store/editorStore';
import { defineMonacoThemes } from './MonacoThemes';
import '../styles/collabeditor.css'
// Define message types
interface WebSocketMessage {
  type: string;
  content?: string;
  userId?: string;
  username?: string; // Added username field
  version?: number;
  position?: number; // New field to store line number where user is typing
}

const CollabEditor: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { currentFile, updateFile, setCurrentFile } = useEditorStore();
  
  const [userId] = useState<string>(uuidv4()); // Stable userId for session
  const [username] = useState<string>(`User-${userId.substring(0, 4)}`); // Create a short username based on userId
  const socketUrl = roomId ? `ws://localhost:8000/ws/room/${roomId}/${userId}` : null;
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    shouldReconnect: () => true,
    onOpen: () => console.log('WebSocket connected'),
    onClose: () => console.log('WebSocket disconnected'),
    onError: (event) => console.error('WebSocket error:', event),
  });

  const editorRef = useRef<any>(null);
  const localChangeRef = useRef<boolean>(false);
  const versionRef = useRef<number>(0);

  // For managing typing users' positions
  const [typingUsers, setTypingUsers] = useState<{ userId: string; username: string; position: number; color: string }[]>([]);

  // User color map
  const userColorMap = useRef<Map<string, string>>(new Map());

  // Get a color for a user (ensuring consistency)
  const getUserColor = useCallback((userId: string) => {
    if (!userColorMap.current.has(userId)) {
      // Generate a color based on userId for consistency
      const colors = [
        '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', 
        '#118AB2', '#EF476F', '#FFC6FF', '#9D4EDD',
        '#00BBF9', '#F15BB5', '#00F5D4', '#3A86FF'
      ];
      const colorIndex = Math.abs(userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
      userColorMap.current.set(userId, colors[colorIndex]);
    }
    return userColorMap.current.get(userId);
  }, []);

  // Connection status display
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting...',
    [ReadyState.OPEN]: 'Connected',
    [ReadyState.CLOSING]: 'Closing...',
    [ReadyState.CLOSED]: 'Disconnected',
    [ReadyState.UNINSTANTIATED]: 'Not Connected',
  }[readyState] ?? 'Unknown';

  // Initialize room and file
  useEffect(() => {
    if (!roomId) {
      console.warn("No roomId found, navigating to home.");
      navigate('/');
      return;
    }

    if (!currentFile) {
      const defaultFile = {
        id: 'default-collab-file',
        name: 'collaboration.js',
        language: 'javascript',
        content: '// Start collaborating here!',
      };
      
      setCurrentFile(defaultFile);

      if (readyState === ReadyState.OPEN) {
        sendInitialContent(defaultFile.content);
      }
    } else if (readyState === ReadyState.OPEN) {
      sendInitialContent(currentFile.content);
    }
  }, [roomId, navigate, currentFile, setCurrentFile, readyState]);

  // Send initial content when connection is established
  const sendInitialContent = useCallback((content: string) => {
    if (readyState === ReadyState.OPEN) {
      sendMessage(JSON.stringify({
        type: 'text_update',
        content: content,
        userId: userId,
        username: username,
        version: ++versionRef.current
      }));
    }
  }, [sendMessage, userId, username, readyState]);

  // Handle content changes from the editor
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!value || localChangeRef.current) return;

    localChangeRef.current = true;
    
    setTimeout(() => {
      if (value && editorRef.current) {
        sendMessage(JSON.stringify({
          type: 'text_update',
          content: value,
          userId: userId,
          username: username,
          version: ++versionRef.current
        }));

        // Notify other users that this user is typing
        const position = editorRef.current.getPosition();
        sendMessage(JSON.stringify({
          type: 'user_typing',
          userId: userId,
          username: username,
          position: position.lineNumber
        }));
        
        if (currentFile) {
          updateFile({
            ...currentFile,
            content: value
          });
        }
      }

      localChangeRef.current = false;
    }, 300);
  }, [sendMessage, userId, username, currentFile, updateFile]);

  // Clear typing indicator after inactivity
  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      setTypingUsers(prev => prev.filter(user => user.userId !== userId));
    }, 2000);

    return () => clearTimeout(typingTimeout);
  }, [typingUsers, userId]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage?.data || localChangeRef.current) return;

    try {
      const messageData: WebSocketMessage = JSON.parse(lastMessage.data);

      if (messageData.type === 'text_update' && messageData.userId !== userId && messageData.content !== undefined) {
        if (editorRef.current) {
          const editor = editorRef.current;
          const model = editor.getModel();
          if (model) {
            const selections = editor.getSelections();
            const scrollTop = editor.getScrollTop();

            localChangeRef.current = true;

            model.pushEditOperations(selections, [{ range: model.getFullModelRange(), text: messageData.content }], () => selections);

            if (currentFile) {
              updateFile({
                ...currentFile,
                content: messageData.content
              });
            }

            editor.setScrollTop(scrollTop);
            setTimeout(() => {
              localChangeRef.current = false;
            }, 100);
          }
        }
      } else if (messageData.type === 'user_typing' && messageData.userId !== userId && messageData.position !== undefined) {
        const userColor = getUserColor(messageData.userId!);
        setTypingUsers(prev => [
          ...prev.filter(user => user.userId !== messageData.userId),
          { 
            userId: messageData.userId!, 
            username: messageData.username || `User-${messageData.userId!.substring(0, 4)}`, 
            position: messageData.position!, 
            color: userColor!
          }
        ]);
        
        // Auto-remove typing indicator after a timeout
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(user => user.userId !== messageData.userId));
        }, 3000);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }, [lastMessage, userId, currentFile, updateFile, getUserColor]);

  // Handle editor mounting
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] text-white flex flex-col relative">
      <div className="p-4 border-b border-[#333]">
        <h2 className="text-xl font-semibold mb-2">Collaborative Editor</h2>
        <p className="text-sm text-gray-400">
          Room ID: <span className="font-mono text-yellow-300">{roomId}</span> |
          Your ID: <span className="font-mono text-cyan-300">{username}</span> |
          Status: <span className={readyState === ReadyState.OPEN ? 'text-green-400' : 'text-red-400'}>{connectionStatus}</span>
        </p>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {currentFile && (
          <MonacoEditor
            height="100%"
            width="100%"
            theme="vs-dark"
            language={currentFile.language || 'javascript'}
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
        )}

        {/* Render typing markers with usernames */}
        {typingUsers.map((user) => (
          <div
            key={user.userId}
            className="typing-marker"
            style={{ 
              top: `${user.position * 20}px`, // Adjust top position based on line number
              right: '10px' // Position to the right side of the editor
            }}
          >
            <div 
              className="typing-indicator-container"
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(30, 30, 30, 0.8)',
                padding: '3px 8px',
                borderRadius: '12px',
                border: `2px solid ${user.color}`,
                marginBottom: '5px'
              }}
            >
              <div 
                className="typing-glyph" 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: user.color,
                  marginRight: '6px',
                  animation: 'pulse 1.5s infinite'
                }}
              />
              <span style={{ fontSize: '12px', color: user.color }}>
                {user.username} typing...
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add CSS for typing animation */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default CollabEditor;