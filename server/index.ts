import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import session from "express-session";

// Hard-coded admin credentials for reliability
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "richhabits2025";

// Set admin credentials for use throughout the application
process.env.ADMIN_USERNAME = ADMIN_USERNAME;
process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'rich-habits-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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
    log(`Media file not found: ${filename}`, 'media');
    return next(); // File not found, pass to next handler
  }
  
  // Log for debugging
  log(`Serving media file: ${filename}`, 'media');
  
  // Detect device type for adaptive serving
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
  
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
  
  // Get file stats
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;
  
  // Handle range requests for better streaming (especially on mobile)
  const range = req.headers.range;
  if (range) {
    // Parse Range header value
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    
    // Validate range to prevent large chunk requests
    const chunkSize = Math.min(end - start + 1, 1024 * 1024 * 2); // 2MB max chunk size
    const adjustedEnd = start + chunkSize - 1;
    
    // Create HTTP response
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${adjustedEnd}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400', // Cacheable for 24 hours
      'Access-Control-Allow-Origin': '*' // Allow CORS for media files
    });
    
    // Stream the file chunk
    const stream = fs.createReadStream(filePath, { start, end: adjustedEnd });
    stream.on('error', (error) => {
      log(`Error streaming file ${filename}: ${error.message}`, 'media');
      if (!res.headersSent) {
        res.status(500).send('Error streaming file');
      }
    });
    
    stream.pipe(res);
  } else {
    // Serve the entire file at once (for smaller files)
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400', // Cacheable for 24 hours
      'Access-Control-Allow-Origin': '*' // Allow CORS for media files
    });
    
    const fileStream = fs.createReadStream(filePath);
    
    // Improved error handling
    fileStream.on('error', (error) => {
      log(`Error streaming file ${filename}: ${error.message}`, 'media');
      if (!res.headersSent) {
        res.status(500).send('Error streaming file');
      }
    });
    
    fileStream.pipe(res);
  }
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
