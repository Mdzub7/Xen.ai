import React from 'react';
import { Box, Download } from 'lucide-react';

export const ExtensionsView: React.FC = () => {
  const mockExtensions = [
    { id: 1, name: 'Python', publisher: 'Microsoft', description: 'Python language support' },
    { id: 2, name: 'JavaScript', publisher: 'Microsoft', description: 'JavaScript language support' },
    { id: 3, name: 'Git', publisher: 'Microsoft', description: 'Git integration' },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black text-white p-4">
      <h2 className="text-sm font-medium text-[#e6edf3] mb-4">Extensions</h2>
      <input
        type="text"
        placeholder="Search extensions..."
        className="w-full bg-[#161b22] text-[#e6edf3] px-3 py-1.5 rounded-md text-sm border border-[#30363d] focus:outline-none focus:border-[#58a6ff] mb-4"
      />
      <div className="space-y-4">
        {mockExtensions.map(ext => (
          <div key={ext.id} className="flex items-start space-x-3 p-2 hover:bg-[#161b22] rounded-md border border-[#30363d]">
            <Box size={16} className="mt-1 text-[#7d8590]" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{ext.name}</span>
                <button className="p-1.5 hover:bg-[#21262d] rounded-md text-[#7d8590] hover:text-[#e6edf3]">
                  <Download size={14} />
                </button>
              </div>
              <div className="text-xs text-[#7d8590]">{ext.publisher}</div>
              <div className="text-sm mt-1 text-[#e6edf3]">{ext.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};