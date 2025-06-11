import { z } from 'zod';
import { storage } from './storage.js';
import { randomUUID } from 'crypto';

// Zod validation for payment verification
export const paymentVerificationSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  registrationId: z.string().uuid("Valid registration ID required").optional(),
  forceVerification: z.boolean().default(false)
});

export const registrationVerificationSchema = z.object({
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
  email: z.string().email("Valid email is required").trim(),
  eventId: z.string().uuid("Valid event ID required"),
  basePrice: z.union([z.string(), z.number()]).transform(val => Number(val)),
  finalPrice: z.union([z.string(), z.number()]).transform(val => Number(val)),
  phone: z.string().optional(),
  grade: z.string().optional(),
  shirtSize: z.string().optional(),
  parentName: z.string().optional(),
  experience: z.string().optional(),
  gender: z.string().optional(),
  schoolName: z.string().optional(),
  clubName: z.string().optional()
});

// In-memory verification tracking to prevent race conditions
const verificationLock = new Map<string, { inProgress: boolean; timestamp: number }>();
const LOCK_TIMEOUT = 30000; // 30 seconds

export class PaymentVerificationSystem {
  
  // Create secure registration with payment intent tracking
  static async createSecureRegistration(registrationData: any, ipAddress: string, userAgent: string) {
    const validation = registrationVerificationSchema.safeParse(registrationData);
    
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error.issues.map(i => i.message).join(', ')}`);
    }

    const data = validation.data;
    
    // Handle FREE registrations
    if (data.finalPrice === 0 || data.basePrice === 0) {
      const freePaymentIntentId = `FREE_${randomUUID()}`;
      
      const registration = await storage.createEventRegistration({
        eventId: data.eventId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        grade: data.grade || null,
        shirtSize: data.shirtSize || null,
        parentName: data.parentName || null,
        experience: data.experience || null,
        gender: data.gender || null,
        schoolName: data.schoolName || null,
        clubName: data.clubName || null,
        registrationType: 'individual',
        basePrice: String(data.basePrice),
        finalPrice: String(data.finalPrice),
        waiverAccepted: true,
        termsAccepted: true,
        status: 'completed',
        sessionId: 'bulletproof-system',
        ipAddress,
        userAgent,
        deviceType: 'desktop'
      });

      // Create payment record for FREE registration
      await storage.createPayment({
        userId: registration.id, // Use registration ID as user reference
        amount: String(data.finalPrice),
        paymentMethod: 'stripe',
        paymentSource: 'event',
        eventRegistrationId: registration.id,
        stripePaymentIntentId: freePaymentIntentId,
        status: 'completed',
        paymentDate: new Date()
      });

      return {
        registration,
        paymentIntentId: freePaymentIntentId,
        isFreeRegistration: true
      };
    }

    // Handle PAID registrations (would integrate with Stripe in production)
    const paidPaymentIntentId = `pi_test_${randomUUID()}`;
    
    const registration = await storage.createEventRegistration({
      eventId: data.eventId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      grade: data.grade || null,
      shirtSize: data.shirtSize || null,
      parentName: data.parentName || null,
      experience: data.experience || null,
      gender: data.gender || null,
      schoolName: data.schoolName || null,
      clubName: data.clubName || null,
      registrationType: 'individual',
      basePrice: String(data.basePrice),
      finalPrice: String(data.finalPrice),
      waiverAccepted: true,
      termsAccepted: true,
      status: 'pending',
      sessionId: 'bulletproof-system',
      ipAddress,
      userAgent,
      deviceType: 'desktop'
    });

    // Create pending payment record
    await storage.createPayment({
      userId: registration.id,
      amount: String(data.finalPrice),
      paymentMethod: 'stripe',
      paymentSource: 'event',
      eventRegistrationId: registration.id,
      stripePaymentIntentId: paidPaymentIntentId,
      status: 'pending'
    });

    return {
      registration,
      paymentIntentId: paidPaymentIntentId,
      clientSecret: `${paidPaymentIntentId}_secret_test`,
      isFreeRegistration: false
    };
  }

  // Verify payment completion with race condition protection
  static async verifyPaymentCompletion(paymentIntentId: string, forceVerification = false) {
    // Check for race conditions
    const lockKey = paymentIntentId;
    const existingLock = verificationLock.get(lockKey);
    
    if (existingLock && !forceVerification) {
      if (Date.now() - existingLock.timestamp < LOCK_TIMEOUT && existingLock.inProgress) {
        throw new Error('Payment verification already in progress - race condition detected');
      }
    }

    // Set verification lock
    verificationLock.set(lockKey, { inProgress: true, timestamp: Date.now() });

    try {
      // Handle FREE registrations
      if (paymentIntentId.startsWith('FREE_')) {
        return await this.verifyFreeRegistration(paymentIntentId);
      }

      // Handle PAID registrations
      return await this.verifyPaidRegistration(paymentIntentId, forceVerification);
      
    } finally {
      // Always release lock
      verificationLock.delete(lockKey);
    }
  }

  // Verify free registration
  static async verifyFreeRegistration(paymentIntentId: string) {
    // Find payment record
    const payments = await storage.getPaymentsByUser('all'); // Get all payments to search
    const payment = payments.find(p => p.stripePaymentIntentId === paymentIntentId);
    
    if (!payment) {
      throw new Error('Free registration payment record not found');
    }

    if (payment.status === 'completed') {
      // Already verified
      const registration = await storage.getEventRegistration(payment.eventRegistrationId);
      return {
        success: true,
        registration,
        wasAlreadyVerified: true
      };
    }

    // Mark as completed
    await storage.updatePayment(payment.id, { 
      status: 'completed',
      paymentDate: new Date()
    });

    // Update registration status
    await storage.updateEventRegistration(payment.eventRegistrationId, {
      status: 'completed'
    });

    const registration = await storage.getEventRegistration(payment.eventRegistrationId);
    
    return {
      success: true,
      registration,
      wasAlreadyVerified: false
    };
  }

  // Verify paid registration (would integrate with Stripe API in production)
  static async verifyPaidRegistration(paymentIntentId: string, forceVerification: boolean) {
    // Find payment record
    const payments = await storage.getPaymentsByUser('all');
    const payment = payments.find(p => p.stripePaymentIntentId === paymentIntentId);
    
    if (!payment) {
      throw new Error('Payment intent not found in system records');
    }

    if (payment.status === 'completed' && !forceVerification) {
      throw new Error('Payment already verified - use forceVerification to override');
    }

    // In production, this would call Stripe API to verify payment status
    // For testing, we'll simulate successful payment verification
    console.log(`Simulating Stripe verification for: ${paymentIntentId}`);
    
    // Mock Stripe verification result
    const stripeVerificationResult = {
      status: 'succeeded',
      amount: parseInt(payment.amount) * 100, // Convert to cents
      created: Math.floor(Date.now() / 1000)
    };

    if (stripeVerificationResult.status !== 'succeeded') {
      throw new Error('Stripe payment not succeeded - cannot verify');
    }

    // Update payment status
    await storage.updatePayment(payment.id, {
      status: 'completed',
      paymentDate: new Date()
    });

    // Update registration status
    await storage.updateEventRegistration(payment.eventRegistrationId, {
      status: 'completed'
    });

    const registration = await storage.getEventRegistration(payment.eventRegistrationId);
    
    return {
      success: true,
      registration,
      stripeVerification: stripeVerificationResult,
      wasAlreadyVerified: payment.status === 'completed'
    };
  }

  // Get registration by payment intent
  static async getRegistrationByPaymentIntent(paymentIntentId: string) {
    const payments = await storage.getPaymentsByUser('all');
    const payment = payments.find(p => p.stripePaymentIntentId === paymentIntentId);
    
    if (!payment) {
      throw new Error('Payment intent not found');
    }

    const registration = await storage.getEventRegistration(payment.eventRegistrationId);
    return { registration, payment };
  }
}