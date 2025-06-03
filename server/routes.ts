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
import { paymentService } from "./paymentService.js";
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
  apiVersion: '2024-06-20',
});

// Configure multer for file uploads (store in memory)
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

// Email confirmation helper
async function sendConfirmationEmailForPayment(paymentIntent: any) {
  try {
    const registrations = await storage.getTeamMembersByPaymentIntent(paymentIntent.id);
    
    if (registrations && registrations.length > 0) {
      const isTeamRegistration = registrations.length > 1;
      
      if (isTeamRegistration) {
        await createTeamConfirmationEmail(paymentIntent.id);
      } else {
        await createIndividualConfirmationEmail(paymentIntent.id);
      }
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

// Session data interface
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}

function convertRegistrationsToCSV(registrations: any[]) {
  if (registrations.length === 0) return '';
  
  const headers = Object.keys(registrations[0]);
  const csvContent = [
    headers.join(','),
    ...registrations.map(reg => 
      headers.map(header => {
        const value = reg[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

const authenticateAdmin = (req: Request, res: Response, next: any) => {
  if (!req.session.isAdmin) {
    return res.status(401).json({ error: 'Admin access required' });
  }
  next();
};

async function verifyPaymentIntent(paymentIntentId: string): Promise<boolean> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Error verifying payment intent:', error);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route
  app.get('/api/health', async (req: Request, res: Response) => {
    try {
      const dbStatus = await getDatabaseHealthStatus();
      res.json({
        status: 'healthy',
        database: dbStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: 'Database connection failed'
      });
    }
  });

  // BULLETPROOF Payment Intent Creation - Prevents Multiple Charges
  app.post("/api/events/:eventId(\\d+)/create-payment-intent", async (req: Request, res: Response) => {
    try {
      console.log('=== BULLETPROOF PAYMENT REQUEST ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('Event ID:', req.params.eventId);
      
      const eventId = parseInt(req.params.eventId);
      const { option = 'full', registrationData, discountedAmount, discountCode } = req.body;

      // Use bulletproof payment service to prevent duplicate charges
      console.log('Using bulletproof payment service for registration...');
      
      const paymentResult = await paymentService.createOrRetrievePaymentIntent({
        eventId,
        option,
        registrationData,
        discountCode,
        discountedAmount
      });

      console.log('Payment service result:', {
        success: paymentResult.success,
        amount: paymentResult.amount,
        hasClientSecret: !!paymentResult.clientSecret
      });

      if (!paymentResult.success) {
        return res.status(400).json({
          error: paymentResult.error,
          userFriendlyMessage: paymentResult.userFriendlyMessage || 'Unable to process payment. Please try again.',
          canRetry: true
        });
      }

      // Handle free registrations
      if (paymentResult.isFreeRegistration) {
        console.log('Processing free registration directly');
        
        // Process the registration immediately without any payment
        try {
          const registration = await storage.logEventRegistration({
            ...registrationData,
            eventId: eventId,
            registrationOption: option,
            finalAmount: 0,
            registrationType: option,
            paymentStatus: 'completed',
            stripeIntentId: 'FREE_REGISTRATION'
          });

          return res.json({
            success: true,
            isFreeRegistration: true,
            registrationId: registration.id,
            message: 'Free registration completed successfully'
          });
        } catch (error) {
          console.error('Error processing free registration:', error);
          return res.status(500).json({
            error: 'Failed to process free registration',
            userFriendlyMessage: 'Unable to complete registration. Please try again.'
          });
        }
      }

      res.json({
        clientSecret: paymentResult.clientSecret,
        amount: paymentResult.amount,
        sessionId: paymentResult.sessionId,
        isExisting: paymentResult.isExisting || false
      });

    } catch (error: any) {
      console.error('❌ Bulletproof payment service error:', error);
      
      res.status(500).json({
        error: 'Payment service error',
        userFriendlyMessage: 'Unable to process payment request. Please try again.',
        canRetry: true
      });
    }
  });

  // Process successful payment endpoint
  app.post('/api/process-payment-success', async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, source = 'webhook' } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ error: 'Payment intent ID required' });
      }

      await processSuccessfulPayment(paymentIntentId, source);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error processing payment success:', error);
      res.status(500).json({ error: 'Failed to process payment success' });
    }
  });

  // Process free registration endpoint
  app.post('/api/process-free-registration', async (req: Request, res: Response) => {
    try {
      const { registrationData, eventId, option = 'full' } = req.body;
      
      if (!registrationData || !eventId) {
        return res.status(400).json({ 
          error: 'Missing required registration data or event ID' 
        });
      }

      // Process the free registration directly
      const registration = await storage.logEventRegistration({
        ...registrationData,
        eventId: parseInt(eventId),
        registrationOption: option,
        finalAmount: 0,
        registrationType: option
      });

      res.json({ 
        success: true, 
        registrationId: registration.id 
      });
    } catch (error: any) {
      console.error('Error processing free registration:', error);
      res.status(500).json({ 
        error: 'Failed to process free registration' 
      });
    }
  });

  // Get event information
  app.get('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.json(event);
    } catch (error: any) {
      console.error('Error fetching event:', error);
      res.status(500).json({ error: 'Failed to fetch event' });
    }
  });

  // Get coaches for an event  
  app.get('/api/events/:id/coaches', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const coaches = await storage.getEventCoaches(eventId);
      res.json(coaches);
    } catch (error: any) {
      console.error('Error fetching event coaches:', error);
      res.status(500).json({ error: 'Failed to fetch coaches' });
    }
  });

  // Submit college coach registration request
  app.post('/api/clinician-request', async (req: Request, res: Response) => {
    try {
      const validatedData = insertCoachSchema.parse(req.body);
      const coach = await storage.addCoach(validatedData);
      res.json({ success: true, coach });
    } catch (error: any) {
      console.error('Error submitting coach request:', error);
      res.status(500).json({ error: 'Failed to submit coach request' });
    }
  });

  async function processSuccessfulPayment(paymentIntentId: string, source: string) {
    try {
      console.log(`Processing successful payment: ${paymentIntentId} from ${source}`);
      
      // Verify payment intent is actually succeeded
      const isValid = await verifyPaymentIntent(paymentIntentId);
      if (!isValid) {
        throw new Error('Payment intent verification failed');
      }

      // Get registration data and update status
      const registrations = await storage.getCompletedEventRegistrations();
      const registration = registrations.find((reg: any) => reg.stripeIntentId === paymentIntentId);
      
      if (registration) {
        // Send confirmation email
        await sendConfirmationEmailForPayment({ id: paymentIntentId });
        console.log(`✅ Payment processed successfully: ${paymentIntentId}`);
      }
    } catch (error) {
      console.error('Error processing successful payment:', error);
      throw error;
    }
  }

  async function logWebhookActivity(eventType: string, objectId: string | null, status: string) {
    console.log(`Webhook: ${eventType} - ${objectId} - ${status}`);
  }

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    
    // Catch-all handler for client-side routing
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}