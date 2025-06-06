import { useEffect } from 'react';

// Prefetch utility for lazy-loaded components
export function usePrefetch(prefetchFn: () => Promise<any>, delay = 2000) {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Prefetch on idle or after delay
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          prefetchFn().catch(() => {
            // Silently fail prefetch - not critical
          });
        });
      } else {
        prefetchFn().catch(() => {
          // Silently fail prefetch - not critical
        });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [prefetchFn, delay]);
}

// Prefetch functions for commonly visited pages
export const prefetchPages = {
  events: () => import('../pages/EventsSimple'),
  gallery: () => import('../pages/Gallery'),
  contact: () => import('../pages/Contact'),
  customApparel: () => import('../pages/CustomApparel'),
  shop: () => import('../pages/Shop')
};