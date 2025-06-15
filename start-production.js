#!/usr/bin/env node

/**
 * Production Start Script for Replit Deployment
 * Handles the start:production command requirement
 */

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('🚀 Starting Rich Habits in production mode');
console.log(`📍 Port: ${process.env.PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

// Import and start the main server
import('./dist/index.js')
  .then(() => {
    console.log('✅ Production server started successfully');
  })
  .catch(error => {
    console.error('❌ Failed to start production server:', error);
    process.exit(1);
  });