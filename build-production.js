#!/usr/bin/env node

/**
 * Production Build Script with ES Module Fix
 * Builds the application with proper ES module configuration for deployment
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';

console.log('🔧 Starting production build with ES module fixes...');

try {
  // Step 1: Build client with Vite
  console.log('📦 Building client application...');
  execSync('NODE_OPTIONS="--max-old-space-size=2048" vite build --mode production', { 
    stdio: 'inherit' 
  });

  // Step 2: Build server with proper ES module configuration
  console.log('🔧 Building server with ES module configuration...');
  execSync(`esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --outfile-extension=.mjs --minify --define:__dirname="import.meta.url" --define:process.env.NODE_ENV='"production"'`, { 
    stdio: 'inherit' 
  });

  // Step 3: Create a production launcher script
  const productionLauncher = `#!/usr/bin/env node

/**
 * Production Server Launcher
 * Handles ES module imports and proper __dirname setup
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Set production environment
process.env.NODE_ENV = 'production';

// Enhanced error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// Import and start the main server
import('./index.mjs').catch(error => {
  console.error('🚨 Failed to start server:', error);
  process.exit(1);
});
`;

  writeFileSync('dist/server.mjs', productionLauncher);
  
  console.log('✅ Production build completed successfully!');
  console.log('📁 Built files:');
  console.log('   - Client: dist/public/');
  console.log('   - Server: dist/index.mjs');
  console.log('   - Launcher: dist/server.mjs');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}