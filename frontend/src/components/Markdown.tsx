import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardCopy, Check, Play } from 'lucide-react';
import rehypeRaw from 'rehype-raw';
import { useEditorStore } from '../store/editorStore';

interface MarkdownWithCodeButtonsProps {
  content: string;
}

const MarkdownWithCodeButtons: React.FC<MarkdownWithCodeButtonsProps> = ({ content }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { applyAICode } = useEditorStore();
  
  // Preprocess content to improve spacing and replace <br> tags with actual line breaks
  const processedContent = content
    // Replace <br> tags with newlines
    .replace(/<br>/g, '\n')
    // Add extra line break after headings
    .replace(/^(#{1,6}.*?)$/gm, '$1\n')
    // Add extra line break after paragraphs
    .replace(/^([^#\n`].+)$/gm, '$1\n')
    // Add extra line break after code blocks
    .replace(/```\w*\n[\s\S]*?```/g, match => `${match}\n`)
    // Add extra line break after lists
    .replace(/^(\s*[-*+]\s+.+)$/gm, '$1\n')
    // Add extra line break after numbered lists
    .replace(/^(\s*\d+\.\s+.+)$/gm, '$1\n')
    // Ensure proper spacing around section headers with emojis
    .replace(/(❌|✅|🔍|💡)(.+?)$/gm, '$1$2\n');
  
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };
  
  const handleApply = (code: string) => {
    // Call the applyAICode function from the store
    applyAICode(code);
  };

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const code = String(children).replace(/\n$/, '');
          
          if (!inline && match) {
            return (
              <div className="relative group mb-4">
                <div className="absolute right-2 top-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(code)}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                    title="Copy code"
                  >
                    {copiedCode === code ? <Check size={16} /> : <ClipboardCopy size={16} />}
                  </button>
                  <button
                    onClick={() => handleApply(code)}
                    className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white"
                    title="Apply code"
                  >
                    <Play size={16} />
                  </button>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus as any}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            );
          }
          
          return <code className={className} {...props}>{children}</code>;
        },
        // Add spacing to paragraphs
        p: ({ children }) => <p className="mb-4">{children}</p>,
        // Add spacing to headings
        h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>,
        // Add spacing to lists
        ul: ({ children }) => <ul className="mb-4 ml-6 list-disc">{children}</ul>,
        ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default MarkdownWithCodeButtons;