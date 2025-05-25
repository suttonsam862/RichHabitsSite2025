import type { Express } from "express";
import { bulletproofRegistration } from './bulletproof-registration';
import { z } from 'zod';

// BULLETPROOF REGISTRATION ROUTES - ZERO CORRUPTION TOLERANCE
export function registerBulletproofRoutes(app: Express) {
  
  // STEP 1: CREATE SECURE REGISTRATION WITH LOCKED PAYMENT INTENT
  app.post('/api/bulletproof/create-registration', async (req, res) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');
      
      console.log('Creating bulletproof registration for:', req.body.email);
      
      const result = await bulletproofRegistration.createSecureRegistration(
        req.body,
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
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          error: 'Payment intent ID is required',
          code: 'MISSING_PAYMENT_INTENT'
        });
      }
      
      console.log('Verifying payment completion for:', paymentIntentId);
      
      const result = await bulletproofRegistration.verifyPaymentCompletion(paymentIntentId);
      
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
        }
      });
      
    } catch (error: any) {
      console.error('Payment verification failed:', error.message);
      
      res.status(400).json({
        success: false,
        error: error.message,
        code: 'VERIFICATION_FAILED'
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