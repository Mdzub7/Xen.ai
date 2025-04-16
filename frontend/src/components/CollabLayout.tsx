import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useEditorStore } from '../store/editorStore';
import { ActivityBar } from './ActivityBar';
import CollabEditor from './CollabEditor';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';
import { CollaborativeSidePanel } from './CollaborativeSidePanel';
import { Terminal } from './Terminal';
import { AIPanel } from './AIPanel';
import { v4 as uuidv4 } from 'uuid';
import useWebSocket from 'react-use-websocket'; // Assuming you use this here

const CollabLayout: React.FC = () => {
    const { isAIPanelOpen, toggleAIPanel, currentView } = useEditorStore();
    const { roomId } = useParams<{ roomId: string }>();
    const [isHost] = useState<boolean>(!!roomId);
    const [userId] = useState<string>(() => uuidv4()); // Generate userId here
    const baseWsUrl = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:8000';
    const socketUrl = roomId ? `${baseWsUrl}/ws/collab/${roomId}/${userId}` : null;
    const { sendMessage } = useWebSocket(socketUrl, {}); // Get sendMessage here

    console.log('Layout Room ID:', roomId);

    useEffect(() => {
        if (!isAIPanelOpen) {
            const timer = setTimeout(() => {
                toggleAIPanel();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isAIPanelOpen, toggleAIPanel]);

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black">
            <Toolbar />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Activity Bar */}
                <div className="w-12 flex-shrink-0 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black border-r border-white/10 z-10">
                    <ActivityBar />
                </div>

                {/* Collaborative Side Panel */}
                {currentView !== 'none' && (
                    <div className="hidden md:block w-60 flex-shrink-0 bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black border-r border-white/10 z-10">
                        <CollaborativeSidePanel
                            isHost={isHost}
                            sendMessage={sendMessage}
                            userId={userId}
                        />
                    </div>
                )}

                {/* Main Content Area */}
                <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${isAIPanelOpen ? 'mr-[30vw]' : ''}`}>
                    <div className="flex-grow overflow-hidden">
                        <CollabEditor /> {/* CollabEditor might need userId as well if it doesn't create its own */}
                    </div>
                    <div className="h-[30vh] border-t border-white/10 overflow-hidden">
                        <Terminal />
                    </div>
                    <StatusBar />
                </div>

                {/* AI Panel */}
                {isAIPanelOpen && (
                    <div className="hidden lg:block absolute top-0 right-0 h-[70vh] w-[30vw] bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black border-l border-white/10 z-20">
                        <AIPanel />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollabLayout;