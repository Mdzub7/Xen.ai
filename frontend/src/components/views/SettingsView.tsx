import React, { useEffect } from 'react';
import { Moon, Sun, Monitor, Type, Palette } from 'lucide-react';
import { useSettingsStore, ThemeType } from '../../store/settingsStore';

export const SettingsView: React.FC = () => {
  // Get settings and methods from the store
  const { 
    theme, 
    fontSize, 
    wordWrap, 
    autoSave, 
    setTheme, 
    setFontSize, 
    toggleWordWrap, 
    toggleAutoSave 
  } = useSettingsStore();

  // Log theme changes for debugging
  useEffect(() => {
    console.log('Theme changed in SettingsView:', theme);
  }, [theme]);

  // Handle theme change
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as ThemeType);
  };

  // Handle font size change
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value);
    if (!isNaN(size) && size > 8 && size < 32) {
      setFontSize(size);
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black text-white p-4">
      <h2 className="text-sm font-medium text-[#e6edf3] mb-4">Settings</h2>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm text-[#7d8590]">Appearance</h3>
          <div className="space-y-3 pl-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Palette size={16} className="text-[#7d8590]" />
                <span className="text-sm">Color Theme</span>
              </div>
              <select 
                className="bg-[#161b22] text-sm px-2 py-1.5 rounded-md border border-[#30363d] focus:outline-none focus:border-[#58a6ff]"
                value={theme}
                onChange={handleThemeChange}
              >
                <option value="github-dark">GitHub Dark</option>
                <option value="github-light">GitHub Light</option>
                <option value="vs-dark">VS Dark</option>
                <option value="vs-light">VS Light</option>
                <option value="monokai">Monokai</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Type size={16} className="text-[#7d8590]" />
                <span className="text-sm">Font Size</span>
              </div>
              <input 
                type="number" 
                className="w-20 bg-[#161b22] text-sm px-2 py-1.5 rounded-md border border-[#30363d] focus:outline-none focus:border-[#58a6ff]"
                value={fontSize}
                onChange={handleFontSizeChange}
                min="8"
                max="32"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm text-[#7d8590]">Editor</h3>
          <div className="space-y-3 pl-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                className="rounded border-[#30363d]" 
                checked={wordWrap}
                onChange={toggleWordWrap}
              />
              <span className="text-sm">Word Wrap</span>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                className="rounded border-[#30363d]" 
                checked={autoSave}
                onChange={toggleAutoSave}
              />
              <span className="text-sm">Auto Save</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};