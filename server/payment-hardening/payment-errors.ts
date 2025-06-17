// Payment Error Logging and Recovery System
// Comprehensive error tracking for all payment intent failures

// Temporarily disabled to fix Birmingham Slam Camp registration
// import { db } from '../db';
// import { errorLogs } from '@shared/schema';
// import { eq, desc } from 'drizzle-orm';

export interface PaymentError {
  timestamp: string;
  requestBody: any;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  stripeResponse?: any;
  errorType: 'validation' | 'stripe_400' | 'stripe_500' | 'network' | 'timeout';
  errorMessage: string;
  retryAttempt: number;
}

export class PaymentErrorLogger {
  // Log payment intent creation failure - temporarily disabled
  static async logPaymentError(error: PaymentError): Promise<void> {
    // Temporarily disabled to fix Birmingham Slam Camp registration
    console.error('Payment Error:', {
      sessionId: error.sessionId,
      errorType: error.errorType,
      message: error.errorMessage,
      retryAttempt: error.retryAttempt
    });
  }

  // Get recent payment errors for admin dashboard - temporarily disabled
  static async getRecentErrors(limit: number = 50): Promise<any[]> {
    // Temporarily disabled to fix Birmingham Slam Camp registration
    return [];
  }

  // Get error patterns by IP/session
  static async getErrorPatterns(): Promise<any> {
    try {
      const errors = await this.getRecentErrors(200);
      
      const patterns = {
        byIP: {} as Record<string, number>,
        bySession: {} as Record<string, number>,
        byDevice: {} as Record<string, number>,
        byErrorType: {} as Record<string, number>
      };

      errors.forEach(error => {
        const data = error.registrationData as any;
        if (data?.ipAddress) {
          patterns.byIP[data.ipAddress] = (patterns.byIP[data.ipAddress] || 0) + 1;
        }
        if (error.sessionId) {
          patterns.bySession[error.sessionId] = (patterns.bySession[error.sessionId] || 0) + 1;
        }
        if (error.deviceType) {
          patterns.byDevice[error.deviceType] = (patterns.byDevice[error.deviceType] || 0) + 1;
        }
        if (data?.errorType) {
          patterns.byErrorType[data.errorType] = (patterns.byErrorType[data.errorType] || 0) + 1;
        }
      });

      return patterns;
    } catch (error) {
      console.error('Failed to analyze error patterns:', error);
      return { byIP: {}, bySession: {}, byDevice: {}, byErrorType: {} };
    }
  }

  private static detectDeviceType(userAgent: string): string {
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    if (/Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }
}

// Retry logic for failed payment intents
export class PaymentRetryHandler {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [250, 500, 1000]; // ms

  static async retryPaymentIntent(
    originalFunction: () => Promise<any>,
    sessionId: string,
    requestData: any,
    ipAddress: string,
    userAgent: string
  ): Promise<any> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAYS[attempt - 1]));
          console.log(`Payment retry attempt ${attempt} for session ${sessionId}`);
        }

        const result = await originalFunction();
        
        if (attempt > 0) {
          console.log(`Payment succeeded on retry ${attempt} for session ${sessionId}`);
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        
        // Log each retry attempt
        await PaymentErrorLogger.logPaymentError({
          timestamp: new Date().toISOString(),
          requestBody: requestData,
          ipAddress,
          userAgent,
          sessionId,
          stripeResponse: error.response?.data,
          errorType: this.categorizeError(error),
          errorMessage: error.message || 'Unknown payment error',
          retryAttempt: attempt
        });

        // Don't retry certain types of errors
        if (this.isNonRetryableError(error) || attempt === this.MAX_RETRIES) {
          break;
        }
      }
    }

    // All retries failed
    console.error(`Payment failed after ${this.MAX_RETRIES} retries for session ${sessionId}`);
    throw lastError;
  }

  private static categorizeError(error: any): PaymentError['errorType'] {
    if (error.response?.status === 400) return 'stripe_400';
    if (error.response?.status >= 500) return 'stripe_500';
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') return 'timeout';
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') return 'network';
    return 'validation';
  }

  private static isNonRetryableError(error: any): boolean {
    // Don't retry validation errors or authentication errors
    if (error.response?.status === 400) return true;
    if (error.response?.status === 401) return true;
    if (error.response?.status === 403) return true;
    return false;
  }
}