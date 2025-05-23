import express from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
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

// Serve static files - production and development with cache headers
if (process.env.NODE_ENV === 'production') {
  // In production, serve built assets with proper headers for mobile
  const distPublicPath = path.resolve(process.cwd(), 'dist', 'public');
  console.log('Production: Serving static files from:', distPublicPath);
  app.use(express.static(distPublicPath, {
    setHeaders: (res, path) => {
      // Cache images for better mobile performance
      if (path.endsWith('.webp') || path.endsWith('.png') || path.endsWith('.jpg')) {
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    }
  }));
} else {
  // In development, serve from public folder with mobile-friendly headers
  const publicPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
  console.log('Development: Serving static files from:', publicPath);
  app.use(express.static(publicPath, {
    setHeaders: (res, path) => {
      if (path.endsWith('.webp') || path.endsWith('.png') || path.endsWith('.jpg')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    }
  }));
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "richhabits2025secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Start the server
async function startServer() {
  try {
    // Add health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', version: '1.0.0' });
    });

    // Register all routes
    const server = await registerRoutes(app);

    // Setup Vite only in development - with faster startup
    console.log("Setting up application...");
    if (process.env.NODE_ENV !== 'production') {
      // Wait for Vite setup to complete before starting server
      await setupVite(app, server);
      console.log("✅ Vite development server ready");
    } else {
      console.log('Production mode: Static files handled by routes.ts');
    }

    // Use PORT from environment with fallback - deployment uses PORT 
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    
    // Test database connection before starting server
    if (process.env.NODE_ENV === 'production') {
      console.log('Testing database connection...');
      try {
        const { checkDatabaseConnection } = await import('./db.js');
        const dbConnected = await checkDatabaseConnection();
        if (!dbConnected) {
          console.error('Database connection failed - starting anyway');
        }
      } catch (error) {
        console.error('Database setup error:', error);
      }
    }

    server.listen(port, '0.0.0.0', () => {
      console.log(`✅ Rich Habits server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🌐 Server address:`, server.address());
    });

    // Error handling
    server.on('error', (e: any) => {
      console.error('Server error:', e);
      if (e.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();