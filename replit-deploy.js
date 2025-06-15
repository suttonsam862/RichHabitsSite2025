#!/usr/bin/env node

/**
 * Replit Deployment Configuration
 * Handles all deployment requirements for Rich Habits platform
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0';

console.log('Starting Rich Habits deployment server...');
console.log(`Port: ${PORT}`);
console.log(`Host: ${HOST}`);
console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoints for Replit deployment system
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'rich-habits',
    timestamp: new Date().toISOString(),
    port: PORT,
    host: HOST,
    env: process.env.NODE_ENV || 'production',
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Rich Habits Wrestling</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
      <h1>Rich Habits Wrestling Platform</h1>
      <p>Server is running successfully on port ${PORT}</p>
      <p>Status: Healthy</p>
      <p>Environment: ${process.env.NODE_ENV || 'production'}</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    </body>
    </html>
  `);
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Static file serving
const publicPath = path.resolve(process.cwd(), 'public');
const distPublicPath = path.resolve(process.cwd(), 'dist/public');

console.log(`Public path: ${publicPath}`);
console.log(`Built files path: ${distPublicPath}`);

// Serve static files
app.use(express.static(publicPath, { 
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.use(express.static(distPublicPath, { 
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Fallback for SPA routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  
  // Try to serve built index.html
  const indexPaths = [
    path.join(distPublicPath, 'index.html'),
    path.join(publicPath, 'index.html'),
    path.join(process.cwd(), 'client/index.html')
  ];
  
  let served = false;
  for (const indexPath of indexPaths) {
    try {
      res.sendFile(indexPath);
      served = true;
      break;
    } catch (err) {
      continue;
    }
  }
  
  if (!served) {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rich Habits Wrestling</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        <h1>Rich Habits Wrestling Platform</h1>
        <p>Application is starting up...</p>
        <p>Please refresh the page in a moment.</p>
      </body>
      </html>
    `);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server with comprehensive error handling
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Rich Habits server running on http://${HOST}:${PORT}`);
  console.log(`✅ Health check available at http://${HOST}:${PORT}/health`);
  console.log(`✅ Ready for deployment`);
});

server.on('error', (err) => {
  console.error('Server startup error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use`);
    process.exit(1);
  } else if (err.code === 'EACCES') {
    console.error(`Permission denied for port ${PORT}`);
    process.exit(1);
  } else {
    console.error('Unexpected server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed successfully');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('Forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;