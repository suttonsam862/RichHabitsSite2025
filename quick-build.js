/**
 * Quick Production Build Script
 * Optimized build process to avoid timeout issues
 */

import { build } from 'vite';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function quickBuild() {
  console.log('🚀 Starting optimized production build...');
  
  try {
    // Step 1: Build client with optimized settings
    console.log('📦 Building React client...');
    await build({
      root: path.resolve(__dirname, 'client'),
      build: {
        outDir: path.resolve(__dirname, 'dist/public'),
        emptyOutDir: true,
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              if (id.includes('node_modules')) {
                if (id.includes('lucide-react')) {
                  return 'lucide';
                }
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'react';
                }
                if (id.includes('@radix-ui')) {
                  return 'radix';
                }
                return 'vendor';
              }
            },
          },
        },
        chunkSizeWarningLimit: 1000,
        minify: 'esbuild',
        target: 'es2015',
      },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "client", "src"),
          "@shared": path.resolve(__dirname, "shared"),
          "@assets": path.resolve(__dirname, "attached_assets"),
        },
      },
    });
    
    console.log('✅ Client build completed');
    
    // Step 2: Build server
    console.log('🔧 Building server...');
    await execAsync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');
    
    console.log('✅ Server build completed');
    console.log('🎉 Production build successful!');
    
    // Verify build output
    console.log('\n📊 Build verification:');
    const { stdout } = await execAsync('ls -la dist/public/');
    console.log(stdout);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

quickBuild();