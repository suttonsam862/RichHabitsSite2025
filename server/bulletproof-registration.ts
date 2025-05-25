import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import { db } from './storage';
import { 
  atomicRegistrations, 
  paymentIntentLockdown, 
  criticalErrorLog,
  bulletproofRegistrationSchema,
  EVENT_PRICES,
  VALID_EVENTS,
  type BulletproofRegistration,
  type AtomicRegistration
} from '../shared/bulletproof-schema';
import { eq, and } from 'drizzle-orm';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// BULLETPROOF REGISTRATION CLASS - ZERO TOLERANCE FOR CORRUPTION
export class BulletproofRegistrationSystem {
  
  // STEP 1: CREATE SECURE REGISTRATION WITH LOCKED PAYMENT INTENT
  async createSecureRegistration(registrationData: any, ipAddress: string, userAgent?: string) {
    try {
      // Generate UUID BEFORE any database operations
      const uuid = uuidv4();
      
      // Validate event and get price
      if (!VALID_EVENTS.includes(registrationData.eventSlug)) {
        throw new Error(`Invalid event: ${registrationData.eventSlug}`);
      }
      
      const eventPrice = EVENT_PRICES[registrationData.eventSlug as keyof typeof EVENT_PRICES];
      
      // STRICT DATA VALIDATION - FAIL FAST
      const validatedData = bulletproofRegistrationSchema.parse({
        ...registrationData,
        uuid,
        eventPrice,
        ipAddress,
        userAgent,
        dataChecksum: '', // Will be calculated below
        stripePaymentIntentId: '', // Will be set after Stripe call
        stripeClientSecret: '', // Will be set after Stripe call
      });
      
      // Check for duplicate registration BEFORE creating payment intent
      const existingRegistration = await db
        .select()
        .from(atomicRegistrations)
        .where(
          and(
            eq(atomicRegistrations.email, validatedData.email),
            eq(atomicRegistrations.eventSlug, validatedData.eventSlug)
          )
        )
        .limit(1);
        
      if (existingRegistration.length > 0) {
        await this.logCriticalError({
          errorCode: 'DUPLICATE_REGISTRATION_ATTEMPT',
          severity: 'HIGH',
          email: validatedData.email,
          eventSlug: validatedData.eventSlug,
          errorMessage: `User ${validatedData.email} attempted to register twice for ${validatedData.eventSlug}`,
          ipAddress,
          userAgent,
        });
        
        throw new Error('You have already registered for this event');
      }
      
      // CREATE STRIPE PAYMENT INTENT
      const paymentIntent = await stripe.paymentIntents.create({
        amount: eventPrice,
        currency: 'usd',
        metadata: {
          registration_uuid: uuid,
          event_slug: validatedData.eventSlug,
          customer_email: validatedData.email,
          customer_name: `${validatedData.firstName} ${validatedData.lastName}`,
        },
      });
      
      // Update validated data with Stripe info
      validatedData.stripePaymentIntentId = paymentIntent.id;
      validatedData.stripeClientSecret = paymentIntent.client_secret!;
      
      // Generate data checksum for integrity verification
      validatedData.dataChecksum = this.generateDataChecksum(validatedData);
      
      // ATOMIC DATABASE TRANSACTION - ALL OR NOTHING
      const result = await db.transaction(async (tx) => {
        // Insert registration
        const [registration] = await tx
          .insert(atomicRegistrations)
          .values(validatedData)
          .returning();
          
        // Lock payment intent
        await tx
          .insert(paymentIntentLockdown)
          .values({
            stripePaymentIntentId: paymentIntent.id,
            registrationUuid: uuid,
            amountCents: eventPrice,
            currency: 'usd',
            eventSlug: validatedData.eventSlug,
            status: paymentIntent.status,
            clientSecretHash: crypto.createHash('sha256').update(paymentIntent.client_secret!).digest('hex'),
            createdFromIp: ipAddress,
            userAgent,
          });
          
        return registration;
      });
      
      return {
        success: true,
        registration: result,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
      
    } catch (error: any) {
      // Log all errors for investigation
      await this.logCriticalError({
        errorCode: 'REGISTRATION_CREATION_FAILED',
        severity: 'CRITICAL',
        email: registrationData.email,
        eventSlug: registrationData.eventSlug,
        errorMessage: error.message,
        stackTrace: error.stack,
        requestData: registrationData,
        ipAddress,
        userAgent,
      });
      
      throw error;
    }
  }
  
  // STEP 2: VERIFY PAYMENT COMPLETION - BULLETPROOF VERIFICATION
  async verifyPaymentCompletion(paymentIntentId: string) {
    try {
      // Get payment intent from Stripe (source of truth)
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment not completed. Status: ${paymentIntent.status}`);
      }
      
      // Verify payment intent is locked to a registration
      const [lockdown] = await db
        .select()
        .from(paymentIntentLockdown)
        .where(eq(paymentIntentLockdown.stripePaymentIntentId, paymentIntentId))
        .limit(1);
        
      if (!lockdown) {
        await this.logCriticalError({
          errorCode: 'PAYMENT_INTENT_NOT_LOCKED',
          severity: 'CRITICAL',
          stripePaymentIntentId: paymentIntentId,
          errorMessage: `Payment intent ${paymentIntentId} succeeded but was never locked to a registration`,
        });
        
        throw new Error('Payment verification failed - contact support');
      }
      
      // Update registration payment status
      const [updatedRegistration] = await db
        .update(atomicRegistrations)
        .set({
          paymentStatus: 'succeeded',
          paymentCompletedAt: new Date(),
        })
        .where(eq(atomicRegistrations.uuid, lockdown.registrationUuid))
        .returning();
        
      // Update payment lockdown status
      await db
        .update(paymentIntentLockdown)
        .set({
          status: 'succeeded',
          lastStatusUpdateAt: new Date(),
        })
        .where(eq(paymentIntentLockdown.stripePaymentIntentId, paymentIntentId));
        
      return {
        success: true,
        registration: updatedRegistration,
      };
      
    } catch (error: any) {
      await this.logCriticalError({
        errorCode: 'PAYMENT_VERIFICATION_FAILED',
        severity: 'CRITICAL',
        stripePaymentIntentId: paymentIntentId,
        errorMessage: error.message,
        stackTrace: error.stack,
      });
      
      throw error;
    }
  }
  
  // GET REGISTRATION BY UUID - SECURE LOOKUP
  async getRegistrationByUuid(uuid: string): Promise<AtomicRegistration | null> {
    try {
      const [registration] = await db
        .select()
        .from(atomicRegistrations)
        .where(eq(atomicRegistrations.uuid, uuid))
        .limit(1);
        
      return registration || null;
    } catch (error: any) {
      await this.logCriticalError({
        errorCode: 'REGISTRATION_LOOKUP_FAILED',
        severity: 'HIGH',
        registrationUuid: uuid,
        errorMessage: error.message,
        stackTrace: error.stack,
      });
      
      throw error;
    }
  }
  
  // GET ALL REGISTRATIONS FOR EVENT - VERIFIED ONLY
  async getVerifiedRegistrationsForEvent(eventSlug: string) {
    try {
      const registrations = await db
        .select()
        .from(atomicRegistrations)
        .where(
          and(
            eq(atomicRegistrations.eventSlug, eventSlug),
            eq(atomicRegistrations.paymentStatus, 'succeeded')
          )
        );
        
      return registrations;
    } catch (error: any) {
      await this.logCriticalError({
        errorCode: 'EVENT_REGISTRATIONS_LOOKUP_FAILED',
        severity: 'HIGH',
        eventSlug,
        errorMessage: error.message,
        stackTrace: error.stack,
      });
      
      throw error;
    }
  }
  
  // INTEGRITY CHECK - VERIFY DATA HASN'T BEEN CORRUPTED
  async verifyDataIntegrity(uuid: string): Promise<boolean> {
    try {
      const registration = await this.getRegistrationByUuid(uuid);
      
      if (!registration) {
        return false;
      }
      
      // Recalculate checksum
      const currentChecksum = this.generateDataChecksum(registration);
      
      if (currentChecksum !== registration.dataChecksum) {
        await this.logCriticalError({
          errorCode: 'DATA_INTEGRITY_VIOLATION',
          severity: 'CRITICAL',
          registrationUuid: uuid,
          errorMessage: `Data checksum mismatch for registration ${uuid}`,
          systemState: {
            stored_checksum: registration.dataChecksum,
            calculated_checksum: currentChecksum,
          },
        });
        
        return false;
      }
      
      return true;
    } catch (error: any) {
      await this.logCriticalError({
        errorCode: 'INTEGRITY_CHECK_FAILED',
        severity: 'CRITICAL',
        registrationUuid: uuid,
        errorMessage: error.message,
        stackTrace: error.stack,
      });
      
      return false;
    }
  }
  
  // GENERATE DATA CHECKSUM FOR INTEGRITY VERIFICATION
  private generateDataChecksum(data: any): string {
    // Create consistent string representation of data
    const dataString = JSON.stringify({
      uuid: data.uuid,
      stripePaymentIntentId: data.stripePaymentIntentId,
      eventSlug: data.eventSlug,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      contactName: data.contactName,
      phone: data.phone,
      age: data.age,
      grade: data.grade,
      gender: data.gender,
      tshirtSize: data.tshirtSize,
      schoolName: data.schoolName,
      experienceLevel: data.experienceLevel,
      eventPrice: data.eventPrice,
    });
    
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }
  
  // LOG CRITICAL ERRORS - NEVER MISS A PROBLEM
  private async logCriticalError(errorData: {
    errorCode: string;
    severity: string;
    registrationUuid?: string;
    stripePaymentIntentId?: string;
    email?: string;
    eventSlug?: string;
    errorMessage: string;
    stackTrace?: string;
    requestData?: any;
    systemState?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await db.insert(criticalErrorLog).values({
        ...errorData,
        requestData: errorData.requestData ? JSON.stringify(errorData.requestData) : null,
        systemState: errorData.systemState ? JSON.stringify(errorData.systemState) : null,
      });
    } catch (dbError) {
      // If we can't even log the error, write to console as last resort
      console.error('CRITICAL: Failed to log error to database:', dbError);
      console.error('Original error:', errorData);
    }
  }
}

// Export singleton instance
export const bulletproofRegistration = new BulletproofRegistrationSystem();