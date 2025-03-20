import React from "react";
import { Clock } from "lucide-react";
import { useEditorStore } from "../../store/editorStore";

const ExecutionTimeWidget: React.FC = () => {
  const executionTime = useEditorStore((state) => state.executionTime);

  if (!executionTime) return null; // Hide if no execution time

  return (
    <div className="bg-[#0A192F] border border-white/10 px-4 py-2 rounded-lg shadow-md flex items-center">
      <Clock size={16} className="text-[#7ee787] mr-2" />
      <div className="flex flex-col">
        <span className="text-xs text-[#e6edf3]">Last Execution time:</span>
        <span className="text-sm font-mono text-[#58a6ff] font-bold">
          {executionTime} sec
        </span>
      </div>
    </div>
  );
};

export default ExecutionTimeWidget;
