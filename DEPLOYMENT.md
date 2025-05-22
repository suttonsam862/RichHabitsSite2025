# Replit Deployment Guide

This guide provides instructions for deploying this TypeScript project on Replit.

## Configuration Summary

The application has been configured for proper deployment with the following settings:

- Server listens on `process.env.PORT` (defaulting to 3000) in production mode
- TypeScript configuration is set with proper output directory (`./dist`)
- ESBuild is used to bundle server-side code for production
- Development mode uses port 5000 for local testing

## Deployment Steps

1. **Verify Server Configuration**
   - The server is configured to use environment variables correctly
   - Health endpoint is available at `/health` for monitoring

2. **Run Deployment Check**
   ```
   ./scripts/deploy-production.sh
   ```
   This script checks that everything is properly configured and builds the server code.

3. **Deploy on Replit**
   - Click the "Deploy" button in the Replit interface
   - Replit will automatically run the build process using the configuration in `.replit`
   - The production server will start on the assigned port

4. **Verify Deployment**
   - Check that the application is accessible at your custom domain
   - Verify the health endpoint at `/health` returns `{"status":"ok"}`

## Environment Settings

Ensure these environment variables are properly set:

- `NODE_ENV`: Set to "production" for deployment
- `PORT`: Set automatically by Replit during deployment (defaults to 3000 if not set)
- `DATABASE_URL`: Connection string for your database
- All application API keys and secrets should be configured in the Secrets section

## Troubleshooting

If you encounter any deployment issues:

1. Check server logs for error messages
2. Verify that the server is listening on the correct port
3. Ensure all required environment variables are set
4. Confirm that the application builds correctly before deployment