import React, { useState, useEffect, CSSProperties } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholderColor?: string;
  style?: CSSProperties;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component - Handles progressive image loading
 * with blur-up placeholder and proper responsive sizing
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholderColor = '#f3f4f6', // Light gray default
  style = {},
  priority = false,
  loading = 'lazy',
  sizes = '100vw',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);
  }, [src]);

  // Generate placeholder image of same aspect ratio
  let placeholderImage = '';
  if (width && height) {
    const aspectRatio = width / height;
    // Create a tiny SVG as placeholder (1x1 pixel, scaled)
    placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}' %3E%3Crect width='${width}' height='${height}' fill='${placeholderColor.replace('#', '%23')}' /%3E%3C/svg%3E`;
  }

  // Calculate srcset for responsive images
  const generateSrcSet = () => {
    if (!src) return '';
    
    // If src is already a data URL or external URL, don't generate srcset
    if (src.startsWith('data:') || src.match(/^https?:\/\//)) {
      return src;
    }
    
    // Extract file extension and base path
    const extensionMatch = src.match(/\.(jpe?g|png|webp|avif|gif)$/i);
    if (!extensionMatch) return src;
    
    const extension = extensionMatch[1].toLowerCase();
    const basePath = src.slice(0, -extension.length - 1);
    
    // Generate srcset with various sizes
    // This assumes server can generate different sizes with width parameter
    // If your server doesn't support this, you'll need to modify this logic
    if (src.includes('/assets/')) {
      // For static assets - don't try to resize
      return src;
    } else {
      // For dynamic content that might support resizing
      return `${src} 1x`;
    }
  };

  // Combine default styles with passed styles
  const combinedStyles: CSSProperties = {
    objectFit: 'cover',
    backgroundColor: isLoaded ? 'transparent' : placeholderColor,
    transition: 'filter 0.3s ease, opacity 0.3s ease',
    filter: isLoaded ? 'none' : 'blur(10px)',
    opacity: isLoaded ? 1 : 0.8,
    ...style,
  };

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsError(true);
    if (onError) onError();
    
    // Log error for debugging
    console.error(`Failed to load image: ${src}`);
  };

  // If there's an error, show a placeholder with alt text
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
        <span className="text-sm text-center p-4">{alt || 'Image failed to load'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      decoding={priority ? 'sync' : 'async'}
      sizes={sizes}
      className={className}
      style={combinedStyles}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default OptimizedImage;