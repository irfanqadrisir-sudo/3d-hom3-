import React from 'react';

interface LoadingIndicatorProps {
  message: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-lg">
      <div className="w-12 h-12 border-4 border-t-purple-500 border-r-purple-500 border-b-purple-500 border-l-gray-700 rounded-full animate-spin mb-4"></div>
      <p className="text-lg text-gray-300 font-medium">{message}</p>
    </div>
  );
};