import type { Express, Request, Response } from "express";

/**
 * Simple Payment Intent Creation - Birmingham Slam Camp
 * Bypasses complex error logging to ensure registration works
 */
export function setupPaymentIntentRoutes(app: Express): void {
  // Birmingham Slam Camp payment intent creation
  app.post("/api/events/:eventId/create-payment-intent", async (req: Request, res: Response) => {
    try {
      console.log(`Creating payment intent for event: ${req.params.eventId}`);
      
      const eventId = req.params.eventId;
      const { option = 'full', registrationData, discountedAmount, discountCode } = req.body;

      // Handle Birmingham Slam Camp
      let event;
      if (eventId === '1' || eventId === 'birmingham-slam-camp') {
        event = {
          id: '1',
          slug: 'birmingham-slam-camp',
          title: 'Birmingham Slam Camp',
          basePrice: '249.00'
        };
      } else {
        return res.status(404).json({ 
          error: "Event not found", 
          eventId,
          userFriendlyMessage: "The event you're trying to register for could not be found."
        });
      }

      // Validate registration data
      if (!registrationData?.email || !registrationData?.firstName || !registrationData?.lastName) {
        return res.status(400).json({
          error: "Missing required registration data",
          userFriendlyMessage: "Please complete all required fields: email, first name, and last name."
        });
      }

      // Calculate amount
      let amount: number;
      if (discountedAmount !== undefined && discountedAmount !== null && typeof discountedAmount === 'number') {
        amount = discountedAmount;
      } else {
        const basePrice = parseFloat(event.basePrice);
        amount = option === "1day" ? basePrice * 0.5 : basePrice;
      }

      // Handle free registrations
      if (amount === 0) {
        return res.json({
          clientSecret: 'free_registration',
          amount: 0,
          eventId: event.id,
          eventTitle: event.title,
          isFreeRegistration: true
        });
      }

      // Ensure minimum amount
      if (amount > 0 && amount < 0.50) {
        amount = 0.50;
      }

      // Validate Stripe configuration
      if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
        return res.status(500).json({
          error: "Payment system not configured",
          userFriendlyMessage: "Payment processing is temporarily unavailable. Please contact support."
        });
      }

      // Create Stripe payment intent
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          eventId: event.id,
          eventSlug: event.slug,
          eventTitle: event.title,
          customerEmail: registrationData.email,
          customerName: `${registrationData.firstName} ${registrationData.lastName}`,
          participantFirstName: registrationData.firstName,
          participantLastName: registrationData.lastName,
          schoolName: registrationData.schoolName || '',
          age: registrationData.age || registrationData.grade || '',
          contactName: registrationData.contactName || '',
          phone: registrationData.phone || '',
          waiverAccepted: String(registrationData.medicalReleaseAccepted || registrationData.waiverAccepted || false),
          registrationType: 'individual',
          option: option,
          discountCode: discountCode || '',
          createShopifyOrder: 'true',
          source: 'birmingham_slam_camp_registration'
        }
      });

      if (!paymentIntent || !paymentIntent.client_secret) {
        return res.status(500).json({
          error: "Invalid payment intent response",
          userFriendlyMessage: "Payment setup failed. Please try again or contact support."
        });
      }

      console.log('Payment intent created successfully:', paymentIntent.id);
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        eventId: event.id,
        eventTitle: event.title,
        success: true
      });

    } catch (error) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ 
        error: "Payment intent creation failed",
        message: error instanceof Error ? error.message : "Unknown error",
        userFriendlyMessage: "Payment system is temporarily unavailable. Please try again in a few moments."
      });
    }
  });
}