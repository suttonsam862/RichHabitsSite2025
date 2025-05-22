# Rich Habits Deployment Guide

This guide explains how to properly deploy the Rich Habits e-commerce and event management platform on Replit.

## Deployment Steps

### 1. Build the Application

Before deploying, make sure to build both the client and server:

```bash
# Run from project root
npm run build
```

This command will:
- Build the React frontend using Vite
- Compile the TypeScript server code
- Generate all necessary files in the `dist` directory

### 2. Start the Application

There are two ways to run the application:

#### Development Mode

```bash
npm run dev
```

This starts the development server with hot-reloading enabled.

#### Production Mode

```bash
NODE_ENV=production node server.js
```

This starts the server in production mode, which is optimized for performance.

### 3. Deployment on Replit

Replit uses the `Procfile` to determine how to run your application. Our Procfile is already configured:

```
web: NODE_ENV=production node server.js
```

To deploy on Replit:

1. Click the "Deploy" button in the Replit interface
2. The system will use the Procfile to start the server
3. Your application will be available at your Replit domain

### 4. Troubleshooting 502 Bad Gateway Errors

If you're experiencing 502 Bad Gateway errors on Replit, try these solutions:

#### Solution 1: Verify Port Configuration

Make sure the server is listening on the right port. In production, use:

```javascript
const PORT = process.env.PORT || 3000;
```

This ensures the server binds to the port that Replit assigns.

#### Solution 2: Check Server Startup

Verify your server is starting correctly by checking the logs in the Replit console. Look for:

```
Server running on port [PORT] in production mode
```

#### Solution 3: Health Check

The application includes a health check endpoint at `/health`. Use this to verify the server is running:

```bash
curl https://your-replit-domain.repl.co/health
```

If this returns a 200 response, the server is working correctly.

#### Solution 4: Verify File Structure

Make sure your project has the right structure:

- Server code in `/src` directory
- Client build in `/dist/client` directory
- Entry point in `server.js`

#### Solution 5: Clear Replit Cache

Sometimes Replit caches can cause issues. Try:

1. Click on the three dots (...) next to the "Run" button
2. Select "Secrets"
3. Add a new secret with a random name and value
4. Delete the secret
5. Redeploy

This forces Replit to clear some of its caches.

### 5. Environment Variables

Make sure all required environment variables are set in the Replit Secrets panel:

- `STRIPE_SECRET_KEY`
- `SHOPIFY_ACCESS_TOKEN`
- `SHOPIFY_API_KEY`
- `SHOPIFY_STOREFRONT_TOKEN`
- `SHOPIFY_STORE_DOMAIN`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `DATABASE_URL`
- `UNIVERSAL_DISCOUNT_CODE`

### 6. Database

The application uses a PostgreSQL database. Make sure it's properly configured:

1. Verify the `DATABASE_URL` environment variable is set
2. Check the database connection in the logs
3. If needed, use the database UI in Replit to verify tables exist

### 7. Post-Deployment Checks

After deploying, verify:

1. The site loads correctly
2. API endpoints respond properly (test with the health endpoint)
3. Authentication works
4. Payment processing works 
5. Event registrations flow properly

## Maintenance

### Logs

To view logs in production:

1. Go to your Replit project
2. Click on the "Shell" tab
3. Run `tail -f .replit/logs/console.log`

### Updates

To update the deployed application:

1. Make your changes
2. Rebuild the application
3. Click "Deploy" in the Replit interface

## Advanced Troubleshooting

If you continue to experience issues:

1. Check if the server is binding to the right address (0.0.0.0)
2. Verify all dependencies are installed
3. Check for memory limitations
4. Ensure your Replit plan has sufficient resources
5. Try the simplified server.js entry point provided in this repo

## Help and Support

For further assistance with deployment issues:

- Email: admin@rich-habits.com
- Phone: +1 (480) 810-4477