import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Download, CheckSquare, Check } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

interface UnifiedCodeBlockProps {
  code: string;
  language?: string;
  label?: string;
  showApply?: boolean;
  showDownload?: boolean;
}

export const UnifiedCodeBlock: React.FC<UnifiedCodeBlockProps> = ({
  code,
  language = 'typescript',
  label,
  showApply = true,
  showDownload = true,
}) => {
  const [copied, setCopied] = useState(false);
  const { applyAICode } = useEditorStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    <div className="rounded-lg overflow-hidden bg-[#1e1e1e] border border-[#3c3c3c] mb-4">
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
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>

          {showApply && (
            <button
              onClick={handleApply}
              aria-label="Apply code"
              className="p-1 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white"
              title="Apply code"
            >
              <CheckSquare size={14} />
            </button>
          )}

          {showDownload && (
            <button
              onClick={handleDownload}
              aria-label="Download code"
              className="p-1 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white"
              title="Download code"
            >
              <Download size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Code display */}
      <div className="relative overflow-hidden">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus as any}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            width: '100%',
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word'
          }}
          wrapLongLines={true}
          showLineNumbers={true}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: '#6B7280',
            textAlign: 'right',
            userSelect: 'none'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};