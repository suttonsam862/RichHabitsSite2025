// Error logging schema for payment intent failures and mobile issues
import { pgTable, text, timestamp, json, integer, boolean } from 'drizzle-orm/pg-core';

export const errorLogs = pgTable('error_logs', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  errorType: text('error_type').notNull(), // 'payment_intent_failure', 'mobile_crash', 'validation_error'
  sessionId: text('session_id').notNull(),
  userId: text('user_id'),
  eventId: integer('event_id'),
  userAgent: text('user_agent'),
  deviceType: text('device_type'), // 'mobile', 'desktop', 'tablet'
  errorMessage: text('error_message').notNull(),
  errorStack: text('error_stack'),
  requestPayload: json('request_payload'), // Full request data for debugging
  registrationData: json('registration_data'), // Form data at time of error
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  resolved: boolean('resolved').default(false),
  notes: text('notes')
});

export type ErrorLog = typeof errorLogs.$inferSelect;
export type NewErrorLog = typeof errorLogs.$inferInsert;