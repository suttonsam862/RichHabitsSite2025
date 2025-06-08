
import { storage } from './storage';
import { EventRegistrationLogInsert } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { eventRegistrationLog } from '@shared/schema';
import { db } from './db';

export class UnifiedRegistrationService {
  
  // Single entry point for all registration logging
  async logRegistration(formData: any, req: any, sessionId?: string): Promise<string> {
    try {
      console.log('📝 Logging registration to unified system...');
      
      const sessionIdToUse = sessionId || this.generateSessionId();
      
      // Extract client information
      const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      const deviceType = this.detectDeviceType(userAgent);
      
      // Calculate pricing
      const basePrice = Math.round((formData.price || 249) * 100);
      const discountAmount = formData.discountAmount || 0;
      const finalPrice = Math.max(0, basePrice - Math.round(discountAmount * 100));
      
      const logData: EventRegistrationLogInsert = {
        formSessionId: sessionIdToUse,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        eventSlug: formData.eventSlug,
        eventId: formData.eventId || null,
        campDate: formData.campDate || null,
        teamName: formData.teamName || null,
        grade: formData.grade || null,
        schoolName: formData.schoolName || null,
        clubName: formData.clubName || null,
        tShirtSize: formData.tShirtSize || null,
        gender: formData.gender || null,
        experience: formData.experience || null,
        registrationType: formData.registrationType || 'individual',
        day1: formData.day1 || false,
        day2: formData.day2 || false,
        day3: formData.day3 || false,
        gearSelection: formData.gearSelection || null,
        basePrice: basePrice,
        discountCode: formData.discountCode || null,
        discountAmount: Math.round(discountAmount * 100),
        finalPrice: finalPrice,
        paymentStatus: 'pending',
        ipAddress: ipAddress,
        userAgent: userAgent,
        deviceType: deviceType,
        medicalReleaseAccepted: formData.medicalReleaseAccepted !== false,
        termsAccepted: formData.termsAccepted !== false,
        dataSource: 'unified_system'
      };
      
      const logEntry = await storage.createRegistrationLog(logData);
      
      console.log(`✅ Registration logged: ${logEntry.id} - ${formData.firstName} ${formData.lastName}`);
      return logEntry.id;
      
    } catch (error) {
      console.error('❌ Failed to log registration:', error);
      throw new Error('Registration logging failed');
    }
  }
  
  // Get all completed registrations (unified view)
  async getCompletedRegistrations(): Promise<any[]> {
    try {
      const results = await db
        .select({
          id: eventRegistrationLog.id,
          firstName: eventRegistrationLog.firstName,
          lastName: eventRegistrationLog.lastName,
          email: eventRegistrationLog.email,
          phone: eventRegistrationLog.phone,
          eventSlug: eventRegistrationLog.eventSlug,
          eventId: eventRegistrationLog.eventId,
          schoolName: eventRegistrationLog.schoolName,
          clubName: eventRegistrationLog.clubName,
          grade: eventRegistrationLog.grade,
          tShirtSize: eventRegistrationLog.tShirtSize,
          registrationType: eventRegistrationLog.registrationType,
          paymentStatus: eventRegistrationLog.paymentStatus,
          stripePaymentIntentId: eventRegistrationLog.stripePaymentIntentId,
          finalPrice: eventRegistrationLog.finalPrice,
          createdAt: eventRegistrationLog.createdAt,
          day1: eventRegistrationLog.day1,
          day2: eventRegistrationLog.day2,
          day3: eventRegistrationLog.day3
        })
        .from(eventRegistrationLog)
        .where(
          or(
            eq(eventRegistrationLog.paymentStatus, 'paid'),
            eq(eventRegistrationLog.paymentStatus, 'succeeded')
          )
        );
      
      return results;
      
    } catch (error) {
      console.error('❌ Error getting completed registrations:', error);
      throw error;
    }
  }
  
  // Check for duplicate registrations
  async checkDuplicateRegistration(email: string, eventSlug: string): Promise<boolean> {
    try {
      const existing = await db
        .select()
        .from(eventRegistrationLog)
        .where(
          and(
            eq(eventRegistrationLog.email, email.toLowerCase()),
            eq(eventRegistrationLog.eventSlug, eventSlug),
            or(
              eq(eventRegistrationLog.paymentStatus, 'paid'),
              eq(eventRegistrationLog.paymentStatus, 'succeeded')
            )
          )
        )
        .limit(1);
      
      return existing.length > 0;
      
    } catch (error) {
      console.error('❌ Error checking duplicate registration:', error);
      return false;
    }
  }
  
  // Update payment status
  async updatePaymentStatus(
    paymentIntentId: string, 
    status: 'paid' | 'failed' | 'cancelled'
  ): Promise<void> {
    try {
      await db
        .update(eventRegistrationLog)
        .set({ 
          paymentStatus: status,
          updatedAt: new Date()
        })
        .where(eq(eventRegistrationLog.stripePaymentIntentId, paymentIntentId));
      
      console.log(`✅ Updated payment status: ${paymentIntentId} -> ${status}`);
      
    } catch (error) {
      console.error('❌ Failed to update payment status:', error);
      throw error;
    }
  }
  
  // Get registration by payment intent
  async getRegistrationByPaymentIntent(paymentIntentId: string): Promise<any | null> {
    try {
      const results = await db
        .select()
        .from(eventRegistrationLog)
        .where(eq(eventRegistrationLog.stripePaymentIntentId, paymentIntentId))
        .limit(1);
      
      return results[0] || null;
      
    } catch (error) {
      console.error('❌ Error getting registration by payment intent:', error);
      return null;
    }
  }
  
  // Generate unique session ID
  private generateSessionId(): string {
    return `unified_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Detect device type
  private detectDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }
}

export const unifiedRegistrationService = new UnifiedRegistrationService();
