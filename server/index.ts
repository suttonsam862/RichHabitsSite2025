import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Special handler for media files to ensure correct MIME types
// This runs before all the catch-all handlers to ensure proper content-types
app.get('/assets/:filename', (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'public', 'assets', filename);
  
  if (!fs.existsSync(filePath)) {
    return next(); // File not found, pass to next handler
  }
  
  // Define MIME types based on file extensions
  const extension = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream'; // Default
  
  switch (extension) {
    case '.mp4':
      contentType = 'video/mp4';
      break;
    case '.mov':
      contentType = 'video/quicktime';
      break;
    case '.webm':
      contentType = 'video/webm';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.webp':
      contentType = 'image/webp';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
  }
  
  const fileStream = fs.createReadStream(filePath);
  res.setHeader('Content-Type', contentType);
  
  // Improved error handling
  fileStream.on('error', (error) => {
    log(`Error streaming file ${filename}: ${error.message}`, 'media');
    if (!res.headersSent) {
      res.status(500).send('Error streaming file');
    }
  });
  
  fileStream.pipe(res);
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
