// Payment Intent Creation Hardening System
// Prevents duplicate intents, handles errors, and ensures bulletproof payment flow

export class PaymentIntentLock {
  private static activeSessions: Map<string, {
    timestamp: number;
    paymentIntentId?: string;
    status: 'creating' | 'completed' | 'failed';
  }> = new Map();

  private static readonly LOCK_TIMEOUT = 30000; // 30 seconds
  private static readonly CLEANUP_INTERVAL = 60000; // 1 minute

  static {
    // Clean up expired locks every minute
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, lock] of this.activeSessions.entries()) {
        if (now - lock.timestamp > this.LOCK_TIMEOUT) {
          this.activeSessions.delete(sessionId);
        }
      }
    }, this.CLEANUP_INTERVAL);
  }

  // Acquire lock for payment intent creation
  static acquireLock(sessionId: string): boolean {
    const existing = this.activeSessions.get(sessionId);
    
    if (existing) {
      // Check if lock is expired
      if (Date.now() - existing.timestamp > this.LOCK_TIMEOUT) {
        this.activeSessions.delete(sessionId);
      } else {
        // Active lock exists
        return false;
      }
    }

    // Acquire new lock
    this.activeSessions.set(sessionId, {
      timestamp: Date.now(),
      status: 'creating'
    });

    return true;
  }

  // Check if session has existing payment intent
  static getExistingIntent(sessionId: string): string | null {
    const lock = this.activeSessions.get(sessionId);
    return lock?.paymentIntentId || null;
  }

  // Update lock with payment intent ID
  static updateLock(sessionId: string, paymentIntentId: string): void {
    const lock = this.activeSessions.get(sessionId);
    if (lock) {
      lock.paymentIntentId = paymentIntentId;
      lock.status = 'completed';
      lock.timestamp = Date.now();
    }
  }

  // Mark lock as failed
  static markFailed(sessionId: string): void {
    const lock = this.activeSessions.get(sessionId);
    if (lock) {
      lock.status = 'failed';
      lock.timestamp = Date.now();
    }
  }

  // Release lock
  static releaseLock(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }

  // Get lock status
  static getLockStatus(sessionId: string): 'none' | 'creating' | 'completed' | 'failed' {
    const lock = this.activeSessions.get(sessionId);
    if (!lock) return 'none';
    
    // Check if expired
    if (Date.now() - lock.timestamp > this.LOCK_TIMEOUT) {
      this.activeSessions.delete(sessionId);
      return 'none';
    }
    
    return lock.status;
  }
}