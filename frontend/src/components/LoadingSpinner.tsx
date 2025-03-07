import React from 'react';
import '../styles/loadingSpinner.css';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-black-300 rounded-lg p-6 max-w-[95%] shadow-md">
        <div className="flex items-center space-x-3">
          <div className="loader"></div>
          <span className="text-gray-400">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};
