import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import  {SignUp}  from './components/auth/SignUp';
import { useEditorStore } from './store/editorStore';
import  {Login}  from './components/auth/Login';
import  Home  from './components/Home';
import { NotFoundPage } from './components/NotFoundPage';
import ForgotPassword from './components/ForgotPassowrd';
import  Layout  from './components/Layout';
import { ThemeProvider } from './components/ThemeProvider';


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
          <Route path="/v1/*" element={<Layout />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;