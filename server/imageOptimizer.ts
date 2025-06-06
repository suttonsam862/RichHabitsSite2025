import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';

// Optional Sharp integration - falls back gracefully if not available
let sharp: any;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not available - image optimization disabled');
}

interface OptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export async function optimizeImage(req: Request, res: Response) {
  try {
    const { width, height, quality, format } = req.query as Record<string, string>;
    const imagePath = req.params[0]; // Using wildcard route
    
    if (!imagePath) {
      return res.status(400).json({ error: 'Image path required' });
    }

    // Construct full file path
    const publicDir = process.env.NODE_ENV === 'production' 
      ? path.resolve(process.cwd(), 'dist', 'public')
      : path.resolve(process.cwd(), 'public');
    
    const fullPath = path.join(publicDir, imagePath);
    
    // Security check - ensure path is within public directory
    const resolvedPath = path.resolve(fullPath);
    const resolvedPublicDir = path.resolve(publicDir);
    
    if (!resolvedPath.startsWith(resolvedPublicDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return res.status(404).json({ error: 'Image not found' });
    }

    // If Sharp is not available, serve original file
    if (!sharp) {
      return res.sendFile(fullPath);
    }

    // Parse optimization parameters
    const options: OptimizationOptions = {};
    
    if (width && !isNaN(parseInt(width))) {
      options.width = parseInt(width);
    }
    
    if (height && !isNaN(parseInt(height))) {
      options.height = parseInt(height);
    }
    
    if (quality && !isNaN(parseInt(quality))) {
      options.quality = Math.min(100, Math.max(1, parseInt(quality)));
    }
    
    if (format && ['webp', 'jpeg', 'png'].includes(format)) {
      options.format = format as 'webp' | 'jpeg' | 'png';
    }

    // If no optimization requested, serve original
    if (Object.keys(options).length === 0) {
      return res.sendFile(fullPath);
    }

    // Create Sharp instance
    let transformer = sharp(fullPath);

    // Apply resizing
    if (options.width || options.height) {
      transformer = transformer.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Apply format conversion and quality
    if (options.format === 'webp') {
      transformer = transformer.webp({ quality: options.quality || 80 });
      res.type('image/webp');
    } else if (options.format === 'jpeg') {
      transformer = transformer.jpeg({ quality: options.quality || 80 });
      res.type('image/jpeg');
    } else if (options.format === 'png') {
      transformer = transformer.png({ quality: options.quality || 80 });
      res.type('image/png');
    } else {
      // Auto-detect format based on original file
      const ext = path.extname(fullPath).toLowerCase();
      if (ext === '.webp') {
        transformer = transformer.webp({ quality: options.quality || 80 });
        res.type('image/webp');
      } else if (ext === '.jpg' || ext === '.jpeg') {
        transformer = transformer.jpeg({ quality: options.quality || 80 });
        res.type('image/jpeg');
      } else if (ext === '.png') {
        transformer = transformer.png({ quality: options.quality || 80 });
        res.type('image/png');
      }
    }

    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=86400', // 24 hours
      'Vary': 'Accept-Encoding'
    });

    // Stream optimized image
    transformer.pipe(res);

  } catch (error) {
    console.error('Image optimization error:', error);
    res.status(500).json({ error: 'Image optimization failed' });
  }
}

// Helper function to generate optimized image URLs
export function getOptimizedImageUrl(
  originalPath: string, 
  options: OptimizationOptions = {}
): string {
  const params = new URLSearchParams();
  
  if (options.width) params.set('width', options.width.toString());
  if (options.height) params.set('height', options.height.toString());
  if (options.quality) params.set('quality', options.quality.toString());
  if (options.format) params.set('format', options.format);
  
  const queryString = params.toString();
  const basePath = `/api/images/${originalPath.replace(/^\//, '')}`;
  
  return queryString ? `${basePath}?${queryString}` : basePath;
}