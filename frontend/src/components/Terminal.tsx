import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Play, Clock } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { runCode } from '../utils/runJudge0';
import ExecutionTimeWidget from "./ExecutionTimeWidget";

// Define terminal commands and their descriptions for help
const COMMANDS = {
  clear: "Clear the terminal screen",
  help: "Display available commands",
  run: "Execute the code in the current file",
  echo: "Display a message",
  date: "Display the current date and time",
  ls: "List files in the current directory",
  pwd: "Print working directory",
  whoami: "Display current user",
  version: "Display terminal version",
};

// Function to get current time as a string - moved outside component
function getTimeString() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export const executeCode = async () => {
  const currentFile = useEditorStore.getState().currentFile;
  const addTerminalCommand = useEditorStore.getState().addTerminalCommand;
  const setExecutionTime = useEditorStore.getState().setExecutionTime;

  if (!currentFile) return "Error: No file selected.";

  // Get language ID safely
  const languageId = useEditorStore.getState().getLanguageId?.(currentFile.language) || 71;
  const exactTime = getTimeString(); // Capture exact time
  
  try {
    // Send code execution request
    const response = await runCode(currentFile.content, languageId, "");
    
    if (response.success) {
      addTerminalCommand({ 
        command: `Output (${currentFile.language}):`, 
        output: response.output || "[No output]",
        timestamp: exactTime // Store exact execution time
      });
      const execTime=response.time ||"N/A";
      setExecutionTime(execTime);
    }
  } catch (error) {
    console.error("Execution error:", error);
    return "Error: Failed to Compile.";
  }
}

export const Terminal: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentCommand, setCurrentCommand] = useState("");
  const [currentTime, setCurrentTime] = useState(getTimeString());
  const { terminalHistory, addTerminalCommand, setTerminalHistory } = useEditorStore();
  const terminalRef = useRef<HTMLDivElement>(null);
  const currentFile = useEditorStore((state) => state.currentFile);
  const allFiles = useEditorStore((state) => state.files);

  // Update current time every second for input line only
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(getTimeString());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const clearTerminalHistory = () => {
    setTerminalHistory([]);
  };

  
  const processCommand = async (command: string) => {
    const args = command.split(" ");
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case "clear":
        clearTerminalHistory();
        return null; // No output needed

      case "help":
      case "--help":
        return Object.entries(COMMANDS)
          .map(([cmd, desc]) => `${cmd.padEnd(10)} - ${desc}`)
          .join("\n");

      case "run":
        if (!currentFile) {
          return "Error: No file is open to run.";
        }
        return await executeCode();

      case "echo":
        return args.slice(1).join(" ");

      case "date":
        return new Date().toString();

      case "ls":
        if (!allFiles?.length) {
          return "No files found.";
        }
        return allFiles.map(file => file.name).join("\n");

      case "pwd":
        return "/XenAi";

      case "whoami":
        return "Dummy User";

      case "version":
        return "Terminal v2.0.3";

      default:
        return `'${cmd}' is not recognized as a valid command.\nType 'help' to see available commands.`;
    }
  };

  const handleCommand = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentCommand.trim()) {
      const command = currentCommand.trim();
      setCurrentCommand("");
      
      // Capture the exact time as string when command is entered
      const exactTime = getTimeString();
      
      
      const output = await processCommand(command);

      // Use the same captured time for consistency
      addTerminalCommand({ 
        command, 
        output: output || "",
        timestamp: exactTime
      });
    }
  };

  const processedHistory = terminalHistory.map(entry => {
    const filePath = currentFile ? currentFile.name : "main";
    return {
      ...entry,
      fullPath: `${entry.timestamp} ~/${filePath}`
    };
  });

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black">
      {/* Execution Time Widget */}
      <ExecutionTimeWidget/>
      
      <div className="flex items-center justify-between px-4 py-1 bg-black/20 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <TerminalIcon size={14} className="text-[#7d8590]" />
          <span className="text-sm text-[#e6edf3]">Terminal</span>
        </div>
        <div className="flex items-center space-x-2"> 
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-[#21262d] rounded text-[#7d8590] hover:text-[#e6edf3]"
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-[#21262d] rounded text-[#7d8590] hover:text-[#e6edf3]"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-2 text-[#e6edf3] font-mono text-sm">
        {processedHistory.map((entry, index) => (
          <div key={index} className="whitespace-pre-wrap mb-1">
            <div className="flex items-center">
              <span className="text-[#7ee787]">➜</span>
              {/* Use the pre-computed path string */}
              <span className="text-[#58a6ff] ml-2">{entry.fullPath}</span>
              <span className="ml-2 text-[#7d8590]">$</span>
              <span className="ml-2">{entry.command}</span>
            </div>
            <div className="text-[#7d8590] ml-6">{entry.output}</div>
          </div>
        ))}
        <div className="flex items-center mt-2">
          <span className="text-[#7ee787]">➜</span>
          <span className="text-[#58a6ff] ml-2">
            {/* Use state variable for input line timestamp */}
            {currentTime} ~/
            {currentFile ? currentFile.name : "main"}
          </span>
          <span className="ml-2 text-[#7d8590]">$</span>
          <input
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleCommand}
            className="flex-1 ml-2 bg-transparent border-none outline-none text-[#e6edf3]"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
};