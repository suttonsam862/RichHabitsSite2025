import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building React client application...');

try {
  // Change to the client directory and run the build command
  process.chdir(path.join(__dirname, 'client'));
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('React build completed successfully!');
  
  // Ensure dist/public directory exists
  const publicDir = path.join(__dirname, 'dist/public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log(`Created directory: ${publicDir}`);
  }
  
  console.log('Build process completed!');
} catch (error) {
  console.error('Error building React app:', error.message);
  process.exit(1);
}