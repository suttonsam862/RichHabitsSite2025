
import type { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

interface TransactionRequest extends Request {
  transactionFingerprint?: string;
  isDuplicateTransaction?: boolean;
  blockReason?: string;
}

// In-memory store for active transactions with multiple layers of protection
const activeTransactions = new Map<string, {
  timestamp: number;
  paymentIntentId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  ipAddress: string;
  userAgent: string;
}>();

const recentPaymentAttempts = new Map<string, {
  timestamp: number;
  attempts: number;
  lastAttempt: number;
}>();

const completedTransactions = new Set<string>();

// Clean up expired entries every 2 minutes
setInterval(() => {
  const now = Date.now();
  const expiredThreshold = 15 * 60 * 1000; // 15 minutes
  
  for (const [key, value] of activeTransactions.entries()) {
    if (now - value.timestamp > expiredThreshold) {
      activeTransactions.delete(key);
    }
  }
  
  for (const [key, value] of recentPaymentAttempts.entries()) {
    if (now - value.timestamp > expiredThreshold) {
      recentPaymentAttempts.delete(key);
    }
  }
}, 2 * 60 * 1000);

function createTransactionFingerprint(registrationData: any, sessionId: string, ipAddress: string): string {
  // Create multiple layers of fingerprinting
  const primaryFingerprint = `${sessionId}_${registrationData.email}_${registrationData.firstName}_${registrationData.lastName}`;
  const secondaryFingerprint = `${ipAddress}_${registrationData.email}_${Date.now().toString().slice(0, -4)}`; // 10-second window
  const dataHash = createHash('sha256')
    .update(JSON.stringify({
      email: registrationData.email,
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      eventId: registrationData.eventId
    }))
    .digest('hex')
    .substring(0, 16);
  
  return `${primaryFingerprint}_${dataHash}`;
}

export function duplicateTransactionPrevention(req: TransactionRequest, res: Response, next: NextFunction) {
  // Only apply to payment-related endpoints
  if (!req.path.includes('payment-intent') && !req.path.includes('stripe')) {
    return next();
  }

  const { registrationData } = req.body;
  const sessionId = req.sessionID || 'no_session';
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  if (!registrationData?.email) {
    return next();
  }

  // Create comprehensive transaction fingerprint
  const transactionFingerprint = createTransactionFingerprint(registrationData, sessionId, ipAddress);
  req.transactionFingerprint = transactionFingerprint;

  // Check for active identical transaction
  const activeTransaction = activeTransactions.get(transactionFingerprint);
  if (activeTransaction) {
    const timeSinceStart = Date.now() - activeTransaction.timestamp;
    
    if (timeSinceStart < 60000) { // 1 minute window
      console.log(`BLOCKED: Duplicate transaction attempt for ${registrationData.email} (${timeSinceStart}ms ago)`);
      req.isDuplicateTransaction = true;
      req.blockReason = 'Active identical transaction in progress';
      
      return res.status(429).json({
        error: 'Duplicate transaction blocked',
        message: 'A payment for this registration is already being processed',
        userFriendlyMessage: 'Your payment is already being processed. Please wait and do not refresh the page.',
        retryAfter: Math.ceil((60000 - timeSinceStart) / 1000)
      });
    }
  }

  // Check for rapid successive attempts from same email/IP
  const attemptKey = `${registrationData.email}_${ipAddress}`;
  const recentAttempts = recentPaymentAttempts.get(attemptKey);
  
  if (recentAttempts) {
    const timeSinceLastAttempt = Date.now() - recentAttempts.lastAttempt;
    
    if (timeSinceLastAttempt < 30000 && recentAttempts.attempts >= 2) { // 30 seconds, 2 attempts
      console.log(`BLOCKED: Rapid successive attempts from ${registrationData.email} at ${ipAddress}`);
      req.isDuplicateTransaction = true;
      req.blockReason = 'Too many rapid attempts';
      
      return res.status(429).json({
        error: 'Too many payment attempts',
        message: 'Please wait before attempting another payment',
        userFriendlyMessage: 'Please wait 30 seconds before trying again to prevent duplicate charges.',
        retryAfter: Math.ceil((30000 - timeSinceLastAttempt) / 1000)
      });
    }
  }

  // Check if this exact transaction was recently completed
  if (completedTransactions.has(transactionFingerprint)) {
    console.log(`BLOCKED: Transaction already completed for ${registrationData.email}`);
    req.isDuplicateTransaction = true;
    req.blockReason = 'Transaction already completed';
    
    return res.status(409).json({
      error: 'Transaction already completed',
      message: 'This registration has already been processed',
      userFriendlyMessage: 'This registration has already been completed. Please check your email for confirmation.'
    });
  }

  // Record this transaction attempt
  activeTransactions.set(transactionFingerprint, {
    timestamp: Date.now(),
    status: 'pending',
    ipAddress,
    userAgent
  });

  // Update attempt tracking
  recentPaymentAttempts.set(attemptKey, {
    timestamp: recentAttempts?.timestamp || Date.now(),
    attempts: (recentAttempts?.attempts || 0) + 1,
    lastAttempt: Date.now()
  });

  next();
}

export function markTransactionProcessing(transactionFingerprint: string, paymentIntentId: string) {
  const transaction = activeTransactions.get(transactionFingerprint);
  if (transaction) {
    transaction.status = 'processing';
    transaction.paymentIntentId = paymentIntentId;
    console.log(`Transaction marked as processing: ${transactionFingerprint} -> ${paymentIntentId}`);
  }
}

export function markTransactionCompleted(transactionFingerprint: string) {
  const transaction = activeTransactions.get(transactionFingerprint);
  if (transaction) {
    transaction.status = 'completed';
    completedTransactions.add(transactionFingerprint);
    console.log(`Transaction completed: ${transactionFingerprint}`);
  }
}

export function markTransactionFailed(transactionFingerprint: string) {
  const transaction = activeTransactions.get(transactionFingerprint);
  if (transaction) {
    transaction.status = 'failed';
    console.log(`Transaction failed: ${transactionFingerprint}`);
  }
}

export function getTransactionStats() {
  return {
    activeTransactions: activeTransactions.size,
    recentAttempts: recentPaymentAttempts.size,
    completedTransactions: completedTransactions.size
  };
}
