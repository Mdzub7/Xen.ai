import React from 'react';
import { User, Mail, Github, Globe, MapPin } from 'lucide-react';

export const ProfileView: React.FC = () => {
  return (
    <div className="h-full bg-[#252526] text-white p-4">
      <h2 className="text-sm font-semibold uppercase mb-4">Profile</h2>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-[#3c3c3c] flex items-center justify-center">
            <User size={40} className="text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium">John Doe</h3>
            <p className="text-sm text-gray-400">Software Developer</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail size={16} className="text-gray-400" />
            <span className="text-sm">john.doe@example.com</span>
          </div>
          <div className="flex items-center space-x-3">
            <Github size={16} className="text-gray-400" />
            <span className="text-sm">github.com/johndoe</span>
          </div>
          <div className="flex items-center space-x-3">
            <Globe size={16} className="text-gray-400" />
            <span className="text-sm">portfolio.dev</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin size={16} className="text-gray-400" />
            <span className="text-sm">San Francisco, CA</span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#3c3c3c]">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-sm py-2 rounded">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};