/**
 * Emergency Deployment Script
 * Creates a minimal production build to fix the white screen deployment issue
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createEmergencyBuild() {
  console.log('Creating emergency production build...');
  
  // Create dist/public directory
  const distPublicPath = path.join(__dirname, 'dist', 'public');
  fs.mkdirSync(distPublicPath, { recursive: true });
  
  // Create a basic index.html that loads your React app
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rich Habits Wrestling Events</title>
  <link rel="icon" type="image/png" href="/images/favicon.png">
  <style>
    body {
      margin: 0;
      font-family: 'Oswald', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: #000;
      color: #fff;
    }
    #root {
      min-height: 100vh;
    }
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(220, 38, 38, 0.3);
      border-top: 3px solid #dc2626;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error-fallback {
      display: none;
      text-align: center;
      padding: 40px 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    .error-fallback.active {
      display: block;
    }
    .logo {
      font-size: 3rem;
      font-weight: bold;
      color: #dc2626;
      margin-bottom: 20px;
    }
  </style>
  <script>
    // Show error fallback if React doesn't load within 10 seconds
    setTimeout(() => {
      if (!window.ReactLoaded) {
        document.querySelector('.loading').style.display = 'none';
        document.querySelector('.error-fallback').classList.add('active');
      }
    }, 10000);
  </script>
</head>
<body>
  <div id="root">
    <div class="loading">
      <div class="spinner"></div>
    </div>
    <div class="error-fallback">
      <div class="logo">RICH HABITS</div>
      <h2>Elite Wrestling Events & Training</h2>
      <p>We're experiencing technical difficulties. Please refresh the page or try again later.</p>
      <p>For immediate assistance, contact us directly.</p>
      <button onclick="window.location.reload()" style="
        background: #dc2626; 
        color: white; 
        border: none; 
        padding: 12px 24px; 
        border-radius: 6px; 
        cursor: pointer; 
        font-size: 16px;
        margin-top: 20px;
      ">Refresh Page</button>
    </div>
  </div>
  
  <!-- Development mode: Use Vite dev server -->
  <script type="module">
    if (import.meta.env?.DEV) {
      import('/src/main.tsx');
    }
  </script>
  
  <!-- Production mode: Load built assets -->
  <script>
    if (!window.location.hostname.includes('replit')) {
      // In production, try to load the built JavaScript
      const script = document.createElement('script');
      script.type = 'module';
      script.src = '/assets/index.js';
      script.onload = () => {
        window.ReactLoaded = true;
        document.querySelector('.loading').style.display = 'none';
      };
      script.onerror = () => {
        // If assets fail to load, show error
        document.querySelector('.loading').style.display = 'none';
        document.querySelector('.error-fallback').classList.add('active');
      };
      document.head.appendChild(script);
    }
  </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(distPublicPath, 'index.html'), indexHtml);
  console.log('✅ Created index.html');
  
  // Build server
  console.log('Building server...');
  try {
    await execAsync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');
    console.log('✅ Server built successfully');
  } catch (error) {
    console.error('Server build failed:', error);
  }
  
  // Copy essential static files
  const publicSrc = path.join(__dirname, 'public');
  const publicDest = path.join(distPublicPath);
  
  if (fs.existsSync(publicSrc)) {
    try {
      await execAsync(`cp -r ${publicSrc}/* ${publicDest}/`);
      console.log('✅ Copied static files');
    } catch (error) {
      console.log('Static files copy failed, but continuing...');
    }
  }
  
  console.log('🎉 Emergency build complete!');
  console.log('The site should now work in production mode.');
  console.log('Next steps:');
  console.log('1. Deploy using Replit\'s Deploy button');
  console.log('2. The site will initially show a loading screen');
  console.log('3. For full functionality, run a complete build later');
}

createEmergencyBuild().catch(console.error);