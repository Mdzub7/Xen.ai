import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {Home} from './components/Home';
import {SignUp} from './components/auth/SignUp';
import {Login} from './components/auth/Login';
import ForgotPassword from './components/ForgotPassowrd';
import Layout from './components/Layout';
import {NotFoundPage} from './components/NotFoundPage';
import { ThemeProvider } from './components/ThemeProvider';
import { useEditorStore } from './store/editorStore'; 

const App: React.FC = () => {
  const { isAuthenticated, initializeDefaultFile } = useEditorStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      initializeDefaultFile();
    }
  }, [isAuthenticated]);

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Route for collaborative rooms */}
          <Route path="/v1/room/:roomId" element={<Layout />} />
          {/* Default editor for other /v1 routes */}
          <Route path="/v1/*" element={<Layout />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;