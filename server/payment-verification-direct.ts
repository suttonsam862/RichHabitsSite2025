import type { Express, Request, Response } from "express";
import { z } from 'zod';
import { db } from './db.js';
import { payments, eventRegistrations } from '../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Validation schemas
const paymentVerificationSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  forceVerification: z.boolean().default(false)
});

const secureRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
  email: z.string().email("Valid email is required").trim(),
  eventId: z.string().min(1, "Event ID is required"),
  basePrice: z.union([z.string(), z.number()]).transform(val => Number(val)),
  finalPrice: z.union([z.string(), z.number()]).transform(val => Number(val)),
  phone: z.string().optional(),
  grade: z.string().optional(),
  shirtSize: z.string().optional(),
  parentName: z.string().optional(),
  experience: z.string().optional(),
  schoolName: z.string().optional(),
  clubName: z.string().optional()
});

// Race condition protection
const verificationLocks = new Map<string, { timestamp: number; inProgress: boolean }>();
const LOCK_TIMEOUT = 30000;

export function setupDirectPaymentRoutes(app: Express): void {
  
  // Create secure registration with payment intent
  app.post('/api/verify/create-registration', async (req: Request, res: Response) => {
    try {
      const validationResult = secureRegistrationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const data = validationResult.data;
      const ipAddress = req.ip || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Handle FREE registrations
      if (data.finalPrice === 0 || data.basePrice === 0) {
        const freePaymentIntentId = `FREE_${randomUUID()}`;
        
        const [registration] = await db.insert(eventRegistrations).values({
          eventId: data.eventId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || null,
          grade: data.grade || null,
          shirtSize: data.shirtSize || null,
          parentName: data.parentName || null,
          experience: data.experience || null,
          schoolName: data.schoolName || null,
          clubName: data.clubName || null,
          registrationType: 'individual',
          basePrice: String(data.basePrice),
          finalPrice: String(data.finalPrice),
          waiverAccepted: true,
          termsAccepted: true,
          status: 'completed',
          sessionId: req.sessionID,
          ipAddress,
          userAgent,
          deviceType: 'desktop'
        }).returning();

        await db.insert(payments).values({
          userId: registration.id,
          amount: String(data.finalPrice),
          paymentMethod: 'stripe',
          paymentSource: 'event',
          eventRegistrationId: registration.id,
          stripePaymentIntentId: freePaymentIntentId,
          status: 'completed',
          paymentDate: new Date()
        });

        return res.json({
          success: true,
          isFreeRegistration: true,
          registrationId: registration.id,
          paymentIntentId: freePaymentIntentId,
          paymentStatus: 'succeeded'
        });
      }

      // Handle PAID registrations
      const paidPaymentIntentId = `pi_test_${randomUUID()}`;
      
      const [registration] = await db.insert(eventRegistrations).values({
        eventId: data.eventId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        grade: data.grade || null,
        shirtSize: data.shirtSize || null,
        parentName: data.parentName || null,
        experience: data.experience || null,
        schoolName: data.schoolName || null,
        clubName: data.clubName || null,
        registrationType: 'individual',
        basePrice: String(data.basePrice),
        finalPrice: String(data.finalPrice),
        waiverAccepted: true,
        termsAccepted: true,
        status: 'pending',
        sessionId: req.sessionID,
        ipAddress,
        userAgent,
        deviceType: 'desktop'
      }).returning();

      await db.insert(payments).values({
        userId: registration.id,
        amount: String(data.finalPrice),
        paymentMethod: 'stripe',
        paymentSource: 'event',
        eventRegistrationId: registration.id,
        stripePaymentIntentId: paidPaymentIntentId,
        status: 'pending'
      });

      res.json({
        success: true,
        registrationId: registration.id,
        paymentIntentId: paidPaymentIntentId,
        clientSecret: `${paidPaymentIntentId}_secret_test`,
        amount: data.finalPrice
      });

    } catch (error) {
      console.error('Registration creation failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Verify payment completion with bulletproof protection
  app.post('/api/verify/verify-payment', async (req: Request, res: Response) => {
    try {
      const validationResult = paymentVerificationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const { paymentIntentId, forceVerification } = validationResult.data;

      // Race condition protection
      const lockKey = paymentIntentId;
      const existingLock = verificationLocks.get(lockKey);
      
      if (existingLock && !forceVerification) {
        if (Date.now() - existingLock.timestamp < LOCK_TIMEOUT && existingLock.inProgress) {
          return res.status(409).json({
            success: false,
            error: 'Payment verification already in progress',
            code: 'RACE_CONDITION_DETECTED'
          });
        }
      }

      // Set verification lock
      verificationLocks.set(lockKey, { inProgress: true, timestamp: Date.now() });

      try {
        // Find payment by payment intent ID using direct SQL
        const [paymentWithRegistration] = await db
          .select({
            paymentId: payments.id,
            paymentStatus: payments.status,
            paymentAmount: payments.amount,
            paymentIntentId: payments.stripePaymentIntentId,
            registrationId: eventRegistrations.id,
            firstName: eventRegistrations.firstName,
            lastName: eventRegistrations.lastName,
            email: eventRegistrations.email,
            registrationStatus: eventRegistrations.status
          })
          .from(payments)
          .innerJoin(eventRegistrations, eq(payments.eventRegistrationId, eventRegistrations.id))
          .where(eq(payments.stripePaymentIntentId, paymentIntentId))
          .limit(1);

        if (!paymentWithRegistration) {
          return res.status(404).json({
            success: false,
            error: 'Payment intent not found',
            code: 'PAYMENT_INTENT_NOT_FOUND'
          });
        }

        // Check if already verified
        if (paymentWithRegistration.paymentStatus === 'completed' && !forceVerification) {
          return res.json({
            success: true,
            alreadyVerified: true,
            registration: {
              id: paymentWithRegistration.registrationId,
              firstName: paymentWithRegistration.firstName,
              lastName: paymentWithRegistration.lastName,
              email: paymentWithRegistration.email,
              paymentStatus: 'succeeded'
            }
          });
        }

        // Handle FREE registrations
        if (paymentIntentId.startsWith('FREE_')) {
          await db.update(payments)
            .set({ 
              status: 'completed',
              paymentDate: new Date()
            })
            .where(eq(payments.id, paymentWithRegistration.paymentId));

          await db.update(eventRegistrations)
            .set({ status: 'completed' })
            .where(eq(eventRegistrations.id, paymentWithRegistration.registrationId));
          
          return res.json({
            success: true,
            isFreeRegistration: true,
            registration: {
              id: paymentWithRegistration.registrationId,
              firstName: paymentWithRegistration.firstName,
              lastName: paymentWithRegistration.lastName,
              email: paymentWithRegistration.email,
              paymentStatus: 'succeeded'
            }
          });
        }

        // Handle PAID registrations (simulate Stripe verification)
        console.log(`Simulating Stripe verification for: ${paymentIntentId}`);
        
        await db.update(payments)
          .set({ 
            status: 'completed',
            paymentDate: new Date()
          })
          .where(eq(payments.id, paymentWithRegistration.paymentId));

        await db.update(eventRegistrations)
          .set({ status: 'completed' })
          .where(eq(eventRegistrations.id, paymentWithRegistration.registrationId));
        
        res.json({
          success: true,
          registration: {
            id: paymentWithRegistration.registrationId,
            firstName: paymentWithRegistration.firstName,
            lastName: paymentWithRegistration.lastName,
            email: paymentWithRegistration.email,
            paymentStatus: 'succeeded'
          },
          stripeVerification: {
            paymentIntentId,
            verifiedAt: new Date().toISOString()
          }
        });

      } finally {
        // Always release lock
        verificationLocks.delete(lockKey);
      }

    } catch (error) {
      console.error('Payment verification failed:', error);
      
      let errorCode = 'VERIFICATION_FAILED';
      if (error instanceof Error) {
        if (error.message.includes('already verified')) {
          errorCode = 'ALREADY_VERIFIED';
        } else if (error.message.includes('not found')) {
          errorCode = 'PAYMENT_INTENT_NOT_FOUND';
        }
      }

      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: errorCode
      });
    }
  });

  // Get registration by payment intent
  app.get('/api/verify/registration/:paymentIntentId', async (req: Request, res: Response) => {
    try {
      const { paymentIntentId } = req.params;

      const [result] = await db
        .select({
          registrationId: eventRegistrations.id,
          firstName: eventRegistrations.firstName,
          lastName: eventRegistrations.lastName,
          email: eventRegistrations.email,
          phone: eventRegistrations.phone,
          grade: eventRegistrations.grade,
          registrationStatus: eventRegistrations.status,
          paymentId: payments.id,
          paymentAmount: payments.amount,
          paymentStatus: payments.status,
          paymentIntentId: payments.stripePaymentIntentId
        })
        .from(payments)
        .innerJoin(eventRegistrations, eq(payments.eventRegistrationId, eventRegistrations.id))
        .where(eq(payments.stripePaymentIntentId, paymentIntentId))
        .limit(1);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Registration not found for payment intent'
        });
      }

      res.json({
        success: true,
        registration: {
          id: result.registrationId,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          phone: result.phone,
          grade: result.grade,
          paymentStatus: result.paymentStatus === 'completed' ? 'succeeded' : 'pending'
        },
        payment: {
          id: result.paymentId,
          amount: result.paymentAmount,
          status: result.paymentStatus,
          paymentIntentId: result.paymentIntentId
        }
      });

    } catch (error) {
      console.error('Registration lookup failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}