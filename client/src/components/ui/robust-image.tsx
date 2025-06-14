import React, { useState, useEffect } from 'react';

interface RobustImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  decorative?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}

export const RobustImage: React.FC<RobustImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/images/placeholder.svg',
  decorative = false,
  onError,
  onLoad
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setImageState(src ? 'loading' : 'error');
    setHasTriedFallback(false);
  }, [src]);

  const handleImageLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleImageError = (e?: React.SyntheticEvent<HTMLImageElement>) => {
    onError?.();
    
    // Bulletproof fallback protection using dataset tracking
    if (e?.target) {
      const img = e.target as HTMLImageElement;
      if (img.dataset.fallbackAttempted !== 'true') {
        img.dataset.fallbackAttempted = 'true';
        img.src = fallbackSrc || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
        return;
      }
    }
    
    // Try fallback if we haven't already and currentSrc is not the fallback
    if (!hasTriedFallback && currentSrc !== fallbackSrc && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasTriedFallback(true);
      setImageState('loading');
      return;
    }
    
    setImageState('error');
  };

  // Show fallback placeholder if no src or final error state
  if (!currentSrc || (imageState === 'error' && hasTriedFallback)) {
    return (
      <div 
        className={`flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-800 to-gray-700 ${className}`}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : alt}
        aria-hidden={decorative}
      >
        <img 
          src={fallbackSrc} 
          alt={decorative ? "" : alt}
          className="w-full h-full object-cover opacity-50"
          aria-hidden={decorative}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      )}
      <img
        src={currentSrc}
        alt={decorative ? "" : alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        aria-hidden={decorative}
      />
    </div>
  );
};

// Shopify-specific image component that handles multiple image property formats
interface ShopifyImageProps {
  product?: {
    images?: Array<{ 
      src?: string; 
      url?: string; 
      originalSrc?: string; 
      alt?: string; 
      altText?: string;
    }>;
    title: string;
  };
  variant?: {
    image?: {
      src?: string;
      url?: string; 
      originalSrc?: string;
      alt?: string;
      altText?: string;
    };
  };
  className?: string;
  imageIndex?: number;
  decorative?: boolean;
}

export const ShopifyImage: React.FC<ShopifyImageProps> = ({
  product,
  variant,
  className = '',
  imageIndex = 0,
  decorative = false
}) => {
  // Image fallback priority as specified:
  // 1. variant.image.src
  // 2. variant.image.url  
  // 3. variant.image.originalSrc
  // 4. product.images[0].src
  // 5. placeholder.png (handled by RobustImage)
  
  const getImageUrl = (): string | undefined => {
    // Priority 1-3: Try variant image properties
    if (variant?.image) {
      const variantImage = variant.image;
      if (variantImage.src) return variantImage.src;
      if (variantImage.url) return variantImage.url;
      if (variantImage.originalSrc) return variantImage.originalSrc;
    }
    
    // Priority 4: Try product images
    const productImage = product?.images?.[imageIndex];
    if (productImage) {
      if (productImage.src) return productImage.src;
      if (productImage.url) return productImage.url;
      if (productImage.originalSrc) return productImage.originalSrc;
    }
    
    return undefined;
  };

  const getAltText = (): string => {
    // Try variant image alt text first
    if (variant?.image?.alt) return variant.image.alt;
    if (variant?.image?.altText) return variant.image.altText;
    
    // Try product image alt text
    const productImage = product?.images?.[imageIndex];
    if (productImage?.alt) return productImage.alt;
    if (productImage?.altText) return productImage.altText;
    
    // Fallback to product title
    return product?.title || 'Product image';
  };

  const imageUrl = getImageUrl();
  const altText = getAltText();

  return (
    <RobustImage
      src={imageUrl}
      alt={altText}
      className={className}
      decorative={decorative}
    />
  );
};

// Helper function to get the best image URL for cart items
export const getShopifyImageUrl = (
  product?: { images?: Array<{ src?: string; url?: string; originalSrc?: string; }> },
  variant?: { image?: { src?: string; url?: string; originalSrc?: string; } }
): string => {
  // Same priority as ShopifyImage component
  if (variant?.image) {
    const variantImage = variant.image;
    if (variantImage.src) return variantImage.src;
    if (variantImage.url) return variantImage.url;
    if (variantImage.originalSrc) return variantImage.originalSrc;
  }
  
  const productImage = product?.images?.[0];
  if (productImage) {
    if (productImage.src) return productImage.src;
    if (productImage.url) return productImage.url;
    if (productImage.originalSrc) return productImage.originalSrc;
  }
  
  return '/images/placeholder.svg';
};