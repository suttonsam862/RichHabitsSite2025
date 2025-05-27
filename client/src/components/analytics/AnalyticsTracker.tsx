// Native Analytics Tracker Component
// Automatically tracks page views and visitor activity
// Completely invisible to users and doesn't affect existing functionality

import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface AnalyticsTrackerProps {
  children?: React.ReactNode;
}

export function AnalyticsTracker({ children }: AnalyticsTrackerProps) {
  const [location] = useLocation();

  useEffect(() => {
    // Track page view when route changes
    const trackPageView = async () => {
      try {
        await fetch('/api/analytics/log-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: location,
            eventType: 'page_view'
          })
        });
      } catch (error) {
        // Silent fail - analytics shouldn't break the site
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackPageView();
  }, [location]);

  // This component is invisible and doesn't render anything
  return children ? <>{children}</> : null;
}

// Hook for tracking registration events in your existing components
export function useAnalyticsTracking() {
  const trackRegistrationStart = async (eventId: number, eventName: string, registrationType: string) => {
    try {
      await fetch('/api/analytics/registration-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, eventName, registrationType })
      });
    } catch (error) {
      console.debug('Registration start tracking failed:', error);
    }
  };

  const trackRegistrationComplete = async (eventId: number, eventName: string, amount: number, paymentIntentId?: string) => {
    try {
      await fetch('/api/analytics/registration-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, eventName, amount, paymentIntentId })
      });
    } catch (error) {
      console.debug('Registration completion tracking failed:', error);
    }
  };

  const trackPaymentComplete = async (amount: number, eventId: number, paymentIntentId: string, registrationType: string) => {
    try {
      await fetch('/api/analytics/payment-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, eventId, paymentIntentId, registrationType })
      });
    } catch (error) {
      console.debug('Payment completion tracking failed:', error);
    }
  };

  return {
    trackRegistrationStart,
    trackRegistrationComplete,
    trackPaymentComplete
  };
}