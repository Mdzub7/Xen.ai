import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Play, FileText } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { runCode } from '../utils/runJudge0';
import ExecutionTimeWidget from "./widget/ExecutionTimeWidget";

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

// Function to get current time as a string
function getTimeString() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Create a global store for stdin
let globalStdin = "";
export const getStdin = () => globalStdin;
export const setGlobalStdin = (value: string) => {
  globalStdin = value;
};

// Modified to get input from global store
export const executeCode = async () => {
  const currentFile = useEditorStore.getState().currentFile;
  const addTerminalCommand = useEditorStore.getState().addTerminalCommand;
  const setExecutionTime = useEditorStore.getState().setExecutionTime;

  if (!currentFile) {
    addTerminalCommand({
      command: "run",
      output: "Error: No file selected.",
      timestamp: getTimeString()
    });
    return;
  }

  // Get language ID safely
  const languageId = useEditorStore.getState().getLanguageId?.(currentFile.language) || 71;
  const exactTime = getTimeString(); // Capture exact time
  
  // Use the global stdin
  const input = globalStdin;
  
  // Log the input to terminal for transparency
  // if (input) {
  //   addTerminalCommand({
  //     command: "stdin",
  //     output: input,
  //     timestamp: exactTime
  //   });
  // }
  
  try {
    // Pass the input to runCode for stdin
    const response = await runCode(currentFile.content, languageId, input);
    
    if (response.success) {
      addTerminalCommand({ 
        command: `Output (${currentFile.language}):`, 
        output: response.output || "[No output]",
        timestamp: exactTime
      });
      const execTime = response.time || "N/A";
      setExecutionTime(execTime);
    } else {
      // Handle error case
      addTerminalCommand({
        command: "Error",
        output: response.error || "Execution failed",
        timestamp: exactTime
      });
    }
  } catch (error) {
    console.error("Execution error:", error);
    addTerminalCommand({
      command: "Error",
      output: "Failed to compile or execute code.",
      timestamp: exactTime
    });
  }
}

export const Terminal = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentCommand, setCurrentCommand] = useState("");
  const [currentTime, setCurrentTime] = useState(getTimeString());
  const [activeTab, setActiveTab] = useState("terminal");
  const [stdinValue, setStdinValue] = useState("");
  
  const { terminalHistory, addTerminalCommand, setTerminalHistory } = useEditorStore();
  const terminalRef = useRef<HTMLDivElement>(null);
  const currentFile = useEditorStore((state) => state.currentFile);
  const allFiles = useEditorStore((state) => state.files);

  // Update global stdin when local stdin changes
  useEffect(() => {
    setGlobalStdin(stdinValue);
  }, [stdinValue]);

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
        return Object.entries(COMMANDS)
          .map(([cmd, desc]) => `${cmd.padEnd(10)} - ${desc}`)
          .join("\n");

      case "run":
        if (!currentFile) {
          return "Error: No file is open to run.";
        }
        // Execute with current stdin value
        await executeCode();
        return null;

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
        return "Terminal v2.5.3";

      default:
        return `'${cmd}' is not recognized as a valid command.\nType 'help' to see available commands.`;
    }
  };

  const handleCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentCommand.trim()) {
      const command = currentCommand.trim();
      setCurrentCommand("");
      
      // Capture the exact time as string when command is entered
      const exactTime = getTimeString();
      
      addTerminalCommand({ 
        command, 
        output: "",
        timestamp: exactTime
      });
      
      const output = await processCommand(command);

      if (output !== null) {
        // Update the last command with the output
        const updatedHistory = [...terminalHistory];
        if (updatedHistory.length > 0) {
          updatedHistory[updatedHistory.length - 1].output = output || "";
          setTerminalHistory(updatedHistory);
        }
      }
    }
  };

  const processedHistory = terminalHistory.map(entry => {
    const filePath = currentFile ? currentFile.name : "main";
    return {
      ...entry,
      fullPath: `${entry.timestamp} ~/${filePath}`
    };
  });

  if (!isVisible) return null;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black relative">
      {/* Execution Time Widget */}
      <ExecutionTimeWidget/>
      
      <div className={`flex flex-col ${isExpanded ? 'flex-grow' : 'h-48'}`}>
        {/* Tab Headers */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("terminal")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "terminal"
                ? "bg-[#0d1117] text-[#e6edf3] border-t-2 border-l border-r border-t-[#58a6ff] border-l-white/10 border-r-white/10"
                : "text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#21262d]/30"
            }`}
          >
            <div className="flex items-center space-x-2">
              <TerminalIcon size={14} />
              <span>Terminal</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("input")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "input"
                ? "bg-[#0d1117] text-[#e6edf3] border-t-2 border-l border-r border-t-[#58a6ff] border-l-white/10 border-r-white/10"
                : "text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#21262d]/30"
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText size={14} />
              <span>Input</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "terminal" && (
            <div ref={terminalRef} className="h-full overflow-y-auto p-2 text-[#e6edf3] font-mono text-sm">
              {processedHistory.map((entry, index) => (
                <div key={index} className="whitespace-pre-wrap mb-1">
                  <div className="flex items-center">
                    <span className="text-[#7ee787]">➜</span>
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
          )}

          {activeTab === "input" && (
            <div className="h-full flex flex-col p-3">
              <div className="mb-2 flex items-center text-[#e6edf3] text-sm">
                <span>Custom Input</span>
                <span className="text-[#7d8590] text-xs ml-2">
                  (Will be used as stdin for any run command)
                </span>
              </div>
              <textarea
                value={stdinValue}
                onChange={(e) => setStdinValue(e.target.value)}
                placeholder="Enter your test input here..."
                className="flex-1 p-3 rounded bg-[#0d1117] text-[#e6edf3] border border-[#30363d] font-mono text-sm resize-none focus:outline-none focus:border-[#58a6ff]"
                spellCheck={false}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => setStdinValue("")}
                  className="px-3 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-sm mr-2"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terminal;