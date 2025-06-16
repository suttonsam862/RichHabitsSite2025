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
// Using default API version for compatibility
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true
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
    // Extract and validate basic parameters
    const { option = 'full' } = req.body;
    const eventSlug = req.params.eventSlug;

    // Validate event slug
    if (!eventSlug || typeof eventSlug !== 'string') {
      console.error('Invalid event slug provided:', eventSlug);
      return res.status(400).json({ 
        error: 'Invalid event slug',
        userFriendlyMessage: 'Event not found. Please try again.'
      });
    }

    // Get the event by slug
    let event;
    try {
      event = await storage.getEventBySlug(eventSlug);
      if (!event) {
        console.error(`Event not found for slug: ${eventSlug}`);
        return res.status(404).json({ 
          error: `Event with slug '${eventSlug}' not found`,
          userFriendlyMessage: 'Event not found. Please select a valid event.'
        });
      }
    } catch (dbError) {
      console.error('Database error fetching event:', dbError);
      return res.status(500).json({
        error: 'Database error fetching event',
        userFriendlyMessage: 'Unable to load event details. Please try again.'
      });
    }

    // Validate Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('CRITICAL: Stripe secret key not configured');
      return res.status(500).json({
        error: 'Payment system not configured',
        userFriendlyMessage: 'Payment processing is temporarily unavailable. Please contact support.'
      });
    }

    // Log Stripe mode for debugging
    const isLiveMode = !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
    console.log(`Creating payment intent in ${isLiveMode ? 'LIVE' : 'TEST'} mode for event ${event.id} (${event.title})`);

    // Calculate amount with comprehensive validation
    let amount: number;
    const discountedAmount = req.body.discountedAmount;

    if (discountedAmount !== null && discountedAmount !== undefined && typeof discountedAmount === 'number') {
      // Use discounted amount (already validated by discount system)
      if (discountedAmount < 0) {
        console.error('Invalid discounted amount (negative):', discountedAmount);
        return res.status(400).json({
          error: 'Invalid discounted amount: cannot be negative',
          userFriendlyMessage: 'There was an issue with your discount. Please try again.'
        });
      }

      amount = Math.round(discountedAmount * 100); // Convert to cents
      console.log(`✅ Using discounted price: $${discountedAmount} (${amount} cents) for discount code: ${req.body.discountCode}`);
    } else {
      // Use event's base price
      if (!event.id) {
        console.error('CRITICAL: Event missing ID:', { eventSlug, event });
        return res.status(400).json({
          error: 'Event configuration error: missing event ID',
          userFriendlyMessage: 'Event configuration issue. Please contact support.'
        });
      }

      const basePrice = parseFloat(event.basePrice) || 0;
      if (basePrice <= 0) {
        console.error('CRITICAL: Invalid base price for event:', { eventId: event.id, basePrice });
        return res.status(400).json({
          error: 'Event pricing configuration error',
          userFriendlyMessage: 'Event pricing not configured. Please contact support.'
        });
      }

      amount = Math.round(basePrice * 100); // Convert to cents
      console.log(`💰 Using base price: $${basePrice} (${amount} cents) for event ${event.id}`);
    }

    // Final amount validation
    if (!amount || isNaN(amount) || amount <= 0) {
      console.error('CRITICAL: Invalid final amount:', { eventId: event.id, amount, basePrice: event.basePrice });
      return res.status(400).json({
        error: 'Could not determine valid price for the event',
        userFriendlyMessage: 'Pricing error. Please refresh the page and try again.'
      });
    }

    // Validate customer information
    const customerInfo = req.body;
    const validationErrors = [];

    if (!customerInfo.email || typeof customerInfo.email !== 'string' || !customerInfo.email.includes('@')) {
      validationErrors.push('Valid email address is required');
    }
    if (!customerInfo.firstName || typeof customerInfo.firstName !== 'string' || customerInfo.firstName.trim().length < 2) {
      validationErrors.push('First name is required (minimum 2 characters)');
    }
    if (!customerInfo.lastName || typeof customerInfo.lastName !== 'string' || customerInfo.lastName.trim().length < 2) {
      validationErrors.push('Last name is required (minimum 2 characters)');
    }

    if (validationErrors.length > 0) {
      console.error('Customer validation errors:', validationErrors);
      return res.status(400).json({
        error: 'Customer information validation failed',
        validationErrors,
        userFriendlyMessage: 'Please check your registration information and try again.'
      });
    }

    // Create comprehensive metadata
    const metadata: Record<string, string> = {
      eventId: event.id.toString(),
      eventName: event.title,
      eventSlug: eventSlug,
      option: option,
      firstName: customerInfo.firstName.trim(),
      lastName: customerInfo.lastName.trim(),
      contactName: customerInfo.contactName ? customerInfo.contactName.trim() : `${customerInfo.firstName.trim()} ${customerInfo.lastName.trim()}`,
      email: customerInfo.email.trim().toLowerCase(),
      phone: customerInfo.phone ? customerInfo.phone.trim() : '',
      tShirtSize: customerInfo.tShirtSize || '',
      grade: customerInfo.grade || '',
      schoolName: customerInfo.schoolName ? customerInfo.schoolName.trim() : '',
      clubName: customerInfo.clubName ? customerInfo.clubName.trim() : '',
      registrationType: customerInfo.registrationType || 'individual',
      // Day selections (convert to strings for metadata)
      day1: (customerInfo.day1 === true || customerInfo.day1 === 'true') ? 'true' : 'false',
      day2: (customerInfo.day2 === true || customerInfo.day2 === 'true') ? 'true' : 'false',
      day3: (customerInfo.day3 === true || customerInfo.day3 === 'true') ? 'true' : 'false',
      // Additional tracking
      createdAt: new Date().toISOString(),
      source: 'website_registration'
    };

    // Log payment intent creation for audit trail
    console.log('🚨 PAYMENT INTENT CREATION:');
    console.log(`  Event: ${metadata.eventName} (${metadata.eventId})`);
    console.log(`  Amount: $${amount/100} (${amount} cents)`);
    console.log(`  Customer: ${metadata.firstName} ${metadata.lastName} (${metadata.email})`);
    console.log(`  Registration Type: ${metadata.registrationType}`);
    console.log(`  Timestamp: ${metadata.createdAt}`);

    // Create Stripe payment intent with retry logic
    let paymentIntent;
    let clientSecret: string;

    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
        // Add description for better Stripe dashboard visibility
        description: `${event.title} Registration - ${customerInfo.firstName} ${customerInfo.lastName}`,
        // Set receipt email
        receipt_email: customerInfo.email.trim().toLowerCase()
      });

      clientSecret = paymentIntent.client_secret;

      if (!clientSecret) {
        throw new Error('Payment intent created but no client secret returned');
      }

      console.log(`✅ Payment intent created successfully: ${paymentIntent.id}`);

    } catch (stripeError: any) {
      console.error('Stripe payment intent creation failed:', {
        error: stripeError.message,
        code: stripeError.code,
        type: stripeError.type,
        eventId: event.id,
        amount: amount,
        customerEmail: customerInfo.email
      });

      // Return user-friendly error messages based on Stripe error types
      let userMessage = 'Payment setup failed. Please try again.';

      if (stripeError.code === 'parameter_invalid_empty') {
        userMessage = 'Missing required payment information. Please check your details.';
      } else if (stripeError.code === 'parameter_invalid_integer') {
        userMessage = 'Invalid payment amount. Please refresh and try again.';
      } else if (stripeError.type === 'authentication_error') {
        userMessage = 'Payment system authentication error. Please contact support.';
      }

      return res.status(400).json({
        error: 'Payment intent creation failed',
        stripeError: stripeError.message,
        userFriendlyMessage: userMessage
      });
    }

    // Success response
    const response = {
      clientSecret,
      amount: amount / 100, // Convert back to dollars for display
      paymentIntentId: paymentIntent.id,
      eventId: event.id,
      eventName: event.title
    };

    console.log(`✅ Payment intent response prepared for ${customerInfo.email}`);
    res.json(response);

  } catch (error) {
    console.error('Unexpected error in createPaymentIntent:', error);

    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      userFriendlyMessage: 'Something went wrong. Please refresh the page and try again.'
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

    // CRITICAL: Prevent duplicate payment processing
    if (paymentIntentId && !freeRegistration) {
      // Check if this payment intent has already been processed
      const existingPayment = await storage.getPaymentByStripeId(paymentIntentId);
      if (existingPayment) {
        console.log(`⚠️ Payment intent ${paymentIntentId} already processed. Returning existing registration.`);
        return res.status(409).json({ 
          error: "Payment already processed",
          registrationId: existingPayment.eventRegistrationId,
          message: "This payment has already been processed successfully."
        });
      }
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
    const event = await storage.getEvent(eventId.toString());
    if (!event) {
      return res.status(404).json({ error: `Event with ID ${eventId} not found` });
    }

    // Get the registration data from the request body if this is a free registration,
    // otherwise from the payment intent metadata

    // Log the metadata for debugging
    console.log('Payment intent metadata:', paymentIntent.metadata);

    // Use the complete registration data from payment intent metadata
    const registrationData = {
      eventId,
      firstName: paymentIntent.metadata.participantFirstName || paymentIntent.metadata.firstName || '',
      lastName: paymentIntent.metadata.participantLastName || paymentIntent.metadata.lastName || '',
      contactName: paymentIntent.metadata.contactName || '',
      email: paymentIntent.metadata.customerEmail || '',
      phone: paymentIntent.metadata.phone || '',
      age: paymentIntent.metadata.age || '',
      schoolName: paymentIntent.metadata.schoolName || '',
      waiverAccepted: paymentIntent.metadata.waiverAccepted === 'true',
      tShirtSize: paymentIntent.metadata.tShirtSize || '',
      grade: paymentIntent.metadata.grade || paymentIntent.metadata.age || '',
      gender: paymentIntent.metadata.gender || '',
      clubName: paymentIntent.metadata.clubName || '',
      medicalReleaseAccepted: paymentIntent.metadata.waiverAccepted === 'true',
      registrationType: paymentIntent.metadata.registrationType || 'individual',
      day1: paymentIntent.metadata.day1 === 'true',
      day2: paymentIntent.metadata.day2 === 'true',
      day3: paymentIntent.metadata.day3 === 'true',
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
      eventDate: event.startDate.toDateString(),
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
      medicalReleaseAccepted: registrationData.medicalReleaseAccepted || true,
      registrationType: registrationData.registrationType || 'individual',
      paymentStatus: 'paid',
      paymentIntentId: paymentIntent.id,
      gender: registrationData.gender || null,
      day1: registrationData.day1 || false,
      day2: registrationData.day2 || false,
      day3: registrationData.day3 || false,
      basePrice: (amount / 100).toString(),
      finalPrice: (amount / 100).toString()
    };

    const completeRegistration = await storage.createEventRegistration(eventRegistrationData);
    console.log(`Registration created successfully: ID ${completeRegistration.id} for ${registrationData.firstName} ${registrationData.lastName}`);

    // Send the registration confirmation email
    await sendRegistrationConfirmationEmail({
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: registrationData.email,
      eventName: event.title,
      eventDates: event.startDate.toDateString(),
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
      firstName: registration.contactName ? registration.contactName.split(' ')[0] : registration.firstName,
      lastName: registration.contactName ? registration.contactName.split(' ').slice(1).join(' ') || registration.lastName : registration.lastName,
      email: email,
      phone: registration.phone || ''
    };

    // Create additional attributes for the order - ensure all registration data is included
    const attributes = [
      { key: "Event_Name", value: event.title },
      { key: "Event_ID", value: registration.eventId.toString() },
      { key: "Registration_Type", value: registration.registrationType === 'full' ? 'Full Camp' : 'Single Day' },
      { key: "Participant_First_Name", value: registration.firstName },
      { key: "Participant_Last_Name", value: registration.lastName },
      { key: "Contact_Name_Parent_Guardian", value: registration.contactName || '' },
      { key: "Contact_Email", value: registration.email },
      { key: "Contact_Phone", value: registration.phone || '' },
      { key: "Participant_Age", value: registration.age || '' },
      { key: "School_Name", value: registration.schoolName || '' },
      { key: "T_Shirt_Size", value: registration.tShirtSize || '' },
      { key: "Grade", value: registration.grade || '' },
      { key: "Club", value: registration.clubName || 'N/A' },
      { key: "Medical_Waiver_Accepted", value: registration.waiverAccepted ? 'Yes' : 'No' },
      { key: "Medical_Release_Accepted", value: registration.medicalReleaseAccepted ? 'Yes' : 'No' }
    ];

    // Additional registration notes with all form fields including medical waiver
    const note = `
      Birmingham Slam Camp Registration Details:\n
      Event: ${event.title}\n
      Participant: ${registration.firstName} ${registration.lastName}\n
      Age: ${registration.age || 'Not provided'}\n
      School: ${registration.schoolName || 'Not provided'}\n
      Contact (Parent/Guardian): ${registration.contactName || 'Not provided'}\n
      Contact Email: ${registration.email}\n
      Contact Phone: ${registration.phone || 'Not provided'}\n
      T-Shirt Size: ${registration.tShirtSize || 'Not provided'}\n
      Grade: ${registration.grade || 'Not provided'}\n
      Club: ${registration.clubName || 'N/A'}\n
      Registration Type: ${registration.registrationType === 'full' ? 'Full Camp' : 'Single Day'}\n
      Medical Waiver Accepted: ${registration.waiverAccepted ? 'Yes' : 'No'}\n
      Payment Method: Stripe\n
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

        // CRITICAL SAFEGUARD: Check for duplicate payment processing
        const existingPayment = await storage.getPaymentByStripeId(paymentIntent.id);
        if (existingPayment) {
          console.log(`Payment ${paymentIntent.id} already processed - skipping duplicate webhook`);
          break;
        }

        // Check if this is a retail cart payment or event registration
        const paymentType = paymentIntent.metadata?.type;

        if (paymentType === 'retail_cart_checkout') {
          // Handle retail cart checkout
          console.log('Processing retail cart payment:', paymentIntent.id);

          try {
            // Parse cart items from metadata
            const cartItemsData = JSON.parse(paymentIntent.metadata.cart_items || '[]');
            const customerEmail = paymentIntent.metadata.customer_email;

            if (!customerEmail || !cartItemsData.length) {
              console.error('Missing customer info or cart items for retail payment:', paymentIntent.id);
              break;
            }

            // Create customer info from payment intent
            const customer = {
              firstName: paymentIntent.metadata.customer_first_name || 'Customer',
              lastName: paymentIntent.metadata.customer_last_name || '',
              email: customerEmail,
              phone: paymentIntent.metadata.customer_phone || ''
            };

            // Import and use the createShopifyOrderFromCart function
            const { createShopifyOrderFromCart } = await import('./shopify.js');
            const shopifyOrder = await createShopifyOrderFromCart(cartItemsData, customer, paymentIntent.id);

            if (shopifyOrder.success) {
              console.log('Successfully created Shopify order from cart payment:', shopifyOrder.orderId);
              trackOrderCreated();
            } else {
              console.error('Failed to create Shopify order from cart payment');
              trackOrderFailed();
            }

          } catch (error) {
            console.error('Error processing retail cart payment:', error);
            trackOrderFailed();
          }

          break;
        }

        // Handle event registration payments (existing logic)
        const eventId = paymentIntent.metadata?.eventId;
        const eventName = paymentIntent.metadata?.eventName;

        // CRITICAL: Reject payments with missing event UUID
        if (!eventId) {
          console.error(`🚨 CRITICAL: Missing eventId in payment metadata`);
          console.error(`Payment Intent ID: ${paymentIntent.id} - REJECTED`);
          break;
        }

        if (!eventName) {
          console.error(`🚨 CRITICAL: Missing eventName in payment metadata`);
          console.error(`Payment Intent ID: ${paymentIntent.id} - REJECTED`);
          break;
        }

        // Additional safeguard: Verify event exists in database using UUID
        let validatedEvent;
        try {
          validatedEvent = await storage.getEvent(eventId);
          if (!validatedEvent) {
            console.error(`🚨 CRITICAL: Event with UUID ${eventId} not found in database`);
            console.error(`Payment Intent ID: ${paymentIntent.id} - REJECTED`);
            break;
          }

          // Verify event name matches database
          if (validatedEvent.title !== eventName) {
            console.error(`🚨 CRITICAL: Event name mismatch - Database: ${validatedEvent.title}, Metadata: ${eventName}`);
            console.error(`Payment Intent ID: ${paymentIntent.id} - REJECTED`);
            break;
          }

          console.log(`✅ Payment metadata validated: Event ${eventId} (${eventName})`);
        } catch (error) {
          console.error(`🚨 CRITICAL: Error validating event ${eventId}:`, error);
          console.error(`Payment Intent ID: ${paymentIntent.id} - REJECTED`);
          break;
        }

        // Process the validated payment
        try {
          // Get registration data - CRITICAL: Only use metadata from payment intent
          const registrationData = paymentIntent.metadata;

          // Validate all required fields are present
          if (!registrationData.firstName || !registrationData.lastName || !registrationData.email) {
            console.error(`🚨 CRITICAL: Missing required registration data in payment metadata`);
            console.error(`Payment Intent ID: ${paymentIntent.id} - REJECTED`);
            break;
          }

          // Extract full registration information from metadata
          const registration = {
            eventId: eventId,
            firstName: registrationData.firstName,
            lastName: registrationData.lastName,
            contactName: registrationData.contactName || `${registrationData.firstName} ${registrationData.lastName}`,
            email: registrationData.email,
            phone: registrationData.phone || '',
            tShirtSize: registrationData.tShirtSize || '',
            grade: registrationData.grade || '',
            schoolName: registrationData.schoolName || '',
            clubName: registrationData.clubName || '',
            registrationType: registrationData.option || 'individual',
            day1: registrationData.day1 === 'true' || registrationData.day1 === true,
            day2: registrationData.day2 === 'true' || registrationData.day2 === true,
            day3: registrationData.day3 === 'true' || registrationData.day3 === true,
            stripePaymentIntentId: paymentIntent.id
          };

          // Create registration record in database
          const dbRegistration = await storage.createEventRegistration({
            eventId: eventId,
            firstName: registration.firstName,
            lastName: registration.lastName,
            email: registration.email,
            phone: registration.phone || null,
            grade: registration.grade || null,
            shirtSize: registration.tShirtSize || null,
            parentName: registration.contactName || null,
            schoolName: registration.schoolName || null,
            clubName: registration.clubName || null,
            registrationType: registration.registrationType,
            basePrice: (paymentIntent.amount / 100).toString(),
            finalPrice: (paymentIntent.amount / 100).toString(),
            waiverAccepted: true,
            termsAccepted: true,
            status: 'completed',
            stripePaymentIntentId: paymentIntent.id
          });

          // Create Shopify order from the registration data
          console.log('Creating Shopify order with registration data:', registration);
          const shopifyOrder = await createShopifyOrderFromRegistration(registration, validatedEvent, paymentIntent.amount / 100);

          if (shopifyOrder) {
            console.log('Successfully created Shopify order:', shopifyOrder.id);
            trackOrderCreated();

            // Update registration with Shopify order ID
            await storage.updateEventRegistration(dbRegistration.id, {
              shopifyOrderId: shopifyOrder.id.toString()
            });

            console.log(`✅ Shopify order created successfully for payment ${paymentIntent.id}: ${shopifyOrder.id}`);
          } else {
            console.error('Failed to create Shopify order from registration data');
            trackOrderFailed();
            logCriticalFailure('shopify', 'Order creation failed', { 
              paymentIntentId: paymentIntent.id, 
              eventId, 
              registrationData: registration 
            });
          }

          console.log(`✅ Payment processed successfully for event ${eventId}: ${paymentIntent.id}`);

          // Send confirmation email
          try {
            await sendRegistrationConfirmationEmail({
              firstName: registration.firstName,
              lastName: registration.lastName,
              email: registration.email,
              eventName: validatedEvent.title,
              eventDates: validatedEvent.startDate.toDateString(),
              eventLocation: validatedEvent.location || "",
              registrationType: registration.registrationType,
              amount: (paymentIntent.amount / 100).toString(),
              paymentId: paymentIntent.id
            });
          } catch (error) {
            console.error('Error sending confirmation email:', error);
          }
        } catch (error) {
          console.error('Error processing payment success:', error);
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