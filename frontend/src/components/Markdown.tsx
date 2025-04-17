import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { UnifiedCodeBlock } from './UnifiedCodeBlock';
import rehypeRaw from 'rehype-raw';
import { useEditorStore } from '../store/editorStore';

interface MarkdownWithCodeButtonsProps {
  content: string;
}

const MarkdownWithCodeButtons: React.FC<MarkdownWithCodeButtonsProps> = ({ content }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { applyAICode } = useEditorStore();
  
  // Modify the content preprocessing to avoid extra line breaks
  const processedContent = content
    // Replace <br> tags with newlines
    .replace(/<br>/g, '\n')
    // Add extra line break after headings (but not double)
    .replace(/^(#{1,6}.*?)$/gm, '$1\n')
    // Don't add extra line breaks after paragraphs
    // .replace(/^([^#\n`].+)$/gm, '$1\n')
    // Don't add extra line breaks after code blocks
    // .replace(/```\w*\n[\s\S]*?```/g, match => `${match}\n`)
    // Don't add extra line breaks after lists
    // .replace(/^(\s*[-*+]\s+.+)$/gm, '$1\n')
    // Don't add extra line breaks after numbered lists
    // .replace(/^(\s*\d+\.\s+.+)$/gm, '$1\n')
    // Ensure proper spacing around section headers with emojis (but not double)
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
              <UnifiedCodeBlock
                code={code}
                language={match[1]}
                showApply={true}
                showDownload={false}
              />
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