import type { Express, Request, Response } from "express";
import { storage } from "./storage.js";

// Legacy event ID to UUID mapping for existing frontend forms
const LEGACY_EVENT_MAPPING: Record<number, { slug: string; name: string }> = {
  1: { slug: 'summer-wrestling-camp-2025', name: 'Summer Wrestling Elite Camp 2025' },
  2: { slug: 'recruiting-showcase-2025', name: 'College Recruiting Showcase' },
  3: { slug: 'technique-clinic-advanced', name: 'Advanced Technique Clinic' },
  4: { slug: 'summer-wrestling-camp-2025', name: 'Summer Wrestling Elite Camp 2025' } // Fallback to camp
};

// Helper to get UUID from legacy event ID
async function getEventUuidFromLegacyId(legacyId: number): Promise<string | null> {
  const mapping = LEGACY_EVENT_MAPPING[legacyId];
  if (!mapping) return null;
  
  const events = await storage.getEvents();
  const event = events.find(e => e.slug === mapping.slug);
  return event ? event.id : null;
}

// Device type detection
function detectDeviceType(userAgent: string | undefined): 'mobile' | 'tablet' | 'desktop' {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) return 'mobile';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
  return 'desktop';
}

export function setupLegacyBridge(app: Express): void {
  console.log('Setting up legacy bridge for frontend form compatibility...');

  // Bridge for team registration forms
  app.post("/api/team-registration", async (req: Request, res: Response) => {
    try {
      console.log('Team registration received via legacy bridge:', req.body);
      const teamData = req.body;

      // Map legacy event ID to UUID
      const eventUuid = await getEventUuidFromLegacyId(parseInt(teamData.eventId));
      if (!eventUuid) {
        return res.status(400).json({ 
          error: "Event not found",
          userFriendlyMessage: "The selected event is not available for registration."
        });
      }

      // Create registrations for each team member
      const registrationIds = [];
      for (const athlete of teamData.athletes) {
        const registration = await storage.createEventRegistration({
          eventId: eventUuid,
          firstName: athlete.firstName,
          lastName: athlete.lastName,
          email: athlete.email,
          phone: athlete.parentPhoneNumber,
          parentName: athlete.parentName,
          registrationType: 'team',
          teamName: teamData.teamName,
          basePrice: teamData.teamPrice?.toString() || "199",
          finalPrice: teamData.teamPrice?.toString() || "199",
          shirtSize: athlete.shirtSize,
          waiverAccepted: true,
          termsAccepted: true,
          sessionId: req.sessionID,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          deviceType: detectDeviceType(req.get('User-Agent'))
        });
        registrationIds.push(registration.id);
        console.log(`Created team registration for: ${athlete.firstName} ${athlete.lastName}`);
      }

      res.json({ 
        success: true, 
        message: "Team registration successful",
        registrationIds: registrationIds,
        teamName: teamData.teamName
      });
    } catch (error) {
      console.error("Team registration error:", error);
      res.status(500).json({ 
        error: "Failed to process team registration",
        userFriendlyMessage: "Unable to process team registration. Please try again."
      });
    }
  });

  // Bridge for individual event registrations after Stripe payment
  app.post("/api/events/:eventId/stripe-payment-success", async (req: Request, res: Response) => {
    try {
      console.log('Payment success handler called via legacy bridge:', req.params, req.body);
      const { eventId } = req.params;
      const paymentData = req.body;

      // Map legacy event ID to UUID
      const eventUuid = await getEventUuidFromLegacyId(parseInt(eventId));
      if (!eventUuid) {
        return res.status(400).json({ error: "Event not found" });
      }

      // Create registration record
      const registration = await storage.createEventRegistration({
        eventId: eventUuid,
        firstName: paymentData.firstName,
        lastName: paymentData.lastName,
        email: paymentData.email,
        phone: paymentData.phone,
        grade: paymentData.grade,
        schoolName: paymentData.schoolName,
        clubName: paymentData.clubName,
        parentName: paymentData.parentName || paymentData.contactName,
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

      // Create payment record if Stripe payment intent provided
      if (paymentData.stripePaymentIntentId) {
        await storage.createPayment({
          userId: registration.id, // Use registration ID as user reference for guest registrations
          amount: paymentData.finalPrice?.toString() || "0",
          paymentMethod: 'stripe',
          paymentSource: 'event',
          eventRegistrationId: registration.id,
          stripePaymentIntentId: paymentData.stripePaymentIntentId,
          status: 'completed',
          paymentDate: new Date()
        });
        console.log(`Created payment record for registration: ${registration.id}`);
      }

      console.log(`Created individual registration: ${paymentData.firstName} ${paymentData.lastName}`);
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

  // Bridge for admin registration endpoints
  app.get("/api/registrations", async (req: Request, res: Response) => {
    try {
      // Map legacy event ID filter to UUID if provided
      let eventUuid = undefined;
      if (req.query.eventId) {
        const legacyId = parseInt(req.query.eventId as string);
        eventUuid = await getEventUuidFromLegacyId(legacyId);
      }

      const registrations = eventUuid 
        ? await storage.getEventRegistrationsByEvent(eventUuid)
        : await storage.getEvents().then(async events => {
            const allRegistrations = [];
            for (const event of events) {
              const eventRegs = await storage.getEventRegistrationsByEvent(event.id);
              allRegistrations.push(...eventRegs);
            }
            return allRegistrations;
          });

      res.json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  // Bridge for analytics endpoints
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

  console.log('✅ Legacy bridge endpoints registered for frontend compatibility');
}