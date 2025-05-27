// Comprehensive error logging system for payment intent failures
import { db } from './db';
import { errorLogs } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export interface PaymentErrorContext {
  sessionId: string;
  eventId?: number;
  userAgent?: string;
  deviceType?: string;
  registrationData?: any;
  requestPayload?: any;
  errorStack?: string;
}

export class PaymentErrorLogger {
  static async logPaymentIntentFailure(
    errorMessage: string,
    context: PaymentErrorContext
  ) {
    try {
      const deviceType = this.detectDeviceType(context.userAgent || '');
      
      await db.insert(errorLogs).values({
        errorType: 'payment_intent_failure',
        sessionId: context.sessionId,
        eventId: context.eventId,
        userAgent: context.userAgent,
        deviceType,
        errorMessage,
        errorStack: context.errorStack,
        requestPayload: context.requestPayload,
        registrationData: context.registrationData,
        resolved: false
      });

      // Also log to console for immediate debugging
      console.error('PAYMENT INTENT FAILURE:', {
        sessionId: context.sessionId,
        eventId: context.eventId,
        deviceType,
        error: errorMessage,
        registrationData: context.registrationData
      });
    } catch (logError) {
      console.error('Failed to log payment error:', logError);
    }
  }

  static async logMobileCrash(
    errorMessage: string,
    context: PaymentErrorContext
  ) {
    try {
      await db.insert(errorLogs).values({
        errorType: 'mobile_crash',
        sessionId: context.sessionId,
        eventId: context.eventId,
        userAgent: context.userAgent,
        deviceType: this.detectDeviceType(context.userAgent || ''),
        errorMessage,
        errorStack: context.errorStack,
        requestPayload: context.requestPayload,
        registrationData: context.registrationData,
        resolved: false
      });
    } catch (logError) {
      console.error('Failed to log mobile crash:', logError);
    }
  }

  static async logValidationError(
    errorMessage: string,
    context: PaymentErrorContext
  ) {
    try {
      await db.insert(errorLogs).values({
        errorType: 'validation_error',
        sessionId: context.sessionId,
        eventId: context.eventId,
        userAgent: context.userAgent,
        deviceType: this.detectDeviceType(context.userAgent || ''),
        errorMessage,
        errorStack: context.errorStack,
        requestPayload: context.requestPayload,
        registrationData: context.registrationData,
        resolved: false
      });
    } catch (logError) {
      console.error('Failed to log validation error:', logError);
    }
  }

  private static detectDeviceType(userAgent: string): string {
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }
    if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }

  // Get recent payment errors for debugging
  static async getRecentPaymentErrors(limit: number = 50) {
    try {
      return await db
        .select()
        .from(errorLogs)
        .where(eq(errorLogs.errorType, 'payment_intent_failure'))
        .orderBy(desc(errorLogs.timestamp))
        .limit(limit);
    } catch (error) {
      console.error('Failed to fetch recent payment errors:', error);
      return [];
    }
  }
}