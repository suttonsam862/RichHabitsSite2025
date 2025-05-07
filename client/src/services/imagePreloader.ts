/**
 * Image Preloader Service
 * Handles preloading of critical images for faster page loads
 */

// List of critical images to preload
// These should be loaded early to improve UX
const criticalPaths = [
  // Will be populated by components
];

// Track which images have already been preloaded
const preloadedImages = new Set<string>();

/**
 * Preload a single image
 * @param src Image URL to preload
 * @returns Promise that resolves when image is loaded
 */
export function preloadImage(src: string): Promise<void> {
  if (!src || preloadedImages.has(src)) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      preloadedImages.add(src);
      resolve();
    };
    img.onerror = () => {
      console.error(`Failed to preload image: ${src}`);
      reject(new Error(`Failed to preload image: ${src}`));
    };
  });
}

/**
 * Add a critical image to the preload list
 * @param src Critical image URL
 */
export function addCriticalImage(src: string): void {
  if (!criticalPaths.includes(src)) {
    criticalPaths.push(src);
  }
}

/**
 * Preload all critical images
 * @param maxConcurrent Maximum number of concurrent downloads
 * @returns Promise that resolves when all critical images are loaded
 */
export async function preloadCriticalImages(maxConcurrent: number = 4): Promise<void> {
  const queue = [...criticalPaths];
  const inProgress: Promise<void>[] = [];
  
  const loadNext = () => {
    if (queue.length === 0) return null;
    
    const src = queue.shift();
    if (!src) return null;
    
    const promise = preloadImage(src).then(() => {
      const index = inProgress.indexOf(promise);
      if (index !== -1) {
        inProgress.splice(index, 1);
      }
      
      const next = loadNext();
      if (next) inProgress.push(next);
    });
    
    return promise;
  };
  
  // Start initial batch
  for (let i = 0; i < Math.min(maxConcurrent, queue.length); i++) {
    const promise = loadNext();
    if (promise) inProgress.push(promise);
  }
  
  // Wait for all to complete
  await Promise.all(inProgress);
}

/**
 * Initialize image preloading when browser is idle
 */
export function initImagePreloading(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Use requestIdleCallback if available, or setTimeout as fallback
  const requestIdle = (window as any).requestIdleCallback || 
    ((callback: () => void) => setTimeout(callback, 1));
  
  requestIdle(() => {
    preloadCriticalImages().catch(err => {
      console.error('Error preloading images:', err);
    });
  });
}