import React from 'react';
import { Copy, Download, CheckSquare } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string; 
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'typescript', 
  label 
}) => {
  const { applyAICode } = useEditorStore();

  const handleCopy = () => navigator.clipboard.writeText(code);

  const handleApply = () => applyAICode(code);

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-snippet.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg overflow-hidden bg-[#1e1e1e] border border-[#3c3c3c]">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#252526]">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-400">{language}</span>
          {label && (
            <span className={`text-xs ${label.includes('❌') ? 'text-red-400' : 'text-green-400'}`}>
              {label}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            aria-label="Copy code"
            className="p-1 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white"
            title="Copy code"
          >
            <Copy size={14} />
          </button>

          <button
            onClick={handleApply}
            aria-label="Apply code"
            className="p-1 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white"
            title="Apply code"
          >
            <CheckSquare size={14} />  {/* Updated icon */}
          </button>

          <button
            onClick={handleDownload}
            aria-label="Download code"
            className="p-1 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white"
            title="Download code"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Code display */}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-300 whitespace-pre-wrap">{code}</code>
      </pre>
    </div>
  );
};
