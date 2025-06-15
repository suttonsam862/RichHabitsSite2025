/**
 * Deployment Server for Replit
 * Handles deployment requirements for Rich Habits platform
 */

import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

// Create Express application
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get current directory in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force deployment environment settings
process.env.PORT = process.env.PORT || '5000';
process.env.NODE_ENV = 'production';

console.log(`🚀 Starting Rich Habits deployment server on port ${process.env.PORT}`);

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rich-habits-production-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Allow HTTP for deployment testing
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
  }),
);

// Health check endpoints for deployment
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT,
    environment: process.env.NODE_ENV
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    api: 'running',
    timestamp: new Date().toISOString()
  });
});

// Static file serving with priority
const publicPath = path.resolve(process.cwd(), "public");

// Serve static files from multiple locations
app.use(express.static(publicPath));
app.use('/images', express.static(path.join(publicPath, 'images')));
app.use('/assets', express.static(path.join(publicPath, 'assets')));
app.use('/videos', express.static(path.join(publicPath, 'videos')));

// Try to serve built client files if they exist
try {
  const distPath = path.resolve(process.cwd(), "dist/public");
  app.use(express.static(distPath));
  console.log(`📦 Serving built client from: ${distPath}`);
} catch (err) {
  console.log('📝 Built client files not found, will serve development version');
}

// Basic API routes for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Rich Habits API is running', timestamp: new Date().toISOString() });
});

// Catch-all route to serve index.html for React routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Try built version first, then development version
  const builtIndex = path.resolve(process.cwd(), "dist/public/index.html");
  const devIndex = path.resolve(process.cwd(), "client/index.html");
  
  // Serve the built index if it exists, otherwise serve development version
  res.sendFile(builtIndex, (err) => {
    if (err) {
      console.log('Built index.html not found, trying development version');
      res.sendFile(devIndex, (devErr) => {
        if (devErr) {
          console.error('No index.html found');
          res.status(500).send(`
            <html>
              <head><title>Rich Habits</title></head>
              <body>
                <h1>Rich Habits Wrestling</h1>
                <p>Server is running but client files are not available.</p>
                <p>Build the client with: npm run build</p>
              </body>
            </html>
          `);
        }
      });
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = parseInt(process.env.PORT, 10);
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Rich Habits deployment server running on http://0.0.0.0:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📍 Health check available at: http://0.0.0.0:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} already in use`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});