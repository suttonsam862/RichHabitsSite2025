import React, { useState, useEffect } from 'react';
import { ImageWithErrorHandling } from '../MediaErrorHandlers';
import { parseImageError, logMediaError } from '../../utils/mediaErrorUtils';

interface EventImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  fallbackSrc?: string;
  onError?: (error: any) => void;
  lazyLoad?: boolean;
}

/**
 * Enhanced event image component with robust error handling
 */
const EventImage: React.FC<EventImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  fallbackSrc,
  onError,
  lazyLoad = true
}) => {
  const [hasError, setHasError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  // Reset error state when source changes
  useEffect(() => {
    setHasError(false);
    setLoadAttempts(0);
  }, [src]);
  
  // Handle image load errors
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const errorData = parseImageError(event);
    
    // Log detailed error information
    logMediaError(errorData);
    
    // Set error state
    setHasError(true);
    
    // Call custom error handler if provided
    if (onError) {
      onError(errorData);
    }
  };
  
  // Retry loading when clicking the retry button
  const handleRetry = () => {
    if (loadAttempts < 3) {
      setHasError(false);
      setLoadAttempts(prev => prev + 1);
    }
  };

  // Create a custom fallback UI for image errors
  const fallbackUI = (
    <div 
      className={`image-error-container bg-gray-100 rounded flex flex-col items-center justify-center p-4 ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '200px',
        minHeight: '100px'
      }}
    >
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-600 mb-3">{alt || 'Image not available'}</p>
        
        {loadAttempts < 3 ? (
          <button 
            onClick={handleRetry}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again {loadAttempts > 0 ? `(${loadAttempts}/3)` : ''}
          </button>
        ) : (
          <p className="text-xs text-gray-500">
            Could not load image
          </p>
        )}
      </div>
    </div>
  );

  // If we have a fallback source and there's an error, try the fallback
  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;

  return (
    <ImageWithErrorHandling
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={handleImageError}
      loading={lazyLoad ? 'lazy' : undefined}
      fallback={hasError && !fallbackSrc ? fallbackUI : undefined}
    />
  );
};

export default EventImage;