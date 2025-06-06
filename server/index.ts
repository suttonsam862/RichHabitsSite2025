import express from "express";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import path from "path";
import { fileURLToPath } from "url";

// Create Express application
const app = express();

// =============================================================================
// SECURITY MIDDLEWARE LAYER
// =============================================================================

// 1. CORS Configuration - Allow production domain and localhost for development
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      'https://rich-habits.com',
      'https://www.rich-habits.com',
      'https://richhabits.com',
      'https://www.richhabits.com',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'https://replit.dev',
      'https://*.replit.dev',
      'https://richhabitssite2025.replit.app',
      'https://*.replit.app'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development mode, be more permissive
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Check if origin matches allowed domains or subdomains
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return origin === allowedOrigin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 2. Helmet Security Headers with development-friendly CSP
const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com",
        "https://unpkg.com",
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com",
        "data:"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:", 
        "blob:",
        "https://images.unsplash.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'",
        "https://js.stripe.com",
        "https://unpkg.com",
        "https://cdn.jsdelivr.net",
        ...(isDevelopment ? ["'unsafe-eval'", "http://localhost:*"] : [])
      ],
      connectSrc: [
        "'self'", 
        "https://api.stripe.com",
        "https://*.supabase.co",
        "wss://",
        "ws://",
        ...(isDevelopment ? ["http://localhost:*", "ws://localhost:*"] : [])
      ],
      frameSrc: [
        "'self'", 
        "https://js.stripe.com", 
        "https://hooks.stripe.com"
      ],
      objectSrc: ["'none'"],
      ...(isDevelopment ? {} : { upgradeInsecureRequests: [] }),
    },
  },
  referrerPolicy: { policy: "no-referrer" }
}));

// Additional security headers
app.use((req, res, next) => {
  // Permissions Policy to disable unnecessary browser features
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(self)');
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
});

// 3. Rate Limiting Configuration
// Auth routes rate limiter - strict limits for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 requests per window per IP
  message: {
    error: 'Too many authentication attempts',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public API rate limiter - moderate limits for general API usage
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window per IP
  message: {
    error: 'Too many requests',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to specific routes
app.use('/api/admin/login', authLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/login', authLimiter);

// Apply general rate limiting to all API routes except webhooks
app.use('/api', (req, res, next) => {
  // Skip rate limiting for webhook endpoints
  if (req.path.includes('webhook') || req.path.includes('stripe-webhook')) {
    return next();
  }
  return publicLimiter(req, res, next);
});

// =============================================================================
// EXPRESS BODY PARSING MIDDLEWARE
// =============================================================================

// Configure Express middleware - Stripe webhook needs raw body first
app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get the current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files - production and development with cache headers
if (process.env.NODE_ENV === 'production') {
  // In production, serve built assets with proper headers for mobile
  const distPublicPath = path.resolve(process.cwd(), 'dist', 'public');
  console.log('Production: Serving static files from:', distPublicPath);
  app.use(express.static(distPublicPath, {
    setHeaders: (res, path) => {
      // Cache images for better mobile performance
      if (path.endsWith('.webp') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.JPG')) {
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Vary', 'Accept-Encoding');
      }
      // Fix MIME types for video files
      if (path.endsWith('.webm')) {
        res.setHeader('Content-Type', 'video/webm');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours for videos
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Vary', 'Accept-Encoding');
      }
      if (path.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours for videos
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Vary', 'Accept-Encoding');
      }
    }
  }));
  
  // Also serve from public folder for Rich Habits wrestling content
  const publicPath = path.resolve(process.cwd(), 'public');
  app.use(express.static(publicPath, {
    setHeaders: (res, path) => {
      if (path.endsWith('.webp') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.JPG')) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Vary', 'Accept-Encoding');
      }
      // Fix MIME types for video files
      if (path.endsWith('.webm')) {
        res.setHeader('Content-Type', 'video/webm');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Vary', 'Accept-Encoding');
      }
      if (path.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Vary', 'Accept-Encoding');
      }
    }
  }));
} else {
  // In development, serve from public folder with mobile-friendly headers
  const publicPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
  console.log('Development: Serving static files from:', publicPath);
  app.use(express.static(publicPath, {
    setHeaders: (res, path) => {
      if (path.endsWith('.webp') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.JPG')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour in dev
        res.setHeader('Vary', 'Accept-Encoding');
      }
      // Fix MIME types for video files in development
      if (path.endsWith('.webm')) {
        res.setHeader('Content-Type', 'video/webm');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Vary', 'Accept-Encoding');
      }
      if (path.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Vary', 'Accept-Encoding');
      }
    }
  }));
}

// =============================================================================
// SECURE SESSION CONFIGURATION
// =============================================================================

/*
 * LEGACY SESSION AUTHENTICATION - DEPRECATED
 * 
 * Previous implementation used session-based authentication with express-session.
 * This has been replaced with Supabase Auth using JWT tokens for better security.
 * Session configuration is maintained for backward compatibility but should be
 * phased out in favor of stateless JWT authentication.
 * 
 * Security improvements in current JWT implementation:
 * - Stateless authentication (no server-side session storage)
 * - Token-based authorization with proper expiration
 * - Supabase Auth integration with role-based access control
 */

app.use(
  session({
    secret: process.env.SESSION_SECRET || "richhabits2025secret",
    resave: false,
    saveUninitialized: false,
    name: 'richhabits.sid', // Custom session name for security
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'strict', // CSRF protection
    },
  })
);

// Start the server
async function startServer() {
  try {
    // Add health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', version: '1.0.0' });
    });

    // Add image optimization endpoint
    const { optimizeImage } = await import('./imageOptimizer.js');
    app.get('/api/images/*', optimizeImage);

    // Register all routes
    const server = await registerRoutes(app);

    // Add global error handling middleware
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Global error handler:', {
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      // Don't expose stack traces in production
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: isDevelopment ? err.message : 'Something went wrong',
        ...(isDevelopment && { stack: err.stack })
      });
    });

    // Setup Vite BEFORE any catch-all routes in development
    console.log("Setting up application...");
    if (process.env.NODE_ENV !== 'production') {
      // Wait for Vite setup to complete before starting server
      await setupVite(app, server);
      console.log("✅ Vite development server ready");
    } else {
      console.log('Production mode: Static files handled by routes.ts');
      
      // Catch-all handler for serving frontend (production only)
      app.get('*', (req, res) => {
        // Serve index.html for all non-API routes to enable client-side routing
        const indexPath = path.resolve(process.cwd(), 'dist', 'index.html');
        
        res.sendFile(indexPath, (err) => {
          if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).json({
              error: 'Server Error',
              message: 'Unable to serve the application'
            });
          }
        });
      });
    }

    // Catch-all 404 handler for API routes
    app.use('/api/*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `API endpoint ${req.path} not found`,
        path: req.path
      });
    });

    // Use PORT from environment with fallback - deployment uses PORT 
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : (process.env.NODE_ENV === 'production' ? 3000 : 5173);
    
    // Test database connection before starting server
    if (process.env.NODE_ENV === 'production') {
      console.log('Testing database connection...');
      try {
        const { checkDatabaseConnection } = await import('./db.js');
        const dbConnected = await checkDatabaseConnection();
        if (!dbConnected) {
          console.error('Database connection failed - starting anyway');
        }
      } catch (error) {
        console.error('Database setup error:', error);
      }
    }

    server.listen(port, '0.0.0.0', () => {
      console.log(`✅ Rich Habits server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🌐 Server address:`, server.address());
    });

    // Error handling
    server.on('error', (e: any) => {
      console.error('Server error:', e);
      if (e.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();