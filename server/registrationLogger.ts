import { storage } from './storage';
import { EventRegistrationLogInsert } from '@shared/schema';

// Device detection helper
function detectDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

// Generate a unique form session ID
export function generateFormSessionId(): string {
  return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create initial registration log entry - MUST be called before any Stripe interaction
export async function logRegistrationAttempt(
  formData: any,
  req: any,
  formSessionId?: string
): Promise<string> {
  try {
    const sessionId = formSessionId || generateFormSessionId();
    
    // Extract client information
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const deviceType = detectDeviceType(userAgent);
    
    // Calculate pricing
    const basePrice = Math.round((formData.price || 249) * 100); // Convert to cents
    const discountAmount = formData.discountAmount || 0;
    const finalPrice = Math.max(0, basePrice - Math.round(discountAmount * 100));
    
    const logData: EventRegistrationLogInsert = {
      formSessionId: sessionId,
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
      dataSource: 'form_submission'
    };
    
    console.log('Creating registration log entry for:', formData.firstName, formData.lastName);
    const logEntry = await storage.createRegistrationLog(logData);
    
    console.log(`✅ Registration logged: ${logEntry.id} - ${formData.firstName} ${formData.lastName} (${formData.email})`);
    return logEntry.id;
  } catch (error) {
    console.error('❌ CRITICAL: Failed to log registration attempt:', error);
    throw new Error('Registration logging failed - cannot proceed');
  }
}

// Update log entry with Stripe payment intent ID
export async function updateLogWithPaymentIntent(
  logId: string,
  paymentIntentId: string
): Promise<void> {
  try {
    await storage.updateRegistrationLog(logId, {
      stripePaymentIntentId: paymentIntentId,
      paymentStatus: 'processing'
    });
    
    console.log(`✅ Payment intent linked to log: ${logId} -> ${paymentIntentId}`);
  } catch (error) {
    console.error('❌ Failed to update log with payment intent:', error);
    throw error;
  }
}

// Mark registration as paid
export async function markRegistrationPaid(
  paymentIntentId: string,
  paymentMethod?: string
): Promise<void> {
  try {
    const logEntry = await storage.getRegistrationLogByPaymentIntent(paymentIntentId);
    
    if (!logEntry) {
      console.error(`❌ No registration log found for payment intent: ${paymentIntentId}`);
      return;
    }
    
    await storage.updateRegistrationLog(logEntry.id, {
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'card'
    });
    
    console.log(`✅ Registration marked as paid: ${logEntry.id} - ${logEntry.firstName} ${logEntry.lastName}`);
  } catch (error) {
    console.error('❌ Failed to mark registration as paid:', error);
    throw error;
  }
}

// Mark registration as failed
export async function markRegistrationFailed(
  paymentIntentId: string,
  errorReason?: string
): Promise<void> {
  try {
    const logEntry = await storage.getRegistrationLogByPaymentIntent(paymentIntentId);
    
    if (!logEntry) {
      console.error(`❌ No registration log found for payment intent: ${paymentIntentId}`);
      return;
    }
    
    await storage.updateRegistrationLog(logEntry.id, {
      paymentStatus: 'failed'
    });
    
    console.log(`❌ Registration marked as failed: ${logEntry.id} - ${errorReason || 'Unknown error'}`);
  } catch (error) {
    console.error('❌ Failed to mark registration as failed:', error);
  }
}

// Validate that registration logging occurred before allowing Stripe session creation
export async function validateRegistrationLogged(formSessionId: string): Promise<boolean> {
  try {
    const logEntry = await storage.getRegistrationLogByFormSession(formSessionId);
    
    if (!logEntry) {
      console.error(`❌ SECURITY VIOLATION: Stripe session creation attempted without logging for session: ${formSessionId}`);
      return false;
    }
    
    console.log(`✅ Registration logging validated for session: ${formSessionId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to validate registration logging:', error);
    return false;
  }
}