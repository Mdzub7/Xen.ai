import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

export const Terminal: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentCommand, setCurrentCommand] = useState('');
  const { terminalHistory, addTerminalCommand } = useEditorStore();
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentCommand.trim()) {
      addTerminalCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  return isVisible ? (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-1 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center space-x-2">
          <TerminalIcon size={14} className="text-gray-400" />
          <span className="text-sm text-gray-300">Terminal</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white"
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-2 text-gray-300 font-mono text-sm"
      >
        {terminalHistory.map((entry, index) => (
          <div key={index} className="whitespace-pre-wrap">
            <div className="flex items-center">
              <span className="text-green-500">➜</span>
              <span className="text-blue-400 ml-2">~/project</span>
              <span className="ml-2">$</span>
              <span className="ml-2">{entry.command}</span>
            </div>
            <div className="text-gray-400 ml-6">{entry.output}</div>
          </div>
        ))}
        <div className="flex items-center mt-2">
          <span className="text-green-500">➜</span>
          <span className="text-blue-400 ml-2">~/project</span>
          <span className="ml-2">$</span>
          <input
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleCommand}
            className="flex-1 ml-2 bg-transparent border-none outline-none text-gray-300"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  ) : null;
};