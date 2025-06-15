#!/usr/bin/env node

/**
 * Production Server for Replit Deployment
 * ES Module compatible entry point with proper error handling
 */

import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { existsSync } from "fs";

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Essential middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rich-habits-production-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
  })
);

// Health check endpoints
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "rich-habits-wrestling",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    port: process.env.PORT || "5000",
    uptime: process.uptime()
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get("/api/test", (req, res) => {
  res.status(200).json({
    message: "API endpoint working",
    timestamp: new Date().toISOString()
  });
});

// Static file serving with ES module compatible paths
const publicPath = path.resolve(__dirname, "public");
const distPublicPath = path.resolve(__dirname, "dist", "public");

// Try different static file locations
if (existsSync(distPublicPath)) {
  console.log(`📁 Serving static files from: ${distPublicPath}`);
  app.use(express.static(distPublicPath));
} else if (existsSync(publicPath)) {
  console.log(`📁 Serving static files from: ${publicPath}`);
  app.use(express.static(publicPath));
} else {
  console.log("⚠️ No static files directory found");
}

// Image and asset serving with error handling
app.get("/images/*", (req, res) => {
  const imagePath = path.join(publicPath, req.path);
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.log(`Image not found: ${req.path}`);
      res.status(404).json({ error: "Image not found" });
    }
  });
});

app.get("/assets/*", (req, res) => {
  const assetPath = path.join(publicPath, req.path);
  res.sendFile(assetPath, (err) => {
    if (err) {
      console.log(`Asset not found: ${req.path}`);
      res.status(404).json({ error: "Asset not found" });
    }
  });
});

// Basic API endpoints for testing
app.get("/api/status", (req, res) => {
  res.json({
    status: "running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production"
  });
});

// Simple product endpoint for testing
app.get("/api/products", (req, res) => {
  res.json({
    message: "Products endpoint active",
    timestamp: new Date().toISOString()
  });
});

// Catch-all for client-side routing
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  // Try to serve index.html from different locations
  const indexPaths = [
    path.join(distPublicPath, "index.html"),
    path.join(publicPath, "index.html"),
    path.join(__dirname, "index.html")
  ];

  for (const indexPath of indexPaths) {
    if (existsSync(indexPath)) {
      return res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("Failed to serve index.html:", err);
          res.status(500).send("Internal Server Error");
        }
      });
    }
  }

  res.status(404).send("Application not found");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message
  });
});

// Global error handlers
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Start server
const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Rich Habits production server running on http://${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "production"}`);
  console.log(`📁 Static files: ${existsSync(distPublicPath) ? distPublicPath : publicPath}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} already in use`);
    process.exit(1);
  } else {
    console.error("❌ Server error:", err);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});

export default app;