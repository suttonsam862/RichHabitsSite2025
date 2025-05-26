import React from 'react';

// Comprehensive mobile crash prevention system
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua) || 
         window.innerWidth <= 768 || 
         'ontouchstart' in window;
};

// Memory-safe component wrapper
export const withMobileSafety = <T extends Record<string, any>>(Component: React.ComponentType<T>) => {
  return React.forwardRef<any, T>((props, ref) => {
    try {
      // Add mobile-specific optimizations
      const mobileProps = isMobile() ? {
        ...props,
        // Reduce animations on mobile
        animate: false,
        // Disable heavy effects
        enableEffects: false
      } : props;

      return React.createElement(Component, { ...mobileProps, ref });
    } catch (error) {
      console.error('Mobile component crash prevented:', error);
      return React.createElement('div', {
        className: "flex items-center justify-center p-4 min-h-32"
      }, React.createElement('div', {
        className: "text-center"
      }, [
        React.createElement('div', {
          key: 'spinner',
          className: "animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
        }),
        React.createElement('p', {
          key: 'text',
          className: "text-sm text-gray-600"
        }, 'Loading...')
      ]));
    }
  });
};

// Safe video loading for mobile
export const getMobileSafeVideoProps = () => {
  if (isMobile()) {
    return {
      preload: 'none' as const,
      controls: false,
      autoPlay: false,
      loop: false,
      muted: true
    };
  }
  return {
    preload: 'metadata' as const,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true
  };
};

// Memory cleanup for mobile
export const cleanupMobileResources = () => {
  if (isMobile() && 'gc' in window && typeof (window as any).gc === 'function') {
    try {
      (window as any).gc();
    } catch (e) {
      // Silent fail - gc not available
    }
  }
};

// Safe animation settings
export const getMobileSafeAnimationProps = () => {
  if (isMobile()) {
    return {
      initial: false,
      animate: false,
      transition: { duration: 0 }
    };
  }
  return {};
};

// Error recovery for forms
export const handleMobileFormError = (error: any, fallbackAction?: () => void) => {
  console.error('Mobile form error:', error);
  
  if (isMobile() && fallbackAction) {
    // Use fallback on mobile
    fallbackAction();
  } else {
    // Rethrow on desktop
    throw error;
  }
};