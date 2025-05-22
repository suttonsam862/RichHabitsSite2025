#!/bin/bash
set -e

echo "Running TypeScript build check..."
npx tsc --noEmit

echo "Checking server configuration..."
# Verify port configuration is using environment variable
grep -q "process.env.PORT || 3000" server/index.ts || 
  { echo "ERROR: server/index.ts should use process.env.PORT with fallback to port 3000"; exit 1; }

echo "Verifying package.json scripts..."
# Check for required scripts
npm run | grep -q "\"build\":" || 
  { echo "ERROR: Missing build script in package.json"; exit 1; }
npm run | grep -q "\"start\":" || 
  { echo "ERROR: Missing start script in package.json"; exit 1; }

echo "Deployment check passed successfully!"
echo "The application is configured correctly for production deployment."