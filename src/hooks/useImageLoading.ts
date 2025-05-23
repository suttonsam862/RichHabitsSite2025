import { useState, useEffect } from 'react';
import { addCriticalImage, preloadImage } from '../services/imagePreloader';
import useResponsive from './useResponsive';

interface UseImageLoadingOptions {
  priority?: boolean;
  preload?: boolean;
  errorFallback?: string;
}

/**
 * Custom hook for handling image loading with advanced features
 */
export function useImageLoading(
  src: string,
  options: UseImageLoadingOptions = {}
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isMobile } = useResponsive();
  
  // Default options
  const { 
    priority = false, 
    preload = false,
    errorFallback
  } = options;
  
  // Mark as critical image if priority is true
  useEffect(() => {
    if (priority && src) {
      addCriticalImage(src);
    }
  }, [priority, src]);
  
  // Preload image if requested
  useEffect(() => {
    if (preload && src) {
      setIsLoading(true);
      
      preloadImage(src)
        .then(() => {
          setIsLoaded(true);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setIsLoading(false);
        });
    }
  }, [preload, src]);
  
  // Create appropriate loading state handlers
  const handleLoad = () => {
    setIsLoaded(true);
    setIsLoading(false);
  };
  
  const handleError = (err: any) => {
    setError(err instanceof Error ? err : new Error('Failed to load image'));
    setIsLoading(false);
  };
  
  // Final src to use (with error fallback if provided)
  const imageSrc = error && errorFallback ? errorFallback : src;
  
  return {
    isLoaded,
    isLoading,
    error,
    handleLoad,
    handleError,
    imageSrc,
    isMobile
  };
}

export default useImageLoading;