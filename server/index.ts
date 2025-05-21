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
    // Register all the routes
    const server = await registerRoutes(app);
    
    // Setup Vite for development environment
    await setupVite(app, server);
    
    // Add fallback/health route
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', version: '1.0.0' });
    });
    
    // Start listening on port
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();