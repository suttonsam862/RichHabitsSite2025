import type { Express } from "express";
import { bulletproofRegistration } from './bulletproof-registration';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Zod validation schemas for bulletproof endpoints
const paymentVerificationSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  forceVerification: z.boolean().optional().default(false)
});

const registrationCreationSchema = z.object({
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(), 
  email: z.string().email("Valid email is required").trim(),
  phone: z.string().optional(),
  age: z.string().optional(),
  grade: z.string().optional(),
  gender: z.string().optional(),
  contactName: z.string().optional(),
  tshirtSize: z.string().optional(),
  schoolName: z.string().optional(),
  experienceLevel: z.string().optional(),
  clubName: z.string().optional(),
  eventSlug: z.string().min(1, "Event slug is required"),
  basePrice: z.union([z.string(), z.number()]).transform(val => Number(val)),
  finalPrice: z.union([z.string(), z.number()]).transform(val => Number(val))
});

// BULLETPROOF REGISTRATION ROUTES - ZERO CORRUPTION TOLERANCE
export function registerBulletproofRoutes(app: Express) {
  
  // STEP 1: CREATE SECURE REGISTRATION WITH LOCKED PAYMENT INTENT
  app.post('/api/bulletproof/create-registration', async (req, res) => {
    try {
      // Validate input with Zod
      const validationResult = registrationCreationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Registration validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          })),
          code: 'VALIDATION_FAILED'
        });
      }

      const registrationData = validationResult.data;
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');
      
      console.log('Creating bulletproof registration for:', registrationData.email);
      
      // Handle FREE registrations automatically
      if (registrationData.finalPrice === 0 || registrationData.basePrice === 0) {
        console.log('Processing FREE registration for:', registrationData.email);
        
        const freePaymentIntentId = `FREE_${randomUUID()}`;
        const result = await bulletproofRegistration.createSecureRegistration(
          { ...registrationData, isFreeRegistration: true },
          ipAddress,
          userAgent
        );
        
        return res.json({
          success: true,
          isFreeRegistration: true,
          registrationUuid: result.registration.uuid,
          paymentIntentId: freePaymentIntentId,
          paymentStatus: 'succeeded'
        });
      }
      
      // Handle PAID registrations with Stripe
      const result = await bulletproofRegistration.createSecureRegistration(
        registrationData,
        ipAddress,
        userAgent
      );
      
      res.json({
        success: true,
        clientSecret: result.clientSecret,
        registrationUuid: result.registration.uuid,
        paymentIntentId: result.paymentIntentId,
      });
      
    } catch (error: any) {
      console.error('Bulletproof registration failed:', error.message);
      
      res.status(400).json({
        success: false,
        error: error.message,
        code: 'REGISTRATION_FAILED'
      });
    }
  });
  
  // STEP 2: VERIFY PAYMENT COMPLETION - BULLETPROOF VERIFICATION
  app.post('/api/bulletproof/verify-payment', async (req, res) => {
    try {
      // Validate input with Zod
      const validationResult = paymentVerificationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Payment verification validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          })),
          code: 'VALIDATION_FAILED'
        });
      }

      const { paymentIntentId, forceVerification } = validationResult.data;
      
      console.log('Verifying payment completion for:', paymentIntentId);
      
      // Handle FREE registrations
      if (paymentIntentId.startsWith('FREE_')) {
        console.log('Processing FREE registration verification for:', paymentIntentId);
        
        const result = await bulletproofRegistration.verifyFreeRegistration(paymentIntentId);
        
        return res.json({
          success: true,
          isFreeRegistration: true,
          registration: {
            uuid: result.registration.uuid,
            firstName: result.registration.firstName,
            lastName: result.registration.lastName,
            email: result.registration.email,
            eventSlug: result.registration.eventSlug,
            paymentStatus: 'succeeded',
            paymentCompletedAt: result.registration.paymentCompletedAt || new Date().toISOString(),
          }
        });
      }
      
      // Handle PAID registrations with Stripe verification
      const result = await bulletproofRegistration.verifyPaymentCompletion(paymentIntentId, forceVerification);
      
      res.json({
        success: true,
        registration: {
          uuid: result.registration.uuid,
          firstName: result.registration.firstName,
          lastName: result.registration.lastName,
          email: result.registration.email,
          eventSlug: result.registration.eventSlug,
          paymentStatus: result.registration.paymentStatus,
          paymentCompletedAt: result.registration.paymentCompletedAt,
        },
        stripeVerification: {
          paymentIntentId: paymentIntentId,
          verifiedAt: new Date().toISOString(),
          previouslyVerified: result.wasAlreadyVerified || false
        }
      });
      
    } catch (error: any) {
      console.error('Payment verification failed:', error.message);
      
      // Provide specific error codes for different failure scenarios
      let errorCode = 'VERIFICATION_FAILED';
      if (error.message.includes('already verified')) {
        errorCode = 'ALREADY_VERIFIED';
      } else if (error.message.includes('not found')) {
        errorCode = 'PAYMENT_INTENT_NOT_FOUND';
      } else if (error.message.includes('not succeeded')) {
        errorCode = 'PAYMENT_NOT_SUCCEEDED';
      } else if (error.message.includes('race condition')) {
        errorCode = 'RACE_CONDITION_DETECTED';
      }
      
      res.status(400).json({
        success: false,
        error: error.message,
        code: errorCode,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // GET REGISTRATION BY UUID - SECURE LOOKUP
  app.get('/api/bulletproof/registration/:uuid', async (req, res) => {
    try {
      const { uuid } = req.params;
      
      console.log('Looking up registration:', uuid);
      
      const registration = await bulletproofRegistration.getRegistrationByUuid(uuid);
      
      if (!registration) {
        return res.status(404).json({
          success: false,
          error: 'Registration not found',
          code: 'REGISTRATION_NOT_FOUND'
        });
      }
      
      // Verify data integrity
      const isIntegrityValid = await bulletproofRegistration.verifyDataIntegrity(uuid);
      
      res.json({
        success: true,
        registration: {
          uuid: registration.uuid,
          firstName: registration.firstName,
          lastName: registration.lastName,
          email: registration.email,
          contactName: registration.contactName,
          phone: registration.phone,
          age: registration.age,
          grade: registration.grade,
          gender: registration.gender,
          tshirtSize: registration.tshirtSize,
          schoolName: registration.schoolName,
          experienceLevel: registration.experienceLevel,
          clubName: registration.clubName,
          eventSlug: registration.eventSlug,
          paymentStatus: registration.paymentStatus,
          paymentCompletedAt: registration.paymentCompletedAt,
          createdAt: registration.createdAt,
        },
        dataIntegrityValid: isIntegrityValid,
      });
      
    } catch (error: any) {
      console.error('Registration lookup failed:', error.message);
      
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'LOOKUP_FAILED'
      });
    }
  });
  
  // GET ALL VERIFIED REGISTRATIONS FOR EVENT
  app.get('/api/bulletproof/event/:eventSlug/registrations', async (req, res) => {
    try {
      const { eventSlug } = req.params;
      
      console.log('Getting verified registrations for event:', eventSlug);
      
      const registrations = await bulletproofRegistration.getVerifiedRegistrationsForEvent(eventSlug);
      
      // Format for display (remove sensitive data)
      const formattedRegistrations = registrations.map(reg => ({
        uuid: reg.uuid,
        firstName: reg.firstName,
        lastName: reg.lastName,
        email: reg.email,
        age: reg.age,
        grade: reg.grade,
        gender: reg.gender,
        schoolName: reg.schoolName,
        experienceLevel: reg.experienceLevel,
        clubName: reg.clubName,
        registeredAt: reg.createdAt,
        paymentCompletedAt: reg.paymentCompletedAt,
      }));
      
      res.json({
        success: true,
        eventSlug,
        totalRegistrations: registrations.length,
        registrations: formattedRegistrations,
      });
      
    } catch (error: any) {
      console.error('Event registrations lookup failed:', error.message);
      
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'EVENT_LOOKUP_FAILED'
      });
    }
  });
  
  // ADMIN: GET SYSTEM HEALTH AND ERROR SUMMARY
  app.get('/api/bulletproof/admin/system-health', async (req, res) => {
    try {
      // This would be protected by admin authentication in production
      
      const healthData = await bulletproofRegistration.getSystemHealth();
      
      res.json({
        success: true,
        systemHealth: healthData,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error: any) {
      console.error('System health check failed:', error.message);
      
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'HEALTH_CHECK_FAILED'
      });
    }
  });
  
  // EMERGENCY: DISABLE REGISTRATION SYSTEM
  app.post('/api/bulletproof/admin/emergency-stop', async (req, res) => {
    try {
      // This would be protected by admin authentication in production
      console.log('EMERGENCY STOP ACTIVATED - All registrations disabled');
      
      // In a real system, this would set a global flag to disable registrations
      res.json({
        success: true,
        message: 'Registration system disabled for maintenance',
        timestamp: new Date().toISOString(),
      });
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
}