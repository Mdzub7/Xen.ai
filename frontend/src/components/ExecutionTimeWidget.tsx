import React from "react";
import { Clock } from "lucide-react";
import { useEditorStore } from "../store/editorStore";

const ExecutionTimeWidget: React.FC = () => {
  const executionTime = useEditorStore((state) => state.executionTime);

  if (!executionTime) return null; // Hide if no execution time

  return (
    <div className="bg-[#1b2535] border border-white/10 px-4 py-2 rounded-lg shadow-md flex items-center">
      <Clock size={16} className="text-[#f97316] mr-2" />
      <div className="flex flex-col">
        <span className="text-xs text-[#7d8590]">Execution time:</span>
        <span className="text-sm font-mono text-[#f97316] font-bold">
          {executionTime} sec
        </span>
      </div>
    </div>
  );
};

export default ExecutionTimeWidget;
