# Rich Habits Replit Deployment Guide

This guide provides comprehensive instructions for deploying your Rich Habits e-commerce platform on Replit, with specific solutions for the 502 Bad Gateway error.

## Replit Configuration

The application is now configured with robust deployment settings:

- Server automatically detects and uses the appropriate port (`process.env.PORT`)
- TypeScript compilation now correctly handles ESM modules
- Advanced error handling captures and logs all issues in production
- Health check endpoint provides deployment verification
- Proper handling of missing build files prevents silent failures

## Deployment Process

1. **Pre-Deployment Check**
   ```
   chmod +x scripts/deploy.sh && ./scripts/deploy.sh
   ```
   This script ensures all files are correctly compiled and ready for deployment.

2. **Manual Build**
   If the deployment script doesn't complete, follow these steps:
   ```
   # Compile TypeScript code
   npx tsc

   # Bundle server code for production
   npx esbuild src/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

   # Build client
   npx vite build
   ```

3. **Start Production Server**
   ```
   NODE_ENV=production node launch.js
   ```
   The launcher script includes additional error handling and verification.

4. **Deploy on Replit**
   - Click the "Run" button to verify everything works locally
   - Click the "Deploy" button in the Replit interface
   - The deployment will use the configurations set in `.replit`

5. **Verify Deployment**
   - The application should now be accessible at your custom domain
   - Check that the health endpoint returns a valid response:
   ```
   curl https://your-domain.com/health
   ```

## Fixing 502 Bad Gateway Errors

If you encounter a 502 Bad Gateway error:

1. **Check Server Logs**
   - Look for specific error messages in the Replit console
   - Verify the server started successfully

2. **Port Configuration**
   - Ensure the server is listening on the correct port (automatically set by Replit)
   - The code now uses `const port = parseInt(process.env.PORT || '3000', 10)` and doesn't specify host binding

3. **Build Process**
   - Check that all TypeScript files compiled correctly
   - The `dist` directory should contain the compiled JavaScript

4. **Module Resolution**
   - TypeScript is now configured with the Bundler module resolution
   - ESM imports are properly handled

5. **Domain Verification**
   - Ensure your domain is correctly linked to your Replit project
   - DNS settings should include the proper CNAME or A record
   - SSL certification should be active

## Environment Variables

Make sure these environment variables are properly set in the Replit Secrets panel:

- `NODE_ENV`: Should be "production" in deployment
- `PORT`: Automatically set by Replit (don't override)
- `DATABASE_URL`: Your PostgreSQL database connection string
- All API keys and external service credentials as listed in your environment secrets

## DNS Troubleshooting

If your domain isn't connecting:

1. Verify that the domain is properly verified in Replit
2. Check that DNS records are correct:
   - CNAME: `your-domain.com` should point to `your-repl-name.your-username.repl.co`
   - Allow up to 24 hours for DNS changes to propagate
3. SSL certificates are automatically provisioned by Replit