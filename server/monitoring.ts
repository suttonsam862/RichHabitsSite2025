
import { getTransactionStats } from "./middleware/duplicateTransactionPrevention.js";

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

interface TransactionStats {
  duplicatesBlocked: number;
  paymentIntentsCreated: number;
  paymentIntentsCompleted: number;
  rapidAttemptsBlocked: number;
  alreadyCompletedBlocked: number;
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

let transactionStats: TransactionStats = {
  duplicatesBlocked: 0,
  paymentIntentsCreated: 0,
  paymentIntentsCompleted: 0,
  rapidAttemptsBlocked: 0,
  alreadyCompletedBlocked: 0
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

export function trackDuplicateBlocked(): void {
  transactionStats.duplicatesBlocked++;
  console.log(`Duplicate transaction blocked (total: ${transactionStats.duplicatesBlocked})`);
}

export function trackPaymentIntentCreated(): void {
  transactionStats.paymentIntentsCreated++;
  console.log(`Payment intent created (total: ${transactionStats.paymentIntentsCreated})`);
}

export function trackPaymentIntentCompleted(): void {
  transactionStats.paymentIntentsCompleted++;
  console.log(`Payment intent completed (total: ${transactionStats.paymentIntentsCompleted})`);
}

export function trackRapidAttemptBlocked(): void {
  transactionStats.rapidAttemptsBlocked++;
  console.log(`Rapid attempt blocked (total: ${transactionStats.rapidAttemptsBlocked})`);
}

export function trackAlreadyCompletedBlocked(): void {
  transactionStats.alreadyCompletedBlocked++;
  console.log(`Already completed transaction blocked (total: ${transactionStats.alreadyCompletedBlocked})`);
}

export function logCriticalFailure(type: string, message: string, details: Record<string, any> = {}): void {
  console.error(`CRITICAL FAILURE [${type}]: ${message}`, details);
}

export function getStats(): { 
  webhooks: WebhookStats; 
  orders: OrderStats; 
  transactions: TransactionStats;
  duplicatePrevention: ReturnType<typeof getTransactionStats>;
} {
  return {
    webhooks: webhookStats,
    orders: orderStats,
    transactions: transactionStats,
    duplicatePrevention: getTransactionStats()
  };
}

export function generateDuplicatePreventionReport(): string {
  const stats = getStats();
  const currentTime = new Date().toISOString();
  
  return `
=== DUPLICATE TRANSACTION PREVENTION REPORT ===
Generated: ${currentTime}

PREVENTION STATISTICS:
- Duplicate transactions blocked: ${stats.transactions.duplicatesBlocked}
- Rapid attempts blocked: ${stats.transactions.rapidAttemptsBlocked}
- Already completed transactions blocked: ${stats.transactions.alreadyCompletedBlocked}
- Payment intents created: ${stats.transactions.paymentIntentsCreated}
- Payment intents completed: ${stats.transactions.paymentIntentsCompleted}

ACTIVE MONITORING:
- Active transactions being tracked: ${stats.duplicatePrevention.activeTransactions}
- Recent payment attempts being monitored: ${stats.duplicatePrevention.recentAttempts}
- Completed transactions in memory: ${stats.duplicatePrevention.completedTransactions}

WEBHOOK PROCESSING:
- Webhooks received: ${stats.webhooks.received}
- Webhooks processed successfully: ${stats.webhooks.successful}
- Webhook failures: ${stats.webhooks.failed}

ORDER CREATION:
- Orders created: ${stats.orders.created}
- Order creation failures: ${stats.orders.failed}

DUPLICATE PREVENTION EFFECTIVENESS:
- Prevention rate: ${stats.transactions.duplicatesBlocked > 0 ? 
  ((stats.transactions.duplicatesBlocked / (stats.transactions.paymentIntentsCreated + stats.transactions.duplicatesBlocked)) * 100).toFixed(2) + '%' : 
  'N/A (no duplicates attempted)'}
- Success rate: ${stats.transactions.paymentIntentsCreated > 0 ? 
  ((stats.transactions.paymentIntentsCompleted / stats.transactions.paymentIntentsCreated) * 100).toFixed(2) + '%' : 
  'N/A (no payments attempted)'}
`;
}
