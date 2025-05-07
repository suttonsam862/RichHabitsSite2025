import { useState, useEffect } from 'react';

interface ResponsiveConfig {
  mobile: number;
  tablet: number;
  laptop: number;
  desktop: number;
}

const defaultBreakpoints: ResponsiveConfig = {
  mobile: 640,   // Up to 640px
  tablet: 768,   // 641px to 768px
  laptop: 1024,  // 769px to 1024px
  desktop: 1280, // 1025px and above
};

/**
 * Hook to handle responsive design needs
 * Provides current breakpoint and helper methods
 */
export default function useResponsive(customBreakpoints?: Partial<ResponsiveConfig>) {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  // Initialize with a reasonable default based on server-side or client-side
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });
  
  // Calculate device type from window size
  const isMobile = windowSize.width <= breakpoints.mobile;
  const isTablet = windowSize.width > breakpoints.mobile && windowSize.width <= breakpoints.tablet;
  const isLaptop = windowSize.width > breakpoints.tablet && windowSize.width <= breakpoints.laptop;
  const isDesktop = windowSize.width > breakpoints.laptop;
  
  // Current matched breakpoint
  const currentBreakpoint = 
    isMobile ? 'mobile' :
    isTablet ? 'tablet' :
    isLaptop ? 'laptop' :
    'desktop';
    
  // Update window size
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    // Add event listener to window resize
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Helper to get appropriate value for current breakpoint
  function getResponsiveValue<T>(values: { [key in 'mobile' | 'tablet' | 'laptop' | 'desktop']?: T }, defaultValue: T): T {
    return values[currentBreakpoint] ?? defaultValue;
  }
  
  // Helper to get appropriate image size for current breakpoint
  function getResponsiveImageSize(originalWidth: number): number {
    if (isMobile) return Math.min(originalWidth, 640);
    if (isTablet) return Math.min(originalWidth, 768);
    if (isLaptop) return Math.min(originalWidth, 1024);
    return Math.min(originalWidth, 1280);
  }
  
  return {
    windowSize,
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    currentBreakpoint,
    getResponsiveValue,
    getResponsiveImageSize,
  };
}