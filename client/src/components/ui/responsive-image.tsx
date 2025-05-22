import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  lazyLoad?: boolean;
  sizes?: string;
  containerClassName?: string;
}

/**
 * ResponsiveImage Component
 * 
 * This component renders a responsive image with optional lazy loading
 * and placeholder. It also handles image loading errors gracefully.
 */
export function ResponsiveImage({
  src,
  alt,
  className,
  placeholderSrc = '/images/placeholder.jpg',
  lazyLoad = true,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  containerClassName,
  ...props
}: ResponsiveImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Function to generate responsive image URLs
  const getResponsiveUrls = (url: string) => {
    // If it's already an absolute URL or data URL, return as is
    if (url.startsWith('http') || url.startsWith('data:')) {
      return { src: url, srcSet: undefined };
    }

    // For local images, we can provide WebP alternatives and different sizes
    // Strip extension to create base path
    const basePath = url.replace(/\.\w+$/, '');
    
    // Create srcSet with responsive images
    try {
      return {
        src: `${basePath}.jpg`, // Original as fallback
        srcSet: `
          /optimized/sm/${basePath}.webp 640w,
          /optimized/md/${basePath}.webp 1024w,
          /optimized/lg/${basePath}.webp 1920w,
          /optimized/sm/${basePath}.jpg 640w,
          /optimized/md/${basePath}.jpg 1024w,
          /optimized/lg/${basePath}.jpg 1920w
        `.trim()
      };
    } catch (e) {
      // Fallback to original if there's an error
      return { src: url, srcSet: undefined };
    }
  };

  const { src: imgSrc, srcSet } = !error ? getResponsiveUrls(src) : { src: placeholderSrc, srcSet: undefined };

  // Handle error and reset image to placeholder
  const handleError = () => {
    if (!error) {
      console.warn(`Failed to load image: ${src}`);
      setError(true);
    }
  };

  // Handle successful image load
  const handleLoad = () => {
    setLoaded(true);
  };

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <img
        src={imgSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={lazyLoad ? 'lazy' : undefined}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          'transition-opacity duration-300', 
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...props}
      />
    </div>
  );
}