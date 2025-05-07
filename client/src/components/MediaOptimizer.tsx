import React, { useState, useEffect, ReactNode, CSSProperties } from 'react';
import LazyImage from './LazyImage';
import PriorityImage from './PriorityImage';
import OptimizedImage from './OptimizedImage';
import useResponsive from '../hooks/useResponsive';

interface MediaOptimizerProps {
  src: string;
  alt: string;
  type: 'image' | 'video' | 'background';
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
  style?: CSSProperties;
  children?: ReactNode;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  loadingStrategy?: 'eager' | 'lazy' | 'progressive';
  fallbackSrc?: string;
  placeholderColor?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * MediaOptimizer - Smart wrapper for optimizing media loading
 * Automatically chooses the best loading strategy based on device, priority, etc.
 */
const MediaOptimizer: React.FC<MediaOptimizerProps> = ({
  src,
  alt,
  type = 'image',
  priority = false,
  className = '',
  width,
  height,
  style = {},
  children,
  objectFit = 'cover',
  loadingStrategy = 'progressive',
  fallbackSrc,
  placeholderColor = '#f3f4f6',
  onLoad,
  onError,
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  
  // For background image type with children
  if (type === 'background' && children) {
    const bgStyle: CSSProperties = {
      backgroundImage: `url(${src})`,
      backgroundSize: objectFit,
      backgroundPosition: 'center',
      ...style,
    };
    
    return (
      <div className={className} style={bgStyle}>
        {children}
      </div>
    );
  }
  
  // Handle error
  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };
  
  // Handle load
  const handleLoad = () => {
    setHasLoaded(true);
    if (onLoad) onLoad();
  };
  
  // Use priority loading for important above-the-fold images
  if (priority) {
    return (
      <PriorityImage
        src={hasError && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        style={style}
        objectFit={objectFit}
      />
    );
  }
  
  // Use lazy loading for below-the-fold images
  if (loadingStrategy === 'lazy') {
    return (
      <LazyImage
        src={hasError && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        style={style}
        objectFit={objectFit}
        placeholderColor={placeholderColor}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }
  
  // Use optimized loading for all other images
  return (
    <OptimizedImage
      src={hasError && fallbackSrc ? fallbackSrc : src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      placeholderColor={placeholderColor}
      loading="lazy"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default MediaOptimizer;