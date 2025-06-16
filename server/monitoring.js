
// Basic monitoring functions for Stripe webhooks and payments
let webhookStats = {
  received: 0,
  successful: 0,
  failed: 0
};

let orderStats = {
  created: 0,
  failed: 0
};

export function trackWebhookReceived() {
  webhookStats.received++;
  console.log(`Webhook received (total: ${webhookStats.received})`);
}

export function trackWebhookSuccess() {
  webhookStats.successful++;
  console.log(`Webhook processed successfully (total: ${webhookStats.successful})`);
}

export function trackWebhookFailure() {
  webhookStats.failed++;
  console.log(`Webhook processing failed (total: ${webhookStats.failed})`);
}

export function trackOrderCreated() {
  orderStats.created++;
  console.log(`Order created successfully (total: ${orderStats.created})`);
}

export function trackOrderFailed() {
  orderStats.failed++;
  console.log(`Order creation failed (total: ${orderStats.failed})`);
}

export function logCriticalFailure(type, message, details = {}) {
  console.error(`CRITICAL FAILURE [${type}]: ${message}`, details);
}

export function getStats() {
  return {
    webhooks: webhookStats,
    orders: orderStats
  };
}
