
// Basic monitoring functions for Stripe webhooks and payments
interface WebhookStats {
  received: number;
  successful: number;
  failed: number;
}

interface OrderStats {
  created: number;
  failed: number;
}

let webhookStats: WebhookStats = {
  received: 0,
  successful: 0,
  failed: 0
};

let orderStats: OrderStats = {
  created: 0,
  failed: 0
};

export function trackWebhookReceived(): void {
  webhookStats.received++;
  console.log(`Webhook received (total: ${webhookStats.received})`);
}

export function trackWebhookSuccess(): void {
  webhookStats.successful++;
  console.log(`Webhook processed successfully (total: ${webhookStats.successful})`);
}

export function trackWebhookFailure(): void {
  webhookStats.failed++;
  console.log(`Webhook processing failed (total: ${webhookStats.failed})`);
}

export function trackOrderCreated(): void {
  orderStats.created++;
  console.log(`Order created successfully (total: ${orderStats.created})`);
}

export function trackOrderFailed(): void {
  orderStats.failed++;
  console.log(`Order creation failed (total: ${orderStats.failed})`);
}

export function logCriticalFailure(type: string, message: string, details: Record<string, any> = {}): void {
  console.error(`CRITICAL FAILURE [${type}]: ${message}`, details);
}

export function getStats(): { webhooks: WebhookStats; orders: OrderStats } {
  return {
    webhooks: webhookStats,
    orders: orderStats
  };
}
