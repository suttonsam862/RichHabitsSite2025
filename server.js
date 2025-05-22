// Ultra Simple Replit Deployment Server - ES Module Version

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Create Express app
const app = express();

// Basic error handling
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Get current directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static file serving - try various possible paths
const possibleClientPaths = [
  path.join(__dirname, 'client/dist'),
  path.join(__dirname, 'dist/client'),
  path.join(__dirname, 'public')
];

// Try each possible path
let staticPath = null;
for (const clientPath of possibleClientPaths) {
  if (fs.existsSync(clientPath)) {
    staticPath = clientPath;
    console.log(`Found static files at: ${clientPath}`);
    break;
  }
}

// Serve static files if we found them
if (staticPath) {
  app.use(express.static(staticPath));
}

// Basic API endpoints 
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Rich Habits API',
    version: '1.0.0',
    status: 'online'
  });
});

// Fallback route for static site
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) return;
  
  // For static site, serve index.html if it exists
  if (staticPath) {
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // Ultimate fallback
  res.status(200).send(`
    <html>
      <head>
        <title>Rich Habits</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #333; max-width: 650px; margin: 0 auto; padding: 2rem; }
          h1 { color: #d35400; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          p { line-height: 1.6; }
        </style>
      </head>
      <body>
        <h1>Rich Habits Server</h1>
        <p>The server is running correctly.</p>
        <p>Static files will be served once the application is built.</p>
        <p>Health check endpoint: <a href="/health">/health</a></p>
        <p>API information: <a href="/api/info">/api/info</a></p>
      </body>
    </html>
  `);
});

// Start server with proper port binding for Replit
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API info: http://localhost:${PORT}/api/info`);
});