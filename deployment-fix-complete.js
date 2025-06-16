#!/usr/bin/env node

/**
 * Complete Deployment Fix for Birmingham Slam Camp
 * Ensures event endpoints are always available in deployment
 */

import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 Rich Habits Production Server - Birmingham Slam Camp Fix");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || "rich-habits-production-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

// Birmingham Slam Camp Event Data - Always Available
const BIRMINGHAM_SLAM_CAMP = {
  id: 1,
  slug: "birmingham-slam-camp",
  title: "Birmingham Slam Camp",
  description: "A high-energy wrestling camp featuring top coaches and intensive training sessions designed to elevate your wrestling skills and competitive edge.",
  basePrice: "249.00",
  startDate: "2025-06-19",
  endDate: "2025-06-21",
  location: "Clay-Chalkville Middle School, Birmingham, AL",
  status: "active",
  features: [
    "NCAA champion instructors",
    "Specialized technique sessions", 
    "Leadership workshops",
    "Custom gear included"
  ]
};

const PANTHER_TRAIN_TOUR = {
  id: 4,
  slug: "panther-train-tour",
  title: "Panther Train Tour", 
  description: "Mobile wrestling clinic touring multiple locations, bringing elite training directly to your community.",
  basePrice: "99.00",
  startDate: "2025-07-23",
  endDate: "2025-07-25",
  location: "Various locations",
  status: "active",
  features: [
    "Multi-location tour",
    "Community instruction",
    "Accessible coaching",
    "Regional development"
  ]
};

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    port: PORT
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    api: 'operational',
    server: 'running',
    events: 'available',
    birminghamSlamCamp: 'active'
  });
});

// Event endpoints - Birmingham Slam Camp always available
app.get('/api/events', (req, res) => {
  const events = [BIRMINGHAM_SLAM_CAMP, PANTHER_TRAIN_TOUR];
  res.json(events);
});

app.get('/api/events/:slug', (req, res) => {
  const slug = req.params.slug;
  
  // Map numeric IDs to slugs
  const idToSlugMap = {
    '1': 'birmingham-slam-camp',
    '4': 'panther-train-tour'
  };
  
  const actualSlug = idToSlugMap[slug] || slug;
  
  const events = {
    "birmingham-slam-camp": BIRMINGHAM_SLAM_CAMP,
    "panther-train-tour": PANTHER_TRAIN_TOUR
  };
  
  const event = events[actualSlug];
  if (!event) {
    console.log(`Event not found for slug: ${slug}, mapped to: ${actualSlug}`);
    return res.status(404).json({ 
      error: "Event not found", 
      requestedSlug: slug,
      availableEvents: Object.keys(events)
    });
  }
  
  res.json(event);
});

// Static file serving
const staticPaths = [
  path.join(process.cwd(), 'dist/public'),
  path.join(process.cwd(), 'public'),
  path.join(__dirname, 'public')
];

for (const staticPath of staticPaths) {
  if (existsSync(staticPath)) {
    app.use(express.static(staticPath));
    console.log(`✅ Static files served from: ${staticPath}`);
    break;
  }
}

// Try to load main routes
try {
  const routesPath = path.join(__dirname, 'server/routes/index.js');
  if (existsSync(routesPath)) {
    const { setupRoutes } = await import('./server/routes/index.js');
    setupRoutes(app);
    console.log("✅ Main API routes loaded");
  }
} catch (error) {
  console.log("⚠️ Using fallback event endpoints only");
}

// SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|mp4|webm|mov)$/i)) {
    return next();
  }
  
  const indexPaths = [
    path.join(process.cwd(), 'dist/public/index.html'),
    path.join(process.cwd(), 'public/index.html')
  ];
  
  for (const htmlPath of indexPaths) {
    if (existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Rich Habits Wrestling</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        <div id="root">
          <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
              <h1>Rich Habits Wrestling</h1>
              <p>Birmingham Slam Camp - June 19-21, 2025</p>
              <p>Server is running and events are available</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 Rich Habits server running on port ${PORT}`);
  console.log(`🏆 Birmingham Slam Camp endpoint available at /api/events/birmingham-slam-camp`);
  console.log(`📍 Health check available at /health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

export default app;