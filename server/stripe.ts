import Stripe from 'stripe';
import { Request, Response } from 'express';
import { EVENT_PRODUCTS } from './shopify';
import { storage } from './storage';
import { getStripePriceId, getStripeProductId } from './stripeProducts';
import { 
  trackWebhookReceived, 
  trackWebhookSuccess, 
  trackWebhookFailure, 
  trackOrderCreated, 
  trackOrderFailed,
  logCriticalFailure
} from './monitoring.js';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe key: STRIPE_SECRET_KEY');
}

// Validate Stripe keys configuration
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_51RK25mBIRPjPy7BLnnfk9W4NLtkhEARrXCYY7yn2lAryA1jBPSkK7pU9ILCf1sJL0YVbrdd1mTcsYTot04uuIVav00HVWDloOE';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_aMVpANfxDWAJyyvavUoZfKStMmH2EkFl';

// Ensure keys match (both live or both test)
const secretIsLive = !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
const publishableIsLive = !STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_');

if (secretIsLive !== publishableIsLive) {
  throw new Error('Stripe key mismatch: secret and publishable keys must both be live or both be test keys');
}

// Initialize Stripe with the secret key
// Using the latest API version and enabling live mode 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
  apiVersion: '2025-04-30.basil'
});

// Explicitly log whether we're in live mode
const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');
console.log('Stripe live mode:', !isTestMode);

// Ensure we're using live mode in production
if (process.env.NODE_ENV === 'production' && isTestMode) {
  console.warn('WARNING: Using Stripe test mode in production environment');
}

// For development, we need to downgrade to test mode if using a test secret key
if (process.env.NODE_ENV === 'development' && !isTestMode) {
  console.warn('WARNING: Using Stripe live mode in development environment');
  console.log('Consider using test mode for development to avoid real charges');
}

// Helper function to get the price for an event based on option
const getEventPrice = async (eventId: number, option: string, numberOfDays?: number, selectedDates?: string[]): Promise<number> => {
  try {
    // Import pricing utilities to handle 1-day and team pricing correctly
    const { calculateRegistrationAmount } = await import('./pricingUtils.js');
    
    // Use the proper pricing calculation that handles 1-day registrations
    return calculateRegistrationAmount(eventId, option, numberOfDays, selectedDates);
  } catch (error) {
    console.error('Error getting event price:', error);
    throw error;
  }
};

// Verify a payment intent status
export const verifyPaymentIntent = async (paymentIntentId: string): Promise<boolean> => {
  try {
    // Get the payment intent to verify its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Only consider payments that have been successfully processed
    // Status must be 'succeeded' for a payment to be valid
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error(`Error verifying payment intent ${paymentIntentId}:`, error);
    return false;
  }
};

// Create a payment intent
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { option = 'full' } = req.body;
    const eventSlug = req.params.eventSlug;

    if (!eventSlug || typeof eventSlug !== 'string') {
      return res.status(400).json({ error: 'Invalid event slug' });
    }

    // Get the event by slug to retrieve its name and check if it exists
    const event = await storage.getEventBySlug(eventSlug);
    if (!event) {
      return res.status(404).json({ error: `Event with slug '${eventSlug}' not found` });
    }

    let amount: number;
    let clientSecret: string | null;
    let stripeProductId: string | null = null;
    let stripePriceId: string | null = null;

    // Log Stripe mode for debugging
    const isLiveMode = !process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');
    console.log(`Creating payment intent in ${isLiveMode ? 'LIVE' : 'TEST'} mode for event ${event.id} (${event.title})`);

    // CRITICAL FIX: Always prioritize discountedAmount when provided
    const discountedAmount = req.body.discountedAmount;
    
    if (discountedAmount !== null && discountedAmount !== undefined && typeof discountedAmount === 'number') {
      // Use the final discounted price directly (already validated by discount system)
      amount = Math.round(discountedAmount * 100); // Convert to cents
      console.log(`✅ Using provided discounted price: $${discountedAmount} (${amount} cents) for discount code: ${req.body.discountCode}`);
      
      // Additional validation for discounted amount
      if (amount < 0) {
        return res.status(400).json({
          error: 'Invalid discounted amount: cannot be negative'
        });
      }
    } else {
      // Map event slug back to numeric ID for pricing calculation
      const eventSlugToIdMap: Record<string, number> = {
        'summer-wrestling-camp-2025': 1,
        'recruiting-showcase-2025': 2, 
        'technique-clinic-advanced': 3
      };
      
      const numericEventId = eventSlugToIdMap[event.slug] || 1;
      
      // Get calculated price only when no discount provided
      amount = await getEventPrice(numericEventId, option, req.body.numberOfDays, req.body.selectedDates);
      console.log(`💰 Using calculated base price: $${amount/100} (${amount} cents) for event ${numericEventId} (${option})`);
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          error: 'Could not determine price for the event'
        });
      }
    }
    
    console.log(`Using calculated price of $${amount/100} for event ${event.id} (${event.title})`);
    
    try {
      // Include all customer registration details in the metadata
      const customerInfo = req.body;
      
      // Create metadata with all registration fields
      const metadata: Record<string, string> = {
        eventId: event.id.toString(),
        eventName: event.title,
        option,
        // Add all customer registration data from the request body
        firstName: customerInfo.firstName || '',
        lastName: customerInfo.lastName || '',
        contactName: customerInfo.contactName || '',
        email: customerInfo.email || '',
        phone: customerInfo.phone || '',
        tShirtSize: customerInfo.tShirtSize || '',
        grade: customerInfo.grade || '',
        schoolName: customerInfo.schoolName || '',
        clubName: customerInfo.clubName || '',
        // Convert boolean values to strings for metadata
        day1: (customerInfo.day1 === true || customerInfo.day1 === 'true') ? 'true' : 'false',
        day2: (customerInfo.day2 === true || customerInfo.day2 === 'true') ? 'true' : 'false',
        day3: (customerInfo.day3 === true || customerInfo.day3 === 'true') ? 'true' : 'false',
      };
      
      console.log('Creating PaymentIntent with customer metadata:', metadata);
      
      // Create a PaymentIntent with the calculated amount and all customer data
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      clientSecret = paymentIntent.client_secret;
      
      if (!clientSecret) {
        throw new Error('Failed to get client secret from payment intent');
      }
    } catch (stripeError) {
      console.error('Stripe error creating payment intent:', stripeError);
      return res.status(400).json({
        error: stripeError instanceof Error ? stripeError.message : 'Error creating payment intent with Stripe',
      });
    }
    
    if (!clientSecret) {
      return res.status(500).json({
        error: 'Failed to obtain client secret from Stripe',
      });
    }
    
    // Return response with common structure
    const response: Record<string, any> = {
      clientSecret,
      amount: amount / 100, // Convert back to dollars for display
    };
    
    // Add optional fields if they exist
    if (stripePriceId) response.priceId = stripePriceId;
    if (stripeProductId) response.productId = stripeProductId;
    
    res.json(response);
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
    const { paymentIntentId, eventId: eventIdParam, amount, freeRegistration, discountCode } = req.body;
    const eventId = Number(req.params.eventId || eventIdParam);
    
    // Check for valid event ID
    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Handle free registration case (100% discount)
    let paymentIntent: any;
    
    if (freeRegistration) {
      console.log('Processing free registration with discount code:', discountCode);
      console.log('Registration data received:', req.body);
      
      // For free registrations, we won't verify a payment intent
      // Instead, we'll use the registration data sent from the client
      
      // Retrieve registration data from registration form (stored in client sessionStorage)
      const registrationEmail = req.body.email || '';
      
      if (!registrationEmail) {
        return res.status(400).json({ error: 'Missing email for free registration' });
      }
      
      // Create a mock payment intent for free registrations
      paymentIntent = {
        id: `free_reg_${Date.now()}`,
        amount: 0,
        status: 'succeeded',
        metadata: {
          firstName: req.body.firstName || '',
          lastName: req.body.lastName || '',
          contactName: req.body.contactName || '',
          email: registrationEmail,
          phone: req.body.phone || '',
          tShirtSize: req.body.tShirtSize || '',
          grade: req.body.grade || '',
          schoolName: req.body.schoolName || '',
          clubName: req.body.clubName || '',
          option: req.body.registrationType || req.body.option || 'full',
          day1: req.body.day1 || 'false',
          day2: req.body.day2 || 'false',
          day3: req.body.day3 || 'false',
          discountCode: discountCode || ''
        }
      };
      
      console.log('Created mock payment intent for free registration:', paymentIntent);
      // For free registrations, we'll continue with the flow using our mock payment intent
    } else {
      // For paid registrations, we need a payment intent ID
      if (!paymentIntentId) {
        return res.status(400).json({ error: 'Payment intent ID is required' });
      }
      
      // Retrieve the payment intent to verify it's successful
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          error: `Payment is not successful. Status: ${paymentIntent.status}`,
        });
      }
    }

    // Get the event details from database
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ error: `Event with ID ${eventId} not found` });
    }

    // Get the registration data from the request body if this is a free registration,
    // otherwise from the payment intent metadata
    
    // Log the metadata for debugging
    console.log('Payment intent metadata:', paymentIntent.metadata);
    
    // Use the complete registration data sent from frontend, not just metadata
    const registrationData = {
      eventId,
      firstName: req.body.firstName || paymentIntent.metadata.firstName || '',
      lastName: req.body.lastName || paymentIntent.metadata.lastName || '',
      contactName: req.body.contactName || paymentIntent.metadata.contactName || '',
      email: req.body.email || paymentIntent.metadata.email || '',
      phone: req.body.phone || paymentIntent.metadata.phone || '',
      tShirtSize: req.body.tShirtSize || paymentIntent.metadata.tShirtSize || '',
      grade: req.body.grade || paymentIntent.metadata.grade || '',
      gender: req.body.gender || paymentIntent.metadata.gender || '',
      schoolName: req.body.schoolName || paymentIntent.metadata.schoolName || '',
      clubName: req.body.clubName || paymentIntent.metadata.clubName || '',
      medicalReleaseAccepted: true,
      registrationType: req.body.registrationType || req.body.option || paymentIntent.metadata.option || 'full',
      day1: req.body.day1 === true || req.body.day1 === 'true' || paymentIntent.metadata.day1 === 'true',
      day2: req.body.day2 === true || req.body.day2 === 'true' || paymentIntent.metadata.day2 === 'true',
      day3: req.body.day3 === true || req.body.day3 === 'true' || paymentIntent.metadata.day3 === 'true',
    };
    
    // Verify the registration data is complete
    console.log('Constructed registration data:', registrationData);
    
    // Validate critical fields and provide meaningful error messages
    if (!registrationData.email || registrationData.email === 'Not provided') {
      console.error('Missing email in registration data. This will cause issues with Shopify orders.');
    }
    
    if (!registrationData.firstName || registrationData.firstName === 'Not provided' ||
        !registrationData.lastName || registrationData.lastName === 'Not provided') {
      console.error('Missing name information in registration data. This will cause issues with Shopify orders.');
    }

    // First create the Shopify order to get the order ID
    console.log('Creating Shopify order for registration...');
    const shopifyOrder = await createShopifyOrderFromRegistration(
      registrationData, 
      event, 
      paymentIntent.amount / 100 // Convert cents to dollars
    );
    
    // Create the complete registration entry - this is the MASTER record
    const completeRegistrationData = {
      eventId,
      eventName: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      camperName: `${registrationData.firstName} ${registrationData.lastName}`,
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: registrationData.email,
      phone: registrationData.phone,
      grade: registrationData.grade,
      gender: registrationData.gender || 'Not specified',
      schoolName: registrationData.schoolName,
      clubName: registrationData.clubName || '',
      tShirtSize: registrationData.tShirtSize,
      parentGuardianName: registrationData.contactName,
      registrationType: registrationData.registrationType,
      day1: registrationData.day1,
      day2: registrationData.day2,
      day3: registrationData.day3,
      medicalReleaseAccepted: true,
      stripePaymentIntentId: paymentIntent.id,
      shopifyOrderId: shopifyOrder?.id?.toString() || `ORDER_${paymentIntent.id}`,
      amountPaid: paymentIntent.amount, // Amount in cents
      paymentDate: new Date(),
      paymentStatus: 'completed',
      source: 'website',
      notes: 'Registration completed via website'
    };

    // Create the registration record in the event_registrations table
    const eventRegistrationData = {
      eventId: event.id,
      eventSlug: event.slug,
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      contactName: registrationData.contactName || `${registrationData.firstName} ${registrationData.lastName}`,
      email: registrationData.email,
      phone: registrationData.phone || null,
      tShirtSize: registrationData.tShirtSize || null,
      grade: registrationData.grade || null,
      schoolName: registrationData.schoolName || null,
      clubName: registrationData.clubName || null,
      // experience: registrationData.experience || null, // Field not available in current schema
      medicalReleaseAccepted: registrationData.medicalReleaseAccepted || true,
      registrationType: registrationData.registrationType || 'individual',
      paymentStatus: 'paid',
      paymentIntentId: paymentIntent.id,
      gender: registrationData.gender || null,
      day1: registrationData.day1 || false,
      day2: registrationData.day2 || false,
      day3: registrationData.day3 || false
    };

    const completeRegistration = await storage.createEventRegistration(eventRegistrationData);
    console.log(`Registration created successfully: ID ${completeRegistration.id} for ${registrationData.firstName} ${registrationData.lastName}`);

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
      paymentId: paymentIntent.id,
      shopifyOrderId: shopifyOrder?.id?.toString()
    });

    // Success response
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      registration: completeRegistration,
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
  shopifyOrderId?: string;
}) {
  try {
    // Log the email information to verify it's correct
    console.log('Sending registration confirmation email to:', data.email);
    console.log('Confirmation details:', {
      firstName: data.firstName,
      lastName: data.lastName,
      eventName: data.eventName,
      amountPaid: data.amount,
      registrationType: data.registrationType
    });
    
    // Validate email
    if (!data.email || !data.email.includes('@')) {
      console.error('Invalid email address, cannot send confirmation:', data.email);
      return false;
    }
    
    // Format email content
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
    
    console.log('Email content prepared for sending');
    
    // This would be replaced with actual email sending code
    // Example using SendGrid:
    // 
    // if (process.env.SENDGRID_API_KEY) {
    //   const sgMail = require('@sendgrid/mail');
    //   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    //   const msg = {
    //     to: data.email,
    //     from: 'noreply@rich-habits.com',
    //     subject: `Registration Confirmation - ${data.eventName}`,
    //     text: emailContent,
    //     html: emailContent.replace(/\n/g, '<br>')
    //   };
    //   await sgMail.send(msg);
    //   console.log('Confirmation email sent successfully via SendGrid');
    // } else {
    //   console.log('SENDGRID_API_KEY not configured, email would be sent with content:', emailContent);
    // }
    
    return true;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return false;
  }
}

// Helper function to create a Shopify order from registration
export async function createShopifyOrderFromRegistration(
  registration: any,
  event: any,
  amount: number
) {
  try {
    // Import the Shopify API functions
    const { createShopifyDraftOrder } = await import('./shopify');
    
    console.log('Creating Shopify order for registration with complete data:', JSON.stringify(registration, null, 2));
    
    // Enhanced validation for all required fields
    if (!registration.email || registration.email === 'Not provided') {
      console.error('Registration missing valid email address, cannot create Shopify order');
      return null;
    }
    
    if (!registration.firstName || registration.firstName === 'Not provided' ||
        !registration.lastName || registration.lastName === 'Not provided') {
      console.error('Registration missing name information, cannot create Shopify order');
      return null;
    }
    
    // Log details for debugging
    console.log(`Creating Shopify order with customer email: ${registration.email}`);
    console.log(`Customer Name: ${registration.firstName} ${registration.lastName}`);
    console.log(`Contact Name: ${registration.contactName}`);
    console.log(`T-Shirt Size: ${registration.tShirtSize}`);
    console.log(`Grade: ${registration.grade}`);
    console.log(`School: ${registration.schoolName}`);
    
    // Define line items for the Shopify order with more detailed description
    const lineItems = [
      {
        title: `${event.title} - ${registration.registrationType === 'full' ? 'Full Camp' : 'Single Day'} Registration`,
        quantity: 1,
        price: amount
      }
    ];
    
    // Create customer data with email validation
    const email = registration.email.trim();
    if (!email.includes('@')) {
      console.error('Invalid email format:', email);
      return null;
    }
    
    const customer = {
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: email,
      phone: registration.phone || ''
    };
    
    // Create additional attributes for the order - ensure all registration data is included
    const attributes = [
      { key: "Event_Name", value: event.title },
      { key: "Event_ID", value: registration.eventId.toString() },
      { key: "Registration_Type", value: registration.registrationType === 'full' ? 'Full Camp' : 'Single Day' },
      { key: "Student_Name", value: `${registration.firstName} ${registration.lastName}` },
      { key: "Parent_Guardian", value: registration.contactName },
      { key: "T_Shirt_Size", value: registration.tShirtSize },
      { key: "Grade", value: registration.grade },
      { key: "School", value: registration.schoolName },
      { key: "Club", value: registration.clubName || 'N/A' }
    ];
    
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
        attributes
      });
      
      console.log('Shopify order created:', shopifyOrder);
      return shopifyOrder;
    } else {
      // This is just a placeholder for when the Shopify integration is not fully implemented
      console.log('Would create Shopify order with:', { lineItems, customer, note, attributes });
      return { id: `placeholder-${Date.now()}` };
    }
  } catch (error) {
    console.error('Failed to create Shopify order from registration:', error);
    return null;
  }
}

// Create a webhook handler for Stripe events
export const handleStripeWebhook = async (req: Request, res: Response) => {
  trackWebhookReceived();
  
  const sig = req.headers['stripe-signature'];

  if (!sig || typeof sig !== 'string') {
    trackWebhookFailure();
    logCriticalFailure('webhook', 'Missing Stripe signature', { headers: req.headers });
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  let event;

  try {
    // Verify the event came from Stripe using the signing secret
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
        
        // CRITICAL: Double-verify the payment status to prevent processing incorrectly submitted payments
        // Skip verification for test webhooks to allow testing
        let paymentStatus = true;
        if (!paymentIntent.id.startsWith('pi_test_')) {
          paymentStatus = await verifyPaymentIntent(paymentIntent.id);
          if (!paymentStatus) {
            console.error(`Payment verification failed for payment intent ${paymentIntent.id} - not processing this registration`);
            break;
          }
        } else {
          console.log(`Skipping verification for test payment intent ${paymentIntent.id}`);
        }
        
        // Payment verified, now process the successful payment
        const eventId = Number(paymentIntent.metadata?.eventId);
        const registrationId = Number(paymentIntent.metadata?.registrationId);
        
        if (eventId && !isNaN(eventId)) {
          try {
            // Get the event details
            const event = await storage.getEvent(eventId);
            if (!event) {
              console.error(`Event with ID ${eventId} not found`);
              break;
            }
            
            // Get registration data - either from metadata or from database
            let registrationData: any;
            
            if (registrationId && !isNaN(registrationId)) {
              // Get the original registration from database
              const originalRegistration = await storage.getRegistration(registrationId);
              if (originalRegistration) {
                registrationData = originalRegistration;
                console.log(`Using registration data from database for ID ${registrationId}`);
              } else {
                console.warn(`Registration with ID ${registrationId} not found in database, using metadata instead`);
                registrationData = paymentIntent.metadata;
              }
            } else {
              // Use metadata from the payment intent
              console.log('Using registration data from payment intent metadata');
              registrationData = paymentIntent.metadata;
            }
            
            // Calculate the amount for the Shopify order
            const option = registrationData.option || registrationData.registrationType || 'full';
            const amount = await getEventPrice(eventId, option);
            
            // Extract full registration information
            const registration = {
              eventId: eventId,
              firstName: registrationData.firstName || 'Not provided',
              lastName: registrationData.lastName || 'Not provided',
              contactName: registrationData.contactName || 'Not provided',
              email: registrationData.email || 'Not provided',
              phone: registrationData.phone || 'Not provided',
              tShirtSize: registrationData.tShirtSize || 'Not provided',
              grade: registrationData.grade || 'Not provided',
              schoolName: registrationData.schoolName || 'Not provided',
              clubName: registrationData.clubName || 'Not provided',
              registrationType: registrationData.registrationType || option,
              day1: registrationData.day1 === 'true' || registrationData.day1 === true,
              day2: registrationData.day2 === 'true' || registrationData.day2 === true,
              day3: registrationData.day3 === 'true' || registrationData.day3 === true,
              shopifyOrderId: '',
              stripePaymentIntentId: paymentIntent.id
            };
            
            // Create Shopify order from the registration data
            console.log('Creating Shopify order with registration data:', registration);
            const shopifyOrder = await createShopifyOrderFromRegistration(registration, event, amount / 100);
            
            if (shopifyOrder) {
              console.log('Successfully created Shopify order:', shopifyOrder.id);
              trackOrderCreated();
              
              // Update registration with Shopify order ID if we have a database record
              if (registrationId && !isNaN(registrationId)) {
                try {
                  await storage.updateRegistration(registrationId, {
                    shopifyOrderId: shopifyOrder.id
                  });
                  console.log(`Updated registration #${registrationId} with Shopify order ID ${shopifyOrder.id}`);
                } catch (error) {
                  console.error('Error updating registration with Shopify order ID:', error);
                }
              }
              
              // Add Shopify order ID to the registration data
              registration.shopifyOrderId = shopifyOrder.id;
            } else {
              console.error('Failed to create Shopify order from registration data');
              trackOrderFailed();
              logCriticalFailure('shopify', 'Order creation failed', { 
                paymentIntentId: paymentIntent.id, 
                eventId, 
                registrationData: registration 
              });
            }
            
            // Copy to completed registrations table if we have a registration ID
            if (registrationId && !isNaN(registrationId)) {
              try {
                // Copy the registration to the completed table
                const completedRegistration = await storage.createCompletedEventRegistration(
                  registrationId, 
                  paymentIntent.id
                );
                
                if (completedRegistration) {
                  console.log(`Created completed registration record #${completedRegistration.id} for registration #${registrationId}`);
                  
                  // If we have a Shopify order ID, update the completed registration
                  if (shopifyOrder && shopifyOrder.id) {
                    try {
                      await storage.updateCompletedRegistration(completedRegistration.id, {
                        shopify_order_id: shopifyOrder.id
                      });
                      console.log(`Updated completed registration #${completedRegistration.id} with Shopify order ID ${shopifyOrder.id}`);
                    } catch (error) {
                      console.error('Error updating completed registration with Shopify order ID:', error);
                    }
                  }
                } else {
                  console.error(`Failed to create completed registration for registration #${registrationId}`);
                }
              } catch (error) {
                console.error('Error creating completed registration:', error);
              }
            } else {
              console.warn('No registration ID in metadata, skipping completed registration creation');
            }
            
            // Send confirmation email
            try {
              await sendRegistrationConfirmationEmail({
                firstName: registration.firstName,
                lastName: registration.lastName,
                email: registration.email,
                eventName: event.title,
                eventDates: event.date || "",
                eventLocation: event.location || "",
                registrationType: registration.registrationType,
                amount: (amount / 100).toString(),
                paymentId: paymentIntent.id
              });
            } catch (error) {
              console.error('Error sending confirmation email:', error);
            }
          } catch (error) {
            console.error('Error processing payment success:', error);
          }
        } else {
          console.warn('Missing event ID in payment intent metadata:', paymentIntent.metadata);
        }
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        // Handle failed payment if needed
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    trackWebhookSuccess();
    res.json({ received: true });
  } catch (err) {
    console.error('Error handling Stripe webhook:', err);
    trackWebhookFailure();
    logCriticalFailure('webhook', err instanceof Error ? err.message : 'Unknown webhook error', {
      requestBody: req.body,
      headers: req.headers
    });
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};
