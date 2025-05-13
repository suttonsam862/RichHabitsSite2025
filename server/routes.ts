import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertCustomApparelInquirySchema, 
  insertEventRegistrationSchema,
  insertNewsletterSubscriberSchema,
  insertCollaborationSchema,
  insertCoachSchema,
  insertEventCoachSchema
} from "@shared/schema";
import { z } from "zod";
import { createEventRegistrationCheckout, EVENT_PRODUCTS, EventRegistrationData, listProducts, createShopifyDraftOrder, ShopifyDraftOrderParams } from "./shopify";
import { createPaymentIntent, handleSuccessfulPayment, handleStripeWebhook } from "./stripe";
import { getStripePriceId, getStripeProductId } from "./stripeProducts";
import { validateDiscountCode, updatePaymentIntent } from "./discounts";
import { registerImageOptimizationRoutes } from "./imageOptimizer";

// Shopify configuration - in a real app, store these in environment variables
const SHOPIFY_ADMIN_API_KEY = process.env.SHOPIFY_ADMIN_API_KEY || "";
const SHOPIFY_ADMIN_API_PASSWORD = process.env.SHOPIFY_ADMIN_API_PASSWORD || "";
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "rich-habits.myshopify.com";
const SHOPIFY_API_VERSION = "2023-07"; // Update to latest version as needed

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
  
  // Setup image optimization routes
  const assetsDir = path.join(process.cwd(), 'attached_assets');
  registerImageOptimizationRoutes(app, assetsDir);
  
  // Serve static files directly with various optimizations
  const staticOptions = {
    maxAge: 86400000,   // 1 day caching for static assets
    etag: true,         // Use ETags for cache validation
    lastModified: true, // Use Last-Modified for cache validation
    index: false        // Disable automatic directory index serving
  };
  
  // Serve files from public directory (built frontend assets)
  app.use(express.static(path.join(process.cwd(), 'public'), {
    ...staticOptions,
    fallthrough: true  // Allow falling through to next middleware
  }));
  
  // Serve design files specifically
  app.use('/designs', express.static(path.join(process.cwd(), 'public/designs'), staticOptions));
  
  // Serve attached assets files with detailed logging and improved file path handling
  app.use('/assets', (req, res, next) => {
    console.log('[media] Asset request:', req.path);
    
    // Remove URL encoding
    const decodedPath = decodeURIComponent(req.path);
    console.log('[media] Decoded path:', decodedPath);
    
    // Try both possible locations: attached_assets and public/assets
    const attachedAssetsPath = path.join(process.cwd(), 'attached_assets', decodedPath);
    const publicAssetsPath = path.join(process.cwd(), 'public/assets', decodedPath);
    
    let filePath = null;
    
    // Check if file exists in either location
    if (fs.existsSync(attachedAssetsPath)) {
      filePath = attachedAssetsPath;
      console.log('[media] Found asset file in attached_assets:', decodedPath);
    } else if (fs.existsSync(publicAssetsPath)) {
      filePath = publicAssetsPath;
      console.log('[media] Found asset file in public/assets:', decodedPath);
    }
    
    if (filePath) {
      // Serve the file directly with proper content type
      const fileExtension = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';
      
      // Set content type based on file extension
      if (fileExtension === '.png') contentType = 'image/png';
      else if (fileExtension === '.jpg' || fileExtension === '.jpeg') contentType = 'image/jpeg';
      else if (fileExtension === '.gif') contentType = 'image/gif';
      else if (fileExtension === '.svg') contentType = 'image/svg+xml';
      else if (fileExtension === '.mp4') contentType = 'video/mp4';
      else if (fileExtension === '.mov') contentType = 'video/quicktime';
      else if (fileExtension === '.webm') contentType = 'video/webm';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      console.log('[media] Serving media file:', decodedPath.substring(1));
      fs.createReadStream(filePath).pipe(res);
    } else {
      console.log('[media] Media file not found:', decodedPath.substring(1));
      console.log('[media] Asset file not found in any location:', decodedPath);
      next();
    }
  });
  
  // Fallback for attached_assets if the custom handler misses any files
  app.use('/assets', express.static(path.join(process.cwd(), 'attached_assets'), staticOptions));
  app.use('/assets', express.static(path.join(process.cwd(), 'public/assets'), staticOptions));
  
  // API routes for events
  app.get("/api/events", async (req, res) => {
    try {
      // Get events from database
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching events", error: (error as Error).message });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);
      
      // Get event from database
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Log successful API response
      console.log(`[api] Successfully retrieved event ID ${eventId}: ${event.title}`);
      res.json(event);
    } catch (error) {
      console.error(`[api] Error fetching event ${req.params.id}:`, error);
      res.status(500).json({ message: "Error fetching event", error: (error as Error).message });
    }
  });

  app.post("/api/events/:id/register", async (req, res) => {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);
      
      // Validate request body
      const validatedData = insertEventRegistrationSchema.parse({
        ...req.body,
        eventId
      });
      
      // Get event from database
      let event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Create registration in database
      const registration = await storage.createEventRegistration(validatedData);
      
      // Get registration data for checkout
      const registrationData: EventRegistrationData = {
        eventId: event.id,
        eventTitle: event.title,
        participantName: `${validatedData.firstName} ${validatedData.lastName}`,
        email: validatedData.email,
        phone: validatedData.phone,
        registrationType: validatedData.registrationType,
        emergencyContactName: validatedData.emergencyContactName,
        emergencyContactPhone: validatedData.emergencyContactPhone,
        selectedDays: validatedData.selectedDays,
        registrationNotes: validatedData.registrationNotes,
        registrationId: registration.id,
        schoolName: validatedData.schoolName,
        ageGroup: validatedData.ageGroup,
        wrestlingExperience: validatedData.wrestlingExperience
      };
      
      let productId = "";
      let unitAmount = 0;
      
      if (event.id === 1) { // Birmingham Slam Camp
        if (validatedData.registrationType === "full") {
          productId = "birmingham-slam-camp-full";
          unitAmount = 24900; // $249.00
        } else {
          productId = "birmingham-slam-camp-single";
          unitAmount = 14900; // $149.00
        }
      } else if (event.id === 2) { // National Champ Camp
        if (validatedData.registrationType === "full") {
          productId = "national-champ-camp-full";
          unitAmount = 34900; // $349.00
        } else {
          productId = "national-champ-camp-single";
          unitAmount = 17500; // $175.00
        }
      } else if (event.id === 3) { // Texas Recruiting Clinic
        productId = "texas-recruiting-clinic";
        unitAmount = 24900; // $249.00
      } else if (event.id === 4) { // Panther Train Tour
        if (validatedData.registrationType === "full") {
          productId = "panther-train-tour-full";
          unitAmount = 20000; // $200.00
        } else {
          productId = "panther-train-tour-single";
          unitAmount = 9900; // $99.00
        }
      } else {
        // Default case (should not happen but just in case)
        productId = "event-registration";
        unitAmount = 10000; // $100.00
      }
      
      // Check for discount code
      if (validatedData.discountCode) {
        const discountResult = await validateDiscountCode(
          validatedData.discountCode, 
          eventId,
          validatedData.schoolName || ""
        );
        
        if (discountResult.valid) {
          unitAmount = Math.round(unitAmount * (1 - discountResult.discountPercentage));
        }
      }
      
      // Create payment intent for the registration
      const paymentIntentData = {
        amount: unitAmount,
        currency: "usd",
        metadata: {
          eventId: event.id.toString(),
          registrationType: validatedData.registrationType,
          registrationId: registration.id.toString(),
          customerName: `${validatedData.firstName} ${validatedData.lastName}`,
          customerEmail: validatedData.email,
          customerPhone: validatedData.phone,
          product: productId,
          discountCode: validatedData.discountCode || ""
        }
      };
      
      // If the registration is free (100% discount), handle it differently
      if (unitAmount === 0) {
        // Process free registration
        await handleSuccessfulPayment({
          eventId: event.id,
          registrationId: registration.id,
          customerId: validatedData.email,
          amount: 0,
          paymentId: "free_registration",
          customerName: `${validatedData.firstName} ${validatedData.lastName}`,
          customerEmail: validatedData.email,
          customerPhone: validatedData.phone
        });
        
        return res.json({
          success: true,
          freeRegistration: true,
          message: "Free registration processed successfully"
        });
      }
      
      // Create a Stripe PaymentIntent
      const paymentIntent = await createPaymentIntent(paymentIntentData);
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: unitAmount,
        registrationId: registration.id
      });
    } catch (error) {
      console.error("Error processing event registration:", error);
      res.status(500).json({ 
        message: "Error processing event registration", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Setup event coaches
  app.get("/api/events/:eventId/coaches", async (req, res) => {
    try {
      const { eventId } = req.params;
      const eventIdNum = parseInt(eventId);
      
      const coaches = await storage.getEventCoaches(eventIdNum);
      res.json(coaches);
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching event coaches", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // API routes for contact form submissions
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      
      // Create contact submission in database
      const contactSubmission = await storage.createContactSubmission(validatedData);
      
      res.status(201).json(contactSubmission);
    } catch (error) {
      res.status(500).json({ 
        message: "Error submitting contact form", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // API routes for custom apparel inquiries
  app.post("/api/custom-apparel", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertCustomApparelInquirySchema.parse(req.body);
      
      // Create inquiry in database
      const inquiry = await storage.createCustomApparelInquiry(validatedData);
      
      res.status(201).json(inquiry);
    } catch (error) {
      res.status(500).json({ 
        message: "Error submitting custom apparel inquiry", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // API routes for newsletter subscribers
  app.post("/api/newsletter", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertNewsletterSubscriberSchema.parse(req.body);
      
      // Create subscriber in database
      const subscriber = await storage.createNewsletterSubscriber(validatedData);
      
      res.status(201).json(subscriber);
    } catch (error) {
      res.status(500).json({ 
        message: "Error subscribing to newsletter", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // API routes for collaboration inquiries
  app.post("/api/collaborate", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertCollaborationSchema.parse(req.body);
      
      // Create inquiry in database
      const inquiry = await storage.createCollaboration(validatedData);
      
      res.status(201).json(inquiry);
    } catch (error) {
      res.status(500).json({ 
        message: "Error submitting collaboration inquiry", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Setup Stripe webhook handler
  app.post("/api/stripe-webhook", express.raw({ type: 'application/json' }), handleStripeWebhook);

  // Serve the SPA for all other routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });

  const httpServer = createServer(app);

  return httpServer;
}