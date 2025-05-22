import { Request, Response, NextFunction } from 'express';
import { supabase } from './supabase';

/**
 * Authentication middleware for enhanced security
 * Verifies the user's auth token from Supabase
 */
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  // Get the auth token from the request header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication token is missing or invalid'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
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
 * Ensures the user has admin privileges
 */
export async function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  
  try {
    // Check if the user has admin role in Supabase
    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', req.user.id)
      .single();
    
    if (error || !data || !data.is_admin) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      });
    }
    
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: 'An error occurred during authorization'
    });
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