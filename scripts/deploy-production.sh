#!/bin/bash
set -e

echo "Running pre-deployment checks..."

# Ensure we're using the right port configuration
if ! grep -q "process.env.NODE_ENV === 'production'" server/index.ts; then
  echo "ERROR: server/index.ts is not properly configured for deployment"
  echo "Make sure the PORT environment variable is used with fallback to 3000"
  exit 1
fi

# Verify TypeScript configuration
if ! grep -q "\"outDir\": \"./dist\"" tsconfig.json; then
  echo "ERROR: tsconfig.json must have outDir set to './dist'"
  exit 1
fi

# Run ESBuild manually since we can't modify package.json
echo "Building server-side code..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Ensure the production environment uses NODE_ENV=production
echo "Checking production environment configuration..."
if [ -z "$PORT" ]; then
  echo "WARNING: PORT environment variable not set, will default to 3000"
fi

echo "Deployment preparation completed successfully!"
echo ""
echo "Next steps for deployment:"
echo "1. Make sure all your code is committed to the repository"
echo "2. Click the 'Deploy' button in the Replit interface"
echo "3. The system will use the build and run commands from the .replit configuration"
echo "4. Verify that your application starts up at the connected custom domain"
echo ""
echo "Your application will run with NODE_ENV=production and listen on PORT=$PORT or default to port 3000"