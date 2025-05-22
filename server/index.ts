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

// Serve static files from the public directory using a simpler approach
const publicPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
app.use(express.static(publicPath));

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

    // Setup Vite only in development
    if (process.env.NODE_ENV !== 'production') {
      await setupVite(app, server);
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

    // Use PORT from environment with fallback
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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