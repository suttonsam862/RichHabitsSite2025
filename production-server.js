import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express application
const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// API endpoint example
app.get('/api/info', (req, res) => {
  res.json({ 
    name: 'Rich Habits API',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Serve static files from dist/public (Vite's output directory)
const clientDistPath = path.join(__dirname, 'dist/public');
console.log(`Serving static files from: ${clientDistPath}`);
app.use(express.static(clientDistPath));

// Serve index.html for all other routes (client-side routing)
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) return;
  
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Client app not built. Run: npm run build');
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'production'} mode`);
  console.log(`Open: http://localhost:${PORT}`);
});