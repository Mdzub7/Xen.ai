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
    <div className="h-full w-64 min-w-64 bg-[#252526] text-white p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold uppercase mb-4">Search</h2>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search in files..."
          className="flex-1 bg-[#3c3c3c] text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white transition-colors"
        >
          <Search size={16} />
        </button>
      </div>
      <div className="space-y-2 overflow-y-auto">
        {searchResults.map((result, index) => (
          <div key={index} className="text-sm hover:bg-[#2a2a2a] p-1 rounded cursor-pointer">
            <div className="text-gray-400 flex items-center space-x-2">
              <span>{result.file}</span>
              <span className="text-xs">:{result.line}</span>
            </div>
            <div className="pl-4 border-l border-[#3c3c3c] mt-1 text-gray-300">
              {result.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};