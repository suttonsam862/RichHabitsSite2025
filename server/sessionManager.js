// Session management for preventing duplicate payment intents
class SessionManager {
  constructor() {
    // In-memory store for active sessions (in production, use Redis)
    this.activeSessions = new Map();
    this.paymentIntents = new Map(); // Store payment intents by session
    
    // Clean up expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  // Generate unique session ID based on user data
  generateSessionId(email, eventId, registrationType = 'full') {
    const timestamp = Date.now();
    const data = `${email.toLowerCase()}-${eventId}-${registrationType}-${Math.floor(timestamp / (5 * 60 * 1000))}`;
    return Buffer.from(data).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  // Check if session is locked (payment in progress)
  isSessionLocked(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    
    // Check if session has expired (10 minutes)
    const now = Date.now();
    if (now - session.createdAt > 10 * 60 * 1000) {
      this.activeSessions.delete(sessionId);
      this.paymentIntents.delete(sessionId);
      return false;
    }
    
    return session.locked;
  }

  // Lock session to prevent duplicate processing
  lockSession(sessionId, email, eventId, registrationType, amount) {
    console.log(`🔒 Locking session: ${sessionId} for ${email} - Event ${eventId}`);
    
    this.activeSessions.set(sessionId, {
      sessionId,
      email: email.toLowerCase(),
      eventId,
      registrationType,
      amount,
      locked: true,
      createdAt: Date.now(),
      attempts: 1
    });
    
    return true;
  }

  // Get existing payment intent for session
  getPaymentIntent(sessionId) {
    return this.paymentIntents.get(sessionId);
  }

  // Store payment intent for session
  storePaymentIntent(sessionId, paymentIntentId, clientSecret) {
    console.log(`💳 Storing payment intent: ${paymentIntentId} for session: ${sessionId}`);
    
    this.paymentIntents.set(sessionId, {
      paymentIntentId,
      clientSecret,
      createdAt: Date.now(),
      status: 'created'
    });
  }

  // Update payment intent status
  updatePaymentIntentStatus(sessionId, status) {
    const intent = this.paymentIntents.get(sessionId);
    if (intent) {
      intent.status = status;
      intent.updatedAt = Date.now();
      console.log(`📝 Updated payment intent status: ${intent.paymentIntentId} -> ${status}`);
    }
  }

  // Release session lock
  unlockSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.locked = false;
      console.log(`🔓 Unlocked session: ${sessionId}`);
    }
  }

  // Complete session (successful payment)
  completeSession(sessionId) {
    console.log(`✅ Completing session: ${sessionId}`);
    this.activeSessions.delete(sessionId);
    // Keep payment intent record for a bit longer for reference
    setTimeout(() => {
      this.paymentIntents.delete(sessionId);
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Clear payment intent for session (used when forcing new intent creation)
  clearPaymentIntent(sessionId) {
    console.log(`🗑️ Clearing payment intent for session: ${sessionId}`);
    this.paymentIntents.delete(sessionId);
  }

  // Increment attempt counter for session
  incrementAttempts(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.attempts = (session.attempts || 0) + 1;
      
      // If too many attempts, reject
      if (session.attempts > 3) {
        console.warn(`⚠️ Too many attempts for session: ${sessionId} (${session.attempts})`);
        return false;
      }
    }
    return true;
  }

  // Get session info
  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  // Clean up expired sessions
  cleanupExpiredSessions() {
    const now = Date.now();
    const expiredThreshold = 15 * 60 * 1000; // 15 minutes
    
    let cleanedSessions = 0;
    let cleanedIntents = 0;
    
    // Clean up expired active sessions
    for (const [sessionId, session] of this.activeSessions) {
      if (now - session.createdAt > expiredThreshold) {
        this.activeSessions.delete(sessionId);
        cleanedSessions++;
      }
    }
    
    // Clean up old payment intents
    for (const [sessionId, intent] of this.paymentIntents) {
      if (now - intent.createdAt > 60 * 60 * 1000) { // 1 hour
        this.paymentIntents.delete(sessionId);
        cleanedIntents++;
      }
    }
    
    if (cleanedSessions > 0 || cleanedIntents > 0) {
      console.log(`🧹 Cleaned up ${cleanedSessions} expired sessions and ${cleanedIntents} old payment intents`);
    }
  }

  // Get stats for monitoring
  getStats() {
    return {
      activeSessions: this.activeSessions.size,
      paymentIntents: this.paymentIntents.size,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();