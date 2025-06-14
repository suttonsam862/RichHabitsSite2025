/**
 * Debug Middleware Order Script
 * Tests the actual middleware execution order for image requests
 */

import express from 'express';
import path from 'path';

const app = express();

// Debug middleware to trace requests
app.use((req, res, next) => {
  console.log(`📥 Request: ${req.method} ${req.url}`);
  next();
});

// Static file middleware (should handle images)
const publicPath = path.resolve(process.cwd(), "public");
console.log("Setting up static file serving from:", publicPath);
app.use(express.static(publicPath));

// Test specific routes
app.use('/images', express.static(path.join(publicPath, 'images')));
app.use('/assets', express.static(path.join(publicPath, 'assets')));

// Catch-all to see what's not being caught
app.use('*', (req, res) => {
  console.log(`❌ Unhandled request: ${req.originalUrl}`);
  res.status(404).send(`File not found: ${req.originalUrl}`);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Debug server running on http://localhost:${PORT}`);
  console.log("Test URLs:");
  console.log(`  http://localhost:${PORT}/Cursive-Logo.webp`);
  console.log(`  http://localhost:${PORT}/images/placeholder.svg`);
  console.log(`  http://localhost:${PORT}/assets/DSC09374--.JPG`);
});