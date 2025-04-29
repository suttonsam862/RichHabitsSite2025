import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { VideoWithErrorHandling } from '../MediaErrorHandlers';
import { 
  parseVideoError, 
  logMediaError, 
  MediaErrorData,
  inferMimeTypeFromExtension,
} from '../../utils/mediaErrorUtils';

// Helper functions
const checkVideoExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking video existence:', error);
    return false;
  }
};

// Custom browser capability detection
const canBrowserPlayFileType = (fileType: string): boolean => {
  const video = document.createElement('video');
  
  // Try inferred MIME type
  const mimeType = inferMimeTypeFromExtension(fileType);
  if (mimeType) {
    return video.canPlayType(mimeType) !== '';
  }
  
  // If no MIME type could be inferred, do basic format check
  if (fileType.match(/\.(mp4)$/i)) {
    return video.canPlayType('video/mp4') !== '';
  }
  
  if (fileType.match(/\.(webm)$/i)) {
    return video.canPlayType('video/webm') !== '';
  }
  
  if (fileType.match(/\.(ogg|ogv)$/i)) {
    return video.canPlayType('video/ogg') !== '';
  }
  
  return false;
};

// Get browser supported video formats 
const getSupportedVideoFormats = (): string[] => {
  const video = document.createElement('video');
  
  // Test video formats
  const videoFormats = [
    { type: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', shortName: 'mp4 (H.264)' },
    { type: 'video/webm; codecs="vp8, vorbis"', shortName: 'webm (VP8)' },
    { type: 'video/webm; codecs="vp9"', shortName: 'webm (VP9)' },
    { type: 'video/ogg; codecs="theora"', shortName: 'ogg' }
  ];
  
  return videoFormats
    .filter(format => video.canPlayType(format.type) !== '')
    .map(format => format.shortName);
};

interface EventVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  title?: string;
  onError?: (error: MediaErrorData | any) => void;
  style?: CSSProperties;
}

/**
 * Enhanced event video component with robust error handling
 */
const EventVideo: React.FC<EventVideoProps> = ({
  src,
  poster,
  className = '',
  autoplay = false,
  muted = true,
  controls = true,
  loop = false,
  preload = 'metadata',
  title,
  onError,
  style
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [fileExists, setFileExists] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Check file extension for better error messages
  const fileExtension = src.split('.').pop()?.toLowerCase();
  const isValidExtension = ['mp4', 'webm', 'ogg'].includes(fileExtension || ''); // MOV format is not supported in many browsers
  
  // Log file extension info
  useEffect(() => {
    if (fileExtension) {
      console.log(`[EventVideo] Video file extension: ${fileExtension}`);
      console.log(`[EventVideo] Is standard web video format: ${isValidExtension}`);
      
      // Special warning for MOV files
      if (fileExtension === 'mov') {
        console.warn('[EventVideo] MOV format is not reliably supported across browsers. Convert to MP4 for better compatibility.');
      }
    }
  }, [fileExtension, isValidExtension]);
  
  // Reset error state when source changes
  useEffect(() => {
    setHasError(false);
    setLoadAttempts(0);
    
    // Test browser video capabilities
    const testVideoCapabilities = () => {
      const supportedFormats = getSupportedVideoFormats();
      console.log('Browser supported video formats:', supportedFormats);
      
      const fileExtension = src.split('.').pop()?.toLowerCase();
      const canPlay = canBrowserPlayFileType(fileExtension || '');
      console.log(`Can browser play ${fileExtension}?`, canPlay);
      
      // Get MIME type and check it
      const mimeType = inferMimeTypeFromExtension(src);
      console.log(`Inferred MIME type for ${src}: ${mimeType}`);
      
      if (mimeType) {
        const video = document.createElement('video');
        const canPlayType = video.canPlayType(mimeType);
        console.log(`Browser canPlayType response for ${mimeType}: '${canPlayType}'`);
      }
    };
    
    // Check if the video file exists
    const verifyFileExists = async () => {
      console.log(`[EventVideo] Checking if video exists: ${src}`);
      const exists = await checkVideoExists(src);
      console.log(`[EventVideo] Video file exists: ${exists}`);
      setFileExists(exists);
      
      // If file doesn't exist, trigger error handling
      if (!exists) {
        console.error(`[EventVideo] Video file not found: ${src}`);
        setHasError(true);
        
        if (onError) {
          onError({
            mediaType: 'video',
            src,
            errorCode: -1, // Custom error code for file not found
            errorMessage: 'Video file not found on server',
            networkState: 3,
            readyState: 0,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // Try a direct fetch with more details
        try {
          const response = await fetch(src);
          const contentType = response.headers.get('content-type');
          console.log(`[EventVideo] Video content type: ${contentType}`);
          if (response.ok) {
            console.log(`[EventVideo] Video fetch successful, status: ${response.status}`);
            
            // Test if the video element can actually play the video
            if (videoRef.current) {
              console.log(`[EventVideo] Testing video playback capabilities for: ${src}`);
              videoRef.current.onloadedmetadata = () => {
                console.log(`[EventVideo] Video metadata loaded successfully. Duration: ${videoRef.current?.duration}s`);
              };
              videoRef.current.oncanplay = () => {
                console.log(`[EventVideo] Video can be played now`);
                setIsPlaying(true);
              };
            }
          } else {
            console.error(`[EventVideo] Video fetch failed, status: ${response.status}`);
          }
        } catch (err) {
          console.error('[EventVideo] Error fetching video:', err);
        }
      }
    };
    
    testVideoCapabilities();
    verifyFileExists();
  }, [src, onError]);
  
  // Capture regular HTML5 video errors
  const handleVideoError = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = event.currentTarget;
    const errorData = parseVideoError(videoElement);
    
    // Log detailed error information
    logMediaError(errorData);
    
    // Set error state in component
    setHasError(true);
    
    // Call custom error handler if provided
    if (onError) {
      onError(errorData);
    }
  };
  
  // Custom error handler for any other issues
  const handleCustomError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Event video component error:', error, errorInfo);
    
    setHasError(true);
    
    if (onError) {
      onError({ error, errorInfo });
    }
  };
  
  // Retry loading when clicking the retry button
  const handleRetry = () => {
    if (loadAttempts < 3) {
      setHasError(false);
      setLoadAttempts(prev => prev + 1);
      
      // Force reload the video element
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  };

  // Create a custom fallback UI for video errors
  const fallbackUI = (
    <div className={`video-error-container bg-gray-100 rounded flex flex-col items-center justify-center p-6 ${className}`} style={{ minHeight: '300px', ...(style || {}) }}>
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
        
        {/* Conditional error messages based on the type of error detected */}
        {fileExists === false ? (
          <p className="text-gray-600 mb-4">Video file not found: {src.split('/').pop()}</p>
        ) : !isValidExtension ? (
          <p className="text-gray-600 mb-4">Unsupported video format: .{fileExtension || 'unknown'}</p>
        ) : (
          <p className="text-gray-600 mb-4">The video could not be loaded</p>
        )}
        
        {/* Technical details for debugging - can be removed in production */}
        <details className="mb-4 text-left text-xs text-gray-500">
          <summary className="cursor-pointer mb-2">Technical details</summary>
          <p>Source: {src}</p>
          <p>Format: .{fileExtension || 'unknown'}</p>
          <p>File exists: {fileExists === null ? 'checking...' : fileExists ? 'yes' : 'no'}</p>
          <p>Load attempts: {loadAttempts}</p>
        </details>
        
        {loadAttempts < 3 && (
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again {loadAttempts > 0 ? `(${loadAttempts}/3)` : ''}
          </button>
        )}
        
        {loadAttempts >= 3 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-2">
              Multiple attempts failed.
            </p>
            
            {fileExists === false && (
              <p className="text-xs text-amber-700">
                Video file might be missing or unavailable.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <VideoWithErrorHandling
      ref={videoRef}
      src={src}
      poster={poster}
      className={className}
      autoPlay={autoplay}
      muted={muted}
      controls={controls}
      loop={loop}
      preload={preload}
      onError={handleVideoError}
      fallback={hasError ? fallbackUI : undefined}
      style={style}
    >
      Your browser does not support HTML5 video.
    </VideoWithErrorHandling>
  );
};

export default EventVideo;