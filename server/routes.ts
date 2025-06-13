import type { Express, Request, Response } from "express";
import express from "express";
import { storage } from "./storage.js";
import { getDatabaseHealthStatus } from "./db.js";
import { z } from "zod";
import { insertEventRegistrationSchema } from "../shared/schema.js";
import { handleStripeWebhook } from "./stripe.js";
import { listCollections, getCollectionByHandle, getCollectionProducts, getProductById } from "./shopify.js";

// Frontend-to-Database field mapping validation schema
const frontendRegistrationSchema = z.object({
  eventId: z.union([z.string(), z.number()]).transform(val => String(val)),
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
  email: z.string().email("Valid email is required").trim(),
  phone: z.string().optional(),
  
  // Handle frontend field name variations
  grade: z.string().optional(),
  age: z.string().optional(),
  
  // Map frontend tShirtSize to database shirtSize
  tShirtSize: z.string().optional(),
  shirtSize: z.string().optional(),
  
  // Map frontend contactName to database parentName
  contactName: z.string().optional(),
  parentName: z.string().optional(),
  
  // Map frontend experienceLevel to database experience
  experienceLevel: z.string().optional(),
  experience: z.string().optional(),
  
  // Other optional fields
  gender: z.string().optional(),
  schoolName: z.string().optional(),
  clubName: z.string().optional(),
  registrationType: z.string().default('individual'),
  gearSelection: z.any().optional(),
  basePrice: z.union([z.string(), z.number()]).optional(),
  finalPrice: z.union([z.string(), z.number()]).optional(),
  medicalReleaseAccepted: z.boolean().default(false),
  waiverAccepted: z.boolean().default(false),
  termsAccepted: z.boolean().default(false)
});

// Team athlete validation schema with field mapping
const athleteSchema = z.object({
  firstName: z.string().min(1, "Athlete first name is required").trim(),
  lastName: z.string().min(1, "Athlete last name is required").trim(),
  email: z.string().email("Valid athlete email is required").trim(),
  
  // Handle frontend field variations for team athletes
  age: z.string().optional(),
  grade: z.string().optional(),
  
  // Map frontend shirtSize/tShirtSize to database shirtSize
  shirtSize: z.string().optional(),
  tShirtSize: z.string().optional(),
  
  // Map frontend parentName/contactName to database parentName
  parentName: z.string().optional(),
  contactName: z.string().optional(),
  
  // Map frontend parentPhoneNumber to database phone
  parentPhoneNumber: z.string().optional(),
  phone: z.string().optional(),
  
  // Map frontend experienceLevel to database experience
  experienceLevel: z.string().optional(),
  experience: z.string().optional(),
  
  // Other optional fields
  gender: z.string().optional(),
  schoolName: z.string().optional(),
  clubName: z.string().optional()
});

// Team registration validation schema
const teamRegistrationSchema = z.object({
  eventId: z.union([z.string(), z.number()]).transform(val => String(val)),
  teamName: z.string().min(1, "Team name is required").trim(),
  schoolName: z.string().optional(),
  
  // Team contact (coach) information - required for team registrations
  teamContact: z.object({
    firstName: z.string().min(1, "Coach first name is required").trim(),
    lastName: z.string().min(1, "Coach last name is required").trim(),
    email: z.string().email("Valid coach email is required").trim(),
    phone: z.string().optional()
  }),
  
  // Registration option and pricing
  registrationType: z.enum(['team']).default('team'),
  option: z.enum(['full', '1day', '2day']).default('full'),
  numberOfDays: z.number().optional(),
  selectedDates: z.array(z.string()).optional(),
  
  // Array of athletes with validation
  athletes: z.array(athleteSchema).min(1, "At least one athlete is required"),
  
  // Optional team-level fields
  discountCode: z.string().optional(),
  basePrice: z.union([z.string(), z.number()]).optional(),
  finalPrice: z.union([z.string(), z.number()]).optional(),
  stripePaymentIntentId: z.string().optional()
});

// Helper function to map legacy event IDs to new slugs
function getEventSlugFromLegacyId(legacyId: number): string {
  const mapping: Record<number, string> = {
    1: 'summer-wrestling-camp-2025',
    2: 'recruiting-showcase-2025', 
    3: 'technique-clinic-advanced'
  };
  return mapping[legacyId] || 'unknown-event';
}

// Helper function to detect device type from user agent
function detectDeviceType(userAgent: string | undefined): 'mobile' | 'tablet' | 'desktop' {
  if (!userAgent) return 'desktop';
  
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
    return 'mobile';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  return 'desktop';
}

export function setupRoutes(app: Express): void {
  // Health check endpoint
  app.get("/api/health", async (req: Request, res: Response) => {
    try {
      const dbHealth = await getDatabaseHealthStatus();
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: dbHealth
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Users endpoints
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      // For demo purposes, we'll create a simple user list endpoint
      res.json({
        message: "Rich Habits User Management - UUID-based system ready",
        features: [
          "Role-based user management (customer, coach, designer, staff, sales_agent, admin)",
          "Team/organization hierarchy support",
          "Comprehensive user profiles with preferences",
          "OAuth and password authentication support"
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Events endpoints
  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:slug", async (req: Request, res: Response) => {
    try {
      const event = await storage.getEventBySlug(req.params.slug);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  // Event registrations endpoints
  app.get("/api/events/:eventId/registrations", async (req: Request, res: Response) => {
    try {
      const registrations = await storage.getEventRegistrationsByEvent(req.params.eventId);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  // Payments endpoints
  app.get("/api/payments/user/:userId", async (req: Request, res: Response) => {
    try {
      const payments = await storage.getPaymentsByUser(req.params.userId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  // Custom orders endpoints
  app.get("/api/custom-orders/:customerId", async (req: Request, res: Response) => {
    try {
      const orders = await storage.getCustomOrdersByCustomer(req.params.customerId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch custom orders" });
    }
  });

  // Event registration submission endpoint with bulletproof field mapping
  app.post("/api/event-registration", async (req: Request, res: Response) => {
    try {
      // Validate and sanitize input using Zod
      const validationResult = frontendRegistrationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        console.error("Validation errors:", validationResult.error.issues);
        return res.status(400).json({ 
          error: "Registration validation failed",
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const registrationData = validationResult.data;

      // Convert legacy event ID to UUID if needed
      let eventUuid = registrationData.eventId;
      if (!isNaN(Number(registrationData.eventId))) {
        // Map legacy event IDs to new UUIDs
        const events = await storage.getEvents();
        const targetSlug = getEventSlugFromLegacyId(Number(registrationData.eventId));
        console.log(`Legacy ID ${registrationData.eventId} maps to slug: ${targetSlug}`);
        console.log(`Available events:`, events.map(e => ({ id: e.id, slug: e.slug })));
        
        const event = events.find(e => e.slug === targetSlug);
        if (!event) {
          console.error(`Event not found for slug: ${targetSlug}`);
          return res.status(400).json({ 
            error: "Event not found", 
            debug: { requestedSlug: targetSlug, availableSlugs: events.map(e => e.slug) }
          });
        }
        eventUuid = event.id;
        console.log(`Mapped legacy ID ${registrationData.eventId} to UUID: ${eventUuid}`);
      }

      // Map frontend fields to database fields with fallbacks
      const mappedRegistration = {
        eventId: eventUuid,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        phone: registrationData.phone || null,
        
        // Handle grade/age mapping
        grade: registrationData.grade || registrationData.age || null,
        
        // Map tShirtSize -> shirtSize
        shirtSize: registrationData.tShirtSize || registrationData.shirtSize || null,
        
        // Map contactName -> parentName
        parentName: registrationData.contactName || registrationData.parentName || null,
        
        // Map experienceLevel -> experience
        experience: registrationData.experienceLevel || registrationData.experience || null,
        
        // Other fields
        gender: registrationData.gender || null,
        schoolName: registrationData.schoolName || null,
        clubName: registrationData.clubName || null,
        registrationType: registrationData.registrationType,
        gearSelection: registrationData.gearSelection || null,
        basePrice: String(registrationData.basePrice || "0"),
        finalPrice: String(registrationData.finalPrice || "0"),
        waiverAccepted: registrationData.waiverAccepted || registrationData.medicalReleaseAccepted,
        termsAccepted: registrationData.termsAccepted,
        sessionId: req.sessionID,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceType: detectDeviceType(req.get('User-Agent'))
      };

      // Create registration in database
      const registration = await storage.createEventRegistration(mappedRegistration);

      res.json({ 
        success: true, 
        registrationId: registration.id,
        message: "Registration created successfully"
      });
    } catch (error) {
      console.error("Registration creation error:", error);
      res.status(500).json({ 
        error: "Failed to create registration",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Payment creation endpoint
  app.post("/api/create-payment", async (req: Request, res: Response) => {
    try {
      const { userId, amount, paymentMethod, paymentSource, eventRegistrationId, metadata } = req.body;

      const payment = await storage.createPayment({
        userId: userId,
        amount: amount,
        paymentMethod: paymentMethod,
        paymentSource: paymentSource,
        eventRegistrationId: eventRegistrationId,
        metadata: metadata,
        status: 'pending'
      });

      res.json({ success: true, paymentId: payment.id });
    } catch (error) {
      console.error("Payment creation error:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  // Team registration endpoint with bulletproof validation and field mapping
  app.post("/api/team-registration", async (req: Request, res: Response) => {
    try {
      // Validate and sanitize team registration data using Zod
      const validationResult = teamRegistrationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        console.error("Team registration validation errors:", validationResult.error.issues);
        return res.status(400).json({ 
          error: "Team registration validation failed",
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const teamData = validationResult.data;
      console.log("Team registration received:", teamData);

      // Convert legacy event ID to UUID if needed
      let eventUuid = teamData.eventId;
      let event;
      if (!isNaN(Number(teamData.eventId))) {
        const events = await storage.getEvents();
        const targetSlug = getEventSlugFromLegacyId(Number(teamData.eventId));
        console.log(`Team registration: Legacy ID ${teamData.eventId} maps to slug: ${targetSlug}`);
        
        event = events.find(e => e.slug === targetSlug);
        if (!event) {
          console.error(`Team registration: Event not found for slug: ${targetSlug}`);
          return res.status(400).json({ 
            error: "Event not found", 
            debug: { requestedSlug: targetSlug, availableSlugs: events.map(e => e.slug) }
          });
        }
        eventUuid = event.id;
        console.log(`Team registration: Mapped legacy ID ${teamData.eventId} to UUID: ${eventUuid}`);
      } else {
        event = await storage.getEventBySlug(teamData.eventId) || await storage.getEvent(teamData.eventId);
        if (!event) {
          return res.status(400).json({ error: "Event not found" });
        }
        eventUuid = event.id;
      }

      // Calculate team pricing based on athlete count and option
      const { calculateTeamPrice } = await import('./pricingUtils.js');
      const athleteCount = teamData.athletes.length;
      const calculatedPrice = calculateTeamPrice(Number(event.id) || 1, athleteCount, teamData.option);
      const finalPrice = teamData.finalPrice ? Number(teamData.finalPrice) * 100 : calculatedPrice; // Convert to cents

      console.log(`Team pricing: ${athleteCount} athletes x ${teamData.option} = ${finalPrice} cents`);

      // Create team contact record first
      const teamContactData = {
        eventId: eventUuid,
        firstName: teamData.teamContact.firstName,
        lastName: teamData.teamContact.lastName,
        email: teamData.teamContact.email,
        phone: teamData.teamContact.phone || null,
        registrationType: 'team_contact',
        teamName: teamData.teamName,
        schoolName: teamData.schoolName || null,
        basePrice: String(finalPrice),
        finalPrice: String(finalPrice),
        waiverAccepted: true,
        termsAccepted: true,
        sessionId: req.sessionID,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceType: detectDeviceType(req.get('User-Agent'))
      };

      let teamContactId;
      try {
        const teamContact = await storage.createEventRegistration(teamContactData);
        teamContactId = teamContact.id;
        console.log(`Team contact created: ${teamData.teamContact.firstName} ${teamData.teamContact.lastName} with ID: ${teamContactId}`);
      } catch (contactError) {
        console.error("Failed to create team contact:", contactError);
        return res.status(500).json({ 
          error: "Failed to create team contact record",
          details: contactError instanceof Error ? contactError.message : "Unknown error"
        });
      }

      // Process each athlete with field mapping
      const registrationIds = [teamContactId];
      const failedAthletes = [];
      let shopifyOrderId;

      for (let i = 0; i < teamData.athletes.length; i++) {
        const athlete = teamData.athletes[i];
        
        try {
          // Map frontend athlete fields to database fields with fallbacks
          const mappedAthlete = {
            eventId: eventUuid,
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            email: athlete.email,
            
            // Map parentPhoneNumber -> phone
            phone: athlete.parentPhoneNumber || athlete.phone || null,
            
            // Handle grade/age mapping
            grade: athlete.grade || athlete.age || null,
            
            // Map shirtSize/tShirtSize -> shirtSize
            shirtSize: athlete.shirtSize || athlete.tShirtSize || null,
            
            // Map parentName/contactName -> parentName
            parentName: athlete.parentName || athlete.contactName || null,
            
            // Map experienceLevel -> experience
            experience: athlete.experienceLevel || athlete.experience || null,
            
            // Other fields
            gender: athlete.gender || null,
            schoolName: athlete.schoolName || teamData.schoolName || null,
            clubName: athlete.clubName || null,
            
            // Team-specific fields
            registrationType: 'team',
            teamName: teamData.teamName,
            basePrice: String(finalPrice / athleteCount), // Individual athlete price
            finalPrice: String(finalPrice / athleteCount),
            waiverAccepted: true,
            termsAccepted: true,
            sessionId: req.sessionID,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            deviceType: detectDeviceType(req.get('User-Agent'))
          };

          const registration = await storage.createEventRegistration(mappedAthlete);
          registrationIds.push(registration.id);
          
          console.log(`Team registration: Created registration for ${athlete.firstName} ${athlete.lastName} with ID: ${registration.id}`);
          
        } catch (athleteError) {
          console.error(`Failed to register athlete ${i + 1}:`, athleteError);
          failedAthletes.push({
            index: i + 1,
            name: `${athlete.firstName} ${athlete.lastName}`,
            error: athleteError instanceof Error ? athleteError.message : "Unknown error"
          });
        }
      }

      // Create Shopify order for the team registration
      if (teamData.stripePaymentIntentId) {
        try {
          const { createShopifyOrderFromRegistration } = await import('./stripe.js');
          
          const teamRegistrationData = {
            eventId: Number(event.id) || 1,
            firstName: teamData.teamContact.firstName,
            lastName: teamData.teamContact.lastName,
            email: teamData.teamContact.email,
            phone: teamData.teamContact.phone || '',
            teamName: teamData.teamName,
            schoolName: teamData.schoolName || '',
            registrationType: 'team',
            option: teamData.option,
            numberOfDays: teamData.numberOfDays,
            selectedDates: teamData.selectedDates,
            athleteCount
          };

          const shopifyOrder = await createShopifyOrderFromRegistration(
            teamRegistrationData,
            event,
            finalPrice / 100 // Convert cents to dollars
          );

          if (shopifyOrder?.id) {
            shopifyOrderId = shopifyOrder.id.toString();
            console.log(`Shopify order created for team: ${shopifyOrderId}`);
            
            // Update all registrations with the Shopify order ID
            for (const regId of registrationIds) {
              try {
                await storage.updateEventRegistration(regId, { 
                  shopifyOrderId: shopifyOrderId,
                  stripePaymentIntentId: teamData.stripePaymentIntentId,
                  status: 'completed'
                });
              } catch (updateError) {
                console.error(`Failed to update registration ${regId} with Shopify order ID:`, updateError);
              }
            }
          }
        } catch (shopifyError) {
          console.error("Failed to create Shopify order for team:", shopifyError);
          // Don't fail the entire registration for Shopify errors
        }
      }

      // Check if any athletes failed to register
      if (failedAthletes.length > 0) {
        return res.status(400).json({
          error: "Some athletes could not be registered",
          successfulRegistrations: registrationIds.length - 1, // Exclude team contact
          failedAthletes: failedAthletes,
          registrationIds: registrationIds,
          teamContactId,
          shopifyOrderId
        });
      }

      res.json({ 
        success: true, 
        message: "Team registration successful",
        teamName: teamData.teamName,
        athleteCount: teamData.athletes.length,
        totalPrice: finalPrice / 100,
        registrationIds: registrationIds,
        teamContactId,
        shopifyOrderId
      });
      
    } catch (error) {
      console.error("Team registration error:", error);
      res.status(500).json({ 
        error: "Failed to process team registration",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Individual event registration endpoint for specific events
  app.post("/api/events/:eventId/stripe-payment-success", async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const paymentData = req.body;
      
      // Map legacy event ID to UUID
      const events = await storage.getEvents();
      const eventSlug = getEventSlugFromLegacyId(parseInt(eventId));
      const event = events.find(e => e.slug === eventSlug);
      
      if (!event) {
        return res.status(400).json({ error: "Event not found" });
      }

      // Create registration record
      const registration = await storage.createEventRegistration({
        eventId: event.id,
        firstName: paymentData.firstName,
        lastName: paymentData.lastName,
        email: paymentData.email,
        phone: paymentData.phone,
        grade: paymentData.grade,
        schoolName: paymentData.schoolName,
        clubName: paymentData.clubName,
        registrationType: paymentData.registrationType || 'individual',
        gearSelection: paymentData.gearSelection,
        basePrice: paymentData.basePrice?.toString() || "0",
        finalPrice: paymentData.finalPrice?.toString() || "0",
        waiverAccepted: paymentData.medicalReleaseAccepted || false,
        termsAccepted: paymentData.termsAccepted || false,
        status: 'completed',
        sessionId: req.sessionID,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceType: detectDeviceType(req.get('User-Agent'))
      });

      // Create payment record
      if (paymentData.stripePaymentIntentId) {
        await storage.createPayment({
          userId: registration.userId || registration.id, // Use registration ID if no user
          amount: paymentData.finalPrice?.toString() || "0",
          paymentMethod: 'stripe',
          paymentSource: 'event',
          eventRegistrationId: registration.id,
          stripePaymentIntentId: paymentData.stripePaymentIntentId,
          status: 'completed',
          paymentDate: new Date()
        });
      }

      res.json({ 
        success: true, 
        registrationId: registration.id,
        message: "Registration and payment recorded successfully"
      });
    } catch (error) {
      console.error("Payment success handler error:", error);
      res.status(500).json({ error: "Failed to process payment success" });
    }
  });

  // Analytics tracking endpoints
  app.post("/api/analytics/registration-start", async (req: Request, res: Response) => {
    try {
      const sessionData = req.body;
      
      await storage.createSiteSession({
        sessionToken: sessionData.sessionId || req.sessionID,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceType: detectDeviceType(req.get('User-Agent')),
        referrer: sessionData.referrer,
        utmSource: sessionData.utmSource,
        utmMedium: sessionData.utmMedium,
        utmCampaign: sessionData.utmCampaign,
        pagesVisited: [sessionData.currentPage],
        pageViews: 1
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Analytics tracking error:", error);
      res.status(500).json({ error: "Failed to track analytics" });
    }
  });

  app.post("/api/analytics/registration-complete", async (req: Request, res: Response) => {
    try {
      const completionData = req.body;
      
      // Update existing session to mark conversion
      await storage.updateSiteSession(req.sessionID, {
        convertedSession: true,
        conversionType: 'registration',
        conversionValue: completionData.amount?.toString() || "0",
        endedAt: new Date()
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Analytics completion error:", error);
      res.status(500).json({ error: "Failed to track completion" });
    }
  });

  // Shopping cart endpoints
  app.post("/api/cart/add", async (req: Request, res: Response) => {
    try {
      const { shopifyProductId, shopifyVariantId, productHandle, productTitle, variantTitle, price, compareAtPrice, quantity = 1, productImage, productType, vendor } = req.body;
      const sessionId = req.sessionID;

      if (!shopifyProductId || !shopifyVariantId || !productHandle || !productTitle || !price) {
        return res.status(400).json({ error: "Missing required product information" });
      }

      const cartItem = await storage.addToCart({
        sessionId,
        userId: req.user?.id, // If user is logged in
        shopifyProductId,
        shopifyVariantId,
        productHandle,
        productTitle,
        variantTitle,
        price: price.toString(),
        compareAtPrice: compareAtPrice?.toString(),
        quantity,
        productImage,
        productType,
        vendor
      });

      res.json({ success: true, cartItem });
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = req.sessionID;
      const userId = req.user?.id;

      const cartItems = await storage.getCartItems(sessionId, userId);
      
      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      res.json({ 
        success: true, 
        cartItems, 
        subtotal: subtotal.toFixed(2),
        itemCount 
      });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ error: "Failed to get cart items" });
    }
  });

  app.put("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (quantity < 0) {
        return res.status(400).json({ error: "Quantity cannot be negative" });
      }

      const updatedItem = await storage.updateCartItem(id, quantity);
      
      if (!updatedItem && quantity > 0) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json({ success: true, cartItem: updatedItem });
    } catch (error) {
      console.error("Update cart item error:", error);
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const success = await storage.removeFromCart(id);
      
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ error: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = req.sessionID;
      const userId = req.user?.id;

      const success = await storage.clearCart(sessionId, userId);
      
      res.json({ success });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Custom order creation endpoint
  app.post("/api/custom-orders", async (req: Request, res: Response) => {
    try {
      const orderData = req.body;

      const customOrder = await storage.createCustomOrder({
        customerId: orderData.customerId,
        salesAgentId: orderData.salesAgentId,
        orderNumber: `RH-${Date.now()}`,
        title: orderData.title,
        description: orderData.description,
        gearPackRequests: orderData.gearPackRequests,
        itemizedRequests: orderData.itemizedRequests,
        estimatedPrice: orderData.estimatedPrice,
        status: 'pending'
      });

      res.json({ success: true, orderId: customOrder.id });
    } catch (error) {
      console.error("Custom order creation error:", error);
      res.status(500).json({ error: "Failed to create custom order" });
    }
  });

  // Database system overview endpoint
  app.get("/api/system/overview", async (req: Request, res: Response) => {
    try {
      res.json({
        title: "Rich Habits - Scalable Database System",
        architecture: "UUID-based relational database with Supabase compatibility",
        features: {
          users: "Role-based management with team hierarchy",
          events: "Comprehensive event lifecycle management",
          registrations: "Multi-day event registration with gear selection",
          payments: "Universal payment system (Stripe, Cash, QuickBooks, PayPal)",
          customOrders: "Team apparel order management with design files",
          retailSales: "POS and Shopify transaction tracking",
          siteSessions: "Complete user activity and conversion tracking",
          eventManagement: {
            attendance: "Check-in/check-out tracking",
            gearDistribution: "Gear delivery and return management",
            feedback: "Multi-dimensional feedback collection"
          }
        },
        dataIntegrity: {
          softDeletes: "All tables support soft delete via is_archived",
          auditTrail: "created_at and updated_at timestamps in UTC",
          relationships: "Proper foreign key constraints with UUID references"
        },
        scalability: {
          futureReady: "Modular design for commission tracking, design approvals, affiliate links, client portal",
          performance: "Indexed UUID primary keys for optimal query performance",
          integration: "Compatible with existing Shopify, Stripe, and QuickBooks workflows"
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system overview" });
    }
  });

  // Stripe webhook handler for payment success notifications
  app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

  // Payment intent creation endpoint for all registration types
  app.post("/api/events/:eventId/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const { option = 'full', registrationType = 'individual', athletes = [], numberOfDays, selectedDates, discountedAmount } = req.body;

      // Get event information
      const events = await storage.getEvents();
      let event;
      
      if (!isNaN(Number(eventId))) {
        const targetSlug = getEventSlugFromLegacyId(Number(eventId));
        event = events.find(e => e.slug === targetSlug);
      } else {
        event = events.find(e => e.id === eventId || e.slug === eventId);
      }

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Import pricing utilities
      const { calculateRegistrationAmount, calculateTeamPrice } = await import('./pricingUtils.js');
      
      let amount: number;

      try {
        // CRITICAL FIX: Map event slug back to numeric ID for pricing calculation - NO FALLBACKS
        const eventSlugToIdMap: Record<string, number> = {
          'summer-wrestling-camp-2025': 1,
          'recruiting-showcase-2025': 2, 
          'technique-clinic-advanced': 3
        };
        
        const numericEventId = eventSlugToIdMap[event.slug];
        
        // CRITICAL: Reject payment if event slug is not mapped
        if (!numericEventId) {
          console.error(`CRITICAL: Event slug '${event.slug}' not found in pricing map for payment intent creation`);
          return res.status(400).json({
            error: `Event '${event.slug}' is not configured for payment processing`
          });
        }
        
        if (registrationType === 'team') {
          // Calculate team pricing
          const athleteCount = athletes.length || 1;
          amount = calculateTeamPrice(numericEventId, athleteCount, option);
        } else {
          // Calculate individual pricing (including 1-day)
          amount = calculateRegistrationAmount(numericEventId, option, numberOfDays, selectedDates);
        }

        // Override with discounted amount if provided
        if (discountedAmount !== null && discountedAmount !== undefined && typeof discountedAmount === 'number') {
          amount = Math.round(discountedAmount * 100); // Convert to cents
          console.log(`Using discounted amount: $${discountedAmount} (${amount} cents)`);
        }

        console.log(`Payment intent for ${registrationType} registration: ${option} = ${amount} cents`);

      } catch (pricingError) {
        console.error("Pricing calculation error:", pricingError);
        return res.status(400).json({ 
          error: "Failed to calculate pricing", 
          details: pricingError instanceof Error ? pricingError.message : "Unknown pricing error"
        });
      }

      // Import Stripe functionality
      const { createPaymentIntent } = await import('./stripe.js');
      
      // Create payment intent using existing Stripe logic
      const mockReq = {
        ...req,
        params: { eventSlug: event.slug },
        body: {
          ...req.body,
          option,
          discountedAmount: discountedAmount !== null && discountedAmount !== undefined ? discountedAmount : undefined
        }
      };

      await createPaymentIntent(mockReq, res);

    } catch (error) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ 
        error: "Failed to create payment intent",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Archive system endpoint
  app.get("/api/archive/summary", async (req: Request, res: Response) => {
    try {
      res.json({
        message: "Legacy data successfully archived",
        location: "archive schema with complete audit trail",
        tablesArchived: 25,
        recordsPreserved: "406+ records safely stored",
        benefits: [
          "Complete data preservation before system reorganization",
          "Audit trail of all archived data with timestamps",
          "Zero data loss during database restructuring",
          "Legacy data accessible for historical analysis"
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch archive summary" });
    }
  });

  // Shop API endpoints
  // Get all collections
  app.get("/api/shop/collections", async (req: Request, res: Response) => {
    try {
      const collections = await listCollections();
      res.json(collections);
    } catch (error) {
      console.error('Error fetching collections:', error);
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  // Get collection by handle (e.g., "retail-collection")
  app.get("/api/shop/collections/:handle", async (req: Request, res: Response) => {
    try {
      const { handle } = req.params;
      const collection = await getCollectionByHandle(handle);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      console.error('Error fetching collection:', error);
      res.status(500).json({ error: "Failed to fetch collection" });
    }
  });

  // Get products in a collection
  app.get("/api/shop/collections/:handle/products", async (req: Request, res: Response) => {
    try {
      const { handle } = req.params;
      const collection = await getCollectionByHandle(handle);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      
      const products = await getCollectionProducts(collection.id);
      res.json(products);
    } catch (error) {
      console.error('Error fetching collection products:', error);
      res.status(500).json({ error: "Failed to fetch collection products" });
    }
  });

  // Get individual product by ID
  app.get("/api/shop/products/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await getProductById(id);
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Get individual product by handle
  app.get("/api/shop/products/handle/:handle", async (req: Request, res: Response) => {
    try {
      const { handle } = req.params;
      // First get all products and find by handle
      const collections = await listCollections();
      let foundProduct = null;
      
      for (const collection of collections) {
        const products = await getCollectionProducts(collection.id);
        foundProduct = products.find((p: any) => p.handle === handle);
        if (foundProduct) break;
      }
      
      if (!foundProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(foundProduct);
    } catch (error) {
      console.error('Error fetching product by handle:', error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
}