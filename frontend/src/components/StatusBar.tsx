import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, BatteryCharging, Battery } from "lucide-react";
import type { File } from "../types"; // Import File type
import { useEditorStore } from "../store/editorStore";

// Props for receiving the active file
interface StatusBarProps {
  activeFile: File | null; // The currently opened file
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeFile }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);


  const currentFile = useEditorStore((state) => state.currentFile);

  
  useEffect(() => {
    console.log("Active File:", activeFile); // 🔹 Debugging Output
  }, [activeFile]);

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);

    // Network status listener
    const updateNetworkStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    // Fetch battery level if supported
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener("levelchange", () => setBatteryLevel(Math.round(battery.level * 100)));
      });
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
    };
  }, []);


  return (
    <div className="h-[22px] bg-[#0000] border-t border-[#2d2d2d] flex items-center px-2 text-xs text-gray-400">
      {/* Left Side: Network Status */}
      <div className="flex items-center space-x-2">
        {isOnline ? <Wifi size={12} className="text-green-400" /> : <WifiOff size={12} className="text-red-400" />}
        <span>{isOnline ? "Connected" : "Offline"}</span>
      </div>

      <div className="flex-1" /> {/* Spacer */}

      {/* Right Side: Time, Battery, and File Type */}
      <div className="flex items-center space-x-4">
        <span>{time}</span>
        <span>{currentFile ? currentFile.name : "No File Selected"}</span>
        <span>{currentFile?.language ? currentFile.language : "Language Not Detected!"}</span>
        <span>Spaces: 2</span>
        {batteryLevel !== null && (
          <div className="flex items-center space-x-1">
            {batteryLevel > 20 ? <Battery size={12} /> : <BatteryCharging size={12} className="text-green-400" />}
            <span>{batteryLevel}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
