import React from 'react';
import { User, Mail, Github, Globe, MapPin } from 'lucide-react';

export const ProfileView: React.FC = () => {
  return (
    <div className="h-full bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black text-white p-4">
      <h2 className="text-sm font-medium text-[#e6edf3] mb-4">Profile</h2>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center">
            <User size={40} className="text-[#7d8590]" />
          </div>
          <div>
            <h3 className="text-lg font-medium">John Doe</h3>
            <p className="text-sm text-[#7d8590]">Software Developer</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail size={16} className="text-[#7d8590]" />
            <span className="text-sm">john.doe@example.com</span>
          </div>
          <div className="flex items-center space-x-3">
            <Github size={16} className="text-[#7d8590]" />
            <span className="text-sm">github.com/johndoe</span>
          </div>
          <div className="flex items-center space-x-3">
            <Globe size={16} className="text-[#7d8590]" />
            <span className="text-sm">portfolio.dev</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin size={16} className="text-[#7d8590]" />
            <span className="text-sm">San Francisco, CA</span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#30363d]">
          <button 
            className="w-full bg-black/40 text-white font-medium p-3 rounded-lg hover:bg-black/60 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};