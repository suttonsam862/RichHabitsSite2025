import type { Express, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage.js";
import { insertEventRegistrationSchema } from "../../shared/schema.js";

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

/**
 * Event Registration Routes - Stripe Payment Integration
 * All event-related endpoints including registration, payment creation, and webhooks
 */
export function setupEventRoutes(app: Express): void {
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

      // Validate event exists in database - NO FALLBACKS
      const event = await storage.getEventBySlug(registrationData.eventId);
      if (!event) {
        console.error(`Event not found for ID: ${registrationData.eventId}`);
        return res.status(400).json({ 
          error: "Event not found", 
          eventId: registrationData.eventId
        });
      }

      // Map frontend fields to database fields
      const mappedRegistration = {
        eventId: event.id,
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
        message: "Registration successful",
        registrationId: registration.id,
        eventId: event.id,
        eventName: event.title
      });

    } catch (error) {
      console.error("Event registration error:", error);
      res.status(500).json({ 
        error: "Registration failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Team registration endpoint with enhanced validation
  app.post("/api/team-registration", async (req: Request, res: Response) => {
    try {
      // Validate team registration data
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

      // Validate event exists in database - NO FALLBACKS
      const event = await storage.getEventBySlug(teamData.eventId);
      if (!event) {
        console.error(`Event not found for ID: ${teamData.eventId}`);
        return res.status(400).json({ 
          error: "Event not found", 
          eventId: teamData.eventId
        });
      }

      // Create individual registrations for each athlete
      const registrations = [];
      
      for (const athlete of teamData.athletes) {
        const mappedAthlete = {
          eventId: event.id,
          firstName: athlete.firstName,
          lastName: athlete.lastName,
          email: athlete.email,
          phone: athlete.phone || athlete.parentPhoneNumber || null,
          
          // Handle grade/age mapping
          grade: athlete.grade || athlete.age || null,
          
          // Map shirt size fields
          shirtSize: athlete.shirtSize || athlete.tShirtSize || null,
          
          // Map parent/contact name
          parentName: athlete.parentName || athlete.contactName || null,
          
          // Map experience level
          experience: athlete.experience || athlete.experienceLevel || null,
          
          // Other fields
          gender: athlete.gender || null,
          schoolName: athlete.schoolName || teamData.schoolName || null,
          clubName: athlete.clubName || null,
          registrationType: 'team',
          basePrice: String(teamData.basePrice || "0"),
          finalPrice: String(teamData.finalPrice || "0"),
          waiverAccepted: true,
          termsAccepted: true,
          sessionId: req.sessionID,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          deviceType: detectDeviceType(req.get('User-Agent')),
          
          // Team-specific fields
          teamName: teamData.teamName,
          teamContactEmail: teamData.teamContact.email,
          teamContactName: `${teamData.teamContact.firstName} ${teamData.teamContact.lastName}`,
          teamContactPhone: teamData.teamContact.phone || null
        };

        const registration = await storage.createEventRegistration(mappedAthlete);
        registrations.push(registration);
      }

      res.json({ 
        message: "Team registration successful",
        teamName: teamData.teamName,
        athletesRegistered: registrations.length,
        registrationIds: registrations.map(r => r.id),
        eventId: event.id,
        eventName: event.title
      });

    } catch (error) {
      console.error("Team registration error:", error);
      res.status(500).json({ 
        error: "Team registration failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Stripe payment intent creation endpoint - bulletproof security
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const { eventId, registrationData, amount } = req.body;

      // Validate event exists in database - NO FALLBACKS
      const event = await storage.getEventBySlug(eventId);
      if (!event) {
        console.error(`Payment intent creation failed: Event not found for ID: ${eventId}`);
        return res.status(400).json({ 
          error: "Event not found", 
          eventId 
        });
      }

      // Validate amount matches event pricing
      const eventBasePrice = parseFloat(event.basePrice);
      const requestedAmount = parseFloat(amount);
      
      if (requestedAmount < eventBasePrice) {
        console.error(`Payment amount ${requestedAmount} is less than event base price ${eventBasePrice}`);
        return res.status(400).json({
          error: "Invalid payment amount",
          eventPrice: eventBasePrice,
          requestedAmount
        });
      }

      // Create Stripe payment intent with secure metadata
      const { stripe } = await import("../stripe.js");
      
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(requestedAmount * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            eventId: event.id,
            eventSlug: event.slug,
            eventTitle: event.title,
            customerEmail: registrationData.email,
            customerName: `${registrationData.firstName} ${registrationData.lastName}`,
            registrationType: registrationData.registrationType || 'individual'
          }
        });
        
        if (!paymentIntent || !paymentIntent.client_secret) {
          throw new Error('Invalid payment intent response from Stripe');
        }

        res.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: requestedAmount,
          eventId: event.id,
          eventTitle: event.title
        });
      } catch (stripeError) {
        console.error("Stripe payment intent creation failed:", stripeError);
        throw stripeError;
      }

    } catch (error) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ 
        error: "Payment intent creation failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}