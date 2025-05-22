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

// Serve static files - production and development
if (process.env.NODE_ENV === 'production') {
  // In production, serve built assets
  const distPublicPath = path.resolve(process.cwd(), 'dist', 'public');
  console.log('Production: Serving static files from:', distPublicPath);
  app.use(express.static(distPublicPath));
} else {
  // In development, serve from public folder
  const publicPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
  console.log('Development: Serving static files from:', publicPath);
  app.use(express.static(publicPath));
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
      // Start Vite setup in the background to speed up initialization
      setupVite(app, server).catch(err => console.error("Vite setup error:", err));
    } else {
      // In production, serve static files from the React build directory
      const clientDistPath = path.join(__dirname, '../client/dist');
      console.log(`Serving static files from: ${clientDistPath}`);
      app.use(express.static(clientDistPath));
      
      // Serve index.html for all routes not handled by the API to support client-side routing
      app.get('*', (req, res) => {
        // Skip API routes
        if (req.path.startsWith('/api/')) return;
        
        const indexPath = path.join(clientDistPath, 'index.html');
        console.log(`Serving index.html for client-side routing: ${req.path}`);
        res.sendFile(indexPath);
      });
    }

    // Use PORT from environment with fallback to 5000 (expected by workflow)
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`Server address:`, server.address());
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