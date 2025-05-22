import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import "express-session";
import multer from "multer";
import { pool, getDatabaseHealthStatus } from "./db.js";
import Stripe from "stripe";
import { approveRegistrations } from "./registrationApproval.js";
import { storage } from "./storage.js";
import { fixCompletedRegistrationsWithMissingInfo } from './completedRegistrationFix.js';
import { authenticateUser, authorizeAdmin } from './auth.js';
import { supabase } from './supabase.js';
import { 
  insertContactSubmissionSchema, 
  insertCustomApparelInquirySchema, 
  insertEventRegistrationSchema,
  insertNewsletterSubscriberSchema,
  insertCollaborationSchema,
  insertCoachSchema,
  insertEventCoachSchema
} from "../shared/schema.js";
import { z } from "zod";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});

// Configure multer for file uploads (store in memory)
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

// Extend SessionData to include our custom properties
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}

// Admin authentication middleware
const authenticateAdmin = (req: Request, res: Response, next: any) => {
  // Check if already authenticated in session
  if (req.session && req.session.isAdmin === true) {
    return next();
  }
  
  // For direct access to protected routes, allow admin credentials in body
  if (req.body && req.body.username === "admin" && req.body.password === "richhabits2025") {
    req.session = req.session || {};
    req.session.isAdmin = true;
    return next();
  }
  
  // Not authenticated
  console.log("Authentication failed, unauthorized access attempt");
  res.status(401).json({ error: "Unauthorized" });
};

// Verify if a payment intent is successful
async function verifyPaymentIntent(paymentIntentId: string): Promise<boolean> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Error verifying payment intent:', error);
    return false;
  }
}

// The fix function is already imported at the top of the file

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
  
  // API information endpoint (not at root to avoid interfering with the SPA)
  app.get("/api/info", (req, res) => {
    res.status(200).json({ 
      name: "Rich Habits API",
      status: "online",
      version: "1.0.0"
    });
  });
  
  // API endpoint to approve registrations and move them to completed
  app.post("/api/approve-registrations", authenticateAdmin, approveRegistrations);
  
  // API endpoint to fetch registrations with various filters
  app.get("/api/registrations", authenticateAdmin, async (req, res) => {
    try {
      // Get optional event ID filter from query parameters
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string, 10) : undefined;
      const paymentStatus = req.query.paymentStatus as string | undefined;
      
      // Fetch registrations from storage with filters
      const registrations = await storage.getEventRegistrations(eventId, paymentStatus);
      
      // Return the registrations
      res.status(200).json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });
  
  // API endpoint to fetch completed event registrations
  app.get("/api/completed-registrations", authenticateAdmin, async (req, res) => {
    try {
      // Get optional event ID filter from query parameters
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string, 10) : undefined;
      
      // Get optional payment verification filter
      const paymentVerified = req.query.paymentVerified as string | undefined;
      
      // Fetch completed registrations from storage with filters
      const completedRegistrations = await storage.getCompletedEventRegistrations(eventId, paymentVerified);
      
      // Return the completed registrations
      res.status(200).json(completedRegistrations);
    } catch (error) {
      console.error("Error fetching completed registrations:", error);
      res.status(500).json({ error: "Failed to fetch completed registrations" });
    }
  });

  // Get all events for the admin dashboard
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });
  
  // API endpoint to fetch a single event by ID
  app.get("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      res.status(200).json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });
  
  // Admin login endpoint with simplified approach
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    
    console.log("Login attempt for:", username);
    
    // Direct credential check for maximum reliability
    if (username === "admin" && password === "richhabits2025") {
      req.session = req.session || {};
      req.session.isAdmin = true;
      
      res.status(200).json({
        success: true,
        message: "Authentication successful"
      });
    } else {
      console.log("Login failed: Invalid credentials");
      res.status(401).json({
        success: false,
        message: "Authentication failed"
      });
    }
  });
  
  // Fix completed registrations with missing information
  app.post("/api/admin/fix-completed-registrations", authenticateAdmin, async (req, res) => {
    try {
      const dryRun = req.body.dryRun === true;
      const results = await fixCompletedRegistrationsWithMissingInfo(dryRun);
      
      res.status(200).json({
        success: true,
        results,
        message: `${dryRun ? '[DRY RUN] Would update' : 'Successfully updated'} ${results.updatedRecords} records (${results.skippedRecords} skipped out of ${results.totalProcessed} total)`
      });
    } catch (error: any) {
      console.error("Error fixing completed registrations:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fix completed registrations",
        details: error.message || "Unknown error"
      });
    }
  });

  // Enhanced security routes with Supabase
  app.get('/api/health', async (req, res) => {
    try {
      const dbStatus = await getDatabaseHealthStatus();
      res.json(dbStatus);
    } catch (error: any) {
      res.status(500).json({ 
        status: 'error', 
        message: error.message || 'Health check failed' 
      });
    }
  });

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }
      
      // Create user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.json({
        success: true,
        message: 'User registered successfully',
        user: data.user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  });
  
  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.json({
        success: true,
        message: 'Signed in successfully',
        session: data.session,
        user: data.user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Sign in failed'
      });
    }
  });
  
  app.post('/api/auth/signout', authenticateUser, async (req, res) => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.json({
        success: true,
        message: 'Signed out successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Sign out failed'
      });
    }
  });
  
  // User profile route (protected)
  app.get('/api/user/profile', authenticateUser, async (req, res) => {
    try {
      // Get user profile from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.json({
        success: true,
        profile: data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get profile'
      });
    }
  });

  // Admin routes (protected with admin authorization)
  app.get('/api/admin/users', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
      // Get all users from Supabase (admin only)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.json({
        success: true,
        users: data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get users'
      });
    }
  });

  // Stripe API endpoints for event registrations
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, eventId, registrationType, attendee } = req.body;
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      
      // Create a payment intent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency: "usd",
        metadata: {
          eventId: eventId.toString(),
          registrationType,
          attendeeName: `${attendee.firstName} ${attendee.lastName}`,
          attendeeEmail: attendee.email
        },
      });
      
      // Store registration information pending payment confirmation
      await storage.createEventRegistration({
        eventId,
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        email: attendee.email,
        phone: attendee.phone,
        registrationType,
        stripePaymentIntentId: paymentIntent.id,
        contactName: `${attendee.emergencyContact.name}`,
        medicalReleaseAccepted: true,
        tShirtSize: "L", // Default value
        grade: "N/A", // Default value
        schoolName: "N/A", // Default value
        age: attendee.age ? attendee.age : null,
        experience: attendee.experience || null
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        error: "Failed to create payment intent",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Webhook endpoint to handle Stripe events
  app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    let event;
    
    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(
        req.body,
        sig || '',
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    
    // Handle specific events
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      try {
        console.log(`Processing succeeded payment intent: ${paymentIntent.id}`);
        
        // Update the payment status in our database
        const updated = await storage.updateEventRegistrationPaymentStatus(
          paymentIntent.id,
          "succeeded" // Use "succeeded" to match Stripe's terminology
        );
        
        if (updated) {
          console.log(`Successfully updated registration for payment ${paymentIntent.id}`);
        } else {
          console.warn(`No registration found for payment ${paymentIntent.id}`);
        }
        
        // Additional actions like sending confirmation emails could go here
        
        console.log(`PaymentIntent ${paymentIntent.id} was successful!`);
      } catch (error) {
        console.error('Error processing successful payment:', error);
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      
      try {
        console.log(`Processing failed payment intent: ${paymentIntent.id}`);
        
        // Update the payment status in our database
        const updated = await storage.updateEventRegistrationPaymentStatus(
          paymentIntent.id,
          "failed"
        );
        
        if (updated) {
          console.log(`Updated registration status to failed for payment ${paymentIntent.id}`);
          
          // Get registration info to notify customer about the failure
          const registrations = await storage.getEventRegistrationsByPaymentIntent(paymentIntent.id);
          
          if (registrations && registrations.length > 0) {
            console.log(`Found ${registrations.length} registrations for failed payment, notifying customers`);
            
            // Here you could add logic to send notification emails to customers
            // about their failed payment and how to retry
          }
        } else {
          console.warn(`No registration found for failed payment ${paymentIntent.id}`);
        }
        
        console.log(`PaymentIntent ${paymentIntent.id} failed.`);
      } catch (error) {
        console.error('Error processing failed payment:', error);
      }
    }
    
    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({received: true});
  });

  // Serve frontend - catch-all route for Rich Habits wrestling site
  app.get('*', (req: Request, res: Response) => {
    // Skip API routes and webhooks
    if (req.path.startsWith('/api/') || req.path.startsWith('/webhook')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Serve the Rich Habits frontend
    if (process.env.NODE_ENV === 'production') {
      // Try multiple possible locations for the built files
      const possiblePaths = [
        path.resolve(process.cwd(), 'dist', 'public', 'index.html'),
        path.resolve(process.cwd(), 'dist', 'index.html'),
        path.resolve(__dirname, '..', 'dist', 'public', 'index.html'),
        path.resolve(__dirname, '..', 'public', 'index.html')
      ];
      
      let indexPath = '';
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          indexPath = testPath;
          break;
        }
      }
      
      console.log('🔍 Searching for Rich Habits index.html...');
      console.log('✅ Found at:', indexPath);
      
      if (indexPath && fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error('❌ Rich Habits site files not found in any expected location');
        res.status(500).send(`Rich Habits site not found. Searched: ${possiblePaths.join(', ')}`);
      }
    } else {
      // In development, let Vite handle the frontend
      res.status(404).send('Development mode - frontend handled by Vite');
    }
  });

  // Create Express HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}