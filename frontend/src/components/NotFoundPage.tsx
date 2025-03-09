import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black text-white p-4">
      <div className="flex flex-col items-center max-w-lg text-center">
        {/* Logo with animation */}
        <img
          src="/logo.png"
          alt="Xen AI"
          className="w-32 h-32 object-contain mb-8 hover:scale-105 transition-transform duration-300 animate-pulse"
        />
        
        {/* Error text with shadow effect */}
        <h1 className="text-7xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg">
          404
        </h1>
        
        <h2 className="text-3xl font-semibold mb-6 text-white/90">
          Page Not Found
        </h2>
        
        <p className="text-lg mb-10 text-white/70">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Button with enhanced styling */}
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg 
                   hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-1 
                   transition-all duration-300 shadow-lg font-medium"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};