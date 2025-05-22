#!/bin/bash
set -e

echo "===== Rich Habits Production Build ====="
echo "Starting production build process..."

# Make sure we're running from the project root
if [ ! -f "package.json" ]; then
  echo "ERROR: Must run from project root directory!"
  exit 1
fi

# Ensure all dependencies are installed
echo "Installing dependencies..."
npm install

# Build the client
echo "Building client-side application..."
npx vite build

# Create the dist directory if it doesn't exist
echo "Setting up build directories..."
mkdir -p dist

# Bundle server files for production
echo "Building server-side application..."
npx esbuild src/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Verify build was successful
if [ ! -f "dist/index.js" ]; then
  echo "ERROR: Build failed - dist/index.js was not created!"
  exit 1
fi

# Output instructions for deployment
echo ""
echo "===== Build completed successfully! ====="
echo ""
echo "Your application is ready for Replit deployment."
echo ""
echo "To start the server in production mode:"
echo "NODE_ENV=production node run-production.js"
echo ""
echo "For Replit deployment:"
echo "1. Click the 'Deploy' button in the Replit interface"
echo "2. The system will use the Procfile configuration"
echo ""
echo "===== Build process complete ====="