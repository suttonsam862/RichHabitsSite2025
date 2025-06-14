import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';

interface RobustImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  onError?: () => void;
  onLoad?: () => void;
}

export const RobustImage: React.FC<RobustImageProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon,
  onError,
  onLoad
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);

  useEffect(() => {
    setCurrentSrc(src);
    setImageState('loading');
  }, [src]);

  const handleImageLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleImageError = () => {
    setImageState('error');
    onError?.();
    
    // Try alternative image properties if available
    if (currentSrc && currentSrc.includes('?')) {
      // Remove query parameters and try again
      const baseUrl = currentSrc.split('?')[0];
      if (baseUrl !== currentSrc) {
        setCurrentSrc(baseUrl);
        setImageState('loading');
        return;
      }
    }
  };

  // Show fallback if no src or error state
  if (!currentSrc || imageState === 'error') {
    return (
      <div className={`flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-800 to-gray-700 ${className}`}>
        {fallbackIcon || <ShoppingCart className="w-16 h-16" />}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

// Shopify-specific image component that handles multiple image property formats
interface ShopifyImageProps {
  product: {
    images?: Array<{ 
      src?: string; 
      url?: string; 
      originalSrc?: string; 
      alt?: string; 
    }>;
    title: string;
  };
  className?: string;
  imageIndex?: number;
}

export const ShopifyImage: React.FC<ShopifyImageProps> = ({
  product,
  className = '',
  imageIndex = 0
}) => {
  const image = product.images?.[imageIndex];
  
  // Try multiple Shopify image property formats
  const getImageUrl = () => {
    if (!image) return undefined;
    return image.src || image.url || image.originalSrc;
  };

  const imageUrl = getImageUrl();
  const altText = image?.alt || product.title || 'Product image';

  return (
    <RobustImage
      src={imageUrl}
      alt={altText}
      className={className}
    />
  );
};