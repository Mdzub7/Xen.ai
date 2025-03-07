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
  try {
    const parsedResponse = JSON.parse(response);
    
    if (parsedResponse.review) {
      let formattedReview = parsedResponse.review
        .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
        .replace(/^[\s\n]+|[\s\n]+$/g, '') // Trim start & end spaces
        .replace(/(❌|✅|🔍|💡) /g, '\n$1 ') // Ensure emojis appear on new lines
        .replace(/\n(Bad Code|Issues|Improvements|Recommended Fix):/g, '\n\n$1:') // Format section headers
        .replace(/```(\w+)/g, '\n```$1'); // Ensure code blocks start properly

      return formattedReview;
    } else {
      return "Invalid AI response format.";
    }
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return "Error processing AI response.";
  }
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
        // Look for a label before the code block (e.g., ❌ Bad Code)
        for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
          if (lines[j]?.includes('❌') || lines[j]?.includes('✅')) {
            codeLabel = lines[j].trim();
            break;
          }
        }

        // Push the current section if it has content
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
        // Close the code block and push it
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

  // Push any remaining content
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
