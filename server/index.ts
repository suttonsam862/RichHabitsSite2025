import express from "express";
import session from "express-session";
import { setupRoutes } from "./routes/index.js";
import { setupVite } from "./vite";
import { checkDatabaseConnection } from "./db";
import path from "path";
import { fileURLToPath } from "url";

// Create Express application
const app = express();

// Configure Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get the current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
if (process.env.NODE_ENV === 'production') {
  // In production, serve built client files
  const distPublicPath = path.resolve(process.cwd(), 'dist/public');
  console.log('Production: Serving static files from:', distPublicPath);
  app.use(express.static(distPublicPath));
} else {
  // In development, serve public directory
  const publicPath = path.resolve(process.cwd(), 'public');
  console.log('Development: Serving static files from:', publicPath);
  app.use(express.static(publicPath));
}

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'rich-habits-dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Add global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
async function startServer() {
  try {
    console.log("Setting up application...");

    // Test database connection
    console.log('Testing database connection...');
    try {
      const dbConnected = await checkDatabaseConnection();
      if (!dbConnected) {
        console.error('Database connection failed - starting anyway');
      } else {
        console.log('✅ Database connection verified');
      }
    } catch (error) {
      console.error('Database setup error:', error);
    }

    // Register all routes
    setupRoutes(app);
    
    // Register direct payment verification routes
    const { setupDirectPaymentRoutes } = await import('./payment-verification-direct.js');
    setupDirectPaymentRoutes(app);
    
    // Setup legacy bridge for frontend form compatibility
    const { setupLegacyBridge } = await import('./legacy-bridge.js');
    setupLegacyBridge(app);

    // Catch-all handler for client-side routing in production
    if (process.env.NODE_ENV === 'production') {
      app.get('*', (req, res, next) => {
        // Skip API routes - let them return 404 if not found
        if (req.path.startsWith('/api/')) {
          return next();
        }
        
        // Serve React app for all other routes
        const indexPath = path.resolve(process.cwd(), 'dist/public/index.html');
        res.sendFile(indexPath, (err) => {
          if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Internal Server Error');
          }
        });
      });
    }

    // Create HTTP server with dynamic port assignment
    const PORT = parseInt(process.env.PORT || '3000', 10);
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Rich Habits server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log('🌐 Server address:', server.address());
    });

    // Setup Vite only in development
    if (process.env.NODE_ENV !== 'production') {
      await setupVite(app, server);
      console.log("✅ Vite development server ready");
    }

    // Error handling
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', error);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();