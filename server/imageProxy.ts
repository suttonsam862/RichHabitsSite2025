import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

/**
 * Image proxy service that serves images from multiple sources
 * Serves from local files first, then falls back to production server
 */

const PRODUCTION_IMAGE_BASE = 'https://rich-habits.com';

// Common image directories to check
const IMAGE_DIRECTORIES = [
  'public',
  'public/images',
  'public/assets',
  'public/designs',
  'attached_assets'
];

interface ImageSource {
  path: string;
  exists: boolean;
}

/**
 * Find image in local directories
 */
function findLocalImage(imagePath: string): ImageSource | null {
  // Clean the path - remove leading slash and decode URI components
  const cleanPath = decodeURIComponent(imagePath.startsWith('/') ? imagePath.slice(1) : imagePath);
  
  for (const dir of IMAGE_DIRECTORIES) {
    const fullPath = path.join(process.cwd(), dir, cleanPath);
    
    try {
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        return { path: fullPath, exists: true };
      }
    } catch (error) {
      // Continue checking other directories
    }
  }
  
  return null;
}

/**
 * Get image from production server
 */
async function getProductionImage(imagePath: string): Promise<Response | null> {
  try {
    const productionUrl = `${PRODUCTION_IMAGE_BASE}${imagePath}`;
    const response = await fetch(productionUrl);
    
    if (response.ok) {
      return response as any;
    }
  } catch (error) {
    console.log(`Production image fetch failed for ${imagePath}:`, error);
  }
  
  return null;
}

/**
 * Main image proxy handler
 */
export async function handleImageProxy(req: Request, res: Response) {
  const imagePath = req.path;
  
  // Skip non-image requests
  if (!imagePath.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return res.status(404).json({ error: 'Not an image' });
  }
  
  try {
    // First, try to find the image locally
    const localImage = findLocalImage(imagePath);
    
    if (localImage) {
      console.log(`Serving local image: ${localImage.path}`);
      
      // Determine content type
      const ext = path.extname(localImage.path).toLowerCase();
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml'
      }[ext] || 'image/jpeg';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      
      return res.sendFile(localImage.path);
    }
    
    // If not found locally, try production server
    console.log(`Attempting to fetch from production: ${imagePath}`);
    const productionResponse = await getProductionImage(imagePath);
    
    if (productionResponse) {
      console.log(`Serving production image: ${imagePath}`);
      
      // Copy headers from production response
      productionResponse.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      
      // Stream the image data
      const buffer = await productionResponse.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }
    
    // Generate placeholder if nothing found
    console.log(`Image not found, generating placeholder: ${imagePath}`);
    return generatePlaceholder(res, imagePath);
    
  } catch (error) {
    console.error('Image proxy error:', error);
    return generatePlaceholder(res, imagePath);
  }
}

/**
 * Generate SVG placeholder for missing images
 */
function generatePlaceholder(res: Response, imagePath: string) {
  const filename = path.basename(imagePath);
  const svg = `
    <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f3f4f6"/>
      <rect x="150" y="100" width="100" height="100" fill="#d1d5db" rx="8"/>
      <circle cx="175" cy="125" r="8" fill="#9ca3af"/>
      <path d="M165 145 L175 135 L185 145 L195 135 L205 150 L165 150 Z" fill="#9ca3af"/>
      <text x="200" y="170" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">
        ${filename}
      </text>
      <text x="200" y="190" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">
        Image not found
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(svg);
}

/**
 * Setup image proxy routes
 */
export function setupImageProxy(app: any) {
  // Handle image requests with various prefixes
  app.get('/images/*', handleImageProxy);
  app.get('/assets/*', handleImageProxy);
  app.get('/designs/*', handleImageProxy);
  app.get('/attached_assets/*', handleImageProxy);
  app.get('/public/*', handleImageProxy);
  
  // Handle direct image files in root
  app.get('/*.jpg', handleImageProxy);
  app.get('/*.jpeg', handleImageProxy);
  app.get('/*.png', handleImageProxy);
  app.get('/*.gif', handleImageProxy);
  app.get('/*.webp', handleImageProxy);
  app.get('/*.svg', handleImageProxy);
  
  console.log('Image proxy routes configured');
}