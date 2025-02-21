interface Section {
  type: 'code' | 'text';
  content: string[];
  language?: string;
  label?: string;
}

interface FormattedSection {
  type: 'code' | 'text';
  content: string;
  language?: string;
  label?: string;
}

export const formatAIResponse = (response: string): string => {
  // Clean up the response
  let formattedResponse = response
    .replace(/\n{3,}/g, '\n\n') // Remove extra newlines
    .replace(/^[\s\n]+|[\s\n]+$/g, ''); // Trim start and end

  // Format section headers and emojis
  formattedResponse = formattedResponse
    .replace(/(❌|✅|🔍|💡) /g, '\n$1 ') // Add newline before emojis
    .replace(/\n(Bad Code|Issues|Improvements|Recommended Fix):/g, '\n\n$1:') // Format headers
    .replace(/```(\w+)/g, '\n```$1'); // Add newline before code blocks

  return formattedResponse;
};

export const parseResponse = (content: string): FormattedSection[] => {
  const sections: FormattedSection[] = [];
  const lines = content.split('\n');
  let currentSection: Section = { type: 'text', content: [] };
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeLabel = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const codeBlockStart = line.match(/^```(\w+)?/);
    
    if (codeBlockStart) {
      if (!inCodeBlock) {
        // Look for label in previous lines
        for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
          if (lines[j]?.includes('❌') || lines[j]?.includes('✅')) {
            codeLabel = lines[j].trim();
            break;
          }
        }
        
        if (currentSection.content.length > 0) {
          sections.push({
            type: currentSection.type,
            content: currentSection.content.join('\n').trim(),
            ...(currentSection.type === 'code' && {
              language: currentSection.language,
              label: currentSection.label
            })
          });
        }
        
        inCodeBlock = true;
        codeLanguage = codeBlockStart[1] || 'plaintext';
        currentSection = { 
          type: 'code', 
          content: [], 
          language: codeLanguage, 
          label: codeLabel 
        } as Section;
      } else {
        inCodeBlock = false;
        sections.push({
          type: 'code',
          content: currentSection.content.join('\n').trim(),
          language: currentSection.language,
          label: currentSection.label
        });
        currentSection = { type: 'text', content: [] };
        codeLabel = '';
      }
      continue;
    }

    currentSection.content.push(line);
  }

  if (currentSection.content.length > 0) {
    sections.push({
      type: currentSection.type,
      content: currentSection.content.join('\n').trim(),
      ...(currentSection.type === 'code' && {
        language: currentSection.language,
        label: currentSection.label
      })
    });
  }

  return sections;
};