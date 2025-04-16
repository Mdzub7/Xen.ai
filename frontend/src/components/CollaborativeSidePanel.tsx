import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { SearchView } from './views/SearchView';
import { SettingsView } from './views/SettingsView';
import { ProfileView } from './views/ProfileView';
import { CollabFileExplorer } from './CollabFileExplorer';

interface CollaborativeSidePanelProps {
    isHost: boolean;
    sendMessage: (message: string) => void;
    userId: string;
}

export const CollaborativeSidePanel: React.FC<CollaborativeSidePanelProps> = ({ isHost, sendMessage, userId }) => {
    const { currentView, currentFile } = useEditorStore();

    const renderView = () => {
        switch (currentView) {
            case 'explorer':
                return (
                    <div className="w-full h-full"> {/* Ensure it takes full height */}
                        <CollabFileExplorer
                            isHost={isHost}
                            sendMessage={sendMessage}
                            userId={userId}
                        />
                    </div>
                );
            case 'search':
                return <SearchView />;
            case 'settings':
                return <SettingsView />;
            case 'profile':
                return <ProfileView />;
            case 'logout':
                return null;
            case 'none':
                return null;
            default:
                return null; // Add a default case to handle unexpected views
        }
    };

    return currentView !== 'none' ? (
        <div className={`w-64 h-full bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black border-r border-white/10 ${!currentFile ? 'hidden md:block' : ''}`}>
            {renderView()}
        </div>
    ) : null;
};