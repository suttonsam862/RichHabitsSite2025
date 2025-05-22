// Production entry point for Replit deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set production environment
process.env.NODE_ENV = 'production';

// Check if we have the necessary files
const distIndexPath = path.join(__dirname, 'dist', 'index.js');

if (!fs.existsSync(distIndexPath)) {
  console.error('ERROR: Missing compiled server code!');
  console.error('The file dist/index.js was not found.');
  console.error('');
  console.error('Please run the build process before starting the production server:');
  console.error('1. npm run build  (to build both client and server)');
  console.error('');
  process.exit(1);
}

// Dynamically import the server
console.log('Starting Rich Habits server in production mode...');

import('./dist/index.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});