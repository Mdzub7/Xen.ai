import React from 'react';
import { CodeDiff } from '../utils/codeCompare';
import { X, Check } from 'lucide-react';

interface InlineCodeDiffViewerProps {
  diffs: CodeDiff[];
  onAccept: () => void;
  onReject: () => void;
}

const InlineCodeDiffViewer: React.FC<InlineCodeDiffViewerProps> = ({ diffs, onAccept, onReject }) => {
  return (
    <div className="absolute inset-0 bg-[#0A192F]/95 z-10 flex flex-col">
      <div className="flex justify-between items-center px-4 py-2 bg-[#1e1e1e] border-b border-[#3c3c3c]">
        <h3 className="text-white font-medium text-sm">Review the suggested changes</h3>
        <div className="flex space-x-2">
          <button 
            onClick={onReject}
            className="px-3 py-1 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded flex items-center space-x-1 text-xs"
          >
            <X size={14} />
            <span>Reject</span>
          </button>
          <button 
            onClick={onAccept}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center space-x-1 text-xs"
          >
            <Check size={14} />
            <span>Accept</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-auto p-2 flex-1">
        <pre className="font-mono text-sm leading-relaxed">
          {diffs.map((diff, index) => (
            <div 
              key={index} 
              className={`
                ${diff.added ? 'bg-green-900/30 border-l-4 border-green-500' : ''} 
                ${diff.removed ? 'bg-red-900/30 border-l-4 border-red-500' : ''}
                px-2 py-0.5
              `}
            >
              {diff.value.split('\n').map((line, lineIndex, array) => 
                lineIndex === array.length - 1 && line === '' ? null : (
                  <div key={lineIndex} className="whitespace-pre">
                    {diff.added && <span className="text-green-500 mr-2">+</span>}
                    {diff.removed && <span className="text-red-500 mr-2">-</span>}
                    {line}
                  </div>
                )
              )}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

export default InlineCodeDiffViewer;