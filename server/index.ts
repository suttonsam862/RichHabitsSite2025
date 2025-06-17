import express from "express";
import session from "express-session";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { setupRoutes } from "./routes/index.js";
import { setupVite } from "./vite";
import { checkDatabaseConnection } from "./db";

// Create Express application
const app = express();

// Logo API endpoint - MUST be first before any middleware
app.get("/api/logo", async (req, res) => {
  console.log('Logo API request received');
  
  try {
    const productionUrl = `https://rich-habits.com/Cursive-Logo.webp`;
    console.log('Fetching logo from:', productionUrl);
    const response = await fetch(productionUrl);
    
    if (response.ok) {
      console.log('Successfully fetched logo from production');
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(Buffer.from(buffer));
    } else {
      console.log('Production logo fetch failed with status:', response.status);
    }
  } catch (error) {
    console.log('Production logo fetch error:', error);
  }
  
  // Fallback SVG logo
  const logoSvg = `<svg width="140" height="40" viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        .logo-text { font-family: 'Brush Script MT', cursive; fill: #1f2937; }
        .logo-accent { fill: #dc2626; }
      </style>
    </defs>
    <text x="5" y="16" class="logo-text" font-size="14" font-style="italic">Rich</text>
    <text x="5" y="32" class="logo-text" font-size="14" font-style="italic">Habits</text>
    <line x1="50" y1="20" x2="135" y2="20" stroke="#dc2626" stroke-width="2" opacity="0.7"/>
    <circle cx="125" cy="12" r="2" class="logo-accent"/>
    <circle cx="132" cy="28" r="1.5" class="logo-accent"/>
  </svg>`;
  
  console.log('Serving fallback SVG logo');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(logoSvg);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get current directory in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rich-habits-dev-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
  }),
);

// Global error handling
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

async function startServer() {
  try {
    console.log("🧠 Starting Rich Habits server...");

    // Environment consistency check - force production mode for live Stripe keys
    const isLiveStripe = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_');
    if (isLiveStripe && process.env.NODE_ENV !== 'production') {
      console.log("🔄 Detected live Stripe keys - forcing production environment for consistency");
      process.env.NODE_ENV = 'production';
    }

    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 Stripe Mode: ${isLiveStripe ? 'LIVE' : 'TEST'}`);

    // Critical fix: Setup static file serving with highest priority
    const publicPath = path.resolve(process.cwd(), "public");
    const attachedAssetsPath = path.resolve(process.cwd(), "attached_assets");





    // Enhanced image serving with production fallback
    app.get("/images/*", async (req, res) => {
      const localPath = path.join(publicPath, req.path);
      
      // Try local file first
      if (existsSync(localPath)) {
        return res.sendFile(localPath);
      }
      
      // Fallback to production server
      try {
        const productionUrl = `https://rich-habits.com${req.path}`;
        const response = await fetch(productionUrl);
        
        if (response.ok) {
          console.log(`Serving from production: ${req.path}`);
          response.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });
          const buffer = await response.arrayBuffer();
          return res.send(Buffer.from(buffer));
        }
      } catch (error) {
        console.log(`Production fallback failed for ${req.path}`);
      }
      
      res.status(404).send('Image not found');
    });

    app.get("/assets/*", async (req, res) => {
      const localPath = path.join(publicPath, req.path);
      
      // Try local file first
      if (existsSync(localPath)) {
        return res.sendFile(localPath);
      }
      
      // Fallback to production server
      try {
        const productionUrl = `https://rich-habits.com${req.path}`;
        const response = await fetch(productionUrl);
        
        if (response.ok) {
          console.log(`Serving asset from production: ${req.path}`);
          const buffer = await response.arrayBuffer();
          
          // Set appropriate content type
          const ext = req.path.split('.').pop()?.toLowerCase();
          const contentType = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml'
          }[ext || ''] || 'image/jpeg';
          
          res.setHeader('Content-Type', contentType);
          return res.send(Buffer.from(buffer));
        }
      } catch (error) {
        console.log(`Production asset fallback failed for ${req.path}`);
      }
      
      res.status(404).send('Asset not found');
    });

    // Handle attached_assets requests with production fallback
    app.get("/attached_assets/*", async (req, res) => {
      const localPath = path.join(attachedAssetsPath, req.path.replace('/attached_assets/', ''));
      
      // Try local file first
      if (existsSync(localPath)) {
        return res.sendFile(localPath);
      }
      
      // Fallback to production server
      try {
        const productionUrl = `https://rich-habits.com${req.path}`;
        const response = await fetch(productionUrl);
        
        if (response.ok) {
          console.log(`Serving attached asset from production: ${req.path}`);
          const buffer = await response.arrayBuffer();
          
          // Set appropriate content type
          const ext = req.path.split('.').pop()?.toLowerCase();
          const contentType = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml'
          }[ext || ''] || 'image/jpeg';
          
          res.setHeader('Content-Type', contentType);
          return res.send(Buffer.from(buffer));
        }
      } catch (error) {
        console.log(`Production attached asset fallback failed for ${req.path}`);
      }
      
      res.status(404).send('Attached asset not found');
    });

    // Generic image file handler with production fallback
    app.get(/.*\.(jpg|jpeg|png|gif|svg|webp|ico|mp4|mov|webm)$/i, async (req, res) => {
      const filePath = path.join(publicPath, req.path);
      
      // Try local file first
      if (existsSync(filePath)) {
        return res.sendFile(filePath);
      }
      
      // Fallback to production server
      try {
        const productionUrl = `https://rich-habits.com${req.path}`;
        const response = await fetch(productionUrl);
        
        if (response.ok) {
          console.log(`Serving file from production: ${req.path}`);
          const buffer = await response.arrayBuffer();
          
          // Set appropriate content type
          const ext = req.path.split('.').pop()?.toLowerCase();
          const contentType = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
            'ico': 'image/x-icon',
            'mp4': 'video/mp4',
            'mov': 'video/quicktime',
            'webm': 'video/webm'
          }[ext || ''] || 'application/octet-stream';
          
          res.setHeader('Content-Type', contentType);
          return res.send(Buffer.from(buffer));
        }
      } catch (error) {
        console.log(`Production file fallback failed for ${req.path}`);
      }
      
      res.status(404).send('File not found');
    });

    // Directory-specific routes
    app.use('/images', express.static(path.join(publicPath, 'images')));
    app.use('/assets', express.static(path.join(publicPath, 'assets')));
    app.use('/videos', express.static(path.join(publicPath, 'videos')));
    app.use('/designs', express.static(path.join(publicPath, 'designs')));
    app.use('/coaches', express.static(path.join(publicPath, 'coaches')));
    app.use('/events', express.static(path.join(publicPath, 'events')));

    // General static serving as fallback (but exclude logo files to allow custom handling)
    app.use(express.static(publicPath, {
      setHeaders: (res, path) => {
        // Skip caching for logo files so our custom handler takes precedence
        if (path.includes('Cursive-Logo.webp')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
    app.use('/assets', express.static(attachedAssetsPath));

    console.log(`Static files configured from: ${publicPath}`);
    console.log(`Assets configured from: ${attachedAssetsPath}`);

    console.log("📡 Testing database connection...");
    try {
      const dbConnected = await checkDatabaseConnection();
      console.log(
        dbConnected ? "✅ Database connected" : "❌ Database connection failed",
      );
    } catch (err) {
      console.error("❌ Database connection failed, continuing with server startup:", err instanceof Error ? err.message : String(err));
    }

    // Health check endpoint for preview verification
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        environment: process.env.NODE_ENV || 'development',
        stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
        timestamp: new Date().toISOString(),
        preview: 'working',
        port: PORT,
        builtFiles: existsSync(path.resolve(process.cwd(), "dist/public/index.html"))
      });
    });

    // Preview status endpoint
    app.get('/preview-status', (req, res) => {
      const builtExists = existsSync(path.resolve(process.cwd(), "dist/public/index.html"));
      res.json({
        built: builtExists,
        environment: process.env.NODE_ENV,
        stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
        ready: true
      });
    });

    // Priority: Clean payment setup for Birmingham Slam Camp (bypasses all import issues)
    try {
      const cleanPaymentModule = await import("./clean-payment.js");
      cleanPaymentModule.setupCleanPayment(app);
      console.log("✅ Clean payment endpoint registered for Birmingham Slam Camp");
    } catch (err) {
      console.log("Clean payment setup failed, using fallback routes");
    }

    // Register app routes
    setupRoutes(app);

    // Import on-demand modules - with error handling
    try {
      const { setupDirectPaymentRoutes } = await import(
        "./payment-verification-direct.js"
      );
      setupDirectPaymentRoutes(app);
    } catch (err) {
      console.log("Direct payment routes not available, skipping");
    }

    try {
      const { setupLegacyBridge } = await import("./legacy-bridge.js");
      setupLegacyBridge(app);
    } catch (err) {
      console.log("Legacy bridge not available, skipping");
    }

    // Serve React app for all non-API routes
    app.get("*", (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith("/api/")) return next();

      // Always serve the built application for consistency
      const indexPath = path.resolve(process.cwd(), "dist/public/index.html");

      // Check if built files exist
      if (existsSync(indexPath)) {
        res.sendFile(indexPath, (err) => {
          if (err) {
            console.error("❌ Failed to serve index.html:", err);
            res.status(500).send("Internal Server Error");
          }
        });
      } else {
        // Fallback to development mode if no build exists
        if (process.env.NODE_ENV !== "production") {
          next(); // Let Vite handle it
        } else {
          res.status(500).send("Application not built. Run 'npm run build' first.");
        }
      }
    });

    const PORT = parseInt(process.env.PORT || "3000", 10);
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `✅ Rich Habits server running on http://0.0.0.0:${PORT} (${process.env.NODE_ENV || "development"})`,
      );
      console.log(`🌐 Preview URL: http://0.0.0.0:${PORT}`);
      console.log(`🔗 Public URL: Available via Replit preview`);
    });



    // Setup Vite middleware for development and when built files don't exist
    const builtIndexExists = existsSync(path.resolve(process.cwd(), "dist/public/index.html"));

    if (process.env.NODE_ENV !== "production" || !builtIndexExists) {
      try {
        await setupVite(app, server);
        console.log("✅ Vite middleware configured for development/preview");
      } catch (error) {
        console.error("❌ Vite middleware setup failed:", error);
        console.log("⚠️ Continuing without Vite middleware - preview may not work");
      }
    }

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log("\nShutting down gracefully...");
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
}

startServer();