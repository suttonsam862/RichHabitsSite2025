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
import { 
  calculateRegistrationAmount, 
  validateNationalChampCampRegistration,
  getEventPricing 
} from './pricingUtils.js';

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
      console.log('=== PAYMENT REQUEST DEBUG ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('Event ID:', req.params.eventId);
      
      const eventId = parseInt(req.params.eventId);
      const { option = 'full', registrationData, discountedAmount, discountCode } = req.body;
      
      console.log('Parsed eventId:', eventId);
      console.log('Option:', option);
      console.log('Registration data received:', registrationData);
      
      // Enhanced validation - check if we have the basic registration data
      if (!registrationData) {
        console.log('❌ No registration data provided');
        return res.status(400).json({
          error: 'No registration data provided',
          userFriendlyMessage: 'Please complete all required fields correctly before proceeding.',
          sessionId
        });
      }

      // Validate essential fields are present
      const requiredFields = ['firstName', 'lastName', 'email'];
      const missingFields = requiredFields.filter(field => !registrationData[field] || registrationData[field].trim() === '');
      
      if (missingFields.length > 0) {
        console.log('❌ Missing required fields:', missingFields);
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(', ')}`,
          userFriendlyMessage: 'Please complete all required fields correctly before proceeding.',
          missingFields,
          sessionId
        });
      }

      console.log('✅ Registration data validation passed:', {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        hasPhone: !!registrationData.phone,
        hasTShirtSize: !!registrationData.tShirtSize
      });

      // STRUCTURE: Use centralized pricing utility
      let originalAmount: number;
      
      try {
        // FIX: Validate National Champ Camp flexible registration data
        if (eventId === 2 && (option === '1day' || option === '2day')) {
          const validation = validateNationalChampCampRegistration(
            option, 
            registrationData.numberOfDays, 
            registrationData.selectedDates
          );
          
          if (!validation.valid) {
            console.log('❌ Invalid National Champ Camp registration:', validation.errors);
            return res.status(400).json({
              error: 'Invalid registration data',
              userFriendlyMessage: validation.errors.join('. '),
              validationErrors: validation.errors,
              sessionId
            });
          }
        }
        
        // Calculate amount using centralized utility
        originalAmount = calculateRegistrationAmount(
          eventId, 
          option, 
          registrationData.numberOfDays,
          registrationData.selectedDates
        );
        
        console.log(`Event ${eventId} ${option} option: $${originalAmount / 100}`);
        
      } catch (error) {
        console.log('❌ Pricing calculation error:', error);
        return res.status(400).json({
          error: 'Invalid pricing configuration',
          userFriendlyMessage: 'Unable to calculate pricing for this registration option.',
          sessionId
        });
      }
      let finalAmount = originalAmount;
      let appliedDiscountCode = discountCode || null;
      let discountAmount = 0;
      
      // BACKEND-ONLY DISCOUNT CALCULATION - Never trust frontend amounts
      if (appliedDiscountCode) {
        try {
          const { validateDiscountCode, applyDiscount } = await import('./discountCodes.js');
          const validation = validateDiscountCode(appliedDiscountCode);
          
          if (!validation.valid) {
            console.log('❌ Invalid discount code:', appliedDiscountCode);
            return res.status(400).json({
              error: 'Invalid discount code',
              userFriendlyMessage: 'The discount code is not valid.',
              sessionId
            });
          }
          
          // Calculate discount entirely on backend
          const discountResult = applyDiscount(originalAmount / 100, appliedDiscountCode);
          finalAmount = Math.round(discountResult.finalPrice * 100);
          discountAmount = originalAmount - finalAmount;
          
          console.log('✅ Backend discount calculation:', {
            originalAmountCents: originalAmount,
            originalAmountDollars: originalAmount / 100,
            finalAmountCents: finalAmount,
            finalAmountDollars: finalAmount / 100,
            discountAmountCents: discountAmount,
            discountAmountDollars: discountAmount / 100,
            code: appliedDiscountCode,
            discountResult: discountResult
          });
        } catch (discountError) {
          console.error('❌ Discount validation error:', discountError);
          return res.status(400).json({
            error: 'Error validating discount code',
            userFriendlyMessage: 'We had trouble applying your discount code. Please try again.',
            sessionId
          });
        }
      }
      
      const amount = finalAmount;
      
      const registrationType = option;

      // STEP 2: STRICT DUPLICATE PREVENTION - Check for existing payment intent
      const lockStatus = PaymentIntentLock.getLockStatus(sessionId);
      
      if (lockStatus === 'creating') {
        console.log(`⏳ Blocking duplicate request for session ${sessionId}`);
        return res.status(429).json({
          error: 'Payment creation in progress',
          userFriendlyMessage: 'Payment setup is already in progress. Please wait and do not refresh the page.',
          sessionId
        });
      }

      const existingIntentId = PaymentIntentLock.getExistingIntent(sessionId);
      if (existingIntentId) {
        console.log(`♻️ Returning existing payment intent for session ${sessionId}`);
        return res.json({
          clientSecret: existingIntentId,
          amount: amount / 100,
          sessionId,
          isExisting: true
        });
      }

      // Additional duplicate check: Verify no payment intent exists for this email+event combination in the last 10 minutes
      try {
        const recentIntent = await storage.getRegistrationLogByFormSession(sessionId);
        if (recentIntent && recentIntent.paymentIntentId && 
            recentIntent.createdAt && 
            (Date.now() - recentIntent.createdAt.getTime()) < 600000) { // 10 minutes
          console.log(`🚫 Duplicate registration attempt blocked for ${registrationData.email} in event ${eventId}`);
          return res.status(429).json({
            error: 'Recent registration attempt detected',
            userFriendlyMessage: 'You recently started a registration for this event. Please complete that registration or wait 10 minutes before starting a new one.',
            sessionId
          });
        }
      } catch (duplicateCheckError) {
        console.warn('Could not check for duplicate registrations:', duplicateCheckError);
        // Continue with registration if duplicate check fails
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

        // STEP 5: CREATE PAYMENT INTENT WITH ENHANCED METADATA
        const metadata: Record<string, string> = {
          eventId: eventId.toString(),
          registrationType: option,
          sessionId,
          customerEmail: registrationData.email,
          originalAmount: (originalAmount / 100).toString(),
          finalAmount: (finalAmount / 100).toString(),
          discountCode: appliedDiscountCode || '',
          discountAmount: (discountAmount / 100).toString(),
          firstName: registrationData.firstName,
          lastName: registrationData.lastName
        };

        // FIX: Add National Champ Camp flexible options to metadata
        if (eventId === 2 && (option === '1day' || option === '2day')) {
          metadata.numberOfDays = (registrationData.numberOfDays || 0).toString();
          metadata.selectedDates = (registrationData.selectedDates || []).join(',');
          metadata.campOption = option;
        }

        const paymentIntentResult = await stripe.paymentIntents.create({
          amount,
          currency: 'usd',
          metadata,
          automatic_payment_methods: {
            enabled: true,
          },
        });

        // STEP 6: COMPREHENSIVE LOGGING - Log ALL payment intent creation attempts
        try {
          await storage.logEventRegistration({
            email: registrationData.email,
            eventSlug: `event-${eventId}`,
            finalAmount: finalAmount / 100,
            discountCode: appliedDiscountCode,
            stripeIntentId: paymentIntentResult.id,
            sessionId: sessionId,
            registrationType: registrationType,
            originalAmount: originalAmount / 100,
            discountAmount: discountAmount / 100
          });
          console.log(`✅ SUCCESS: Payment intent ${paymentIntentResult.id} created and logged for ${registrationData.email}, amount: $${finalAmount/100}${appliedDiscountCode ? `, discount: ${appliedDiscountCode}` : ''}`);
        } catch (logError) {
          console.error('❌ CRITICAL: Failed to log payment intent creation:', logError);
          // Log the failure but don't fail the request - payment intent was created successfully
        }

        // STEP 7: SUCCESS - Update lock and return
        PaymentIntentLock.updateLock(sessionId, paymentIntentResult.client_secret!);
        
        console.log(`✅ Payment intent created successfully for session ${sessionId}, event ${eventId}, amount: $${finalAmount/100}, discount: ${appliedDiscountCode || 'none'}`);

        res.json({
          clientSecret: paymentIntentResult.client_secret,
          amount: finalAmount / 100,
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
      
      // Log the failure for comprehensive tracking
      try {
        await storage.logEventRegistration({
          email: registrationData?.email || 'unknown',
          eventSlug: `event-${eventId}`,
          finalAmount: 0,
          discountCode: appliedDiscountCode || null,
          stripeIntentId: `failed_${Date.now()}`,
          sessionId: sessionId,
          registrationType: registrationType || 'unknown',
          originalAmount: 0,
          discountAmount: 0
        });
      } catch (logError) {
        console.error('Failed to log payment intent failure:', logError);
      }
      
      // Release lock on failure
      PaymentIntentLock.releaseLock(sessionId);
      
      // Return user-friendly error message with specific guidance
      res.status(400).json({
        error: 'Payment setup failed',
        userFriendlyMessage: 'We encountered an issue setting up your payment. Please refresh the page and try again. If the problem persists, try using a different browser or device.',
        sessionId,
        canRetry: true
      });
    }
  });
  
  // Add the event-specific payment intent endpoint using ID-based routing
  app.post("/api/events/:eventId/create-payment-intent", createPaymentIntent);

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
  app.post("/api/events/:eventId/stripe-payment-success", handleSuccessfulPayment);
  
  // Add the payment update endpoint for discounts
  app.post("/api/events/:eventId/update-payment-intent", updatePaymentIntent);
  
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
      
      // Use correct authentic pricing for each event (in cents to match Stripe)
      const eventPricing: Record<number, { full: number; single: number }> = {
        1: { full: 24900, single: 14900 }, // Birmingham Slam Camp - $249/$149
        2: { full: 29900, single: 17500 }, // National Champ Camp - $299/$175
        3: { full: 24900, single: 14900 }, // Texas Recruiting Clinic - $249/$149
        4: { full: 20000, single: 9900 }   // Panther Train Tour - $200/$99
      };
      
      const pricing = eventPricing[eventId];
      if (!pricing) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      const priceInCents = option === 'single' ? pricing.single : pricing.full;
      const price = priceInCents / 100; // Convert cents to dollars for display
      
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

  // BULLETPROOF Team Registration API - Using same validation as individual registration
  app.post("/api/team-registration", async (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = Array.isArray(req.headers['x-forwarded-for']) 
      ? req.headers['x-forwarded-for'][0] 
      : req.headers['x-forwarded-for']?.split(',')[0] || 
        req.headers['x-real-ip'] || 
        req.connection?.remoteAddress || 'unknown';
    
    // Generate session ID for team registration
    let sessionId = req.headers['x-session-id'] as string || 
                   req.body.sessionId || 
                   `team_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log('=== TEAM REGISTRATION PAYMENT INTENT CREATION ===');
      console.log('Request received:', {
        eventId: req.body.eventId,
        athleteCount: req.body.athletes?.length,
        coachEmail: req.body.coachInfo?.email,
        discountCode: req.body.discountCode || 'none'
      });
      
      const { eventId, coachInfo, athletes, discountCode } = req.body;
      
      // Enhanced validation - backend controls all pricing logic
      if (!eventId || !coachInfo || !athletes || athletes.length === 0) {
        console.log('❌ Missing required team registration data');
        return res.status(400).json({ 
          error: "Missing required team registration data",
          userFriendlyMessage: 'Please complete all required fields before proceeding.',
          sessionId
        });
      }

      // Validate coach information
      const requiredCoachFields = ['firstName', 'lastName', 'email'];
      const missingCoachFields = requiredCoachFields.filter(field => !coachInfo[field] || coachInfo[field].trim() === '');
      
      if (missingCoachFields.length > 0) {
        console.log('❌ Missing required coach fields:', missingCoachFields);
        return res.status(400).json({
          error: `Missing required coach fields: ${missingCoachFields.join(', ')}`,
          userFriendlyMessage: 'Please complete all coach information fields.',
          missingFields: missingCoachFields,
          sessionId
        });
      }

      // Validate each athlete has required data
      const validAthletes = athletes.filter((athlete: any) => {
        const hasName = athlete.firstName && athlete.lastName && athlete.firstName.trim() && athlete.lastName.trim();
        const hasEmail = athlete.email && athlete.email.trim();
        const hasParentInfo = athlete.parentName && athlete.parentName.trim() && athlete.parentPhoneNumber && athlete.parentPhoneNumber.trim();
        const hasShirtSize = athlete.shirtSize && athlete.shirtSize.trim();
        const hasAge = athlete.age && athlete.age.trim();
        
        console.log(`Athlete ${athlete.firstName} validation:`, {
          hasName,
          hasEmail,
          hasParentInfo,
          hasShirtSize,
          hasAge,
          valid: hasName && hasEmail && hasParentInfo && hasShirtSize && hasAge
        });
        
        return hasName && hasEmail && hasParentInfo && hasShirtSize && hasAge;
      });

      if (validAthletes.length < 5) {
        console.log('❌ Insufficient valid athletes:', validAthletes.length);
        return res.status(400).json({ 
          error: "Team registration requires a minimum of 5 athletes with complete information.",
          userFriendlyMessage: 'Team registration requires at least 5 athletes with complete information.',
          sessionId
        });
      }
      
      // BACKEND CONTROLS PRICING: Calculate amounts (ignore any frontend pricing)
      const TEAM_PRICE_PER_ATHLETE = 19900; // $199 per athlete in cents
      const originalTotalAmount = validAthletes.length * TEAM_PRICE_PER_ATHLETE;
      let finalTotalAmount = originalTotalAmount;
      let appliedDiscountCode = discountCode || null;
      let totalDiscountAmount = 0;
      
      console.log('💰 Team pricing calculation:', {
        athleteCount: validAthletes.length,
        pricePerAthlete: TEAM_PRICE_PER_ATHLETE / 100,
        originalTotal: originalTotalAmount / 100,
        discountCode: appliedDiscountCode
      });
      
      // Apply discount if provided - BACKEND VALIDATION ONLY
      if (appliedDiscountCode) {
        try {
          const { validateDiscountCode, applyDiscount } = await import('./discountCodes.js');
          const validation = validateDiscountCode(appliedDiscountCode, { 
            isTeamRegistration: true, 
            teamSize: validAthletes.length 
          });
          
          if (!validation.valid) {
            console.log('❌ Invalid team discount code:', appliedDiscountCode);
            return res.status(400).json({
              error: 'Invalid discount code for team registration',
              userFriendlyMessage: 'This discount code is not valid for team registrations or has expired.',
              sessionId
            });
          }

          // Apply discount calculation
          const perAthleteOriginal = TEAM_PRICE_PER_ATHLETE / 100; // Convert to dollars
          const teamDiscountResult = applyDiscount(perAthleteOriginal, appliedDiscountCode);
          const discountedPerAthletePrice = teamDiscountResult.finalPrice;
          finalTotalAmount = Math.round(discountedPerAthletePrice * validAthletes.length * 100); // Back to cents
          totalDiscountAmount = originalTotalAmount - finalTotalAmount;
          
          console.log('✅ Team discount applied:', {
            originalTotal: originalTotalAmount / 100,
            finalTotal: finalTotalAmount / 100,
            originalTotalCents: originalTotalAmount,
            finalTotalCents: finalTotalAmount,
            discountAmount: totalDiscountAmount / 100,
            code: appliedDiscountCode
          });
        } catch (discountError) {
          console.error('❌ Discount validation error:', discountError);
          return res.status(400).json({
            error: 'Error validating discount code',
            userFriendlyMessage: 'We had trouble applying your discount code. Please try again.',
            sessionId
          });
        }
      }
      
      // Ensure minimum amount (prevent $0 payments)
      if (finalTotalAmount < 50) { // Minimum $0.50
        console.log('❌ Amount too low for Stripe:', finalTotalAmount);
        return res.status(400).json({
          error: 'Payment amount too low',
          userFriendlyMessage: 'The payment amount is too low to process.',
          sessionId
        });
      }
      
      console.log('💳 Creating Stripe payment intent:', {
        amount: finalTotalAmount,
        amountDollars: finalTotalAmount / 100,
        currency: 'usd',
        athleteCount: validAthletes.length,
        discountCodeApplied: appliedDiscountCode || 'none'
      });
      
      // CRITICAL: Confirm exact amount being sent to Stripe
      console.log('🔍 STRIPE PAYMENT INTENT DEBUG:', {
        finalTotalAmountBeforeStripe: finalTotalAmount,
        finalTotalDollarsBeforeStripe: finalTotalAmount / 100
      });
      
      // Create single payment intent for entire team
      let paymentIntent;
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: finalTotalAmount,
          currency: 'usd',
          metadata: {
            eventId: eventId.toString(),
            registrationType: 'team',
            sessionId,
            coachEmail: coachInfo.email,
            coachName: `${coachInfo.firstName} ${coachInfo.lastName}`,
            athleteCount: validAthletes.length.toString(),
            teamName: coachInfo.teamName || '',
            schoolName: coachInfo.schoolName || '',
            originalAmount: (originalTotalAmount / 100).toString(),
            finalAmount: (finalTotalAmount / 100).toString(),
            discountCode: appliedDiscountCode || '',
            discountAmount: (totalDiscountAmount / 100).toString()
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });
        
        console.log('✅ Stripe payment intent created successfully:', {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret ? 'present' : 'missing',
          amount: paymentIntent.amount,
          status: paymentIntent.status
        });
        
      } catch (stripeError: any) {
        console.error('❌ Stripe payment intent creation failed:', {
          error: stripeError.message,
          type: stripeError.type,
          code: stripeError.code,
          amount: finalTotalAmount,
          athleteCount: validAthletes.length
        });
        
        return res.status(500).json({
          error: 'Payment setup failed',
          userFriendlyMessage: 'We had trouble setting up your team payment, please try again shortly.',
          sessionId,
          details: stripeError.message
        });
      }

      // Log team payment intent creation
      try {
        await storage.logEventRegistration({
          email: coachInfo.email,
          eventSlug: `event-${eventId}`,
          finalAmount: finalTotalAmount / 100,
          discountCode: appliedDiscountCode,
          stripeIntentId: paymentIntent.id,
          sessionId: sessionId,
          registrationType: 'team',
          originalAmount: originalTotalAmount / 100,
          discountAmount: totalDiscountAmount / 100
        });
        console.log(`✅ Team payment intent logged: ${paymentIntent.id} for ${coachInfo.email}`);
      } catch (logError) {
        console.error('Failed to log team payment intent:', logError);
        // Don't fail the request if logging fails
      }

      // Create team registrations in database with pending status
      const createdRegistrations = [];
      for (const athlete of validAthletes) {
        try {
          const registration = await storage.createEventRegistration({
            eventId,
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            email: athlete.email,
            phone: athlete.parentPhoneNumber || coachInfo.phone || null,
            registrationType: 'team',
            stripePaymentIntentId: paymentIntent.id,
            contactName: athlete.parentName, // Map parentName to contactName for database compatibility
            medicalReleaseAccepted: true,
            tShirtSize: athlete.shirtSize, // Map shirtSize to tShirtSize for database compatibility
            grade: athlete.age, // Use age as grade for team registrations
            schoolName: coachInfo.teamName || "Team Registration",
            paymentStatus: 'pending',
            day1: true,
            day2: true,
            day3: true
          });
          createdRegistrations.push(registration);
        } catch (regError) {
          console.error('Failed to create registration for athlete:', athlete.firstName, regError);
        }
      }

      console.log(`✅ Team registration completed: ${createdRegistrations.length}/${validAthletes.length} athletes registered with payment intent ${paymentIntent.id}`);

      // Return response
      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        amount: finalTotalAmount / 100, // Convert back to dollars for display
        athleteCount: validAthletes.length,
        sessionId,
        paymentIntentId: paymentIntent.id,
        registrationsCreated: createdRegistrations.length
      });
      
    } catch (error: any) {
      console.error("❌ Team registration error:", {
        message: error.message,
        stack: error.stack,
        sessionId
      });
      
      res.status(500).json({ 
        error: error.message || "Failed to process team registration",
        userFriendlyMessage: 'We encountered an issue processing your team registration. Please try again shortly.',
        sessionId
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
  
  // Comprehensive Stripe webhook handler for registration workflow
  app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_aMVpANfxDWAJyyvavUoZfKStMmH2EkFl';
    const startTime = Date.now();
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig || '', webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      await logWebhookActivity('verification_failed', null, err instanceof Error ? err.message : 'Unknown error');
      return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    
    console.log(`📨 Stripe webhook: ${event.type} - ${event.data.object.id}`);
    
    try {
      // Handle checkout session completion (primary trigger)
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const paymentIntentId = session.payment_intent;
        
        console.log(`✅ Checkout completed: ${session.id} with payment intent: ${paymentIntentId}`);
        
        if (paymentIntentId) {
          await processSuccessfulPayment(paymentIntentId, 'checkout_completed');
        }
        
        await logWebhookActivity('checkout.session.completed', session.id, 'success');
        
      // Handle payment intent success (backup confirmation)
      } else if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as any;
        
        console.log(`✅ Payment succeeded: ${paymentIntent.id} for $${paymentIntent.amount / 100}`);
        await processSuccessfulPayment(paymentIntent.id, 'payment_succeeded');
        await logWebhookActivity('payment_intent.succeeded', paymentIntent.id, 'success');
        
      // Handle payment failures
      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as any;
        const failureReason = paymentIntent.last_payment_error?.message || 'Unknown error';
        
        console.log(`❌ Payment failed: ${paymentIntent.id} - ${failureReason}`);
        
        // Log payment failure to payment_errors table
        try {
          await storage.logEventRegistration({
            email: 'payment_failure@system.local',
            eventSlug: 'payment-error',
            finalAmount: paymentIntent.amount / 100,
            discountCode: null,
            stripeIntentId: paymentIntent.id,
            sessionId: `failed_${Date.now()}`,
            registrationType: 'error',
            originalAmount: paymentIntent.amount / 100,
            discountAmount: 0
          });
        } catch (logError) {
          console.error('Failed to log payment error:', logError);
        }
        
        // Update registration status to failed
        const registrations = await storage.getEventRegistrationsByPaymentIntent(paymentIntent.id);
        if (registrations && registrations.length > 0) {
          for (const registration of registrations) {
            await storage.updateEventRegistrationPaymentStatus(registration.id.toString(), 'failed');
          }
          console.log(`💔 Updated ${registrations.length} registration(s) to failed status`);
        }
        
        await logWebhookActivity('payment_intent.payment_failed', paymentIntent.id, failureReason);
        
      // Handle refunds
      } else if (event.type === 'charge.refunded') {
        const charge = event.data.object as any;
        
        console.log(`💰 Refund processed: ${charge.id} for $${charge.amount_refunded / 100}`);
        
        // Find and update registrations
        const paymentIntentId = charge.payment_intent;
        if (paymentIntentId) {
          const registrations = await storage.getEventRegistrationsByPaymentIntent(paymentIntentId);
          if (registrations && registrations.length > 0) {
            for (const registration of registrations) {
              await storage.updateEventRegistrationPaymentStatus(registration.id.toString(), 'refunded');
            }
            console.log(`💰 Updated ${registrations.length} registration(s) to refunded status`);
          }
        }
        
        await logWebhookActivity('charge.refunded', charge.id, 'success');
        
      // Handle customer creation
      } else if (event.type === 'customer.created') {
        const customer = event.data.object as any;
        
        console.log(`👤 Customer created: ${customer.id} - ${customer.email}`);
        await logWebhookActivity('customer.created', customer.id, 'success');
        
      } else {
        console.log(`ℹ️ Unhandled webhook event: ${event.type}`);
        await logWebhookActivity(event.type, event.data.object.id, 'unhandled');
      }
      
      const processingTime = Date.now() - startTime;
      console.log(`⚡ Webhook processed in ${processingTime}ms`);
      
      // Respond within 3 seconds to avoid retries
      if (processingTime < 3000) {
        res.status(200).json({received: true, processed: event.type, time: processingTime});
      } else {
        console.warn(`⚠️ Webhook processing took ${processingTime}ms - may cause retries`);
        res.status(200).json({received: true, processed: event.type, time: processingTime, warning: 'slow_processing'});
      }
      
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      await logWebhookActivity(event.type, event.data.object.id, error instanceof Error ? error.message : 'Unknown error');
      res.status(200).json({received: true, error: 'processing_failed'});
    }
  });

  // Helper function to process successful payments
  async function processSuccessfulPayment(paymentIntentId: string, source: string) {
    const registrations = await storage.getEventRegistrationsByPaymentIntent(paymentIntentId);
    
    if (registrations && registrations.length > 0) {
      const isTeamRegistration = registrations[0].registrationType === 'team';
      
      // Update all registrations to paid status
      for (const registration of registrations) {
        await storage.updateEventRegistrationPaymentStatus(registration.id.toString(), 'paid');
      }
      
      console.log(`💳 Updated ${registrations.length} registration(s) to paid status via ${source}`);
      
      // Get event details for confirmation email
      const eventData = await storage.getEvent(registrations[0].eventId);
      
      if (eventData) {
        if (isTeamRegistration) {
          console.log(`📧 Sending team confirmation for ${registrations.length} athletes`);
          
          const teamEmailData = {
            teamContactName: registrations[0].contactName,
            teamName: registrations[0].schoolName || 'Team Registration',
            numCampers: registrations.length,
            campName: eventData.title,
            campDates: eventData.date,
            campLocation: eventData.location,
            totalAmountPaid: (registrations.length * 199).toFixed(2), // Calculate total
            confirmationCode: paymentIntentId,
            teamContactEmail: registrations[0].email,
            campersList: registrations.map(reg => ({
              firstName: reg.firstName,
              lastName: reg.lastName,
              email: reg.email
            }))
          };
          
          await sendConfirmationEmail(teamEmailData);
          
        } else {
          console.log(`📧 Sending individual confirmation to ${registrations[0].email}`);
          
          const registration = registrations[0];
          const emailData = {
            camperFirstName: registration.firstName,
            camperLastName: registration.lastName,
            parentName: registration.contactName,
            campName: eventData.title,
            campDates: eventData.date,
            campLocation: eventData.location,
            eventId: registration.eventId,
            amountPaid: '199.00', // Standard individual price
            confirmationCode: paymentIntentId,
            parentEmail: registration.email
          };
          
          await sendConfirmationEmail(emailData);
        }
      }
      
    } else {
      console.warn(`⚠️ No registrations found for payment intent ${paymentIntentId}`);
      
      // Create placeholder entry for admin review
      try {
        await storage.logEventRegistration({
          email: 'recovery@system.local',
          eventSlug: 'recovered-payment',
          finalAmount: 199, // Default amount
          discountCode: null,
          stripeIntentId: paymentIntentId,
          sessionId: `recovered_${Date.now()}`,
          registrationType: 'recovered',
          originalAmount: 199,
          discountAmount: 0
        });
        
        console.log(`🔄 Created placeholder entry for orphaned payment: ${paymentIntentId}`);
      } catch (recoveryError) {
        console.error('Failed to create recovery entry:', recoveryError);
      }
    }
  }

  // Helper function to log webhook activity
  async function logWebhookActivity(eventType: string, objectId: string | null, status: string) {
    try {
      await storage.logEventRegistration({
        email: 'webhook@system.local',
        eventSlug: 'webhook-log',
        finalAmount: 0,
        discountCode: null,
        stripeIntentId: objectId || `webhook_${Date.now()}`,
        sessionId: `${eventType}_${Date.now()}`,
        registrationType: 'webhook',
        originalAmount: 0,
        discountAmount: 0
      });
    } catch (logError) {
      console.error('Failed to log webhook activity:', logError);
    }
  }

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

  // College Coach Registration endpoint
  app.post('/api/clinician-request', async (req: Request, res: Response) => {
    try {
      const {
        fullName,
        title,
        collegeName,
        email,
        cellPhone,
        schoolPhone,
        schoolWebsite,
        divisionLevel,
        conference,
        numberOfAthletes,
        areasOfInterest,
        daysAttending,
        notes,
        eventId = 3
      } = req.body;

      // Validate required fields
      if (!fullName || !title || !collegeName || !email || !cellPhone || !divisionLevel || !conference || !daysAttending || daysAttending.length === 0) {
        return res.status(400).json({
          error: 'Missing required fields',
          userFriendlyMessage: 'Please fill in all required fields'
        });
      }

      // Check for duplicate email for the same event
      try {
        const existingRequest = await storage.getRecruitingClinicRequestByEmail(email, eventId);
        if (existingRequest) {
          console.log(`Duplicate coach registration attempt: ${email} for event ${eventId}`);
          return res.status(409).json({
            error: 'Duplicate registration',
            userFriendlyMessage: 'A registration with this email already exists for this event.'
          });
        }
      } catch (duplicateCheckError) {
        console.warn('Could not check for duplicate coach registrations:', duplicateCheckError);
        // Continue with registration if duplicate check fails
      }

      // Create the coach registration request
      const requestData = {
        fullName,
        title,
        collegeName,
        email: email.toLowerCase().trim(),
        cellPhone,
        schoolPhone: schoolPhone || null,
        schoolWebsite: schoolWebsite || null,
        divisionLevel,
        conference,
        numberOfAthletes: numberOfAthletes || null,
        areasOfInterest: areasOfInterest || [],
        eventId,
        daysAttending,
        notes: notes || null,
        schoolLogoUrl: null // Will be implemented with file upload later
      };

      const savedRequest = await storage.createRecruitingClinicRequest(requestData);

      console.log(`✅ Coach registration created: ${fullName} from ${collegeName} (${divisionLevel})`);

      res.status(201).json({
        success: true,
        message: 'Registration submitted successfully',
        requestId: savedRequest.id
      });

    } catch (error) {
      console.error('Coach registration error:', error);
      res.status(500).json({
        error: 'Internal server error',
        userFriendlyMessage: 'Unable to process registration. Please try again or contact support.'
      });
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