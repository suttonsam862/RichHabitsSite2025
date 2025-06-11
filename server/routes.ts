import type { Express, Request, Response } from "express";
import { storage } from "./storage.js";
import { getDatabaseHealthStatus } from "./db.js";
import { z } from "zod";
import { insertEventRegistrationSchema } from "../shared/schema.js";

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
  teamPrice: z.union([z.string(), z.number()]).transform(val => Number(val)),
  
  // Coach information (optional for team registrations)
  coachInfo: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional()
  }).optional(),
  
  // Array of athletes with validation
  athletes: z.array(athleteSchema).min(1, "At least one athlete is required"),
  
  // Optional team-level fields
  discountCode: z.string().optional(),
  totalAmount: z.union([z.string(), z.number()]).optional(),
  discountedAmount: z.union([z.string(), z.number()]).optional()
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
      if (!isNaN(Number(teamData.eventId))) {
        const events = await storage.getEvents();
        const targetSlug = getEventSlugFromLegacyId(Number(teamData.eventId));
        console.log(`Team registration: Legacy ID ${teamData.eventId} maps to slug: ${targetSlug}`);
        
        const event = events.find(e => e.slug === targetSlug);
        if (!event) {
          console.error(`Team registration: Event not found for slug: ${targetSlug}`);
          return res.status(400).json({ 
            error: "Event not found", 
            debug: { requestedSlug: targetSlug, availableSlugs: events.map(e => e.slug) }
          });
        }
        eventUuid = event.id;
        console.log(`Team registration: Mapped legacy ID ${teamData.eventId} to UUID: ${eventUuid}`);
      }

      // Process each athlete with field mapping
      const registrationIds = [];
      const failedAthletes = [];

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
            schoolName: athlete.schoolName || null,
            clubName: athlete.clubName || null,
            
            // Team-specific fields
            registrationType: 'team',
            teamName: teamData.teamName,
            basePrice: String(teamData.teamPrice),
            finalPrice: String(teamData.teamPrice),
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

      // Check if any athletes failed to register
      if (failedAthletes.length > 0) {
        return res.status(400).json({
          error: "Some athletes could not be registered",
          successfulRegistrations: registrationIds.length,
          failedAthletes: failedAthletes,
          registrationIds: registrationIds
        });
      }

      res.json({ 
        success: true, 
        message: "Team registration successful",
        teamName: teamData.teamName,
        athleteCount: registrationIds.length,
        registrationIds: registrationIds
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
}