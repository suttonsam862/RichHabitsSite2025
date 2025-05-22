// Simple Express server to serve the static build files
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the React app build directory
const staticPath = path.join(__dirname, 'dist/public');
console.log(`Serving static files from: ${staticPath}`);
app.use(express.static(staticPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API endpoints can be added here
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve index.html for all other routes to support client-side routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) return;
  
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});