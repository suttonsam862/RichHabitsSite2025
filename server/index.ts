import express from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import { createLogger } from "vite";

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

// Add cors headers manually for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Start the server
async function startServer() {
  try {
    // Add fallback/health route before route registration
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', version: '1.0.0' });
    });

    // Add an error handling middleware
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' });
    });
    
    // Register all the routes
    const server = await registerRoutes(app);
    
    // Setup Vite for development environment
    await setupVite(app, server);
    
    // Start listening on port with error handling
    const port = process.env.PORT || 5000;
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
    
    // Handle server errors
    server.on('error', (e) => {
      console.error('Server error:', e);
      if (e.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Try a different port.`);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();