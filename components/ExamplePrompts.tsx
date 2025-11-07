
import React from 'react';

interface ExamplePromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  t: (key: string) => string;
}

export const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ prompts, onSelect, t }) => {
  return (
    <div className="my-4">
      <h4 className="text-sm font-medium text-gray-400 mb-2">{t('inspirationTitle')}</h4>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelect(prompt)}
            className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full hover:bg-purple-500 hover:text-white transition-colors duration-200"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
