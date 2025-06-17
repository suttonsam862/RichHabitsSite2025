import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
if (!IS_PRODUCTION) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
}

// Configure image serving middleware with proper headers
app.use('/assets', (req, res, next) => {
  res.set({
    'Cache-Control': 'public, max-age=31536000', // 1 year cache for assets
    'Access-Control-Allow-Origin': '*',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  });
  next();
});

app.use('/images', (req, res, next) => {
  res.set({
    'Cache-Control': 'public, max-age=31536000',
    'Access-Control-Allow-Origin': '*',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const clientBuilt = existsSync(path.resolve(process.cwd(), "dist/public/index.html"));
  res.json({
    status: 'healthy',
    environment: IS_PRODUCTION ? 'production' : 'development',
    timestamp: new Date().toISOString(),
    clientBuilt,
    port: PORT
  });
});

// API routes placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Debug endpoint to list available images
app.get('/api/debug/images', (req, res) => {
  const fs = require('fs');
  try {
    const assetsPath = path.join(__dirname, 'public/assets');
    const imagesPath = path.join(__dirname, 'public/images');

    const assets = fs.existsSync(assetsPath) ? fs.readdirSync(assetsPath) : [];
    const images = fs.existsSync(imagesPath) ? fs.readdirSync(imagesPath) : [];

    res.json({
      assets: assets.slice(0, 10), // First 10 files
      images: images.slice(0, 10),
      assetsPath,
      imagesPath,
      availablePaths: ['/assets/', '/images/', '/designs/', '/videos/']
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Import image optimization middleware
let optimizedImageMiddleware;
try {
  const imageOptimizerModule = require('./server/imageOptimizer.js');
  optimizedImageMiddleware = imageOptimizerModule.optimizedImageMiddleware;
  var registerImageOptimizationRoutes = imageOptimizerModule.registerImageOptimizationRoutes;
} catch (error) {
  console.log('⚠️  Image optimizer not available, using basic static serving');
  optimizedImageMiddleware = (assetsDir) => (req, res, next) => next();
  registerImageOptimizationRoutes = () => {};
}

// Serve static files from multiple directories
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/designs', express.static(path.join(__dirname, 'public/designs')));
app.use('/videos', express.static(path.join(__dirname, 'public/videos')));

// Add image optimization middleware and routes
app.use(optimizedImageMiddleware(path.join(__dirname, 'public')));
registerImageOptimizationRoutes(app, path.join(__dirname, 'public'));

// Serve static files from the client build
const staticPath = path.resolve(process.cwd(), "dist/public");
if (existsSync(staticPath)) {
  app.use(express.static(staticPath));
  console.log(`✅ Serving static files from: ${staticPath}`);
} else {
  console.log(`⚠️  Static files not found at: ${staticPath}`);
}

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  const indexPath = path.resolve(process.cwd(), "dist/public/index.html");
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <html>
        <body>
          <h1>Client Not Built</h1>
          <p>Run <code>npm run build</code> to build the client application.</p>
          <p>Static path: ${staticPath}</p>
          <p>Index path: ${indexPath}</p>
        </body>
      </html>
    `);
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Static files: ${staticPath}`);
  console.log('🖼️  Assets directory:', path.join(__dirname, 'public/assets'));
  console.log('🎨 Images directory:', path.join(__dirname, 'public/images'));
  console.log(`🏗️  Environment: ${IS_PRODUCTION ? 'production' : 'development'}`);
});