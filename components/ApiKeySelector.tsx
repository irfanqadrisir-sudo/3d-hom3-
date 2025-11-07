
import React from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {

  const handleSelectKey = async () => {
    if (typeof window.aistudio === 'undefined') {
        console.warn('aistudio is not available. Simulating key selection.');
        onKeySelected();
        return;
    }
    await window.aistudio.openSelectKey();
    // Assume selection is successful and let the parent component handle the state change.
    onKeySelected();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          API Key Required for Video Generation
        </h2>
        <p className="text-gray-400 mb-6">
          To use the high-quality Veo model for video generation, you need to select a Google AI Studio API key. 
          This step is required to enable billing for your project.
        </p>
        <button
          onClick={handleSelectKey}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-transform transform hover:scale-105"
        >
          Select API Key
        </button>
        <p className="text-gray-500 mt-4 text-sm">
          For more information, please see the{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            billing documentation
          </a>.
        </p>
      </div>
    </div>
  );
};
