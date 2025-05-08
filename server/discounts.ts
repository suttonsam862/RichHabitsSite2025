import { Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from './storage';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe key: STRIPE_SECRET_KEY');
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true
});

// Universal discount code for admin use (100% off)
// This would typically be stored in a database, but for simplicity we'll use an env variable
const ADMIN_DISCOUNT_CODE = process.env.UNIVERSAL_DISCOUNT_CODE || 'ADMIN-100-OFF';

// Add a new admin discount code
const NEW_ADMIN_DISCOUNT_CODE = '100OFFADMINCODE';

// Hard-coded admin email that can use the 100% off code
const ADMIN_EMAIL = 'samsutton@rich-habits.com';

// Validate a discount code
export const validateDiscountCode = async (req: Request, res: Response) => {
  try {
    const { code, eventId, email, amount } = req.body;
    
    console.log('Validating discount code:', { code, eventId, email, amount });
    console.log('Admin codes:', ADMIN_DISCOUNT_CODE, NEW_ADMIN_DISCOUNT_CODE, 'Admin email:', ADMIN_EMAIL);
    
    if (!code) {
      return res.status(400).json({
        valid: false,
        message: 'Discount code is required'
      });
    }
    
    // Check if it's one of the admin discount codes
    if (code === ADMIN_DISCOUNT_CODE || code === NEW_ADMIN_DISCOUNT_CODE) {
      // Log the discount code attempt
      console.log(`Admin discount code attempt: ${code} from email: ${email}`);
      
      // Verify the email matches the admin email
      if (email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        // Admin discount applies 100% off
        console.log(`100% discount applied for admin: ${email}`);
        return res.json({
          valid: true,
          discountAmount: amount,
          message: '100% discount applied'
        });
      } else {
        console.log(`Admin discount code attempt rejected for unauthorized email: ${email}`);
        return res.status(400).json({
          valid: false,
          message: 'This discount code is not valid for your email'
        });
      }
    }
    
    // Here you would check against other discount codes in your database
    // For now, we'll just reject all other codes
    return res.status(400).json({
      valid: false,
      message: 'Invalid discount code'
    });
  } catch (error) {
    console.error('Error validating discount code:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      valid: false
    });
  }
};

// Update a payment intent with a discounted amount
export const updatePaymentIntent = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, discountAmount } = req.body;
    const eventId = Number(req.params.eventId);
    
    if (!paymentIntentId || isNaN(discountAmount)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    // Get the event to check if it exists
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ error: `Event with ID ${eventId} not found` });
    }
    
    // Retrieve the current payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Calculate the new amount 
    const originalAmount = paymentIntent.amount / 100; // Convert Stripe cents to dollars
    const newAmount = Math.max(0, originalAmount - discountAmount);
    const newAmountInCents = Math.round(newAmount * 100); // Convert dollars to Stripe cents
    
    // Update the payment intent with the new amount
    let updatedIntent;
    if (newAmountInCents > 0) {
      updatedIntent = await stripe.paymentIntents.update(paymentIntentId, {
        amount: newAmountInCents,
        metadata: {
          ...paymentIntent.metadata,
          discountApplied: 'true',
          discountAmount: discountAmount.toString(),
        },
      });
    } else {
      // For 100% discount (free registration), we can either:
      // 1. Cancel the payment intent and handle the registration separately
      // 2. Update it to a minimum amount and then immediately capture
      // Here we'll go with option 1 for simplicity
      
      // First cancel the current payment intent
      await stripe.paymentIntents.cancel(paymentIntentId);
      
      // Return success with zero amount
      return res.json({
        success: true,
        amount: 0,
        message: 'Full discount applied, payment intent cancelled'
      });
    }
    
    // Return the updated amount
    res.json({
      success: true,
      amount: newAmount,
      clientSecret: updatedIntent.client_secret
    });
  } catch (error) {
    console.error('Error updating payment intent:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
};
