
import React from 'react';

interface VideoDisplayProps {
  videoUrl: string;
}

export const VideoDisplay: React.FC<VideoDisplayProps> = ({ videoUrl }) => {
  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-2xl p-4 flex flex-col items-center">
      <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Your 3D Home Tour</h3>
      <video
        src={videoUrl}
        controls
        autoPlay
        loop
        className="w-full h-auto rounded-md border-2 border-gray-700"
      >
        Your browser does not support the video tag.
      </video>
      <a
        href={videoUrl}
        download="3d_home_tour.mp4"
        className="mt-6 bg-green-500 text-white font-bold py-3 px-6 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-all duration-300 inline-flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Download Video
      </a>
    </div>
  );
};
