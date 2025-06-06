import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from './supabase.js';
import { storage } from './storage.js';

/**
 * Authentication middleware for enhanced security
 * Verifies the user's auth token from Supabase using service role
 */
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    // Get the auth token from the request header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication token is missing or invalid'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase using service role client
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid authentication token'
      });
    }
    
    // Attach the user to the request object
    req.user = data.user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: 'An error occurred during authentication'
    });
  }
}

/**
 * Admin authorization middleware
 * Ensures the user has admin privileges by checking user role
 */
export async function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  
  try {
    // First check if the user exists in our local database
    const user = await storage.getUserByUsername(req.user.email);
    
    if (user && user.isAdmin) {
      // User is in local database with admin role
      return next();
    }
    
    // Fallback: Check admin whitelist by email for common admin emails
    const adminEmails = [
      'admin@richhabits.com',
      'support@richhabits.com',
      'coach@richhabits.com'
    ];
    
    if (adminEmails.includes(req.user.email)) {
      // TODO: Consider auto-creating admin user in local database
      return next();
    }
    
    // Check if user has admin role in Supabase users table
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('is_admin, role')
      .eq('id', req.user.id)
      .single();
    
    if (!error && data && (data.is_admin || data.role === 'admin')) {
      return next();
    }
    
    // User does not have admin privileges
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'You do not have permission to access this resource'
    });
    
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: 'An error occurred during authorization'
    });
  }
}

/**
 * Helper function to extract user identity from authenticated request
 * Useful for logging and audit trails
 */
export function getUserIdentityFromRequest(req: Request): { email?: string; id?: string } {
  if (!req.user) {
    return {};
  }
  
  return {
    email: req.user.email,
    id: req.user.id
  };
}

/**
 * Optional middleware for routes that benefit from user context but don't require authentication
 * Sets req.user if valid token is provided, but doesn't block unauthenticated requests
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // Try to verify the token, but don't fail if invalid
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      
      if (!error && data.user) {
        req.user = data.user;
      }
    }
    
    next();
  } catch (error) {
    // Log error but continue without authentication
    console.warn('Optional auth error:', error);
    next();
  }
}

// Helper function to generate secure tokens
export function generateSecureToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    token += chars.charAt(array[i] % chars.length);
  }
  return token;
}

// Extend the Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}