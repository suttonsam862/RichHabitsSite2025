// Simple Express server for development and production
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// For the built client files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist/public'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve index.html for client-side routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) return;
  
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'dist/public/index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});