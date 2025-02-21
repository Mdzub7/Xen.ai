import React from 'react';
import { GitBranch, Wifi } from 'lucide-react';

export const StatusBar: React.FC = () => {
  return (
    <div className="h-[22px] bg-[#1e1e1e] border-t border-[#2d2d2d] flex items-center px-2 text-xs text-gray-400">
      <div className="flex items-center space-x-2">
      <GitBranch size={12} />
      <span>main</span>
      <Wifi size={12} />
      <span>Connected</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center space-x-4">
        <span>UTF-8</span>
        <span>TypeScript</span>
        <span>Spaces: 2</span>
      </div>
    </div>
  );
};