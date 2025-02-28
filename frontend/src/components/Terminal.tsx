import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from "lucide-react";
import { useEditorStore } from "../store/editorStore";

export const Terminal: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentCommand, setCurrentCommand] = useState("");
  const { terminalHistory, addTerminalCommand } = useEditorStore();
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const handleCommand = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentCommand.trim()) {
      const command = currentCommand.trim();
      setCurrentCommand("");

      // Add command to terminal history
      addTerminalCommand({ command, output: "Processing..." });

      // Send request to Judge0 API
      try {
        const response = await fetch("http://localhost:2358/submissions?base64_encoded=false", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_code: command, // Treat command as code
            language_id: 71, // Python 3 (Change based on selected language)
            stdin: "",
            expected_output: "",
            cpu_time_limit: 2,
            memory_limit: 51200
          }),
        });

        const { token } = await response.json();

        if (!token) {
          addTerminalCommand({ command, output: "Error: No token received." });
          return;
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
          const output = result.stdout || result.stderr || "No output.";
          addTerminalCommand({ command, output });
        } else {
          addTerminalCommand({ command, output: "Error: Timeout or no response." });
        }
      } catch (error) {
        addTerminalCommand({ command, output: "Error: Failed to communicate with Judge0." });
      }
    }
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
          <div key={index} className="whitespace-pre-wrap">
            <div className="flex items-center">
              <span className="text-[#7ee787]">➜</span>
              <span className="text-[#58a6ff] ml-2">~/project</span>
              <span className="ml-2 text-[#7d8590]">$</span>
              <span className="ml-2">{entry.command}</span>
            </div>
            <div className="text-[#7d8590] ml-6">{entry.output}</div>
          </div>
        ))}
        <div className="flex items-center mt-2">
          <span className="text-[#7ee787]">➜</span>
          <span className="text-[#58a6ff] ml-2">~/project</span>
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
