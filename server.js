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

// Enhanced port handling for Replit deployment
// Start by checking preferred ports in order of priority
const preferredPorts = [
  process.env.PORT, // First try Replit's assigned port
  4000,             // Use different ports to avoid conflicts
  4080,             // Another alternative
  4321,             // Uncommon port less likely to be in use
  0                 // Let OS assign random port as last resort
].filter(Boolean);  // Remove any undefined values

/**
 * Find an available port and start the server
 * This function tries each port in sequence, with smart fallback
 */
const findAvailablePortAndStart = async () => {
  let lastError = null;
  
  // Try each port in our preferred list
  for (const port of preferredPorts) {
    try {
      console.log(`Attempting to start server on port ${port}...`);
      const server = app.listen(port, '0.0.0.0');
      
      // Wait a moment to ensure server is fully started
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the actual server address (with safer access)
      const address = server.address();
      const actualPort = address ? address.port : port;
      
      console.log(`✅ SUCCESS! Server running on port ${actualPort}`);
      console.log(`   Health check: http://localhost:${actualPort}/health`);
      console.log(`   API info: http://localhost:${actualPort}/api/info`);
      
      // Graceful shutdown handling
      const shutdown = () => {
        console.log('Shutting down server gracefully...');
        server.close(() => {
          console.log('Server closed successfully');
          process.exit(0);
        });
      };
      
      // Register shutdown handlers
      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
      
      // Successfully started
      return;
    } catch (err) {
      lastError = err;
      console.log(`Could not use port ${port}: ${err.message}`);
    }
  }
  
  // If we get here, we couldn't start on any port
  console.error('Failed to start server on any port');
  console.error('Last error:', lastError);
  process.exit(1);
};

// Start the server on best available port
findAvailablePortAndStart().catch(err => {
  console.error('Unexpected error during server startup:', err);
  process.exit(1);
});