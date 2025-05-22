#!/bin/bash
set -e

echo "===== Rich Habits Deployment Script ====="
echo "Starting deployment process..."

# Make sure we're running from the project root
if [ ! -f "package.json" ]; then
  echo "ERROR: Must run from project root directory!"
  exit 1
fi

# Ensure all dependencies are installed
echo "Installing dependencies..."
npm install

# Correctly set up src directory structure
echo "Setting up source directory structure..."
mkdir -p src

# Check if we need to copy server files to src
if [ -d "server" ] && [ ! -f "src/index.ts" ]; then
  echo "Copying server files to src directory..."
  cp -r server/* src/
fi

# Create a build directory
echo "Creating build directory..."
mkdir -p dist

# Run TypeScript compiler to generate declaration files
echo "Compiling TypeScript..."
npx tsc --project tsconfig.json

# Bundle the server code
echo "Bundling server code..."
npx esbuild src/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Build the client
echo "Building client..."
npx vite build

# Verify the build succeeded
if [ ! -f "dist/index.js" ]; then
  echo "ERROR: Build failed, dist/index.js not found!"
  exit 1
fi

echo "===== Build completed successfully! ====="
echo ""
echo "To start the application in production mode:"
echo "NODE_ENV=production node dist/index.js"
echo ""
echo "To deploy on Replit:"
echo "1. Click the 'Run' button - it will use the Replit configuration"
echo "2. Verify that the server starts correctly and the health check passes"
echo "3. Click the 'Deploy' button in the Replit interface"
echo ""
echo "===== Deployment script complete ====="