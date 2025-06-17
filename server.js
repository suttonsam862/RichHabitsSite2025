import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Logo API endpoint - must be first before any middleware
app.get("/api/logo", async (req, res) => {
  console.log('Logo API request received');
  
  try {
    const productionUrl = `https://rich-habits.com/Cursive-Logo.webp`;
    console.log('Fetching logo from:', productionUrl);
    const response = await fetch(productionUrl);
    
    if (response.ok) {
      console.log('Successfully fetched logo from production');
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(Buffer.from(buffer));
    } else {
      console.log('Production logo fetch failed with status:', response.status);
    }
  } catch (error) {
    console.log('Production logo fetch error:', error);
  }
  
  // Fallback SVG logo
  const logoSvg = `<svg width="140" height="40" viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        .logo-text { font-family: 'Brush Script MT', cursive; fill: #1f2937; }
        .logo-accent { fill: #dc2626; }
      </style>
    </defs>
    <text x="5" y="16" class="logo-text" font-size="14" font-style="italic">Rich</text>
    <text x="5" y="32" class="logo-text" font-size="14" font-style="italic">Habits</text>
    <line x1="50" y1="20" x2="135" y2="20" stroke="#dc2626" stroke-width="2" opacity="0.7"/>
    <circle cx="125" cy="12" r="2" class="logo-accent"/>
    <circle cx="132" cy="28" r="1.5" class="logo-accent"/>
  </svg>`;
  
  console.log('Serving fallback SVG logo');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(logoSvg);
});

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