// Production launcher script for Replit deployment
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Set production environment
process.env.NODE_ENV = 'production';

// Check if we have the compiled files
if (!fs.existsSync('./dist/index.js')) {
  console.error('ERROR: Missing compiled JavaScript files in dist/');
  console.error('Please run the build process before deploying');
  process.exit(1);
}

// Launch the server
console.log('Starting Rich Habits server in production mode...');
const server = spawn('node', ['dist/index.js'], {
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.kill('SIGTERM');
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});