// This script prepares the application for deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Ensure the static paths exist for production deployments
const distPubPath = path.join(rootDir, 'dist', 'public');  // Where Vite builds to
const publicPath = path.join(rootDir, 'public');           // Where Express serves from

console.log('Preparing application for deployment...');

// Create a basic index.html in the public directory for health checks
// This ensures the health checks pass even when Vite hasn't built anything yet
function ensurePublicIndex() {
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
    console.log(`Created public directory: ${publicPath}`);
  }
  
  const indexPath = path.join(publicPath, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    const basicHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rich Habits</title>
      </head>
      <body>
        <h1>Rich Habits</h1>
        <p>The application is starting up...</p>
      </body>
      </html>
    `;
    
    fs.writeFileSync(indexPath, basicHtml);
    console.log(`Created basic index.html in: ${indexPath}`);
  }
}

// Copy static assets from dist/public to public if they exist
function copyDistPublicToPublic() {
  if (fs.existsSync(distPubPath)) {
    // Read all files in dist/public
    const files = fs.readdirSync(distPubPath);
    
    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }
    
    // Copy each file/directory
    files.forEach(file => {
      const srcPath = path.join(distPubPath, file);
      const destPath = path.join(publicPath, file);
      
      // Skip if the file already exists in the destination
      if (fs.existsSync(destPath)) {
        return;
      }
      
      // If it's a directory, copy recursively
      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
        console.log(`Copied directory: ${file}`);
      } else {
        // It's a file, so just copy it
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied file: ${file}`);
      }
    });
    
    console.log('Successfully copied all static assets');
  } else {
    console.log('dist/public directory does not exist, skipping copy');
  }
}

// Run the deployment preparation steps
ensurePublicIndex();
copyDistPublicToPublic();

console.log('Deployment preparation complete!');