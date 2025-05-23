import { useState } from 'react';

interface RHImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Custom image component with fallback and error handling
 */
export function RHImage({ src, alt, className = "", style = {} }: RHImageProps) {
  const [hasError, setHasError] = useState(false);
  
  // Create a URL that works in both development and production
  const imageUrl = src.startsWith('http') 
    ? src 
    : src.startsWith('/') 
      ? src // Already starts with slash
      : `/${src}`; // Add slash if needed
  
  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={style}
      >
        <span className="text-gray-500 text-sm">{alt}</span>
      </div>
    );
  }
  
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}

/**
 * Custom background image component with fallback and error handling
 */
export function RHBackgroundImage({ 
  src, 
  alt, 
  className = "", 
  style = {},
  children
}: RHImageProps & { children?: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  
  // Create a URL that works in both development and production
  const imageUrl = src.startsWith('http') 
    ? src 
    : src.startsWith('/') 
      ? src // Already starts with slash
      : `/${src}`; // Add slash if needed
  
  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }
  
  return (
    <div
      className={className}
      style={{ 
        ...style,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {children}
      <img 
        src={imageUrl} 
        alt={alt} 
        style={{ display: 'none' }} 
        onError={() => setHasError(true)} 
      />
    </div>
  );
}