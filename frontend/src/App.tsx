import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ActivityBar } from './components/ActivityBar';
import { Editor } from './components/Editor';
import { Toolbar } from './components/Toolbar';
import { AIPanel } from './components/AIPanel';
import { Terminal } from './components/Terminal';
import { StatusBar } from './components/StatusBar';
import { SearchView } from './components/views/SearchView';
import { SourceControlView } from './components/views/SourceControlView';
import { ExtensionsView } from './components/views/ExtensionsView';
import { SettingsView } from './components/views/SettingsView';
import { ProfileView } from './components/views/ProfileView';
import { FileExplorer } from './components/FileExplorer';
import { SignUp } from './components/auth/SignUp';
import { useEditorStore } from './store/editorStore';
import { Login } from './components/auth/Login';
import { Home } from './components/Home';

const Layout = () => {
  const { isAIPanelOpen, currentView } = useEditorStore();

  const renderSidePanel = () => {
    switch (currentView) {
      case 'explorer':
        return <FileExplorer />;
      case 'search':
        return <SearchView />;
      case 'sourceControl':
        return <SourceControlView />;
      case 'extensions':
        return <ExtensionsView />;
      case 'settings':
        return <SettingsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toolbar />
      <div className="flex-1 flex min-h-0">
        <ActivityBar />
        {currentView !== 'none' && currentView !== 'ai' && (
          <div className="w-64 min-w-64 border-r border-[#3c3c3c]">
            {renderSidePanel()}
          </div>
        )}
        <div className={`flex-1 flex flex-col ${isAIPanelOpen ? 'w-[70%]' : ''}`}>
          <div className="flex-1">
            <Editor />
          </div>
          <div className="h-[28vh] min-h-[28vh] border-t border-[#3c3c3c]">
            <Terminal />
          </div>
        </div>
        {isAIPanelOpen && (
          <div className="w-[30%] min-w-[30%] border-l border-[#3c3c3c]">
            <AIPanel />
          </div>
        )}
      </div>
      <StatusBar />
    </div>
  );
};

function App() {
  const { isAuthenticated, initializeDefaultFile } = useEditorStore();
  
  React.useEffect(() => {
    if (isAuthenticated) {
      initializeDefaultFile();
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/v1/*" element={<Layout />} />
      </Routes>
    </Router>
  );
}

export default App;