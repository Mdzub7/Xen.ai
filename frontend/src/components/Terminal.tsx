import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Play } from "lucide-react";
import { useEditorStore } from "../store/editorStore";

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

export const Terminal: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentCommand, setCurrentCommand] = useState("");
  const { terminalHistory, addTerminalCommand, setTerminalHistory } = useEditorStore();
  const terminalRef = useRef<HTMLDivElement>(null);
  const currentFile = useEditorStore((state) => state.currentFile);
  const allFiles = useEditorStore((state) => state.files);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const clearTerminalHistory = () => {
    setTerminalHistory([]);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const executeCode = async (code: string) => {
    try {
      const response = await fetch("http://localhost:2358/submissions?base64_encoded=false", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language_id: 71, // Python 3 (Change based on selected language)
          stdin: "",
          expected_output: "",
          cpu_time_limit: 2,
          memory_limit: 51200
        }),
      });

      const { token } = await response.json();

      if (!token) {
        return "Error: No token received.";
      }

      // Poll for result
      let result = null;
      for (let i = 0; i < 10; i++) {
        await new Promise((res) => setTimeout(res, 1000)); // Wait 1 second

        const resultResponse = await fetch(`http://localhost:2358/submissions/${token}`);
        const resultData = await resultResponse.json();

        if (resultData.status && resultData.status.id >= 3) {
          result = resultData;
          break;
        }
      }

      // Get final output
      if (result) {
        return result.stdout || result.stderr || "No output.";
      } else {
        return "Error: Timeout or no response.";
      }
    } catch (error) {
      return "Error: Failed to communicate with Judge0.";
    }
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
        return await executeCode(currentFile.content);

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
        return "/workspace";

      case "whoami":
        return "user";

      case "version":
        return "Terminal v1.0.0";

      default:
        return `'${cmd}' is not recognized as a valid command.\nType 'help' to see available commands.`;
    }
  };

  const handleCommand = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentCommand.trim()) {
      const command = currentCommand.trim();
      setCurrentCommand("");

      // Add command to terminal history
      addTerminalCommand({ command, output: "Processing..." });

      // Process the command
      const output = await processCommand(command);
      
      // If output is null, it means we've cleared the terminal
      if (output !== null) {
        // Update the last command with the actual output
        const updatedHistory = [...terminalHistory];
        updatedHistory[updatedHistory.length - 1].output = output;
        setTerminalHistory(updatedHistory);
      }
    }
  };

  const handleRunButtonClick = async () => {
    if (!currentFile) return;
    
    const command = "run";
    addTerminalCommand({ command, output: "Running current file..." });
    
    const output = await executeCode(currentFile.content);
    
    const updatedHistory = [...terminalHistory];
    updatedHistory[updatedHistory.length - 1].output = output;
    setTerminalHistory(updatedHistory);
  };

  return isVisible ? (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black">
      <div className="flex items-center justify-between px-4 py-1 bg-black/20 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <TerminalIcon size={14} className="text-[#7d8590]" />
          <span className="text-sm text-[#e6edf3]">Terminal</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunButtonClick}
            className="p-1 hover:bg-[#21262d] rounded text-[#7ee787] hover:text-[#e6edf3]"
            title="Run current file"
          >
            <Play size={14} />
          </button>
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
        {terminalHistory.map((entry, index) => (
          <div key={index} className="whitespace-pre-wrap mb-1">
            <div className="flex items-center">
              <span className="text-[#7ee787]">➜</span>
              <span className="text-[#58a6ff] ml-2">
                {getCurrentDateTime()} ~/
                {currentFile ? currentFile.name : "main"}
              </span>
              <span className="ml-2 text-[#7d8590]">$</span>
              <span className="ml-2">{entry.command}</span>
            </div>
            <div className="text-[#7d8590] ml-6">{entry.output}</div>
          </div>
        ))}
        <div className="flex items-center mt-2">
          <span className="text-[#7ee787]">➜</span>
          <span className="text-[#58a6ff] ml-2">
            {getCurrentDateTime()} ~/
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
  ) : null;
};