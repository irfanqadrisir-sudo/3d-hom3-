
import React, { useEffect, useRef } from 'react';

// TypeScript declaration for the Photo Sphere Viewer library attached to the window object.
declare const PhotoSphereViewer: any;

interface PhotoSphereViewerProps {
  imageUrl: string;
  title: string;
  caption: string;
}

export const PhotoSphereViewerComponent: React.FC<PhotoSphereViewerProps> = ({ imageUrl, title, caption }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const psViewerRef = useRef<any>(null);

  useEffect(() => {
    if (viewerRef.current && imageUrl) {
      // Ensure PhotoSphereViewer is available
      if (typeof PhotoSphereViewer !== 'undefined') {
        // Destroy any existing instance before creating a new one
        if (psViewerRef.current) {
          psViewerRef.current.destroy();
        }
        
        psViewerRef.current = new PhotoSphereViewer({
          container: viewerRef.current,
          panorama: imageUrl,
          caption: caption,
          loadingImg: 'https://cdn.jsdelivr.net/npm/photo-sphere-viewer@4/dist/loading.gif',
          navbar: [
            'zoom',
            'move',
            'caption',
            'fullscreen',
          ],
        });
      } else {
        console.error("Photo Sphere Viewer library not loaded.");
      }
    }

    // Cleanup function to destroy the viewer when the component unmounts or imageUrl changes
    return () => {
      if (psViewerRef.current) {
        psViewerRef.current.destroy();
        psViewerRef.current = null;
      }
    };
  }, [imageUrl, caption]); // Rerun effect if imageUrl or caption changes

  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-2xl p-4 flex flex-col items-center">
      <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{title}</h3>
      <div ref={viewerRef} className="w-full h-[60vh] rounded-md border-2 border-gray-700"></div>
    </div>
  );
};
