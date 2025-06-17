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

    // Bulletproof static file routes with comprehensive error handling
    app.get("/Cursive-Logo.webp", (req, res) => {
      const filePath = path.join(publicPath, 'Cursive-Logo.webp');
      res.sendFile(filePath, (err) => {
        if (err) {
          console.log('Logo file not found, serving fallback');
          res.status(404).send('Logo not found');
        }
      });
    });

    app.get("/images/*", (req, res) => {
      const filePath = path.join(publicPath, req.path);
      res.sendFile(filePath, (err) => {
        if (err) {
          console.log(`Image not found: ${req.path}`);
          res.status(404).send('Image not found');
        }
      });
    });

    app.get("/assets/*", (req, res) => {
      const filePath = path.join(publicPath, req.path);
      res.sendFile(filePath, (err) => {
        if (err) {
          console.log(`Asset not found: ${req.path}`);
          res.status(404).send('Asset not found');
        }
      });
    });

    // Generic image file handler
    app.get(/.*\.(jpg|jpeg|png|gif|svg|webp|ico|mp4|mov|webm)$/i, (req, res) => {
      const filePath = path.join(publicPath, req.path);
      res.sendFile(filePath, (err) => {
        if (err) {
          res.status(404).send('Image not found');
        }
      });
    });

    // Directory-specific routes
    app.use('/images', express.static(path.join(publicPath, 'images')));
    app.use('/assets', express.static(path.join(publicPath, 'assets')));
    app.use('/videos', express.static(path.join(publicPath, 'videos')));
    app.use('/designs', express.static(path.join(publicPath, 'designs')));
    app.use('/coaches', express.static(path.join(publicPath, 'coaches')));
    app.use('/events', express.static(path.join(publicPath, 'events')));

    // General static serving as fallback
    app.use(express.static(publicPath));
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