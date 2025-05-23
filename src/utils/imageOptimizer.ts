/**
 * Utility functions for optimizing images
 */

/**
 * Generates a properly sized image URL based on viewport size
 * @param originalSrc Original image source
 * @param width Desired width or null for responsive
 * @param quality Image quality (1-100)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  originalSrc: string, 
  width: number | null = null, 
  quality: number = 75
): string {
  // Don't try to optimize data URLs or external URLs
  if (originalSrc.startsWith('data:') || /^https?:\/\/(?!.*replit\.app)/.test(originalSrc)) {
    return originalSrc;
  }

  // Don't try to optimize SVGs
  if (originalSrc.endsWith('.svg')) {
    return originalSrc;
  }

  // For assets, use the original URL for now
  // In a production environment, you would implement a CDN or image optimization service
  return originalSrc;
}

/**
 * Get appropriate image size based on device type/screen size
 * @param isMobile Whether the current device is mobile
 * @param originalWidth Original image width
 * @returns Appropriate image width
 */
export function getResponsiveImageSize(isMobile: boolean, originalWidth: number): number {
  if (isMobile) {
    // On mobile, we generally don't need images larger than 640px
    // (unless it's a full-width hero image on a larger mobile device)
    return Math.min(originalWidth, 640);
  }
  
  // Default to original size, but cap at 1200px for performance
  return Math.min(originalWidth, 1200);
}

/**
 * Creates a tiny placeholder image for blur-up loading effect
 * @param width Image width
 * @param height Image height
 * @param color Background color (hex)
 * @returns Data URL for placeholder image
 */
export function createPlaceholderImage(
  width: number, 
  height: number, 
  color: string = '#f3f4f6'
): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}' %3E%3Crect width='${width}' height='${height}' fill='${color.replace('#', '%23')}' /%3E%3C/svg%3E`;
}

/**
 * Preloads critical images for faster rendering
 * @param imageSources Array of image URLs to preload
 */
export function preloadCriticalImages(imageSources: string[]): void {
  if (typeof window === 'undefined') return;
  
  imageSources.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}