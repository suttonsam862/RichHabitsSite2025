import Stripe from 'stripe';
import { Request, Response } from 'express';
import { EVENT_PRODUCTS } from './shopify';
import { storage } from './storage';
import { getStripePriceId, getStripeProductId } from './stripeProducts';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe key: STRIPE_SECRET_KEY');
}

// Initialize Stripe with the secret key
// Using the latest API version and enabling live mode 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
  apiVersion: '2023-10-16'
});

// Explicitly log whether we're in live mode
const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');
console.log('Stripe live mode:', !isTestMode);

// Ensure we're using live mode in production
if (process.env.NODE_ENV === 'production' && isTestMode) {
  console.warn('WARNING: Using Stripe test mode in production environment');
}

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

    let amount: number;
    let clientSecret: string | null;
    let stripeProductId: string | null = null;
    let stripePriceId: string | null = null;

    // Get Stripe price ID for this event and option
    stripePriceId = getStripePriceId(eventId, option as 'full' | 'single');
    
    if (!stripePriceId) {
      console.warn(`No Stripe price found for event ${eventId} with option ${option}, falling back to calculated price`);
      // Fall back to calculated price
      amount = await getEventPrice(eventId, option);
      
      // Create a PaymentIntent with the calculated amount
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
          eventId: eventId.toString(),
          eventName: event.title,
          option,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      clientSecret = paymentIntent.client_secret;
    } else {
      // Get the associated product ID
      stripeProductId = getStripeProductId(eventId);
      console.log(`Using Stripe product ${stripeProductId} with price ${stripePriceId} for event ${eventId}`);
      
      // Retrieve the price to get the unit amount
      const price = await stripe.prices.retrieve(stripePriceId);
      amount = price.unit_amount || 0;
      
      // Create a PaymentIntent with the price's amount
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
          eventId: eventId.toString(),
          eventName: event.title,
          option,
          stripePriceId
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      clientSecret = paymentIntent.client_secret;
    }
    
    // Return response with common structure
    res.json({
      clientSecret,
      amount: amount / 100, // Convert back to dollars for display
      ...(stripePriceId && { priceId: stripePriceId }),
      ...(stripeProductId && { productId: stripeProductId })
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

    // Get the event details from database
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ error: `Event with ID ${eventId} not found` });
    }

    // Get the registration data from the payment intent metadata
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

    // Send the registration confirmation email
    await sendRegistrationConfirmationEmail({
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: registrationData.email,
      eventName: event.title,
      eventDates: event.date,
      eventLocation: event.location,
      registrationType: registrationData.registrationType,
      amount: (paymentIntent.amount / 100).toFixed(2), // Convert cents to dollars
      paymentId: paymentIntent.id
    });

    // Create a Shopify order (for inventory and record-keeping)
    const shopifyOrder = await createShopifyOrderFromRegistration(
      registrationData, 
      event, 
      paymentIntent.amount / 100 // Convert cents to dollars
    );
    
    // If we got a Shopify order, update the registration with the order ID
    if (shopifyOrder && shopifyOrder.id) {
      // For future: update the registration in the database with the Shopify order ID
      console.log(`Registration ${registration.id} linked to Shopify order ${shopifyOrder.id}`);
    }

    // Success response
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      registration,
      shopifyOrderId: shopifyOrder?.id || null
    });
    
  } catch (error) {
    console.error('Error handling successful payment:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Helper function to send registration confirmation email
async function sendRegistrationConfirmationEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  eventName: string;
  eventDates: string;
  eventLocation: string;
  registrationType: string;
  amount: string;
  paymentId: string;
}) {
  try {
    console.log('Sending registration confirmation email to:', data.email);
    
    // This is a placeholder for actual email sending logic
    // You'd typically use an email service like SendGrid here
    
    // For now, we'll just log the email content we would send
    const emailContent = `
      Subject: Registration Confirmation - ${data.eventName}


      Dear ${data.firstName} ${data.lastName},


      Thank you for registering for ${data.eventName}!

      Registration Details:
      - Event: ${data.eventName}
      - Dates: ${data.eventDates}
      - Location: ${data.eventLocation}
      - Registration Type: ${data.registrationType === 'full' ? 'Full Camp' : 'Single Day'}
      - Amount Paid: $${data.amount}
      - Payment ID: ${data.paymentId}

      We look forward to seeing you at the event!

      Best regards,
      Rich Habits Team
    `;
    
    console.log('Email content that would be sent:', emailContent);
    
    // In the future, add your email sending logic here
    // using SendGrid, Nodemailer, or another email service
    
    return true;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return false;
  }
}

// Helper function to create a Shopify order from registration
async function createShopifyOrderFromRegistration(
  registration: any,
  event: any,
  amount: number
) {
  try {
    // Import the Shopify API functions
    const { createShopifyDraftOrder } = await import('./shopify');
    
    console.log('Creating Shopify order for registration:', registration);
    
    // Define line items for the Shopify order
    const lineItems = [
      {
        title: `${event.title} - ${registration.registrationType === 'full' ? 'Full Camp' : 'Single Day'} Registration`,
        quantity: 1,
        price: amount
      }
    ];
    
    // Create customer data
    const customer = {
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      phone: registration.phone || ''
    };
    
    // Additional registration notes
    const note = `
      Registration Details:\n
      Event ID: ${registration.eventId}\n
      Student Name: ${registration.firstName} ${registration.lastName}\n
      Parent/Guardian: ${registration.contactName}\n
      T-Shirt Size: ${registration.tShirtSize}\n
      Grade: ${registration.grade}\n
      School: ${registration.schoolName}\n
      Club: ${registration.clubName || 'N/A'}\n
      Registration Type: ${registration.registrationType === 'full' ? 'Full Camp' : 'Single Day'}\n
      Payment Method: Stripe (ID: ${registration.shopifyOrderId})\n
      Registration Date: ${new Date().toISOString()}\n
    `;
    
    // If we have a function to create Shopify draft orders, use it
    if (typeof createShopifyDraftOrder === 'function') {
      const shopifyOrder = await createShopifyDraftOrder({
        lineItems,
        customer,
        note,
      });
      
      console.log('Shopify order created:', shopifyOrder);
      return shopifyOrder;
    } else {
      // This is just a placeholder for when the Shopify integration is not fully implemented
      console.log('Would create Shopify order with:', { lineItems, customer, note });
      return { id: `placeholder-${Date.now()}` };
    }
  } catch (error) {
    console.error('Failed to create Shopify order from registration:', error);
    return null;
  }
}

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
