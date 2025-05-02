import Stripe from 'stripe';
import { Request, Response } from 'express';
import { EVENT_PRODUCTS } from './shopify';
import { storage } from './storage';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe key: STRIPE_SECRET_KEY');
}

// Initialize Stripe with the secret key
// Using the latest API version and enabling live mode (not test mode)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true
});

// Log whether we're in test mode or live mode
console.log('Stripe live mode:', !stripe.testMode);

// Helper function to get the price for an event based on option
const getEventPrice = async (eventId: number, option: string): Promise<number> => {
  try {
    const event = await storage.getEvent(eventId);
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    // Parse the price from the event description
    const priceStr = event.price || '';
    const fullPriceMatch = priceStr.match(/\$([0-9]+)\s+full\s+camp/i);
    const singleDayMatch = priceStr.match(/\$([0-9]+)\s+(?:per|single)\s+day/i);
    
    if (option === 'full' && fullPriceMatch && fullPriceMatch[1]) {
      return parseInt(fullPriceMatch[1], 10) * 100; // Convert to cents for Stripe
    } else if (option === 'single' && singleDayMatch && singleDayMatch[1]) {
      return parseInt(singleDayMatch[1], 10) * 100; // Convert to cents for Stripe
    }

    // Fallback to pre-defined prices based on the event key
    const eventKeyMap: Record<number, string> = {
      1: 'birmingham-slam-camp',
      2: 'national-champ-camp',
      3: 'texas-recruiting-clinic',
      4: 'cory-land-tour'
    };
    
    const eventKey = eventKeyMap[eventId];
    if (eventKey && EVENT_PRODUCTS[eventKey as keyof typeof EVENT_PRODUCTS]) {
      const productMapping = EVENT_PRODUCTS[eventKey as keyof typeof EVENT_PRODUCTS];
      if (option === 'full' && productMapping.fullCamp) {
        return productMapping.fullCamp.price * 100;
      } else if (option === 'single' && productMapping.singleDay) {
        return productMapping.singleDay.price * 100;
      }
    }

    throw new Error(`No price information found for event ID ${eventId} with option ${option}`);
  } catch (error) {
    console.error('Error getting event price:', error);
    throw error;
  }
};

// Create a payment intent
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { option = 'full' } = req.body;
    const eventId = Number(req.params.eventId);

    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Get the event to retrieve its name and check if it exists
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ error: `Event with ID ${eventId} not found` });
    }

    // Get the price for the event based on the option
    const amount = await getEventPrice(eventId, option);

    // Create a PaymentIntent with the calculated amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        eventId: eventId.toString(),
        eventName: event.title, // use title field instead of name
        option,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount / 100, // Convert back to dollars for display
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Handle successful payments and create registration
export const handleSuccessfulPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, eventId: eventIdParam, amount } = req.body;
    const eventId = Number(req.params.eventId || eventIdParam);

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Retrieve the payment intent to verify it's successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: `Payment is not successful. Status: ${paymentIntent.status}`,
      });
    }

    // Get the registration data stored in session or your database
    // This would typically be stored when the user submits the registration form
    // For now, we'll create a simple registration record
    const registrationData = {
      eventId,
      firstName: paymentIntent.metadata.firstName || 'Not provided',
      lastName: paymentIntent.metadata.lastName || 'Not provided',
      contactName: paymentIntent.metadata.contactName || 'Not provided',
      email: paymentIntent.metadata.email || 'Not provided',
      phone: paymentIntent.metadata.phone || '',
      tShirtSize: paymentIntent.metadata.tShirtSize || 'Not provided',
      grade: paymentIntent.metadata.grade || 'Not provided',
      schoolName: paymentIntent.metadata.schoolName || 'Not provided',
      clubName: paymentIntent.metadata.clubName || '',
      medicalReleaseAccepted: true,
      registrationType: paymentIntent.metadata.option || 'full',
      shopifyOrderId: paymentIntent.id, // Use the payment intent ID as the order ID
      day1: paymentIntent.metadata.day1 === 'true',
      day2: paymentIntent.metadata.day2 === 'true',
      day3: paymentIntent.metadata.day3 === 'true',
    };

    // Create the registration in your database
    const registration = await storage.createEventRegistration(registrationData);

    // Success response
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      registration,
    });
    
    // TODO: Add code to send registration data to Shopify as a draft order
    // for inventory and record-keeping purposes
  } catch (error) {
    console.error('Error handling successful payment:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Create a webhook handler for Stripe events
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig || typeof sig !== 'string') {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  let event;

  try {
    // Verify the event came from Stripe using the signing secret
    // (We would need to set STRIPE_WEBHOOK_SECRET in production)
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // For development, we'll just log and accept the webhook without verification
      console.warn('STRIPE_WEBHOOK_SECRET not set, skipping signature verification');
      event = req.body;
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Process the successful payment - create registration, etc.
        const eventId = Number(paymentIntent.metadata?.eventId);
        if (eventId && !isNaN(eventId)) {
          // TOOD: Add code to process registration when webhook is received
        }
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        // Handle failed payment if needed
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error handling Stripe webhook:', err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};
