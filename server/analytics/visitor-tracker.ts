// Native Analytics System - Visitor Tracking Module
// Captures all visitor activity and registration events from the website
// Completely independent of existing site functionality

import { ShopifyAnalytics, VisitorEvent, DailySummary } from './shopify-analytics';

export interface TrackedSession {
  sessionId: string;
  startTime: string;
  lastActivity: string;
  pageViews: string[];
  deviceType: 'mobile' | 'desktop' | 'tablet';
  userAgent: string;
  ipAddress: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  events: VisitorEvent[];
}

export class VisitorTracker {
  private sessions: Map<string, TrackedSession> = new Map();
  private shopifyAnalytics: ShopifyAnalytics;
  private aggregationInterval: NodeJS.Timeout | null = null;

  constructor(shopifyDomain: string, shopifyToken: string) {
    this.shopifyAnalytics = new ShopifyAnalytics(shopifyDomain, shopifyToken);
    this.startAggregation();
  }

  // Track a visitor event
  async trackEvent(
    sessionId: string,
    page: string,
    eventType: VisitorEvent['eventType'],
    request: any,
    eventData?: Record<string, any>
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const deviceType = this.detectDeviceType(request.headers['user-agent'] || '');
      const ipAddress = this.getClientIP(request);
      
      // Create or update session
      if (!this.sessions.has(sessionId)) {
        this.sessions.set(sessionId, {
          sessionId,
          startTime: timestamp,
          lastActivity: timestamp,
          pageViews: [],
          deviceType,
          userAgent: request.headers['user-agent'] || '',
          ipAddress,
          referrer: request.headers.referer,
          utmSource: request.query?.utm_source,
          utmMedium: request.query?.utm_medium,
          utmCampaign: request.query?.utm_campaign,
          events: []
        });
      }

      const session = this.sessions.get(sessionId)!;
      session.lastActivity = timestamp;
      
      if (eventType === 'page_view' && !session.pageViews.includes(page)) {
        session.pageViews.push(page);
      }

      const event: VisitorEvent = {
        page,
        timestamp,
        sessionId,
        utmSource: session.utmSource,
        deviceType: session.deviceType,
        referrer: session.referrer,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        eventType,
        eventData
      };

      session.events.push(event);

      // Log to Shopify immediately for real-time tracking
      await this.shopifyAnalytics.logVisitorEvent(event);

      console.log(`Analytics: Tracked ${eventType} for session ${sessionId} on ${page}`);
    } catch (error) {
      console.error('Error tracking visitor event:', error);
      await this.shopifyAnalytics.logError('Visitor tracking error', { 
        sessionId, 
        page, 
        eventType, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  // Get visitor session data
  getSession(sessionId: string): TrackedSession | undefined {
    return this.sessions.get(sessionId);
  }

  // Calculate bounce rate
  private calculateBounceRate(): number {
    const sessions = Array.from(this.sessions.values());
    if (sessions.length === 0) return 0;
    
    const bouncedSessions = sessions.filter(session => session.pageViews.length <= 1).length;
    return Math.round((bouncedSessions / sessions.length) * 100);
  }

  // Aggregate daily data and send to Shopify
  private async aggregateAndSend(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sessions = Array.from(this.sessions.values());
      const todaySessions = sessions.filter(session => 
        session.startTime.startsWith(today)
      );

      if (todaySessions.length === 0) {
        console.log('Analytics: No sessions to aggregate for today');
        return;
      }

      // Calculate device breakdown
      const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
      todaySessions.forEach(session => {
        deviceCounts[session.deviceType]++;
      });

      // Calculate referrer data
      const referrerCounts: Record<string, number> = {};
      todaySessions.forEach(session => {
        if (session.referrer) {
          const domain = new URL(session.referrer).hostname;
          referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
        }
      });

      const topReferrers = Object.entries(referrerCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([source, count]) => ({ source, count }));

      // Calculate UTM conversions
      const utmConversions: Record<string, number> = {};
      todaySessions.forEach(session => {
        if (session.utmSource) {
          utmConversions[session.utmSource] = (utmConversions[session.utmSource] || 0) + 1;
        }
      });

      // Calculate registration metrics
      const registrationEvents = todaySessions.flatMap(session => 
        session.events.filter(event => 
          event.eventType === 'registration_start' || event.eventType === 'registration_complete'
        )
      );

      const registrationsStarted = registrationEvents.filter(e => e.eventType === 'registration_start').length;
      const registrationsCompleted = registrationEvents.filter(e => e.eventType === 'registration_complete').length;
      const conversionRate = registrationsStarted > 0 ? Math.round((registrationsCompleted / registrationsStarted) * 100) : 0;

      // Calculate revenue metrics from payment events
      const paymentEvents = todaySessions.flatMap(session => 
        session.events.filter(event => event.eventType === 'payment_complete')
      );

      const totalRevenue = paymentEvents.reduce((sum, event) => 
        sum + (event.eventData?.amount || 0), 0
      );

      const averageOrderValue = paymentEvents.length > 0 ? totalRevenue / paymentEvents.length : 0;

      const summary: DailySummary = {
        date: today,
        totalVisits: todaySessions.length,
        bounceRate: this.calculateBounceRate(),
        utmConversions,
        mobileVsDesktop: deviceCounts,
        topReferrers,
        registrations: {
          started: registrationsStarted,
          completed: registrationsCompleted,
          conversionRate
        },
        revenue: {
          totalAmount: totalRevenue,
          averageOrderValue,
          transactionCount: paymentEvents.length
        }
      };

      // Send to Shopify
      const success = await this.shopifyAnalytics.storeDailySummary(summary);
      
      if (success) {
        console.log(`Analytics: Successfully sent daily summary to Shopify for ${today}`);
        console.log(`- Visits: ${summary.totalVisits}`);
        console.log(`- Registrations: ${summary.registrations.completed}`);
        console.log(`- Revenue: $${summary.revenue.totalAmount.toFixed(2)}`);
      } else {
        console.error('Analytics: Failed to send daily summary to Shopify');
      }

    } catch (error) {
      console.error('Error aggregating analytics data:', error);
      await this.shopifyAnalytics.logError('Analytics aggregation error', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  // Start the aggregation timer (every 5 minutes)
  private startAggregation(): void {
    this.aggregationInterval = setInterval(() => {
      this.aggregateAndSend();
    }, 5 * 60 * 1000); // 5 minutes

    console.log('Analytics: Started aggregation service (every 5 minutes)');
  }

  // Stop the aggregation timer
  stopAggregation(): void {
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
      this.aggregationInterval = null;
      console.log('Analytics: Stopped aggregation service');
    }
  }

  // Utility: Detect device type from user agent
  private detectDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    if (/Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  // Utility: Get client IP address
  private getClientIP(request: any): string {
    return request.headers['x-forwarded-for']?.split(',')[0] ||
           request.headers['x-real-ip'] ||
           request.connection?.remoteAddress ||
           request.socket?.remoteAddress ||
           'unknown';
  }

  // Manual trigger for immediate aggregation (useful for testing)
  async triggerAggregation(): Promise<void> {
    await this.aggregateAndSend();
  }
}