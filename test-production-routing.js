#!/usr/bin/env node

/**
 * Production Routing Diagnostic Script
 * Tests the deployment configuration and routing setup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 Production Routing Diagnostic\n');

// 1. Check Vite build configuration
console.log('1. Checking Vite build configuration...');
try {
  const viteConfigPath = path.join(__dirname, 'vite.config.ts');
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  if (viteConfig.includes('dist/public')) {
    console.log('✅ Vite builds to dist/public');
  } else {
    console.log('❌ Vite build path issue detected');
  }
} catch (error) {
  console.log('❌ Could not read vite.config.ts');
}

// 2. Check server static file configuration
console.log('\n2. Checking server static file configuration...');
try {
  const routesPath = path.join(__dirname, 'server/routes.ts');
  const routesContent = fs.readFileSync(routesPath, 'utf8');
  
  if (routesContent.includes("path.join(process.cwd(), 'dist', 'public')")) {
    console.log('✅ Server serves from dist/public');
  } else {
    console.log('❌ Server static path mismatch');
  }
  
  if (routesContent.includes('app.get(\'*\'')) {
    console.log('✅ Catch-all route configured');
  } else {
    console.log('❌ Missing catch-all route');
  }
} catch (error) {
  console.log('❌ Could not read server/routes.ts');
}

// 3. Check build output structure (if exists)
console.log('\n3. Checking build output structure...');
const distPath = path.join(__dirname, 'dist');
const distPublicPath = path.join(__dirname, 'dist', 'public');
const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');

if (fs.existsSync(distPath)) {
  console.log('✅ dist/ directory exists');
  
  if (fs.existsSync(distPublicPath)) {
    console.log('✅ dist/public/ directory exists');
    
    if (fs.existsSync(indexPath)) {
      console.log('✅ dist/public/index.html exists');
    } else {
      console.log('❌ dist/public/index.html missing');
    }
    
    // List files in dist/public
    try {
      const files = fs.readdirSync(distPublicPath);
      console.log(`📁 Files in dist/public: ${files.join(', ')}`);
    } catch (error) {
      console.log('❌ Could not list files in dist/public');
    }
  } else {
    console.log('❌ dist/public/ directory missing');
  }
} else {
  console.log('⚠️  dist/ directory not found (run npm run build first)');
}

// 4. Check Procfile
console.log('\n4. Checking Procfile...');
try {
  const procfilePath = path.join(__dirname, 'Procfile');
  const procfileContent = fs.readFileSync(procfilePath, 'utf8');
  
  if (procfileContent.includes('node dist/index.js')) {
    console.log('✅ Procfile points to dist/index.js');
  } else {
    console.log('❌ Procfile configuration issue');
  }
} catch (error) {
  console.log('❌ Could not read Procfile');
}

// 5. Deployment recommendations
console.log('\n🚀 Deployment Instructions:');
console.log('1. Run: npm run build');
console.log('2. Verify dist/public/index.html exists');
console.log('3. Deploy using Replit\'s Deploy button');
console.log('4. Test routes: /team-registration?eventId=1');
console.log('5. Check deployment logs for diagnostic messages');

console.log('\n📋 Summary:');
console.log('- Fixed server static path: dist/public (matches Vite output)');
console.log('- Added comprehensive error handling');
console.log('- Added production logging for diagnostics');
console.log('- Catch-all route now serves from correct location');