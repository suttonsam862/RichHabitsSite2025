import React, { memo, useMemo } from 'react';

/**
 * Performance optimization utilities
 */

// Memoized image component
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export const OptimizedImage = memo(function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy' 
}: OptimizedImageProps) {
  const memoizedProps = useMemo(() => ({
    src,
    alt,
    className,
    loading,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.target as HTMLImageElement;
      if (img.dataset.fallbackAttempted !== 'true') {
        img.dataset.fallbackAttempted = 'true';
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
      }
    }
  }), [src, alt, className, loading]);
  
  return <img {...memoizedProps} />;
});

// Memoized price formatter
export function usePriceFormatter(price: number | string, currency = 'USD') {
  return useMemo(() => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(numericPrice);
  }, [price, currency]);
}

// Memoized class name builder
export function useClassNames(...classes: (string | undefined | null | false)[]) {
  return useMemo(() => {
    return classes.filter(Boolean).join(' ');
  }, [classes]);
}