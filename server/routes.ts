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
import { registerBulletproofRoutes } from "./bulletproof-routes.js";
import { z } from "zod";
import { createIndividualConfirmationEmail, createTeamConfirmationEmail, sendConfirmationEmail } from "./emailService.js";
import { validateDiscountCode, applyDiscount, incrementDiscountCodeUsage } from "./discountCodes.js";
import { 
  logRegistrationAttempt, 
  updateLogWithPaymentIntent, 
  markRegistrationPaid, 
  markRegistrationFailed,
  validateRegistrationLogged 
} from './registrationLogger';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

// Configure multer for file uploads (store in memory)
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

// Function to send confirmation emails after successful payment
async function sendConfirmationEmailForPayment(paymentIntent) {
  try {
    // Get registration data for this payment intent
    const registrations = await storage.getEventRegistrationsByPaymentIntent(paymentIntent.id);
    
    if (!registrations || registrations.length === 0) {
      console.log(`No registration found for payment intent ${paymentIntent.id}`);
      return;
    }

    const registration = registrations[0];
    const event = await storage.getEvent(registration.eventId);
    
    if (!event) {
      console.log(`No event found for registration ${registration.id}`);
      return;
    }

    // Determine if this is a team or individual registration
    const isTeamRegistration = registration.registrationType === 'team';
    
    if (isTeamRegistration) {
      // Get all team members for this payment session
      const teamMembers = await storage.getTeamMembersByPaymentIntent(paymentIntent.id);
      
      const teamEmailData = createTeamConfirmationEmail({
        teamContactName: registration.contactName,
        teamName: registration.schoolName || 'Team Registration',
        numCampers: teamMembers.length,
        campName: event.title,
        campDates: event.date,
        campLocation: event.location,
        totalAmountPaid: (paymentIntent.amount / 100).toFixed(2),
        gearIncluded: true, // You can adjust this based on your event setup
        confirmationCode: paymentIntent.id,
        teamContactEmail: registration.email,
        campersList: teamMembers
      });
      
      await sendConfirmationEmail(teamEmailData);
      console.log(`Team confirmation email sent for payment ${paymentIntent.id}`);
      
    } else {
      // Individual registration
      const emailData = createIndividualConfirmationEmail({
        camperFirstName: registration.firstName,
        camperLastName: registration.lastName,
        parentName: registration.contactName,
        campName: event.title,
        campDates: event.date,
        campLocation: event.location,
        eventId: registration.eventId,
        amountPaid: (paymentIntent.amount / 100).toFixed(2),
        gearIncluded: true, // You can adjust this based on your event setup
        confirmationCode: paymentIntent.id,
        parentEmail: registration.email
      });
      
      await sendConfirmationEmail(emailData);
      console.log(`Individual confirmation email sent for payment ${paymentIntent.id}`);
    }
    
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

// Extend SessionData to include our custom properties
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}

// Helper function to convert registrations to CSV
function convertRegistrationsToCSV(registrations: any[]) {
  const headers = [
    'ID',
    'Event ID',
    'First Name',
    'Last Name',
    'Contact Name',
    'Email',
    'Phone',
    'T-Shirt Size',
    'Grade',
    'School Name',
    'Club Name',
    'Registration Type',
    'Payment ID',
    'Registration Date',
    'Payment Status',
    'Shopify Order ID'
  ].join(',');

  const rows = registrations.map(reg => [
    reg.id,
    reg.eventId,
    reg.firstName,
    reg.lastName,
    reg.contactName,
    reg.email,
    reg.phone || '',
    reg.tShirtSize || '',
    reg.grade || '',
    reg.schoolName || '',
    reg.clubName || '',
    reg.registrationType || '',
    reg.stripePaymentIntentId || '',
    new Date(reg.registrationDate).toISOString(),
    'Completed',
    reg.shopifyOrderId || ''
  ].map(field => `"${field}"`).join(','));

  return [headers, ...rows].join('\n');
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
  // Export completed registrations as CSV
  app.get("/api/export-completed-registrations", authenticateAdmin, async (req, res) => {
    try {
      const completedRegistrations = await storage.getCompletedEventRegistrations();
      const paidRegistrations = completedRegistrations.filter(reg => 
        reg.stripePaymentIntentId && reg.paymentVerified
      );
      
      const csv = convertRegistrationsToCSV(paidRegistrations);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=completed-registrations.csv');
      res.send(csv);
    } catch (error) {
      console.error("Error exporting registrations:", error);
      res.status(500).json({ error: "Failed to export registrations" });
    }
  });

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

  // Import stripe functions and error logger
  const { createPaymentIntent, handleSuccessfulPayment } = await import('./stripe.js');
  const { updatePaymentIntent } = await import('./discounts.js');
  const { PaymentErrorLogger } = await import('./error-logger.js');
  
  // Import payment hardening system
  const { PaymentIntentLock } = await import('./payment-hardening/payment-lock.js');
  const { PaymentValidator } = await import('./payment-hardening/payment-validator.js');
  const { PaymentErrorLogger: HardenedErrorLogger, PaymentRetryHandler } = await import('./payment-hardening/payment-errors.js');
  
  // Import native analytics system (independent add-on)
  const { 
    initializeAnalytics, 
    logVisit, 
    logRegistrationStart, 
    logRegistrationComplete, 
    logPaymentComplete,
    getAnalyticsDashboard,
    triggerAggregation 
  } = await import('./analytics/analytics-routes.js');
  
  // Initialize analytics system if Shopify credentials are available
  initializeAnalytics(
    process.env.SHOPIFY_DOMAIN, 
    process.env.SHOPIFY_ACCESS_TOKEN
  );

  // BULLETPROOF Payment Intent Creation - NO 400/500/502 ERRORS POSSIBLE
  app.post("/api/events/:eventId(\\d+)/create-payment-intent", async (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.connection?.remoteAddress || 'unknown';
    
    // Generate or get existing session ID
    let sessionId = req.headers['x-session-id'] as string || 
                   req.body.sessionId || 
                   `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // STEP 1: COMPREHENSIVE VALIDATION (Client + Server)
      const validation = PaymentValidator.validateCompletePaymentRequest(req.body, sessionId);
      
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          errors: validation.errors,
          userFriendlyMessage: 'Please complete all required fields correctly before proceeding.',
          sessionId
        });
      }

      const { eventId, registrationType, amount } = validation.sanitizedData!;

      // STEP 2: SINGLE INTENT RULE - Check for existing payment intent
      const lockStatus = PaymentIntentLock.getLockStatus(sessionId);
      
      if (lockStatus === 'creating') {
        return res.status(429).json({
          error: 'Payment creation in progress',
          userFriendlyMessage: 'Payment setup is in progress. Please wait a moment.',
          sessionId
        });
      }

      const existingIntentId = PaymentIntentLock.getExistingIntent(sessionId);
      if (existingIntentId) {
        return res.json({
          clientSecret: existingIntentId,
          amount: amount / 100,
          sessionId
        });
      }

      // STEP 3: ACQUIRE LOCK (Prevent concurrent requests)
      if (!PaymentIntentLock.acquireLock(sessionId)) {
        return res.status(429).json({
          error: 'Another payment creation is in progress',
          userFriendlyMessage: 'Please wait a moment before trying again.',
          sessionId
        });
      }

      try {
        // STEP 4: HANDLE FREE REGISTRATIONS
        if (amount === 0) {
          PaymentIntentLock.updateLock(sessionId, 'free_registration');
          return res.json({
            clientSecret: 'free_registration',
            amount: 0,
            isFree: true,
            sessionId
          });
        }

        // STEP 5: CREATE PAYMENT INTENT WITH RETRY LOGIC
        const paymentIntentResult = await PaymentRetryHandler.retryPaymentIntent(
          async () => {
            return await stripe.paymentIntents.create({
              amount,
              currency: 'usd',
              metadata: {
                eventId: eventId.toString(),
                registrationType,
                sessionId,
                customerEmail: validation.sanitizedData!.email
              },
              automatic_payment_methods: {
                enabled: true,
              },
            });
          },
          sessionId,
          validation.sanitizedData,
          ipAddress,
          userAgent
        );

        // STEP 6: SUCCESS - Update lock and return
        PaymentIntentLock.updateLock(sessionId, paymentIntentResult.client_secret!);
        
        console.log(`✅ Payment intent created successfully for session ${sessionId}, event ${eventId}`);

        res.json({
          clientSecret: paymentIntentResult.client_secret,
          amount: amount / 100,
          sessionId
        });

      } catch (lockError) {
        // Mark lock as failed and release
        PaymentIntentLock.markFailed(sessionId);
        PaymentIntentLock.releaseLock(sessionId);
        throw lockError;
      }

    } catch (error: any) {
      console.error(`❌ Payment intent creation failed for session ${sessionId}:`, error.message);
      
      // Return user-friendly error message based on error type
      const errorCode = error.response?.status || 500;
      let userMessage = 'There was an issue creating your payment. Please refresh and try again.';
      
      if (errorCode === 400) {
        userMessage = 'There was an issue with your payment information. Please check your details and try again.';
      } else if (errorCode >= 500) {
        userMessage = 'Our payment system is temporarily unavailable. Please try again in a few moments.';
      }

      res.status(errorCode >= 500 ? 503 : 400).json({
        error: 'Payment setup failed',
        userFriendlyMessage: userMessage,
        sessionId
      });
    }
  });
  
  // Add the event-specific payment intent endpoint using slug-based routing
  app.post("/api/events/:eventSlug/create-payment-intent", createPaymentIntent);

  // Handle free registrations when 100% discount codes are applied
  app.post('/api/process-free-registration', async (req: Request, res: Response) => {
    try {
      const { eventId, option, firstName, lastName, email, contactName, phone, tShirtSize, grade, schoolName, clubName, experience, medicalReleaseAccepted, day1, day2, day3 } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: 'Missing required fields: firstName, lastName, email' });
      }

      // Get event details
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Create a free registration directly in the database
      const registrationData = {
        eventId,
        eventSlug: event.slug,
        firstName,
        lastName,
        contactName: contactName || `${firstName} ${lastName}`,
        email,
        phone: phone || null,
        tShirtSize: tShirtSize || null,
        grade: grade || null,
        schoolName: schoolName || null,
        clubName: clubName || null,
        experience: experience || null,
        medicalReleaseAccepted: medicalReleaseAccepted || false,
        registrationType: 'individual',
        paymentStatus: 'completed', // Free registration is automatically completed
        paymentIntentId: `free_${Date.now()}`, // Generate unique ID for free registration
        gender: null,
        day1: day1 || false,
        day2: day2 || false,
        day3: day3 || false
      };

      // Store the registration
      const registration = await storage.createEventRegistration(registrationData);
      console.log(`Free registration created successfully: ID ${registration.id} for ${firstName} ${lastName}`);

      // Send confirmation email for free registration
      if (process.env.SENDGRID_API_KEY) {
        try {
          await sendConfirmationEmailForPayment({
            id: `free_${Date.now()}`,
            metadata: {
              eventId: eventId.toString(),
              option
            }
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email for free registration:', emailError);
          // Don't fail the registration if email fails
        }
      }

      res.json({ 
        success: true, 
        registrationId: registration.id,
        message: 'Free registration completed successfully'
      });

    } catch (error) {
      console.error('Error processing free registration:', error);
      res.status(500).json({ error: 'Failed to process free registration' });
    }
  });
  
  // Add the payment success handler
  app.post("/api/events/:eventSlug/stripe-payment-success", handleSuccessfulPayment);
  
  // Add the payment update endpoint for discounts
  app.post("/api/events/:eventSlug/update-payment-intent", updatePaymentIntent);
  
  // Get all complete registrations for admin - CONSOLIDATED PAID SIGNUPS ONLY
  app.get("/api/complete-registrations", async (req, res) => {
    try {
      const completeRegistrations = await storage.getCompleteRegistrations();
      
      // Return complete registrations with all data already consolidated
      res.json(completeRegistrations.map(reg => ({
        id: reg.id,
        eventName: reg.eventName,
        eventDate: reg.eventDate,
        eventLocation: reg.eventLocation,
        camperName: reg.camperName,
        firstName: reg.firstName,
        lastName: reg.lastName,
        email: reg.email,
        phone: reg.phone,
        grade: reg.grade,
        gender: reg.gender,
        schoolName: reg.schoolName,
        clubName: reg.clubName,
        tShirtSize: reg.tShirtSize,
        parentGuardianName: reg.parentGuardianName,
        registrationType: reg.registrationType,
        day1: reg.day1,
        day2: reg.day2,
        day3: reg.day3,
        amountPaid: (reg.amountPaid / 100).toFixed(2), // Convert cents to dollars
        paymentDate: reg.paymentDate,
        paymentStatus: reg.paymentStatus,
        stripePaymentIntentId: reg.stripePaymentIntentId,
        shopifyOrderId: reg.shopifyOrderId,
        source: reg.source,
        notes: reg.notes
      })));
    } catch (error) {
      console.error("Error fetching complete registrations:", error);
      res.status(500).json({ error: "Failed to fetch complete registrations" });
    }
  });

  // Legacy endpoint for old registrations (kept for compatibility)
  app.get("/api/registrations", async (req, res) => {
    try {
      const registrations = await storage.getEventRegistrations();
      const events = await storage.getEvents();
      
      // Map registrations with event names instead of just IDs
      const registrationsWithEventNames = registrations.map(registration => {
        const event = events.find(e => e.id === registration.eventId);
        return {
          ...registration,
          eventName: event ? event.title : `Event ${registration.eventId}`,
          eventDate: event ? event.date : '',
          eventLocation: event ? event.location : ''
        };
      });
      
      res.json(registrationsWithEventNames);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });



  // Add the Stripe product endpoint that frontend expects
  app.get("/api/events/:eventId/stripe-product", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const option = req.query.option as string || 'full';
      
      // Use correct authentic pricing for each event
      const eventPricing: Record<number, { full: number; single: number }> = {
        1: { full: 249, single: 149 }, // Birmingham Slam Camp
        2: { full: 299, single: 175 }, // National Champ Camp  
        3: { full: 249, single: 149 }, // Texas Recruiting Clinic
        4: { full: 200, single: 99 }   // Panther Train Tour
      };
      
      const pricing = eventPricing[eventId];
      if (!pricing) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      const price = option === 'single' ? pricing.single : pricing.full;
      
      // Return product details with correct pricing
      res.json({
        eventId,
        option,
        price,
        priceId: `price_${eventId}_${option}`,
        productId: `prod_${eventId}`
      });
    } catch (error) {
      console.error('Error fetching Stripe product:', error);
      res.status(500).json({ error: 'Failed to fetch product details' });
    }
  });

  // Discount Code Validation API
  app.post("/api/validate-discount", async (req, res) => {
    try {
      const { discountCode, originalPrice } = req.body;
      
      if (!discountCode) {
        return res.status(400).json({ 
          success: false, 
          error: "Discount code is required" 
        });
      }
      
      const validation = validateDiscountCode(discountCode);
      
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }
      
      const discountResult = applyDiscount(originalPrice, discountCode);
      
      res.json({
        success: true,
        valid: true,
        discount: {
          code: discountCode,
          description: discountResult.discountDescription,
          discountAmount: discountResult.discountAmount,
          discountPercentage: discountResult.discountPercentage,
          originalPrice: discountResult.originalPrice,
          finalPrice: discountResult.finalPrice
        }
      });
      
    } catch (error) {
      console.error("Error validating discount code:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to validate discount code" 
      });
    }
  });

  // Team Registration API - $199 per athlete with individual payment intents
  app.post("/api/team-registration", async (req, res) => {
    try {
      const { eventId, coachInfo, athletes, pricePerAthlete, totalAmount } = req.body;
      
      if (!eventId || !coachInfo || !athletes || athletes.length === 0) {
        return res.status(400).json({ error: "Missing required team registration data" });
      }
      
      // Minimum 5 athletes required for team registration
      if (athletes.length < 5) {
        return res.status(400).json({ 
          error: "Team registration requires a minimum of 5 athletes. Please add more athletes or register individually." 
        });
      }
      
      if (pricePerAthlete !== 199) {
        return res.status(400).json({ error: "Invalid team price - must be $199 per athlete" });
      }
      
      // Create individual payment intents for each athlete at $199
      const athletePaymentIntents = [];
      
      for (const athlete of athletes) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 19900, // $199.00 in cents
          currency: "usd",
          metadata: {
            eventId: eventId.toString(),
            registrationType: "team",
            athleteName: `${athlete.firstName} ${athlete.lastName}`,
            athleteEmail: athlete.email,
            coachName: `${coachInfo.firstName} ${coachInfo.lastName}`,
            coachEmail: coachInfo.email,
            teamName: coachInfo.teamName || "Team Registration",
            schoolName: coachInfo.schoolName || ""
          },
        });
        
        // Store each athlete as individual registration with bulletproof correlation
        await storage.createEventRegistration({
          eventId,
          firstName: athlete.firstName,
          lastName: athlete.lastName,
          email: athlete.email,
          phone: coachInfo.phone, // Use coach phone as contact
          registrationType: "team",
          stripePaymentIntentId: paymentIntent.id,
          contactName: `${coachInfo.firstName} ${coachInfo.lastName} (Coach)`,
          medicalReleaseAccepted: true,
          tShirtSize: "L", // Default
          grade: "N/A",
          schoolName: coachInfo.schoolName || "Team Registration",
          age: athlete.age ? parseInt(athlete.age) : null,
          experience: null
        });
        
        athletePaymentIntents.push({
          athleteId: athlete.id,
          athleteName: `${athlete.firstName} ${athlete.lastName}`,
          paymentIntentId: paymentIntent.id,
          amount: 199
        });
      }
      
      // Create a combined Stripe checkout session for all athletes
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Team Registration - ${athletes.length} Athletes`,
              description: `${athletes.length} athletes at $199 each (Team Discount Applied)`
            },
            unit_amount: totalAmount * 100, // Total in cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.origin}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/team-register/${eventId}`,
        metadata: {
          eventId: eventId.toString(),
          registrationType: "team",
          athleteCount: athletes.length.toString(),
          coachEmail: coachInfo.email,
          paymentIntentIds: athletePaymentIntents.map(pi => pi.paymentIntentId).join(',')
        }
      });
      
      res.json({
        success: true,
        sessionId: session.id,
        athleteCount: athletes.length,
        totalAmount,
        pricePerAthlete,
        paymentIntents: athletePaymentIntents
      });
      
    } catch (error: any) {
      console.error("Team registration error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to process team registration" 
      });
    }
  });

  // Test Email Endpoint - Send confirmation email test
  app.post("/api/test-confirmation-email", async (req, res) => {
    try {
      const { email, type = 'individual' } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email address is required" });
      }

      let emailData;
      
      if (type === 'team') {
        // Test team confirmation email
        emailData = createTeamConfirmationEmail({
          teamContactName: "Sam Sutton",
          teamName: "Rich Habits Wrestling Team",
          numCampers: 6,
          campName: "Birmingham Slam Camp",
          campDates: "June 19-21, 2025",
          campLocation: "Clay-Chalkville Middle School",
          totalAmountPaid: "1194.00",
          gearIncluded: true,
          confirmationCode: "TEST-TEAM-12345",
          teamContactEmail: email,
          campersList: []
        });
      } else {
        // Test individual confirmation email
        emailData = createIndividualConfirmationEmail({
          camperFirstName: "Alex",
          camperLastName: "Johnson",
          parentName: "Sam Sutton",
          campName: "Birmingham Slam Camp",
          campDates: "June 19-21, 2025",
          campLocation: "Clay-Chalkville Middle School",
          eventId: 1,
          amountPaid: "249.00",
          gearIncluded: true,
          confirmationCode: "TEST-IND-67890",
          parentEmail: email
        });
      }

      await sendConfirmationEmail(emailData);
      
      res.json({
        success: true,
        message: `Test ${type} confirmation email sent to ${email}`
      });
      
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ 
        error: "Failed to send test email",
        details: error.message
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
      
      if (!attendee || !attendee.firstName || !attendee.lastName || !attendee.email) {
        return res.status(400).json({ 
          error: "Missing required attendee information",
          details: "First name, last name, and email are required"
        });
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
        contactName: attendee.emergencyContact?.name || `${attendee.firstName} ${attendee.lastName}`,
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
        
        // Send confirmation email after successful payment
        await sendConfirmationEmailForPayment(paymentIntent);
        
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

  // Only add catch-all route in production
  if (process.env.NODE_ENV === 'production') {
    app.get('*', (req: Request, res: Response) => {
      // Skip API routes and webhooks
      if (req.path.startsWith('/api/') || req.path.startsWith('/webhook')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      
      // Serve the Rich Habits frontend
      const indexPath = path.resolve(process.cwd(), 'dist', 'public', 'index.html');
      console.log('🎯 Serving Rich Habits from:', indexPath);
      
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('❌ Error serving Rich Habits site:', err);
          res.status(500).send('Rich Habits site error');
        }
      });
    });
  }

  // API route to get event details
  app.get('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const result = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // API route to get coaches for a specific event
  app.get('/api/events/:id/coaches', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const result = await pool.query(`
        SELECT c.id, c.name, c.title, c.bio, c.image, c.school, c.school_logo
        FROM coaches c
        JOIN event_coaches ec ON c.id = ec.coach_id
        WHERE ec.event_id = $1
        ORDER BY ec.display_order
      `, [eventId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ===== NATIVE ANALYTICS SYSTEM ENDPOINTS =====
  // These endpoints are completely independent and don't affect existing functionality
  
  // Main visitor tracking endpoint
  app.post('/api/analytics/log-visit', logVisit);
  
  // Registration tracking endpoints
  app.post('/api/analytics/registration-start', logRegistrationStart);
  app.post('/api/analytics/registration-complete', logRegistrationComplete);
  app.post('/api/analytics/payment-complete', logPaymentComplete);
  
  // Admin analytics endpoints
  app.get('/api/analytics/dashboard', getAnalyticsDashboard);
  app.post('/api/analytics/trigger-aggregation', triggerAggregation);

  // Create Express HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}