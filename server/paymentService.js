import Stripe from 'stripe';
import { sessionManager } from './sessionManager.js';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export class PaymentService {
  // Create or retrieve payment intent with full duplicate protection
  async createOrRetrievePaymentIntent(requestData) {
    const { eventId, option, registrationData, discountCode, discountedAmount } = requestData;
    const { email } = registrationData;
    const registrationType = option || 'full';
    
    // Calculate the final amount (either discounted amount or original amount)
    let finalAmount = discountedAmount;
    
    // If no discounted amount provided, calculate base amount from event pricing
    if (finalAmount === null || finalAmount === undefined) {
      // Import pricing utilities to calculate base amount
      const { calculateRegistrationAmount } = await import('./pricingUtils.js');
      finalAmount = calculateRegistrationAmount(eventId, registrationType) / 100; // Convert cents to dollars
    }
    
    // Generate session ID
    const sessionId = sessionManager.generateSessionId(email, eventId, registrationType);
    
    console.log(`🎯 Processing payment request - Session: ${sessionId}, Email: ${email}, Amount: $${finalAmount}, DiscountCode: ${discountCode}`);
    
    // CRITICAL FIX: Handle free registrations - NEVER create payment intents for $0 amounts
    if (finalAmount === 0 || finalAmount === null || finalAmount === undefined) {
      console.log(`✅ FREE REGISTRATION DETECTED - Processing without payment for session: ${sessionId}`);
      
      // Process free registration directly without any payment intent
      return {
        success: true,
        isFreeRegistration: true,
        clientSecret: 'FREE_REGISTRATION',
        sessionId: sessionId,
        amount: 0,
        message: 'Free registration - no payment required'
      };
    }
    
    // Check if session is already locked (payment in progress)
    if (sessionManager.isSessionLocked(sessionId)) {
      const existingIntent = sessionManager.getPaymentIntent(sessionId);
      
      if (existingIntent) {
        console.log(`🔄 Returning existing payment intent for session: ${sessionId}`);
        return {
          success: true,
          clientSecret: existingIntent.clientSecret,
          paymentIntentId: existingIntent.paymentIntentId,
          sessionId: sessionId,
          message: 'Retrieved existing payment intent'
        };
      } else {
        console.warn(`⚠️ Session locked but no payment intent found: ${sessionId}`);
        return {
          success: false,
          error: 'Payment session is locked. Please wait and try again.',
          code: 'SESSION_LOCKED'
        };
      }
    }
    
    // Check if we can process more attempts
    if (!sessionManager.incrementAttempts(sessionId)) {
      console.error(`❌ Too many attempts for session: ${sessionId}`);
      return {
        success: false,
        error: 'Too many payment attempts. Please refresh the page and try again.',
        code: 'TOO_MANY_ATTEMPTS'
      };
    }
    
    // Lock the session
    sessionManager.lockSession(sessionId, email, eventId, registrationType, finalAmount);
    
    try {
      // Check if we already have a payment intent for this exact session
      const existingIntent = sessionManager.getPaymentIntent(sessionId);
      if (existingIntent) {
        console.log(`♻️ Found existing payment intent for session: ${sessionId}`);
        
        // Verify the intent still exists in Stripe
        try {
          const stripeIntent = await stripe.paymentIntents.retrieve(existingIntent.paymentIntentId);
          
          if (stripeIntent.status === 'requires_payment_method' || stripeIntent.status === 'requires_confirmation') {
            console.log(`✅ Existing Stripe intent is valid: ${existingIntent.paymentIntentId}`);
            return {
              success: true,
              clientSecret: existingIntent.clientSecret,
              paymentIntentId: existingIntent.paymentIntentId,
              sessionId: sessionId,
              message: 'Retrieved existing valid payment intent'
            };
          }
        } catch (stripeError) {
          console.warn(`⚠️ Existing payment intent not found in Stripe: ${existingIntent.paymentIntentId}`);
          // Continue to create new one
        }
      }
      
      // Create idempotency key using session ID to prevent duplicate creation
      const idempotencyKey = `payment_${sessionId}_${Date.now()}`;
      
      console.log(`💳 Creating new payment intent with idempotency key: ${idempotencyKey}`);
      
      // Create new payment intent with idempotency protection
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          sessionId: sessionId,
          email: email,
          eventId: eventId.toString(),
          registrationType: registrationType,
          originalAmount: amount.toString()
        }
      }, {
        idempotencyKey: idempotencyKey
      });
      
      // Store the payment intent
      sessionManager.storePaymentIntent(sessionId, paymentIntent.id, paymentIntent.client_secret);
      
      console.log(`✅ Created payment intent: ${paymentIntent.id} for session: ${sessionId}`);
      
      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        sessionId: sessionId,
        message: 'Created new payment intent'
      };
      
    } catch (error) {
      console.error(`❌ Error creating payment intent for session ${sessionId}:`, error.message);
      
      // Unlock session on error
      sessionManager.unlockSession(sessionId);
      
      // Handle specific Stripe errors
      if (error.type === 'StripeCardError') {
        return {
          success: false,
          error: 'Card was declined. Please try a different payment method.',
          code: 'CARD_DECLINED'
        };
      } else if (error.type === 'StripeInvalidRequestError') {
        return {
          success: false,
          error: 'Invalid payment request. Please check your information and try again.',
          code: 'INVALID_REQUEST'
        };
      } else {
        return {
          success: false,
          error: 'Unable to process payment. Please try again.',
          code: 'PAYMENT_ERROR'
        };
      }
    }
  }
  
  // Confirm payment intent completion
  async confirmPaymentSuccess(paymentIntentId, sessionId) {
    try {
      // Verify payment intent was successful
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        console.log(`✅ Payment confirmed successful: ${paymentIntentId}`);
        
        // Update session manager
        if (sessionId) {
          sessionManager.updatePaymentIntentStatus(sessionId, 'succeeded');
          sessionManager.completeSession(sessionId);
        }
        
        return {
          success: true,
          paymentIntent: paymentIntent,
          amount: paymentIntent.amount / 100 // Convert back from cents
        };
      } else {
        console.warn(`⚠️ Payment intent not successful: ${paymentIntentId}, status: ${paymentIntent.status}`);
        return {
          success: false,
          error: `Payment not completed. Status: ${paymentIntent.status}`,
          status: paymentIntent.status
        };
      }
    } catch (error) {
      console.error(`❌ Error confirming payment: ${paymentIntentId}`, error.message);
      return {
        success: false,
        error: 'Unable to verify payment status',
        code: 'VERIFICATION_ERROR'
      };
    }
  }
  
  // Cancel payment intent and unlock session
  async cancelPaymentIntent(sessionId, reason = 'user_cancelled') {
    const session = sessionManager.getSession(sessionId);
    const intent = sessionManager.getPaymentIntent(sessionId);
    
    if (intent) {
      try {
        await stripe.paymentIntents.cancel(intent.paymentIntentId, {
          cancellation_reason: reason
        });
        console.log(`🚫 Cancelled payment intent: ${intent.paymentIntentId}`);
      } catch (error) {
        console.warn(`⚠️ Could not cancel payment intent: ${intent.paymentIntentId}`, error.message);
      }
    }
    
    // Clean up session
    sessionManager.unlockSession(sessionId);
    
    return { success: true };
  }
  
  // Get session and payment status
  getSessionStatus(sessionId) {
    const session = sessionManager.getSession(sessionId);
    const intent = sessionManager.getPaymentIntent(sessionId);
    
    return {
      session: session,
      paymentIntent: intent,
      locked: sessionManager.isSessionLocked(sessionId)
    };
  }
  
  // Get service statistics
  getStats() {
    return sessionManager.getStats();
  }
}

// Export singleton instance
export const paymentService = new PaymentService();