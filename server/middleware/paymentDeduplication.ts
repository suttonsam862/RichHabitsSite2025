
import type { Request, Response, NextFunction } from 'express';

interface PaymentRequest extends Request {
  paymentHash?: string;
  isDuplicatePayment?: boolean;
}

const recentPaymentAttempts = new Map<string, {
  timestamp: number;
  paymentIntentId?: string;
}>();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  const expiredThreshold = 30 * 60 * 1000; // 30 minutes
  
  for (const [key, value] of recentPaymentAttempts.entries()) {
    if (now - value.timestamp > expiredThreshold) {
      recentPaymentAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function paymentDeduplicationMiddleware(req: PaymentRequest, res: Response, next: NextFunction) {
  // Only apply to payment intent creation endpoints
  if (!req.path.includes('create-payment-intent')) {
    return next();
  }

  const { registrationData } = req.body;
  const sessionId = req.sessionID;
  
  if (!registrationData?.email || !sessionId) {
    return next();
  }

  // Create a unique hash for this payment attempt
  const paymentHash = `${sessionId}_${registrationData.email}_${registrationData.firstName}_${registrationData.lastName}`;
  req.paymentHash = paymentHash;

  // Check if we've seen this exact payment attempt recently
  const recentAttempt = recentPaymentAttempts.get(paymentHash);
  if (recentAttempt && (Date.now() - recentAttempt.timestamp) < 60000) { // 1 minute
    console.log(`Blocking duplicate payment attempt for ${registrationData.email}`);
    req.isDuplicatePayment = true;
    
    return res.status(429).json({
      error: 'Duplicate payment attempt',
      message: 'Please wait before attempting another payment',
      userFriendlyMessage: 'Payment already in progress. Please wait a moment before trying again.'
    });
  }

  // Record this payment attempt
  recentPaymentAttempts.set(paymentHash, {
    timestamp: Date.now()
  });

  next();
}

export function markPaymentIntentCreated(paymentHash: string, paymentIntentId: string) {
  const attempt = recentPaymentAttempts.get(paymentHash);
  if (attempt) {
    attempt.paymentIntentId = paymentIntentId;
  }
}
