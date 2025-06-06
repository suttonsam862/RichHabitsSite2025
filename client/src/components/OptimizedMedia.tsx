import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  fallbackSrc,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkMyMC40MTgzIDE2IDI0IDE5LjU4MTcgMjQgMjRDMjQgMjguNDE4MyAyMC40MTgzIDMyIDE2IDMyQzExLjU4MTcgMzIgOCAyOC40MTgzIDggMjRDOCAxOS41ODE3IDExLjU4MTcgMTYgMTYgMTZaIiBmaWxsPSIjOTJBM0IzIi8+Cjwvc3ZnPgo=',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const currentRef = imageRef.current;
    if (!currentRef) return;

    // Intersection Observer for lazy loading
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded && !imageError) {
          loadImage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(currentRef);

    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [src, isLoaded, imageError]);

  const loadImage = () => {
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      setImageError(false);
      onLoad?.();
    };

    img.onerror = () => {
      if (retryCount < 2) {
        // Retry with exponential backoff
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadImage();
        }, Math.pow(2, retryCount) * 1000);
      } else if (fallbackSrc && retryCount === 2) {
        // Try fallback source
        setRetryCount(3);
        img.src = fallbackSrc;
      } else {
        setImageError(true);
        onError?.();
      }
    };

    img.src = src;
  };

  if (imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-sm">Image unavailable</div>
      </div>
    );
  }

  return (
    <img
      ref={imageRef}
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      style={{
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoaded ? 1 : 0.7
      }}
    />
  );
}

interface OptimizedVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  fallbackText?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedVideo({
  src,
  poster,
  className = '',
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
  fallbackText = 'Video unavailable',
  onLoad,
  onError
}: OptimizedVideoProps) {
  const [videoError, setVideoError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const currentRef = videoRef.current;
    if (!currentRef) return;

    // Intersection Observer for lazy loading
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded && !videoError) {
          loadVideo();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(currentRef);

    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [src, isLoaded, videoError]);

  const loadVideo = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    const handleLoad = () => {
      setIsLoaded(true);
      setVideoError(false);
      onLoad?.();
    };

    const handleError = () => {
      if (retryCount < 2) {
        // Retry with exponential backoff
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          video.load();
        }, Math.pow(2, retryCount) * 1000);
      } else {
        setVideoError(true);
        onError?.();
      }
    };

    video.addEventListener('loadeddata', handleLoad);
    video.addEventListener('error', handleError);
    video.src = src;
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoad);
      video.removeEventListener('error', handleError);
    };
  };

  if (videoError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-sm">{fallbackText}</div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      controls={controls}
      preload="none"
      style={{
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoaded ? 1 : 0.7
      }}
    >
      {/* Fallback for browsers that don't support video */}
      <p>{fallbackText}</p>
    </video>
  );
}

// Hook for preloading critical images
export function useImagePreloader(sources: string[]) {
  const [loadedImages, setLoadedImages] = useState(new Set<string>());
  const [failedImages, setFailedImages] = useState(new Set<string>());

  useEffect(() => {
    sources.forEach(src => {
      const img = new Image();
      
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(src));
      };
      
      img.onerror = () => {
        setFailedImages(prev => new Set(prev).add(src));
      };
      
      img.src = src;
    });
  }, [sources]);

  return { loadedImages, failedImages };
}