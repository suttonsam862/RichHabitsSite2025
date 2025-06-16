#!/usr/bin/env node

/**
 * Production Deployment Server for Replit
 * Fixes all ES module compatibility issues and deployment requirements
 */

import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { existsSync, readFileSync } from "fs";

// Fix ES module __dirname issue
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 Starting Rich Habits production server...");
console.log("📍 Working directory:", process.cwd());
console.log("🌍 Environment:", process.env.NODE_ENV || "production");

const app = express();

// Enhanced middleware configuration
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "rich-habits-production-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Allow HTTP for Replit
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// Health check endpoints for deployment
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    api: 'operational',
    server: 'running',
    port: process.env.PORT || 5000
  });
});

// Static file serving with comprehensive paths
const staticPaths = [
  path.join(process.cwd(), 'dist/public'),
  path.join(process.cwd(), 'public'),
  path.join(__dirname, 'public'),
  path.join(__dirname, '../public')
];

let activeStaticPath = null;
for (const staticPath of staticPaths) {
  if (existsSync(staticPath)) {
    app.use(express.static(staticPath));
    activeStaticPath = staticPath;
    console.log(`✅ Static files served from: ${staticPath}`);
    break;
  }
}

if (!activeStaticPath) {
  console.warn("⚠️ No static directory found, creating fallback");
}

// Event API endpoints - always available for deployment
app.get('/api/events', (req, res) => {
  const events = [
    {
      id: 1,
      slug: "birmingham-slam-camp",
      title: "Birmingham Slam Camp",
      date: "June 19-21, 2025",
      location: "Birmingham, AL",
      price: "$249",
      description: "Elite wrestling techniques and training with top-tier coaches."
    },
    {
      id: 4,
      slug: "panther-train-tour",
      title: "Panther Train Tour",
      date: "July 23-25, 2025",
      location: "Multiple Locations",
      price: "$99",
      description: "Intensive training tour focusing on championship-level techniques."
    }
  ];
  res.json(events);
});

app.get('/api/events/:slug', (req, res) => {
  const slug = req.params.slug;
  
  // Map numeric IDs to slugs for compatibility
  const idToSlugMap = {
    '1': 'birmingham-slam-camp',
    '2': 'national-champ-camp',
    '3': 'texas-recruiting-clinic',
    '4': 'panther-train-tour'
  };
  
  const actualSlug = idToSlugMap[slug] || slug;
  
  const events = {
    "birmingham-slam-camp": {
      id: 1,
      slug: "birmingham-slam-camp",
      title: "Birmingham Slam Camp",
      description: "A high-energy wrestling camp featuring top coaches and intensive training sessions designed to elevate your wrestling skills and competitive edge.",
      basePrice: "249.00",
      startDate: "2025-06-19",
      endDate: "2025-06-21",
      location: "Clay-Chalkville Middle School, Birmingham, AL",
      status: "active",
      features: ["NCAA champion instructors", "Specialized technique sessions", "Leadership workshops", "Custom gear included"]
    },
    "panther-train-tour": {
      id: 4,
      slug: "panther-train-tour",
      title: "Panther Train Tour",
      description: "Mobile wrestling clinic touring multiple locations, bringing elite training directly to your community.",
      basePrice: "99.00",
      startDate: "2025-07-23",
      endDate: "2025-07-25",
      location: "Various locations",
      status: "active",
      features: ["Multi-location tour", "Community instruction", "Accessible coaching", "Regional development"]
    }
  };
  
  const event = events[actualSlug];
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }
  
  res.json(event);
});

// API route imports with error handling
try {
  // Import routes dynamically to handle missing modules gracefully
  const routesPath = path.join(__dirname, 'server/routes/index.js');
  if (existsSync(routesPath)) {
    const { setupRoutes } = await import('./server/routes/index.js');
    setupRoutes(app);
    console.log("✅ API routes loaded");
  } else {
    console.log("📝 Setting up basic API endpoints");
    
    // Basic API endpoints
    app.get('/api/test', (req, res) => {
      res.json({ message: 'API is working', timestamp: Date.now() });
    });
    
    app.get('/api/products', (req, res) => {
      res.json({ products: [], message: 'Products endpoint active' });
    });
  }
} catch (error) {
  console.error("⚠️ Route loading error:", error.message);
  
  // Fallback API endpoints for other routes
  app.get('/api/*', (req, res) => {
    res.status(503).json({
      error: 'Service temporarily unavailable',
      path: req.path,
      timestamp: Date.now()
    });
  });
}

// SPA routing - serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) return next();
  
  // Skip static files
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|mp4|webm|mov)$/i)) {
    return next();
  }
  
  // Find and serve index.html
  const indexPaths = [
    path.join(process.cwd(), 'dist/public/index.html'),
    path.join(process.cwd(), 'public/index.html'),
    path.join(__dirname, 'public/index.html'),
    path.join(__dirname, '../public/index.html')
  ];
  
  let indexPath = null;
  for (const htmlPath of indexPaths) {
    if (existsSync(htmlPath)) {
      indexPath = htmlPath;
      break;
    }
  }
  
  if (indexPath) {
    res.sendFile(indexPath);
  } else {
    // Fallback HTML
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rich Habits</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div id="root">
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
              <div style="text-align: center;">
                <h1>Rich Habits</h1>
                <p>Server is running successfully</p>
                <p>Build files are being prepared...</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: Date.now()
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Server startup with enhanced error handling
const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Rich Habits server running on http://${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "production"}`);
  console.log(`📁 Static path: ${activeStaticPath || "None"}`);
  console.log(`🚀 Deployment ready!`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} in use, trying alternate...`);
    // Try alternate port
    const altServer = app.listen(0, HOST, () => {
      const actualPort = altServer.address().port;
      console.log(`✅ Server started on alternate port: ${actualPort}`);
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Prevent crashes from unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit in production, just log
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

export default app;