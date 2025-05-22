import express from "express";
import session from "express-session";
import path from "path";
import fs from "fs";

// Handle uncaught exceptions and unhandled rejections globally
process.on('uncaughtException', (error) => {
  console.error('FATAL ERROR: Uncaught Exception');
  console.error(error);
  // Don't exit immediately in production to allow logs to be written
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('FATAL ERROR: Unhandled Promise Rejection');
  console.error('Reason:', reason);
  // Don't exit immediately in production to allow logs to be written
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Deployment validation - ensure build artifacts exist
if (process.env.NODE_ENV === 'production') {
  const requiredFiles = ['dist/index.js'];
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.resolve(file)));
  
  if (missingFiles.length > 0) {
    console.error('FATAL ERROR: Missing required build artifacts');
    console.error('The following files are missing:', missingFiles.join(', '));
    console.error('Please run `npm run build` before starting the server');
    process.exit(1);
  }
}

// Create Express application
const app = express();

// Simple memory-based session
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

// Configure Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add cors headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Top-level health check endpoint before any route registration
// This ensures it's always accessible even if other routes fail
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Global error handler middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  
  // Don't leak stack traces in production
  const errorMessage = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'An internal server error occurred';
    
  res.status(500).json({ 
    error: 'Internal server error', 
    message: errorMessage
  });
});

// Start the server
async function startServer() {
  try {
    console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode...`);
    
    // Dynamic imports to ensure proper module resolution
    const { registerRoutes } = await import('./routes.js');
    
    // Only import Vite setup in development
    let setupVite = null;
    if (process.env.NODE_ENV !== 'production') {
      const viteModule = await import('./vite.js');
      setupVite = viteModule.setupVite;
    }
    
    // Register all routes
    const server = await registerRoutes(app);
    
    // Setup Vite only in development
    if (setupVite && process.env.NODE_ENV !== 'production') {
      await setupVite(app, server);
    }
    
    // Use the correct port for Replit deployment
    // Always use process.env.PORT (default 3000) in production for Replit
    const port = process.env.PORT || 3000;
      
    server.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server successfully started!`);
      console.log(`✅ Listening on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`✅ Health check available at http://localhost:${port}/health`);
    });
    
    // Handle server errors
    server.on('error', (e: any) => {
      console.error('FATAL ERROR: Server initialization failed');
      console.error(e);
      
      if (e.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please use a different port or free the current one.`);
      }
      
      process.exit(1);
    });
  } catch (error) {
    console.error("FATAL ERROR: Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(error => {
  console.error("FATAL ERROR: Server startup failed:", error);
  process.exit(1);
});