import React, { useState, useEffect, CSSProperties, ReactNode } from 'react';
import useResponsive from '../hooks/useResponsive';
import { getOptimizedImageUrl, createPlaceholderImage } from '../utils/imageOptimizer';

interface OptimizedBackgroundImageProps {
  src: string;
  children: ReactNode;
  className?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  priority?: boolean;
  style?: CSSProperties;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

/**
 * OptimizedBackgroundImage component
 * Provides a div with optimized background image and overlay options
 */
const OptimizedBackgroundImage: React.FC<OptimizedBackgroundImageProps> = ({
  src,
  children,
  className = '',
  overlayColor = '#000000',
  overlayOpacity = 0,
  priority = false,
  style = {},
  position = 'center',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { isMobile } = useResponsive();
  
  // Get optimized image URL based on device
  const optimizedSrc = getOptimizedImageUrl(src, isMobile ? 640 : null);
  
  // Prepare placeholder and preload images
  useEffect(() => {
    if (!src || !priority) return;
    
    const img = new Image();
    img.src = optimizedSrc;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsError(true);
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [optimizedSrc, priority, src]);
  
  // Position map for background-position
  const positionMap: Record<string, string> = {
    center: 'center center',
    top: 'center top',
    bottom: 'center bottom',
    left: 'left center',
    right: 'right center',
  };
  
  // Combine styles for container
  const containerStyle: CSSProperties = {
    position: 'relative',
    backgroundImage: isError ? 'none' : `url(${optimizedSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: positionMap[position],
    backgroundRepeat: 'no-repeat',
    ...style,
  };
  
  // Style for overlay
  const overlayStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: overlayColor,
    opacity: overlayOpacity,
    zIndex: 0,
  };
  
  // Style for content container
  const contentStyle: CSSProperties = {
    position: 'relative',
    zIndex: 1,
  };
  
  return (
    <div className={className} style={containerStyle}>
      {overlayOpacity > 0 && <div style={overlayStyle} />}
      <div style={contentStyle}>{children}</div>
    </div>
  );
};

export default OptimizedBackgroundImage;