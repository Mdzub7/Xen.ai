import React from 'react';
import { Moon, Sun, Monitor, Type, Palette } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="h-full bg-[#252526] text-white p-4">
      <h2 className="text-sm font-semibold uppercase mb-4">Settings</h2>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm text-gray-400">Appearance</h3>
          <div className="space-y-3 pl-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Palette size={16} />
                <span className="text-sm">Color Theme</span>
              </div>
              <select className="bg-[#3c3c3c] text-sm px-2 py-1 rounded">
                <option>Dark Modern</option>
                <option>Dark+</option>
                <option>Light+</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Type size={16} />
                <span className="text-sm">Font Size</span>
              </div>
              <input 
                type="number" 
                className="w-20 bg-[#3c3c3c] text-sm px-2 py-1 rounded"
                defaultValue={14}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm text-gray-400">Editor</h3>
          <div className="space-y-3 pl-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm">Word Wrap</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm">Auto Save</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};