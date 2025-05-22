/**
 * Rich Habits Production Build Script
 * 
 * This script builds the application for production deployment
 * and ensures it will run correctly on Replit.
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility to run shell commands
const run = (command) => {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) console.error(`stderr: ${stderr}`);
      if (stdout) console.log(stdout);
      resolve(stdout);
    });
  });
};

// Main build function
async function buildForProduction() {
  try {
    console.log('🏗️  Starting Rich Habits production build...');

    // 1. Build the client with Vite
    console.log('\n📦 Building client-side application...');
    await run('npx vite build');
    
    // 2. Create dist directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, 'dist'))) {
      fs.mkdirSync(path.join(__dirname, 'dist'));
    }
    
    // 3. Check if our server.js exists
    const serverJsExists = fs.existsSync(path.join(__dirname, 'server.js'));
    if (!serverJsExists) {
      console.error('❌ server.js not found! Please create it first.');
      process.exit(1);
    }

    // 4. Check if our Procfile exists and has the right content
    const procfilePath = path.join(__dirname, 'Procfile');
    const procfileContent = 'web: node launch.js';
    
    if (!fs.existsSync(procfilePath)) {
      console.log('📄 Creating Procfile...');
      fs.writeFileSync(procfilePath, procfileContent);
    } else {
      const existingContent = fs.readFileSync(procfilePath, 'utf8');
      if (existingContent.trim() !== procfileContent) {
        console.log('📄 Updating Procfile...');
        fs.writeFileSync(procfilePath, procfileContent);
      }
    }

    // 5. Verify launcher exists
    const launcherPath = path.join(__dirname, 'launch.js');
    if (!fs.existsSync(launcherPath)) {
      console.log('📄 Creating launcher script...');
      const launcherContent = `/**
 * Rich Habits Production Launcher
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
  });`;
      fs.writeFileSync(launcherPath, launcherContent);
    }

    console.log('\n✅ Build completed successfully!');
    console.log('\nTo deploy on Replit:');
    console.log('1. Click the "Deploy" button in the Replit interface');
    console.log('2. Your application will be available at your Replit domain');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
buildForProduction();