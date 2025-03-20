import React, { useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import '../styles/themes.css';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme } = useSettingsStore();

  // Apply theme class to body element whenever theme changes
  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove('github-dark', 'github-light', 'vs-dark', 'vs-light', 'monokai');
    
    // Add the current theme class
    document.body.classList.add(theme);
    
    // Log the current theme for debugging
    console.log('Current theme applied:', theme);
  }, [theme]);

  return <>{children}</>;
};