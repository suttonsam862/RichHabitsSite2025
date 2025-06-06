import { db } from './db.js';
import { sql } from 'drizzle-orm';

// Webhook monitoring metrics
interface WebhookMetrics {
  webhooksReceived: number;
  webhooksSuccessful: number;
  webhooksFailed: number;
  ordersCreated: number;
  ordersFailed: number;
  lastWebhookTime?: Date;
  lastOrderTime?: Date;
}

// In-memory metrics tracking
let dailyMetrics: WebhookMetrics = {
  webhooksReceived: 0,
  webhooksSuccessful: 0,
  webhooksFailed: 0,
  ordersCreated: 0,
  ordersFailed: 0
};

// Reset metrics daily
let lastResetDate = new Date().toDateString();

export function resetDailyMetrics() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    dailyMetrics = {
      webhooksReceived: 0,
      webhooksSuccessful: 0,
      webhooksFailed: 0,
      ordersCreated: 0,
      ordersFailed: 0
    };
    lastResetDate = today;
  }
}

export function trackWebhookReceived() {
  resetDailyMetrics();
  dailyMetrics.webhooksReceived++;
  dailyMetrics.lastWebhookTime = new Date();
}

export function trackWebhookSuccess() {
  dailyMetrics.webhooksSuccessful++;
}

export function trackWebhookFailure() {
  dailyMetrics.webhooksFailed++;
}

export function trackOrderCreated() {
  dailyMetrics.ordersCreated++;
  dailyMetrics.lastOrderTime = new Date();
}

export function trackOrderFailed() {
  dailyMetrics.ordersFailed++;
}

export function getMetrics(): WebhookMetrics {
  resetDailyMetrics();
  return { ...dailyMetrics };
}

// Health check for monitoring endpoints
export async function getSystemHealth() {
  const metrics = getMetrics();
  const now = new Date();
  
  // Calculate success rates
  const webhookSuccessRate = metrics.webhooksReceived > 0 
    ? (metrics.webhooksSuccessful / metrics.webhooksReceived) * 100 
    : 100;
    
  const orderSuccessRate = metrics.webhooksSuccessful > 0
    ? (metrics.ordersCreated / metrics.webhooksSuccessful) * 100
    : 100;

  // Check if system is receiving webhooks (should have activity within last hour)
  const lastWebhookAge = metrics.lastWebhookTime 
    ? (now.getTime() - metrics.lastWebhookTime.getTime()) / 1000 / 60 // minutes
    : null;

  const isHealthy = webhookSuccessRate >= 95 && orderSuccessRate >= 95;
  const hasRecentActivity = lastWebhookAge === null || lastWebhookAge < 60;

  return {
    status: isHealthy && hasRecentActivity ? 'healthy' : 'warning',
    metrics: {
      webhookSuccessRate: Math.round(webhookSuccessRate * 100) / 100,
      orderSuccessRate: Math.round(orderSuccessRate * 100) / 100,
      webhooksToday: metrics.webhooksReceived,
      ordersToday: metrics.ordersCreated,
      lastWebhookMinutesAgo: lastWebhookAge ? Math.round(lastWebhookAge) : null
    },
    alerts: [
      ...(webhookSuccessRate < 95 ? [`Webhook success rate below 95%: ${webhookSuccessRate.toFixed(1)}%`] : []),
      ...(orderSuccessRate < 95 ? [`Order creation rate below 95%: ${orderSuccessRate.toFixed(1)}%`] : []),
      ...(lastWebhookAge && lastWebhookAge > 60 ? [`No webhooks received in last ${Math.round(lastWebhookAge)} minutes`] : [])
    ]
  };
}

// Log critical failures for alerting
export function logCriticalFailure(type: 'webhook' | 'shopify' | 'payment', error: string, context: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type,
    error,
    context: JSON.stringify(context, null, 2)
  };
  
  console.error('CRITICAL FAILURE:', JSON.stringify(logEntry, null, 2));
  
  // In production, this could send to external monitoring service
  // Examples: Sentry, DataDog, CloudWatch, etc.
}