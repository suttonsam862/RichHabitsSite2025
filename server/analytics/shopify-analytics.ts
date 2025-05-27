// Native Analytics System - Shopify Integration Module
// This module handles all analytics data relay to Shopify Admin Dashboard
// Completely independent of existing site functionality

import fetch from 'node-fetch';

export interface VisitorEvent {
  page: string;
  timestamp: string;
  sessionId: string;
  utmSource?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  referrer?: string;
  ipAddress?: string;
  userAgent?: string;
  eventType: 'page_view' | 'registration_start' | 'registration_complete' | 'payment_complete';
  eventData?: Record<string, any>;
}

export interface DailySummary {
  date: string;
  totalVisits: number;
  bounceRate: number;
  utmConversions: Record<string, number>;
  mobileVsDesktop: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topReferrers: Array<{ source: string; count: number }>;
  registrations: {
    started: number;
    completed: number;
    conversionRate: number;
  };
  revenue: {
    totalAmount: number;
    averageOrderValue: number;
    transactionCount: number;
  };
}

export class ShopifyAnalytics {
  private shopifyDomain: string;
  private accessToken: string;
  private apiVersion: string = '2024-01';

  constructor(domain: string, token: string) {
    this.shopifyDomain = domain;
    this.accessToken = token;
  }

  // Store analytics data as metafields in Shopify
  async storeDailySummary(summary: DailySummary): Promise<boolean> {
    try {
      const metafieldData = {
        metafield: {
          namespace: 'custom.site_metrics',
          key: `daily_summary_${summary.date.replace(/-/g, '_')}`,
          value: JSON.stringify(summary),
          type: 'json'
        }
      };

      const response = await fetch(
        `https://${this.shopifyDomain}/admin/api/${this.apiVersion}/metafields.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': this.accessToken
          },
          body: JSON.stringify(metafieldData)
        }
      );

      if (!response.ok) {
        console.error('Failed to store analytics in Shopify:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error storing analytics data:', error);
      return false;
    }
  }

  // Store real-time visitor events
  async logVisitorEvent(event: VisitorEvent): Promise<boolean> {
    try {
      const eventKey = `visitor_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const metafieldData = {
        metafield: {
          namespace: 'custom.site_events',
          key: eventKey,
          value: JSON.stringify(event),
          type: 'json'
        }
      };

      const response = await fetch(
        `https://${this.shopifyDomain}/admin/api/${this.apiVersion}/metafields.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': this.accessToken
          },
          body: JSON.stringify(metafieldData)
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error logging visitor event:', error);
      return false;
    }
  }

  // Retrieve analytics data from Shopify
  async getDailySummary(date: string): Promise<DailySummary | null> {
    try {
      const key = `daily_summary_${date.replace(/-/g, '_')}`;
      
      const response = await fetch(
        `https://${this.shopifyDomain}/admin/api/${this.apiVersion}/metafields.json?namespace=custom.site_metrics&key=${key}`,
        {
          headers: {
            'X-Shopify-Access-Token': this.accessToken
          }
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.metafields && data.metafields.length > 0) {
        return JSON.parse(data.metafields[0].value);
      }

      return null;
    } catch (error) {
      console.error('Error retrieving analytics data:', error);
      return null;
    }
  }

  // Log errors to Shopify for debugging
  async logError(error: string, context?: Record<string, any>): Promise<void> {
    try {
      const errorData = {
        timestamp: new Date().toISOString(),
        error,
        context: context || {}
      };

      const metafieldData = {
        metafield: {
          namespace: 'custom.site_metrics',
          key: `error_${Date.now()}`,
          value: JSON.stringify(errorData),
          type: 'json'
        }
      };

      await fetch(
        `https://${this.shopifyDomain}/admin/api/${this.apiVersion}/metafields.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': this.accessToken
          },
          body: JSON.stringify(metafieldData)
        }
      );
    } catch (e) {
      console.error('Failed to log error to Shopify:', e);
    }
  }
}