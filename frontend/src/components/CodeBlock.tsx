import React from 'react';
import { UnifiedCodeBlock } from './UnifiedCodeBlock';

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
  return (
    <UnifiedCodeBlock
      code={code}
      language={language}
      label={label}
      showApply={true}
      showDownload={true}
    />
  );
};
