import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-[#323130] rounded-lg p-6 max-w-[95%] shadow-md">
        <div className="flex items-center space-x-3">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
          </div>
          <span className="text-gray-400">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};