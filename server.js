// Simple direct server entry point for Replit deployment
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Set production environment
process.env.NODE_ENV = 'production';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Serve static files from 'dist' directory
const clientDistPath = path.join(__dirname, 'dist', 'client');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Catch-all route for client-side routing
app.get('*', (req, res) => {
  // Health check endpoint already handled above
  if (req.path === '/health') return;
  
  // If client build exists, serve index.html
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  // Fallback response if client build doesn't exist
  res.status(200).send('<h1>Rich Habits Server</h1><p>Server is running. The client application has not been built yet.</p>');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});