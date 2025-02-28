import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

export const SearchView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { files } = useEditorStore();
  const [searchResults, setSearchResults] = useState<Array<{ file: string, line: number, content: string }>>([]);

  const handleSearch = () => {
    const results = files.flatMap(file => {
      const lines = file.content.split('\n');
      return lines
        .map((line, index) => {
          if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
            return {
              file: file.name,
              line: index + 1,
              content: line
            };
          }
          return null;
        })
        .filter((result): result is { file: string; line: number; content: string } => result !== null);
    });
    setSearchResults(results);
  };

  return (
    <div className="h-full bg-[#0d1117] text-[#e6edf3] p-4 overflow-y-auto">
      <h2 className="text-sm font-medium text-[#e6edf3] mb-4">Search</h2>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search in files..."
          className="flex-1 bg-[#161b22] text-[#e6edf3] px-3 py-1.5 rounded-md text-sm border border-[#30363d] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
        />
        <button
          onClick={handleSearch}
          className="p-1.5 hover:bg-[#21262d] rounded-md text-[#7d8590] hover:text-[#e6edf3] transition-colors border border-[#30363d]"
        >
          <Search size={16} />
        </button>
      </div>
      <div className="space-y-2 overflow-y-auto">
        {searchResults.map((result, index) => (
          <div key={index} className="text-sm hover:bg-[#161b22] p-2 rounded-md cursor-pointer border border-[#30363d]">
            <div className="text-[#7d8590] flex items-center space-x-2">
              <span>{result.file}</span>
              <span className="text-xs">:{result.line}</span>
            </div>
            <div className="pl-4 border-l border-[#30363d] mt-1 text-[#e6edf3]">
              {result.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};