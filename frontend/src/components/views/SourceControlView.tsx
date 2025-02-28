import React from 'react';
import { GitBranch, Plus, Check } from 'lucide-react';

export const SourceControlView: React.FC = () => {
  return (
    <div className="h-full bg-[#0d1117] text-[#e6edf3] p-4">
      <h2 className="text-sm font-medium text-[#e6edf3] mb-4">Source Control</h2>
      <div className="flex items-center space-x-2 mb-4">
        <GitBranch size={16} className="text-[#7d8590]" />
        <span className="text-sm">main</span>
      </div>
      <div className="space-y-2">
        <div className="text-sm text-[#7d8590]">Changes</div>
        <div className="pl-4 space-y-2">
          <div className="flex items-center space-x-2 text-sm hover:bg-[#161b22] p-2 rounded-md">
            <Plus size={14} className="text-[#7ee787]" />
            <span>New file</span>
          </div>
          <div className="flex items-center space-x-2 text-sm hover:bg-[#161b22] p-2 rounded-md">
            <Check size={14} className="text-[#58a6ff]" />
            <span>Modified file</span>
          </div>
        </div>
      </div>
    </div>
  );
};