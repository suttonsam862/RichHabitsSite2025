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

    // Setup high-priority static file serving with explicit routes
    const publicPath = path.resolve(process.cwd(), "public");
    const attachedAssetsPath = path.resolve(process.cwd(), "attached_assets");
    
    if (process.env.NODE_ENV === "production") {
      const distPublicPath = path.resolve(process.cwd(), "dist/public");
      console.log("📦 Production: Serving static files from", distPublicPath);
      
      // High priority static routes
      app.use('/images', express.static(path.join(distPublicPath, 'images')));
      app.use('/assets', express.static(path.join(distPublicPath, 'assets')));
      app.use('/videos', express.static(path.join(distPublicPath, 'videos')));
      app.use('/designs', express.static(path.join(distPublicPath, 'designs')));
      app.use(express.static(distPublicPath));
      app.use('/assets', express.static(attachedAssetsPath));
      console.log("📦 Production: Serving assets from", attachedAssetsPath);
    } else {
      console.log("🛠️ Development: Serving static files from", publicPath);
      
      // High priority static routes BEFORE any other middleware
      app.use('/images', express.static(path.join(publicPath, 'images')));
      app.use('/assets', express.static(path.join(publicPath, 'assets')));
      app.use('/videos', express.static(path.join(publicPath, 'videos')));
      app.use('/designs', express.static(path.join(publicPath, 'designs')));
      app.use(express.static(publicPath));
      app.use('/assets', express.static(attachedAssetsPath));
      console.log("🛠️ Development: Serving assets from", attachedAssetsPath);
    }

    console.log("📡 Testing database connection...");
    try {
      const dbConnected = await checkDatabaseConnection();
      console.log(
        dbConnected ? "✅ Database connected" : "❌ Database connection failed",
      );
    } catch (err) {
      console.error("❌ Error testing database:", err);
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

    // Setup Vite dev middleware with static file protection
    if (process.env.NODE_ENV !== "production") {
      // Force static file handling before Vite can intercept
      app.use((req, res, next) => {
        const isStaticFile = req.url.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|mp4|mov|webm|woff|woff2|ttf|eot|css|js|json)$/i);
        if (isStaticFile) {
          console.log(`🖼️ Static file request: ${req.url}`);
        }
        next();
      });
      
      await setupVite(app, server);
      console.log("✅ Vite dev server active");
    }

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} already in use`);
      } else {
        console.error("❌ Server error:", err);
      }
    });
  } catch (err) {
    console.error("❌ Fatal error during startup:", err);
    process.exit(1);
  }
}

// Start it
startServer();
