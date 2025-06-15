#!/usr/bin/env node

/**
 * Deployment Server for Replit
 * Handles deployment requirements for Rich Habits platform
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for deployment
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || 'production'
  });
});

// Serve static files from public directory
const publicPath = path.resolve(process.cwd(), 'public');
app.use(express.static(publicPath));

// Serve built client files if they exist
const distPublicPath = path.resolve(process.cwd(), 'dist/public');
app.use(express.static(distPublicPath));

// Basic API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'API healthy', timestamp: new Date().toISOString() });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  // Try to serve built index.html first
  const builtIndexPath = path.join(distPublicPath, 'index.html');
  const devIndexPath = path.join(process.cwd(), 'client/index.html');
  
  // Check if built version exists
  try {
    res.sendFile(builtIndexPath);
  } catch {
    // Fallback to development index
    res.sendFile(devIndexPath, (err) => {
      if (err) {
        res.status(500).send('Application not ready - please try again in a moment');
      }
    });
  }
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`Rich Habits server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Public path: ${publicPath}`);
  console.log(`Built files path: ${distPublicPath}`);
});

// Error handling
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;