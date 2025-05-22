/**
 * Rich Habits Production Launcher
 * 
 * This file ensures that the application always runs in production mode
 * regardless of the workflow settings.
 */

// Set production environment
process.env.NODE_ENV = 'production';

// Import and run the server
console.log('🚀 Launching Rich Habits in PRODUCTION mode');
import('./server.js')
  .then(() => {
    console.log('✅ Server launched successfully in production mode');
  })
  .catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });