import type { Express, Request, Response } from "express";
import { z } from 'zod';
import { storage } from './storage.js';
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

export function setupPracticalPaymentRoutes(app: Express): void {
  
  // Create secure registration with payment intent
  app.post('/api/payment/create-registration', async (req: Request, res: Response) => {
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
        });

        await storage.createPayment({
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
      });

      await storage.createPayment({
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

  // Verify payment completion with race condition protection
  app.post('/api/payment/verify-payment', async (req: Request, res: Response) => {
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
        // Find payment record by payment intent ID
        let targetPayment = null;
        
        // Search through all registrations to find matching payment intent
        try {
          const events = await storage.getEvents();
          for (const event of events) {
            const registrations = await storage.getEventRegistrationsByEvent(event.id);
            for (const registration of registrations) {
              try {
                const userPayments = await storage.getPaymentsByUser(registration.userId || registration.id);
                const foundPayment = userPayments.find(p => p.stripePaymentIntentId === paymentIntentId);
                if (foundPayment) {
                  targetPayment = foundPayment;
                  break;
                }
              } catch (userError) {
                // Continue searching if this user lookup fails
                continue;
              }
            }
            if (targetPayment) break;
          }
        } catch (searchError) {
          console.error('Payment search error:', searchError);
        }

        if (!targetPayment) {
          return res.status(404).json({
            success: false,
            error: 'Payment intent not found',
            code: 'PAYMENT_INTENT_NOT_FOUND'
          });
        }

        // Check if already verified
        if (targetPayment.status === 'completed' && !forceVerification) {
          const registration = await storage.getEventRegistration(targetPayment.eventRegistrationId);
          return res.json({
            success: true,
            alreadyVerified: true,
            registration: {
              id: registration.id,
              firstName: registration.firstName,
              lastName: registration.lastName,
              email: registration.email,
              paymentStatus: 'succeeded'
            }
          });
        }

        // Handle FREE registrations
        if (paymentIntentId.startsWith('FREE_')) {
          await storage.updatePayment(targetPayment.id, {
            status: 'completed',
            paymentDate: new Date()
          });

          await storage.updateEventRegistration(targetPayment.eventRegistrationId, {
            status: 'completed'
          });

          const registration = await storage.getEventRegistration(targetPayment.eventRegistrationId);
          
          return res.json({
            success: true,
            isFreeRegistration: true,
            registration: {
              id: registration.id,
              firstName: registration.firstName,
              lastName: registration.lastName,
              email: registration.email,
              paymentStatus: 'succeeded'
            }
          });
        }

        // Handle PAID registrations (simulate Stripe verification)
        console.log(`Simulating Stripe verification for: ${paymentIntentId}`);
        
        // Update payment status
        await storage.updatePayment(targetPayment.id, {
          status: 'completed',
          paymentDate: new Date()
        });

        await storage.updateEventRegistration(targetPayment.eventRegistrationId, {
          status: 'completed'
        });

        const registration = await storage.getEventRegistration(targetPayment.eventRegistrationId);
        
        res.json({
          success: true,
          registration: {
            id: registration.id,
            firstName: registration.firstName,
            lastName: registration.lastName,
            email: registration.email,
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
  app.get('/api/payment/registration/:paymentIntentId', async (req: Request, res: Response) => {
    try {
      const { paymentIntentId } = req.params;

      // Search for payment record
      const events = await storage.getEvents();
      let targetPayment = null;
      let targetRegistration = null;
      
      for (const event of events) {
        const registrations = await storage.getEventRegistrationsByEvent(event.id);
        for (const registration of registrations) {
          try {
            const userPayments = await storage.getPaymentsByUser(registration.id);
            const foundPayment = userPayments.find(p => p.stripePaymentIntentId === paymentIntentId);
            if (foundPayment) {
              targetPayment = foundPayment;
              targetRegistration = registration;
              break;
            }
          } catch (error) {
            // Continue searching
          }
        }
        if (targetPayment) break;
      }

      if (!targetPayment || !targetRegistration) {
        return res.status(404).json({
          success: false,
          error: 'Registration not found for payment intent'
        });
      }

      res.json({
        success: true,
        registration: {
          id: targetRegistration.id,
          firstName: targetRegistration.firstName,
          lastName: targetRegistration.lastName,
          email: targetRegistration.email,
          phone: targetRegistration.phone,
          grade: targetRegistration.grade,
          paymentStatus: targetPayment.status === 'completed' ? 'succeeded' : 'pending'
        },
        payment: {
          id: targetPayment.id,
          amount: targetPayment.amount,
          status: targetPayment.status,
          paymentIntentId: targetPayment.stripePaymentIntentId
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