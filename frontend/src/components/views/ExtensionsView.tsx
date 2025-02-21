import React from 'react';
import { Box, Download } from 'lucide-react';

export const ExtensionsView: React.FC = () => {
  const mockExtensions = [
    { id: 1, name: 'Python', publisher: 'Microsoft', description: 'Python language support' },
    { id: 2, name: 'JavaScript', publisher: 'Microsoft', description: 'JavaScript language support' },
    { id: 3, name: 'Git', publisher: 'Microsoft', description: 'Git integration' },
  ];

  return (
    <div className="h-full bg-[#252526] text-white p-4">
      <h2 className="text-sm font-semibold uppercase mb-4">Extensions</h2>
      <input
        type="text"
        placeholder="Search extensions..."
        className="w-full bg-[#3c3c3c] text-white px-3 py-1 rounded text-sm mb-4"
      />
      <div className="space-y-4">
        {mockExtensions.map(ext => (
          <div key={ext.id} className="flex items-start space-x-3 p-2 hover:bg-[#2a2a2a] rounded">
            <Box size={16} className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{ext.name}</span>
                <button className="p-1 hover:bg-[#3c3c3c] rounded">
                  <Download size={14} />
                </button>
              </div>
              <div className="text-xs text-gray-400">{ext.publisher}</div>
              <div className="text-sm mt-1">{ext.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};