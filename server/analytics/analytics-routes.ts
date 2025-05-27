// Native Analytics API Routes - Completely independent of existing functionality
// These endpoints handle visitor tracking and registration analytics

import { Request, Response } from 'express';
import { VisitorTracker } from './visitor-tracker';

let visitorTracker: VisitorTracker | null = null;

// Initialize analytics system (only if Shopify credentials are available)
export function initializeAnalytics(shopifyDomain?: string, shopifyToken?: string) {
  if (shopifyDomain && shopifyToken) {
    visitorTracker = new VisitorTracker(shopifyDomain, shopifyToken);
    console.log('✅ Native Analytics System initialized and connected to Shopify');
  } else {
    console.log('⚠️ Analytics System: Shopify credentials not provided - analytics disabled');
  }
}

// Generate or retrieve session ID from request
function getSessionId(req: Request): string {
  // Try to get existing session ID from cookies or headers
  let sessionId = req.headers['x-session-id'] as string || 
                  req.cookies?.analytics_session_id;
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  return sessionId;
}

// Main visitor tracking endpoint
export async function logVisit(req: Request, res: Response) {
  try {
    if (!visitorTracker) {
      return res.status(200).json({ 
        success: false, 
        message: 'Analytics system not initialized' 
      });
    }

    const sessionId = getSessionId(req);
    const { page, eventType = 'page_view', eventData } = req.body;

    if (!page) {
      return res.status(400).json({ 
        success: false, 
        message: 'Page parameter required' 
      });
    }

    // Track the visitor event
    await visitorTracker.trackEvent(sessionId, page, eventType, req, eventData);

    // Return session ID for client to use in future requests
    res.cookie('analytics_session_id', sessionId, { 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax'
    });

    res.json({ 
      success: true, 
      sessionId,
      message: 'Event tracked successfully' 
    });

  } catch (error) {
    console.error('Error in analytics tracking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal tracking error' 
    });
  }
}

// Registration start tracking
export async function logRegistrationStart(req: Request, res: Response) {
  try {
    if (!visitorTracker) {
      return res.status(200).json({ success: false });
    }

    const sessionId = getSessionId(req);
    const { eventId, eventName, registrationType } = req.body;

    await visitorTracker.trackEvent(
      sessionId, 
      req.headers.referer || '/registration', 
      'registration_start',
      req,
      { eventId, eventName, registrationType }
    );

    res.json({ success: true, sessionId });
  } catch (error) {
    console.error('Error tracking registration start:', error);
    res.status(500).json({ success: false });
  }
}

// Registration completion tracking
export async function logRegistrationComplete(req: Request, res: Response) {
  try {
    if (!visitorTracker) {
      return res.status(200).json({ success: false });
    }

    const sessionId = getSessionId(req);
    const { eventId, eventName, amount, paymentIntentId } = req.body;

    await visitorTracker.trackEvent(
      sessionId,
      req.headers.referer || '/registration-complete',
      'registration_complete',
      req,
      { eventId, eventName, amount, paymentIntentId }
    );

    res.json({ success: true, sessionId });
  } catch (error) {
    console.error('Error tracking registration completion:', error);
    res.status(500).json({ success: false });
  }
}

// Payment completion tracking
export async function logPaymentComplete(req: Request, res: Response) {
  try {
    if (!visitorTracker) {
      return res.status(200).json({ success: false });
    }

    const sessionId = getSessionId(req);
    const { amount, eventId, paymentIntentId, registrationType } = req.body;

    await visitorTracker.trackEvent(
      sessionId,
      req.headers.referer || '/payment-complete',
      'payment_complete',
      req,
      { amount, eventId, paymentIntentId, registrationType }
    );

    res.json({ success: true, sessionId });
  } catch (error) {
    console.error('Error tracking payment completion:', error);
    res.status(500).json({ success: false });
  }
}

// Get analytics dashboard data (for admin use)
export async function getAnalyticsDashboard(req: Request, res: Response) {
  try {
    if (!visitorTracker) {
      return res.status(503).json({ 
        error: 'Analytics system not initialized' 
      });
    }

    const { date } = req.query;
    const targetDate = date as string || new Date().toISOString().split('T')[0];

    // This would typically fetch from Shopify, but for now return current session data
    const sessions = Array.from((visitorTracker as any).sessions.values());
    const todaySessions = sessions.filter((session: any) => 
      session.startTime.startsWith(targetDate)
    );

    const summary = {
      date: targetDate,
      totalVisits: todaySessions.length,
      deviceBreakdown: todaySessions.reduce((acc: any, session: any) => {
        acc[session.deviceType] = (acc[session.deviceType] || 0) + 1;
        return acc;
      }, {}),
      topPages: todaySessions.flatMap((s: any) => s.pageViews)
        .reduce((acc: any, page: string) => {
          acc[page] = (acc[page] || 0) + 1;
          return acc;
        }, {}),
      events: todaySessions.flatMap((s: any) => s.events)
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
}

// Trigger manual aggregation (admin endpoint)
export async function triggerAggregation(req: Request, res: Response) {
  try {
    if (!visitorTracker) {
      return res.status(503).json({ 
        error: 'Analytics system not initialized' 
      });
    }

    await visitorTracker.triggerAggregation();
    res.json({ success: true, message: 'Aggregation triggered successfully' });
  } catch (error) {
    console.error('Error triggering aggregation:', error);
    res.status(500).json({ error: 'Failed to trigger aggregation' });
  }
}