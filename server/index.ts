import express from "express";
import session from "express-session";
import path from "path";
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
      console.error("❌ Database connection failed, continuing with server startup:", err.message);
    }

    // Register app routes
    setupRoutes(app);

    // Import on-demand modules
    const { setupDirectPaymentRoutes } = await import(
      "./payment-verification-direct.js"
    );
    setupDirectPaymentRoutes(app);

    const { setupLegacyBridge } = await import("./legacy-bridge.js");
    setupLegacyBridge(app);

    // Catch-all for client routes (after all APIs)
    if (process.env.NODE_ENV === "production") {
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/")) return next();
        const indexPath = path.resolve(process.cwd(), "dist/public/index.html");
        res.sendFile(indexPath, (err) => {
          if (err) {
            console.error("❌ Failed to serve index.html:", err);
            res.status(500).send("Internal Server Error");
          }
        });
      });
    }

    const PORT = parseInt(process.env.PORT || "5000", 10);
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `✅ Rich Habits server running on http://0.0.0.0:${PORT} (${process.env.NODE_ENV || "development"})`,
      );
    });

    // Setup Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      await setupVite(app, server);
      console.log("✅ Vite middleware configured for development");
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