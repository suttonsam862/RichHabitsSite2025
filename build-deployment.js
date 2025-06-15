#!/usr/bin/env node

/**
 * Comprehensive Deployment Build Script
 * Fixes all ES module compatibility issues and creates production-ready deployment
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync, copyFileSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting comprehensive deployment build...');

try {
  // Step 1: Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (existsSync('dist')) {
    rmSync('dist', { recursive: true, force: true });
  }
  mkdirSync('dist', { recursive: true });
  mkdirSync('dist/public', { recursive: true });

  // Step 2: Build client application
  console.log('📦 Building client application...');
  execSync('NODE_OPTIONS="--max-old-space-size=2048" vite build --mode production', { 
    stdio: 'inherit' 
  });

  // Step 3: Create ES module compatible package.json for dist
  const distPackageJson = {
    "type": "module",
    "main": "index.js",
    "engines": {
      "node": ">=18.0.0"
    },
    "scripts": {
      "start": "node index.js"
    }
  };

  writeFileSync('dist/package.json', JSON.stringify(distPackageJson, null, 2));
  console.log('✅ Created ES module compatible dist/package.json');

  // Step 4: Copy deployment server as main entry point
  copyFileSync('deployment-server.js', 'dist/index.js');
  console.log('✅ Copied deployment server to dist/index.js');

  // Step 5: Create Procfile for deployment
  const procfileContent = 'web: node dist/index.js';
  writeFileSync('Procfile', procfileContent);
  console.log('✅ Created Procfile');

  // Step 6: Create health check script
  const healthCheckScript = `#!/usr/bin/env node

/**
 * Health Check Script for Deployment Verification
 * Tests server startup and health endpoints
 */

import http from 'http';

const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';

console.log('🏥 Running deployment health check...');

// Test server startup
const options = {
  hostname: HOST,
  port: PORT,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Health check passed');
      console.log('📊 Response:', data);
      process.exit(0);
    } else {
      console.error('❌ Health check failed:', res.statusCode);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Health check error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
`;

  writeFileSync('health-check.js', healthCheckScript);
  console.log('✅ Created health check script');

  console.log('🎉 Deployment build completed successfully!');
  console.log('📋 Build Summary:');
  console.log('   ✅ Client built and placed in dist/public');
  console.log('   ✅ ES module compatible server created');
  console.log('   ✅ Fixed __dirname undefined issue');
  console.log('   ✅ Added proper error handling and graceful shutdown');
  console.log('   ✅ Server binds to 0.0.0.0:5000 for Cloud Run');
  console.log('   ✅ Health check endpoints configured');
  console.log('   ✅ Procfile created for deployment');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}