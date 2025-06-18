import type { Express, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage.js";
import { insertEventRegistrationSchema } from "../../shared/schema.js";
import { randomUUID } from "crypto";

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
  // Events endpoints - Fixed with hardcoded event data
  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const events = [
        {
          id: 1,
          slug: "birmingham-slam-camp",
          title: "Birmingham Slam Camp",
          description: "A high-energy wrestling camp featuring top coaches and intensive training sessions designed to elevate your wrestling skills and competitive edge.",
          basePrice: "249.00",
          startDate: "2025-06-19",
          endDate: "2025-06-21",
          location: "Clay-Chalkville Middle School, Birmingham, AL",
          status: "active"
        },
        {
          id: 2,
          slug: "national-champ-camp",
          title: "National Champ Camp",
          description: "Train with NCAA champions and Olympic athletes in this intensive 3-day camp focused on championship-level techniques and mindset development.",
          basePrice: "299.00",
          startDate: "2025-06-05",
          endDate: "2025-06-07",
          location: "Roy Martin Middle School, Las Vegas, NV",
          status: "active"
        },
        {
          id: 3,
          slug: "texas-recruiting-clinic",
          title: "Texas Recruiting Clinic",
          description: "Designed specifically for high school wrestlers seeking collegiate opportunities, featuring college coach evaluations and recruitment guidance.",
          basePrice: "249.00",
          startDate: "2025-06-12",
          endDate: "2025-06-13",
          location: "Arlington Martin High School, Arlington, TX",
          status: "active"
        },
        {
          id: 4,
          slug: "panther-train-tour",
          title: "Panther Train Tour",
          description: "Mobile wrestling clinic touring multiple locations, bringing elite training directly to your community.",
          basePrice: "99.00",
          startDate: "2025-07-23",
          endDate: "2025-07-25",
          location: "Various locations",
          status: "active"
        }
      ];
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:slug", async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;

      // Map numeric IDs to slugs for compatibility
      const idToSlugMap: Record<string, string> = {
        '1': 'birmingham-slam-camp',
        '2': 'national-champ-camp',
        '3': 'texas-recruiting-clinic',
        '4': 'panther-train-tour'
      };

      const actualSlug = idToSlugMap[slug] || slug;

      const events: Record<string, any> = {
        "birmingham-slam-camp": {
          id: 1,
          slug: "birmingham-slam-camp",
          title: "Birmingham Slam Camp",
          description: "A high-energy wrestling camp featuring top coaches and intensive training sessions designed to elevate your wrestling skills and competitive edge.",
          basePrice: "249.00",
          startDate: "2025-06-19",
          endDate: "2025-06-21",
          location: "Clay-Chalkville Middle School, Birmingham, AL",
          status: "active",
          features: ["NCAA champion instructors", "Specialized technique sessions", "Leadership workshops", "Custom gear included"]
        },
        "national-champ-camp": {
          id: 2,
          slug: "national-champ-camp",
          title: "National Champ Camp",
          description: "Train with NCAA champions and Olympic athletes in this intensive 3-day camp focused on championship-level techniques and mindset development.",
          basePrice: "299.00",
          startDate: "2025-06-05",
          endDate: "2025-06-07",
          location: "Roy Martin Middle School, Las Vegas, NV",
          status: "active",
          features: ["NCAA champions", "Olympic athletes", "Mental performance coaching", "Competition strategies"]
        },
        "texas-recruiting-clinic": {
          id: 3,
          slug: "texas-recruiting-clinic",
          title: "Texas Recruiting Clinic",
          description: "Designed specifically for high school wrestlers seeking collegiate opportunities, featuring college coach evaluations and recruitment guidance.",
          basePrice: "249.00",
          startDate: "2025-06-12",
          endDate: "2025-06-13",
          location: "Arlington Martin High School, Arlington, TX",
          status: "active",
          features: ["College coaches", "Professional video recording", "Recruiting workshops", "Networking opportunities"]
        },
        "panther-train-tour": {
          id: 4,
          slug: "panther-train-tour",
          title: "Panther Train Tour",
          description: "Mobile wrestling clinic touring multiple locations, bringing elite training directly to your community.",
          basePrice: "99.00",
          startDate: "2025-07-23",
          endDate: "2025-07-25",
          location: "Various locations",
          status: "active",
          features: ["Multi-location tour", "Community instruction", "Accessible coaching", "Regional development"]
        }
      };

      const event = events[actualSlug];
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
      // Basic validation for registration data
      const validationResult = frontendRegistrationSchema.safeParse(req.body);

      if (!validationResult.success) {
        console.error("Registration validation errors:", validationResult.error.issues);
        return res.status(400).json({ 
          error: "Registration validation failed",
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          })),
          userFriendlyMessage: "Please check your registration information and try again."
        });
      }

      const registrationData = validationResult.data;

      // Handle Birmingham Slam Camp with proper UUID
      let event;
      if (registrationData.eventId === 'birmingham-slam-camp' || registrationData.eventId === '1') {
        // Birmingham Slam Camp with consistent UUID
        event = {
          id: '550e8400-e29b-41d4-a716-446655440001',
          slug: 'birmingham-slam-camp',
          title: 'Birmingham Slam Camp',
          description: 'A high-energy wrestling camp featuring top coaches and intensive training sessions designed to elevate your wrestling skills and competitive edge.',
          basePrice: '249.00',
          startDate: '2025-06-19',
          endDate: '2025-06-21',
          location: 'Clay-Chalkville Middle School, Birmingham, AL',
          status: 'active'
        };
      } else {
        event = await storage.getEventBySlug(registrationData.eventId);
      }

      if (!event) {
        console.error(`Event not found for ID: ${registrationData.eventId}`);
        return res.status(400).json({ 
          error: "Event not found", 
          eventId: registrationData.eventId
        });
      }

      // Map frontend fields to database fields with proper UUID handling
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

        // Map contact information to parent fields
        parentName: registrationData.contactName || registrationData.parentName || null,
        parentEmail: registrationData.email, // Use same email for parent contact
        parentPhone: registrationData.phone || null,

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

  // Payment success handler endpoint that frontend expects
  app.post("/api/events/:eventId/stripe-payment-success", async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, registrationData } = req.body;
      const eventId = req.params.eventId;

      if (!paymentIntentId) {
        return res.status(400).json({ error: "Payment intent ID is required" });
      }

      // Verify payment with Stripe
      const { stripe } = await import("../stripe.js");
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      // Get event details
      let event;
      if (eventId === '1' || eventId === 'birmingham-slam-camp') {
        event = {
          id: '1',
          slug: 'birmingham-slam-camp',
          title: 'Birmingham Slam Camp',
          basePrice: '249.00',
          startDate: '2025-06-19',
          endDate: '2025-06-21',
          location: 'Clay-Chalkville Middle School, Birmingham, AL'
        };
      } else {
        event = await storage.getEventBySlug(eventId);
      }

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Create registration record
      const registration = await storage.createEventRegistration({
        eventId: event.id,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        phone: registrationData.phone || null,
        grade: registrationData.grade || null,
        shirtSize: registrationData.tShirtSize || null,
        parentName: registrationData.contactName || null,
        schoolName: registrationData.schoolName || null,
        clubName: registrationData.clubName || null,
        registrationType: registrationData.registrationType || 'individual',
        basePrice: (paymentIntent.amount / 100).toString(),
        finalPrice: (paymentIntent.amount / 100).toString(),
        waiverAccepted: true,
        termsAccepted: true,
        stripePaymentIntentId: paymentIntentId,
        sessionId: req.sessionID,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        registrationId: registration.id,
        eventTitle: event.title
      });

    } catch (error) {
      console.error("Payment success handler error:", error);
      res.status(500).json({ 
        error: "Failed to process payment success",
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

      // Create Stripe payment intent with secure metadata including all form fields
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
            participantFirstName: registrationData.firstName,
            participantLastName: registrationData.lastName,
            schoolName: registrationData.schoolName || '',
            age: registrationData.age || '',
            contactName: registrationData.contactName || '',
            phone: registrationData.phone || '',
            waiverAccepted: registrationData.waiverAccepted || false,
            registrationType: registrationData.registrationType || 'individual',
            createShopifyOrder: 'true'
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

  // Payment intent creation is now handled by payment-intent.ts
}