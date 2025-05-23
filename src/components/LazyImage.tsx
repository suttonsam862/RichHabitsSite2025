import React, { useRef, useState, useEffect, CSSProperties } from 'react';
import { createPlaceholderImage } from '../utils/imageOptimizer';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholderColor?: string;
  threshold?: number;
  style?: CSSProperties;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * LazyImage component that only loads when scrolled into view
 * Uses Intersection Observer API for efficiency
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholderColor = '#f3f4f6',
  threshold = 0.1,  // How much of the image needs to be in view to trigger loading
  style = {},
  objectFit = 'cover',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isError, setIsError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Calculate placeholder
  const placeholder = width && height 
    ? createPlaceholderImage(width, height, placeholderColor)
    : '';

  // Set up intersection observer to detect when image is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          // Disconnect after triggering
          if (imageRef.current) {
            observer.unobserve(imageRef.current);
          }
        }
      },
      {
        root: null, // viewport
        rootMargin: '100px', // start loading 100px before it comes into view
        threshold,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [threshold]);

  // Image load handler
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Image error handler
  const handleError = () => {
    setIsError(true);
    if (onError) onError();
    console.error(`Failed to load image: ${src}`);
  };

  // Combine styles
  const combinedStyles: CSSProperties = {
    objectFit,
    backgroundColor: placeholderColor,
    transition: 'filter 0.5s ease, opacity 0.5s ease',
    filter: isLoaded ? 'none' : 'blur(8px)',
    opacity: isLoaded ? 1 : 0.6,
    ...style,
  };

  // Error state
  if (isError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : '200px',
          ...style,
        }}
      >
        <span className="text-sm">{alt || 'Image failed to load'}</span>
      </div>
    );
  }

  return (
    <img
      ref={imageRef}
      src={isInView ? src : placeholder}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={combinedStyles}
      loading="lazy"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default LazyImage;