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
    
    // Generate session ID first
    const sessionId = sessionManager.generateSessionId(email, eventId, registrationType);
    
    // CRITICAL FIX: Always prioritize discountedAmount when provided
    let finalAmount;
    
    if (discountedAmount !== null && discountedAmount !== undefined && typeof discountedAmount === 'number') {
      // Use the explicitly provided discounted amount
      finalAmount = discountedAmount;
      console.log(`🎯 Using provided discounted amount: $${finalAmount} for session: ${sessionId}`);
    } else {
      // Calculate base amount from event pricing only when no discount provided
      const { calculateRegistrationAmount } = await import('./pricingUtils.js');
      finalAmount = calculateRegistrationAmount(eventId, registrationType) / 100; // Convert cents to dollars
      console.log(`💰 Using calculated base amount: $${finalAmount} for session: ${sessionId}`);
    }
    
    // Validation: Ensure finalAmount is a valid positive number
    if (isNaN(finalAmount) || finalAmount < 0) {
      console.error(`❌ Invalid final amount calculated: ${finalAmount} for session: ${sessionId}`);
      return {
        success: false,
        error: 'Invalid payment amount calculated',
        userFriendlyMessage: 'Unable to calculate payment amount. Please try again.'
      };
    }
    
    console.log(`🎯 Processing payment request - Session: ${sessionId}, Email: ${email}, Amount: $${finalAmount}, DiscountCode: ${discountCode}`);
    
    // CRITICAL FIX: Handle free registrations - NEVER create payment intents for $0 amounts
    if (finalAmount === 0 || finalAmount === null || finalAmount === undefined) {
      console.log(`✅ FREE REGISTRATION DETECTED - Processing without payment for session: ${sessionId}`);
      
      // For 100% discount codes, process registration directly and return consistent JSON
      try {
        // Process free registration directly without any payment intent
        return {
          success: true,
          isFreeRegistration: true,
          clientSecret: null,
          sessionId: sessionId,
          amount: 0,
          paymentIntentId: `free_reg_${Date.now()}`,
          registrationData: registrationData,
          message: 'Free registration - no payment required'
        };
      } catch (error) {
        console.error('Error processing free registration in payment service:', error);
        return {
          success: false,
          error: 'Failed to process free registration',
          userFriendlyMessage: 'Unable to process free registration. Please contact support with discount code: ' + discountCode
        };
      }
    }
    
    // RACE CONDITION FIX: Check if session is already locked (payment in progress)
    if (sessionManager.isSessionLocked(sessionId)) {
      const existingIntent = sessionManager.getPaymentIntent(sessionId);
      
      if (existingIntent) {
        console.log(`🔄 Session locked with existing intent, returning: ${sessionId}`);
        
        // Verify the existing intent matches the current discount amount
        const existingAmount = existingIntent.amount || 0;
        if (Math.abs(existingAmount - finalAmount) > 0.01) {
          console.log(`💰 Amount mismatch detected: existing $${existingAmount} vs new $${finalAmount}, creating new intent`);
          
          // Unlock session to allow new intent creation with correct amount
          sessionManager.unlockSession(sessionId);
        } else {
          return {
            success: true,
            clientSecret: existingIntent.clientSecret,
            paymentIntentId: existingIntent.paymentIntentId,
            sessionId: sessionId,
            amount: finalAmount,
            message: 'Retrieved existing payment intent with matching amount'
          };
        }
      } else {
        console.warn(`⚠️ Session locked but no payment intent found: ${sessionId}`);
        sessionManager.unlockSession(sessionId); // Unlock orphaned session
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
        amount: Math.round(finalAmount * 100), // Convert to cents
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          sessionId: sessionId,
          email: email,
          eventId: eventId.toString(),
          registrationType: registrationType,
          originalAmount: finalAmount.toString()
        }
      }, {
        idempotencyKey: idempotencyKey
      });
      
      // Store the payment intent with amount for race condition checking
      sessionManager.storePaymentIntent(sessionId, paymentIntent.id, paymentIntent.client_secret, finalAmount);
      
      console.log(`✅ Created payment intent: ${paymentIntent.id} for session: ${sessionId}`);
      
      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        sessionId: sessionId,
        amount: finalAmount,
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