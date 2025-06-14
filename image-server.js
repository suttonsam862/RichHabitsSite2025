/**
 * Dedicated Image Server
 * Serves static files on a separate port to bypass Vite middleware issues
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Setup paths
const publicPath = path.resolve(process.cwd(), "public");
const attachedAssetsPath = path.resolve(process.cwd(), "attached_assets");

console.log(`Image server starting...`);
console.log(`Public path: ${publicPath}`);
console.log(`Assets path: ${attachedAssetsPath}`);

// CORS headers for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.log(`Image request: ${req.method} ${req.url}`);
  next();
});

// Serve static files with proper MIME types
app.use(express.static(publicPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));

// Serve attached assets
app.use('/assets', express.static(attachedAssetsPath));

// Directory routes
app.use('/images', express.static(path.join(publicPath, 'images')));
app.use('/videos', express.static(path.join(publicPath, 'videos')));
app.use('/designs', express.static(path.join(publicPath, 'designs')));

// 404 handler
app.use('*', (req, res) => {
  console.log(`File not found: ${req.originalUrl}`);
  res.status(404).send('Image not found');
});

app.listen(PORT, () => {
  console.log(`Image server running on http://localhost:${PORT}`);
  console.log(`Test: http://localhost:${PORT}/Cursive-Logo.webp`);
});