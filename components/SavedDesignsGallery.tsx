
import React from 'react';
import { Design } from '../App';

interface SavedDesignsGalleryProps {
  designs: Design[];
  onLoad: (design: Design) => void;
  onDelete: (id: number) => void;
  t: (key: string) => string;
}

export const SavedDesignsGallery: React.FC<SavedDesignsGalleryProps> = ({ designs, onLoad, onDelete, t }) => {
  if (designs.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mt-12">
      <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        {t('savedDesignsTitle')}
      </h2>
      <div className="space-y-4">
        {designs.map(design => (
          <div key={design.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between shadow-lg transition-transform hover:scale-[1.02] duration-300">
            <p className="text-gray-300 flex-1 mr-4 truncate" title={design.prompt}>{design.prompt}</p>
            <div className="flex-shrink-0 space-x-2">
              <button
                onClick={() => onLoad(design)}
                className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                {t('viewButton')}
              </button>
              <button
                onClick={() => onDelete(design.id)}
                className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
              >
                {t('deleteButton')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
