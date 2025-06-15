#!/usr/bin/env node

/**
 * Quick ES Module Fix for Deployment
 * Bypasses lengthy build to fix immediate deployment issues
 */

import { writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('⚡ Applying quick ES module fixes...');

try {
  // Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }

  // Create ES module compatible package.json for dist
  const distPackageJson = {
    "type": "module",
    "main": "index.js",
    "engines": {
      "node": ">=18.0.0"
    }
  };

  writeFileSync('dist/package.json', JSON.stringify(distPackageJson, null, 2));
  console.log('✅ Created ES module compatible dist/package.json');

  // Copy production server as the main entry point
  copyFileSync('production-server.js', 'dist/index.js');
  console.log('✅ Copied production server to dist/index.js');

  // Create Procfile for deployment
  const procfileContent = 'web: node production-server.js';
  writeFileSync('Procfile', procfileContent);
  console.log('✅ Created Procfile for deployment');

  // Create a deployment-ready start script
  const startProductionScript = `#!/usr/bin/env node

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
  console.log(\`Production server exited with code \${code}\`);
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
});`;

  writeFileSync('start-production.js', startProductionScript);
  console.log('✅ Created production start script');

  console.log('🎉 ES module fixes applied successfully!');
  console.log('📋 Deployment ready:');
  console.log('   - ES module compatible dist/package.json created');
  console.log('   - Production server ready at dist/index.js');
  console.log('   - Procfile configured for deployment');
  console.log('   - Start script available');

} catch (error) {
  console.error('❌ Fix failed:', error.message);
  process.exit(1);
}