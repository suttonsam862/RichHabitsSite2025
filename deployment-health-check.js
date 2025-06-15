#!/usr/bin/env node

/**
 * Deployment Health Check Script
 * Ensures the server is ready for Replit deployment health checks
 */

import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Critical health check endpoint for deployment
app.get("/", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "rich-habits-wrestling",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    port: process.env.PORT || "5000"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Static files
const publicPath = existsSync("public") ? "public" : "../public";
if (existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// Fallback route
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Endpoint not found" });
  }
  
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Rich Habits Wrestling</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>Rich Habits Wrestling - Deployment Ready</h1>
  <p>Server is running on port ${process.env.PORT || "5000"}</p>
  <p>Status: Healthy</p>
  <p>Time: ${new Date().toISOString()}</p>
</body>
</html>`);
});

// Enhanced error handling
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Start server with deployment-compatible settings
const PORT = parseInt(process.env.PORT || "5000", 10);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Ready for deployment health checks`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});

export default app;