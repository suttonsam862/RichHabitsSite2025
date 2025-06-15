#!/usr/bin/env node

/**
 * Production Start Script for Replit Deployment
 * Ensures the server starts correctly on port 5000 for deployment health checks
 */

import { spawn } from 'child_process';

console.log('🚀 Starting Rich Habits production server...');

// Force port 5000 for deployment
process.env.PORT = '5000';
process.env.NODE_ENV = 'production';

const server = spawn('node', ['production-server.js'], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (err) => {
  console.error('❌ Failed to start production server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Production server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.kill('SIGINT');
});