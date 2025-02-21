import React from 'react';
import { GitBranch, Plus, Check } from 'lucide-react';

export const SourceControlView: React.FC = () => {
  return (
    <div className="h-full bg-[#252526] text-white p-4">
      <h2 className="text-sm font-semibold uppercase mb-4">Source Control</h2>
      <div className="flex items-center space-x-2 mb-4">
        <GitBranch size={16} />
        <span className="text-sm">main</span>
      </div>
      <div className="space-y-2">
        <div className="text-sm text-gray-400">Changes</div>
        <div className="pl-4 space-y-2">
          {/* Placeholder for changes */}
          <div className="flex items-center space-x-2 text-sm">
            <Plus size={14} className="text-green-500" />
            <span>New file</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Check size={14} className="text-blue-500" />
            <span>Modified file</span>
          </div>
        </div>
      </div>
    </div>
  );
};