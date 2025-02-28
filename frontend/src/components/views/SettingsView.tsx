import React from 'react';
import { Moon, Sun, Monitor, Type, Palette } from 'lucide-react';

export const SettingsView: React.FC = () => {
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
              <select className="bg-[#161b22] text-sm px-2 py-1.5 rounded-md border border-[#30363d] focus:outline-none focus:border-[#58a6ff]">
                <option>GitHub Dark</option>
                <option>GitHub Light</option>
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
                defaultValue={14}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm text-[#7d8590]">Editor</h3>
          <div className="space-y-3 pl-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-[#30363d]" defaultChecked />
              <span className="text-sm">Word Wrap</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-[#30363d]" defaultChecked />
              <span className="text-sm">Auto Save</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};