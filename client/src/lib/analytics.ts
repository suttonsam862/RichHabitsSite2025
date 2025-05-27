// Native Analytics Client Library
// Lightweight visitor tracking that sends data to your Shopify dashboard
// Completely independent of existing functionality

interface AnalyticsEvent {
  page: string;
  eventType?: 'page_view' | 'registration_start' | 'registration_complete' | 'payment_complete';
  eventData?: Record<string, any>;
}

class NativeAnalytics {
  private sessionId: string | null = null;
  private isEnabled: boolean = true;
  private baseUrl: string = '';

  constructor() {
    // Get session ID from cookie if it exists
    this.sessionId = this.getCookie('analytics_session_id');
  }

  // Track page views automatically
  async trackPageView(page: string): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await this.sendEvent({
        page,
        eventType: 'page_view'
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Track registration start
  async trackRegistrationStart(eventId: number, eventName: string, registrationType: string): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await this.sendEvent({
        page: window.location.pathname,
        eventType: 'registration_start',
        eventData: { eventId, eventName, registrationType }
      });
    } catch (error) {
      console.warn('Registration start tracking failed:', error);
    }
  }

  // Track registration completion
  async trackRegistrationComplete(eventId: number, eventName: string, amount: number, paymentIntentId?: string): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await this.sendEvent({
        page: window.location.pathname,
        eventType: 'registration_complete',
        eventData: { eventId, eventName, amount, paymentIntentId }
      });
    } catch (error) {
      console.warn('Registration completion tracking failed:', error);
    }
  }

  // Track payment completion
  async trackPaymentComplete(amount: number, eventId: number, paymentIntentId: string, registrationType: string): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await this.sendEvent({
        page: window.location.pathname,
        eventType: 'payment_complete',
        eventData: { amount, eventId, paymentIntentId, registrationType }
      });
    } catch (error) {
      console.warn('Payment completion tracking failed:', error);
    }
  }

  // Send event to analytics endpoint
  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    const response = await fetch('/api/analytics/log-visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.sessionId && { 'X-Session-ID': this.sessionId })
      },
      body: JSON.stringify(event)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.sessionId && !this.sessionId) {
        this.sessionId = data.sessionId;
      }
    }
  }

  // Utility: Get cookie value
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Create global analytics instance
export const analytics = new NativeAnalytics();

// Auto-track page views when component loads
export function usePageTracking() {
  const currentPath = window.location.pathname;
  
  // Track page view on component mount
  React.useEffect(() => {
    analytics.trackPageView(currentPath);
  }, [currentPath]);
}

// Hook for tracking registration events
export function useRegistrationTracking() {
  return {
    trackStart: analytics.trackRegistrationStart.bind(analytics),
    trackComplete: analytics.trackRegistrationComplete.bind(analytics),
    trackPayment: analytics.trackPaymentComplete.bind(analytics)
  };
}