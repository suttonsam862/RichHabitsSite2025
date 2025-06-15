#!/usr/bin/env node

/**
 * ES Module Compatible Production Build Script
 * Fixes deployment issues with __dirname and ES module compatibility
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Starting ES module compatible production build...');

try {
  // Step 1: Build client with Vite
  console.log('📦 Building client application...');
  execSync('vite build --mode production', { stdio: 'inherit' });

  // Step 2: Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }

  // Step 3: Create ES module compatible package.json for dist
  const distPackageJson = {
    "type": "module",
    "main": "index.js",
    "engines": {
      "node": ">=18.0.0"
    }
  };

  writeFileSync('dist/package.json', JSON.stringify(distPackageJson, null, 2));
  console.log('✅ Created ES module compatible dist/package.json');

  // Step 4: Copy production server as the main entry point
  copyFileSync('production-server.js', 'dist/index.js');
  console.log('✅ Copied production server to dist/index.js');

  // Step 5: Create Procfile for deployment
  const procfileContent = 'web: node dist/index.js';
  writeFileSync('Procfile', procfileContent);
  console.log('✅ Created Procfile for deployment');

  // Step 6: Update .replit configuration
  const replitConfig = `modules = ["nodejs-20", "web", "postgresql-16"]

run = "npm run dev"

hidden = [".config", ".git", "generated-icon.png", "node_modules", "dist"]

[nix]
channel = "stable-24_05"
packages = ["jq", "ffmpeg", "lsof"]

[deployment]
deploymentTarget = "cloudrun"
build = ["sh", "-c", "node build-production-esm.js"]
run = ["sh", "-c", "node production-server.js"]

[[ports]]
localPort = 5000
externalPort = 80

[[ports]]
localPort = 3000
externalPort = 3000

[[ports]]
localPort = 4000
externalPort = 3001

[workflows]
runButton = "Start Dev Server"

[[workflows.workflow]]
name = "Start Dev Server"
author = "system"
mode = "sequential"

[[workflows.workflow.tasks]]
task = "packager.installForAll"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "DISABLE_VITE=false npm run dev"
waitForPort = 5000`;

  writeFileSync('.replit', replitConfig);
  console.log('✅ Updated .replit configuration for ES module deployment');

  console.log('🎉 ES module compatible production build completed successfully!');
  console.log('📋 Build summary:');
  console.log('   - Client built to dist/public/');
  console.log('   - ES module compatible server in dist/index.js');
  console.log('   - Package.json configured for ES modules');
  console.log('   - Deployment configuration updated');
  console.log('✅ Ready for deployment with: node production-server.js');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}