import React, { CSSProperties } from 'react';
import OptimizedImage from './OptimizedImage';
import useResponsive from '../hooks/useResponsive';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface PriorityImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  style?: CSSProperties;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * PriorityImage component for critical above-the-fold images
 * Optimized for instant loading and best Core Web Vitals
 */
const PriorityImage: React.FC<PriorityImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  style = {},
  objectFit = 'cover',
}) => {
  const { isMobile, isTablet } = useResponsive();
  
  // Determine if image needs resizing based on screen size
  let optimizedWidth = width;
  if (width && isMobile) {
    optimizedWidth = Math.min(width, 640);
  } else if (width && isTablet) {
    optimizedWidth = Math.min(width, 768);
  }
  
  // Get optimized image URL
  const optimizedSrc = getOptimizedImageUrl(src, optimizedWidth);
  
  // Create sizes attribute for responsive images
  const sizes = isMobile 
    ? '100vw' 
    : isTablet 
      ? '768px'
      : width 
        ? `${width}px` 
        : '100vw';
  
  // Combine styles
  const combinedStyle: CSSProperties = {
    objectFit,
    ...style
  };
  
  return (
    <OptimizedImage
      src={optimizedSrc}
      alt={alt}
      className={className}
      width={optimizedWidth || undefined}
      height={height}
      style={combinedStyle}
      priority={true}
      loading="eager"
      sizes={sizes}
    />
  );
};

export default PriorityImage;