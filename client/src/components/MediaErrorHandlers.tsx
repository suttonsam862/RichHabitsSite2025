import React, { useEffect, useState, useRef, ComponentProps } from 'react';
import MediaErrorBoundary from './MediaErrorBoundary';

// Types for the components
type VideoWithErrorHandlingProps = ComponentProps<'video'> & {
  fallback?: React.ReactNode;
  onError?: React.ReactEventHandler<HTMLVideoElement> | ((error: Error, info: React.ErrorInfo) => void);
  errorMessage?: string;
  className?: string;
};

type ImageWithErrorHandlingProps = ComponentProps<'img'> & {
  fallback?: React.ReactNode;
  onError?: React.ReactEventHandler<HTMLImageElement> | ((error: Error, info: React.ErrorInfo) => void);
  errorMessage?: string;
  placeholderSrc?: string;
  className?: string;
};

type AudioWithErrorHandlingProps = ComponentProps<'audio'> & {
  fallback?: React.ReactNode;
  onError?: React.ReactEventHandler<HTMLAudioElement> | ((error: Error, info: React.ErrorInfo) => void);
  errorMessage?: string;
  className?: string;
};

/**
 * Custom hook to handle media errors and logging
 */
export const useMediaErrorHandler = (mediaType: 'video' | 'image' | 'audio', src: string) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const loadStartTime = useRef<number | null>(null);
  const loadEndTime = useRef<number | null>(null);
  
  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    setErrorDetails(null);
    loadStartTime.current = Date.now();
    loadEndTime.current = null;
  }, [src]);
  
  const handleLoad = () => {
    loadEndTime.current = Date.now();
    setIsLoading(false);
    
    // Log successful load with timing information
    if (process.env.NODE_ENV === 'development') {
      const loadTime = loadEndTime.current - (loadStartTime.current || 0);
      console.log(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} loaded successfully:`, {
        src,
        loadTime: `${loadTime}ms`
      });
    }
  };
  
  const handleError = (event: React.SyntheticEvent<HTMLMediaElement, Event>) => {
    const mediaElement = event.currentTarget;
    const error = mediaElement.error;
    
    // Log detailed error information
    const errorInfo = {
      mediaType,
      src,
      errorCode: error ? error.code : 'unknown',
      errorMessage: error ? error.message : 'Unknown error',
      networkState: mediaElement.networkState,
      readyState: mediaElement.readyState,
      currentSrc: mediaElement.currentSrc,
      timestamp: new Date().toISOString()
    };
    
    console.error(`${mediaType} load error:`, errorInfo);
    
    setHasError(true);
    setIsLoading(false);
    setErrorDetails(errorInfo);
    
    // Return true to prevent default error handling
    return true;
  };
  
  return {
    hasError,
    isLoading,
    errorDetails,
    handleLoad,
    handleError
  };
};

/**
 * Video component with built-in error handling
 */
export const VideoWithErrorHandling: React.FC<VideoWithErrorHandlingProps> = ({
  src,
  fallback,
  onError,
  children,
  className = '',
  ...props
}) => {
  const mediaRef = useRef<HTMLVideoElement>(null);
  const { handleLoad, handleError } = useMediaErrorHandler('video', src || '');
  
  // Custom fallback UI for video errors
  const defaultFallback = (
    <div className={`video-error-container bg-gray-100 rounded flex items-center justify-center ${className}`} style={{ minHeight: '200px' }}>
      <div className="text-center p-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-600">Video could not be loaded</p>
      </div>
    </div>
  );

  return (
    <MediaErrorBoundary 
      mediaType="video"
      fallback={fallback || defaultFallback}
      onError={onError}
    >
      <video
        ref={mediaRef}
        src={src}
        className={className}
        onError={handleError as any}
        onLoadedData={handleLoad}
        {...props}
      >
        {children}
      </video>
    </MediaErrorBoundary>
  );
};

/**
 * Image component with built-in error handling
 */
export const ImageWithErrorHandling: React.FC<ImageWithErrorHandlingProps> = ({
  src,
  alt,
  fallback,
  onError,
  placeholderSrc,
  className = '',
  ...props
}) => {
  const { handleLoad, handleError } = useMediaErrorHandler('image', src || '');
  
  // Custom fallback UI for image errors
  const defaultFallback = (
    <div className={`image-error-container bg-gray-100 rounded flex items-center justify-center ${className}`} style={{ minHeight: '100px' }}>
      <div className="text-center p-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-xs text-gray-600">{alt || 'Image unavailable'}</p>
      </div>
    </div>
  );
  
  return (
    <MediaErrorBoundary 
      mediaType="image"
      fallback={fallback || defaultFallback}
      onError={onError}
    >
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError as any}
        onLoad={handleLoad}
        {...props}
      />
    </MediaErrorBoundary>
  );
};

/**
 * Audio component with built-in error handling
 */
export const AudioWithErrorHandling: React.FC<AudioWithErrorHandlingProps> = ({
  src,
  fallback,
  onError,
  children,
  className = '',
  ...props
}) => {
  const { handleLoad, handleError } = useMediaErrorHandler('audio', src || '');
  
  // Custom fallback UI for audio errors
  const defaultFallback = (
    <div className={`audio-error-container bg-gray-100 rounded flex items-center justify-center ${className}`} style={{ minHeight: '80px' }}>
      <div className="text-center p-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
        <p className="text-xs text-gray-600">Audio could not be played</p>
      </div>
    </div>
  );

  return (
    <MediaErrorBoundary 
      mediaType="audio"
      fallback={fallback || defaultFallback}
      onError={onError}
    >
      <audio
        src={src}
        className={className}
        onError={handleError as any}
        onLoadedData={handleLoad}
        {...props}
      >
        {children}
      </audio>
    </MediaErrorBoundary>
  );
};

// Logger component to add to app for monitoring all media errors
export const MediaErrorLogger: React.FC = () => {
  // Keep a log of all media errors
  const [errors, setErrors] = useState<Array<{
    id: string;
    timestamp: string;
    mediaType: string;
    message: string;
    details: any;
  }>>([]);
  
  // Handle new errors
  const handleMediaError = (error: Error, info: React.ErrorInfo, mediaType: string = 'unknown') => {
    const newError = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      mediaType,
      message: error.message,
      details: {
        error,
        componentStack: info.componentStack,
      }
    };
    
    setErrors(prev => [newError, ...prev]);
    
    // You could send this to an error tracking service here
    console.group('Media Error Logged');
    console.error(`${mediaType} Error:`, error.message);
    console.info('Component Stack:', info.componentStack);
    console.groupEnd();
  };
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {errors.length > 0 && (
        <div className="bg-white border rounded shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Media Error Log ({errors.length})</h3>
            <button 
              onClick={() => setErrors([])} 
              className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {errors.map(err => (
              <div key={err.id} className="text-xs border-b pb-2">
                <div className="font-medium">{err.mediaType} Error</div>
                <div className="text-gray-500">{new Date(err.timestamp).toLocaleTimeString()}</div>
                <div className="text-red-500">{err.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  VideoWithErrorHandling,
  ImageWithErrorHandling,
  AudioWithErrorHandling,
  MediaErrorLogger,
  useMediaErrorHandler
};