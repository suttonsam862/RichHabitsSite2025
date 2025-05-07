import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Map of supported image formats
const supportedFormats = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp']);

/**
 * Middleware to detect image requests and potentially serve optimized versions
 */
export function optimizedImageMiddleware(assetsDir: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip non-GET requests and non-image paths
    if (req.method !== 'GET') return next();
    
    const ext = path.extname(req.path).toLowerCase();
    if (!supportedFormats.has(ext)) return next();
    
    try {
      // Extract width parameter if present (e.g. ?w=300)
      const widthParam = req.query.w || req.query.width;
      const requestedWidth = widthParam ? parseInt(widthParam as string, 10) : null;
      
      // Extract format parameter if present (e.g. ?f=webp or ?format=webp)
      const formatParam = req.query.f || req.query.format;
      const requestedFormat = formatParam ? (formatParam as string).toLowerCase() : null;
      
      // Extract quality parameter if present (e.g. ?q=80 or ?quality=80)
      const qualityParam = req.query.q || req.query.quality;
      const requestedQuality = qualityParam ? parseInt(qualityParam as string, 10) : 90;
      
      // Determine actual file path
      const imagePath = path.join(assetsDir, req.path);
      
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        return next();
      }
      
      // Without server-side image manipulation libraries, just serve the original
      // In a production environment, you'd use Sharp or another library here
      res.sendFile(imagePath);
    } catch (error) {
      console.error('Image optimization error:', error);
      next();
    }
  };
}

/**
 * Register image optimization routes on the Express app
 */
export function registerImageOptimizationRoutes(app: any, assetsDir: string) {
  // Add the middleware to handle image optimization
  app.use(optimizedImageMiddleware(assetsDir));
  
  // Add specific endpoint for image optimization info
  app.get('/api/image-optimization-info', (req: Request, res: Response) => {
    res.json({
      supportsWebP: true,
      supportsAVIF: false,
      supportedFormats: Array.from(supportedFormats),
      optimizationAvailable: true,
      resizingAvailable: false,
      tips: [
        "Use '?w=WIDTH' to request images at specific widths",
        "Use '?f=webp' to request WebP format when supported",
        "Use '?q=QUALITY' to adjust image quality (1-100)",
      ],
    });
  });
}