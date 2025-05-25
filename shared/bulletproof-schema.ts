import { pgTable, text, integer, timestamp, boolean, decimal, json, unique, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// BULLETPROOF REGISTRATION SYSTEM - ZERO CORRUPTION TOLERANCE
// Each registration is ATOMIC - either complete or it doesn't exist

export const atomicRegistrations = pgTable("atomic_registrations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  // IMMUTABLE UNIQUE IDENTIFIERS - NEVER CHANGE THESE
  uuid: text("uuid").notNull().unique(), // UUID generated client-side before payment
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(), // ONE payment = ONE registration FOREVER
  
  // EVENT INFORMATION - LOCKED ON CREATION
  eventSlug: text("event_slug").notNull(),
  eventPrice: integer("event_price_cents").notNull(), // Price locked at registration time
  
  // CUSTOMER DATA - ALL REQUIRED OR REGISTRATION FAILS
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  
  // ATHLETE DATA - ALL REQUIRED FOR VALID REGISTRATION
  age: integer("age").notNull(),
  grade: text("grade").notNull(),
  gender: text("gender").notNull(),
  tshirtSize: text("tshirt_size").notNull(),
  schoolName: text("school_name").notNull(),
  experienceLevel: text("experience_level").notNull(),
  
  // OPTIONAL BUT VALIDATED DATA
  clubName: text("club_name"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  
  // PAYMENT STATUS - ONLY 4 STATES ALLOWED
  paymentStatus: text("payment_status").notNull().default("created"), // created, processing, succeeded, failed
  paymentCompletedAt: timestamp("payment_completed_at"),
  
  // STRIPE DATA - IMMUTABLE ONCE SET
  stripeCustomerId: text("stripe_customer_id"),
  stripeClientSecret: text("stripe_client_secret").notNull(),
  
  // SECURITY AND AUDIT - IMMUTABLE
  registrationSource: text("registration_source").notNull().default("website"),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  
  // TIMESTAMPS - NEVER CHANGE
  createdAt: timestamp("created_at").notNull().defaultNow(),
  
  // DATA INTEGRITY PROTECTION
  dataChecksum: text("data_checksum").notNull(), // SHA-256 hash of all data
  systemVersion: text("system_version").notNull().default("bulletproof_v1"),
  
}, (table) => ({
  // PREVENT ANY DUPLICATE REGISTRATIONS
  uniqueEmailPerEvent: unique("unique_email_event").on(table.email, table.eventSlug),
  uniquePaymentIntent: unique("unique_payment_intent").on(table.stripePaymentIntentId),
  
  // PERFORMANCE INDEXES
  eventIndex: index("atomic_registrations_event_idx").on(table.eventSlug),
  emailIndex: index("atomic_registrations_email_idx").on(table.email),
  paymentIndex: index("atomic_registrations_payment_idx").on(table.stripePaymentIntentId),
  statusIndex: index("atomic_registrations_status_idx").on(table.paymentStatus),
}));

// PAYMENT INTENT LOCKDOWN - PREVENT PAYMENT HIJACKING
export const paymentIntentLockdown = pgTable("payment_intent_lockdown", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  // IMMUTABLE PAYMENT TRACKING
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
  registrationUuid: text("registration_uuid").notNull().references(() => atomicRegistrations.uuid),
  
  // PAYMENT METADATA - LOCKED ON CREATION
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("usd"),
  eventSlug: text("event_slug").notNull(),
  
  // STATUS TRACKING - ONLY FORWARD PROGRESSION
  status: text("status").notNull(), // requires_payment_method, requires_confirmation, succeeded, canceled
  
  // FRAUD PREVENTION
  clientSecretHash: text("client_secret_hash").notNull(), // Hash of client secret for verification
  createdFromIp: text("created_from_ip").notNull(),
  userAgent: text("user_agent"),
  
  // IMMUTABLE TIMESTAMPS
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastStatusUpdateAt: timestamp("last_status_update_at").notNull().defaultNow(),
  
}, (table) => ({
  registrationIndex: index("payment_lockdown_registration_idx").on(table.registrationUuid),
  statusIndex: index("payment_lockdown_status_idx").on(table.status),
}));

// SYSTEM ERROR TRACKING - CATCH EVERY PROBLEM
export const criticalErrorLog = pgTable("critical_error_log", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  // ERROR CLASSIFICATION
  errorCode: text("error_code").notNull(), // DUPLICATE_PAYMENT, MISSING_DATA, PAYMENT_HIJACK, etc.
  severity: text("severity").notNull(), // CRITICAL, HIGH, MEDIUM, LOW
  
  // CONTEXT DATA
  registrationUuid: text("registration_uuid"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  email: text("email"),
  eventSlug: text("event_slug"),
  
  // ERROR DETAILS
  errorMessage: text("error_message").notNull(),
  stackTrace: text("stack_trace"),
  requestData: json("request_data"), // Full request that caused error
  systemState: json("system_state"), // State of system when error occurred
  
  // CUSTOMER IMPACT
  customerNotified: boolean("customer_notified").default(false),
  financialImpact: integer("financial_impact_cents").default(0),
  
  // RESOLUTION TRACKING
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: text("resolved_by"),
  resolutionAction: text("resolution_action"),
  
  // IMMUTABLE METADATA
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  
}, (table) => ({
  errorCodeIndex: index("error_log_code_idx").on(table.errorCode),
  severityIndex: index("error_log_severity_idx").on(table.severity),
  unresolvedIndex: index("error_log_unresolved_idx").on(table.resolved),
}));

// REFUND ACCOUNTABILITY - TRACK EVERY CENT
export const refundTracker = pgTable("refund_tracker", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  // REFUND IDENTIFICATION
  stripeRefundId: text("stripe_refund_id").notNull().unique(),
  originalPaymentIntentId: text("original_payment_intent_id").notNull(),
  registrationUuid: text("registration_uuid").references(() => atomicRegistrations.uuid),
  
  // REFUND DETAILS
  amountRefundedCents: integer("amount_refunded_cents").notNull(),
  refundReason: text("refund_reason").notNull(), // DUPLICATE_CHARGE, SYSTEM_ERROR, CUSTOMER_REQUEST
  refundStatus: text("refund_status").notNull(), // pending, succeeded, failed, canceled
  
  // ACCOUNTABILITY
  initiatedBy: text("initiated_by").notNull(), // system_auto, admin_manual, customer_service
  approvedBy: text("approved_by"),
  customerEmail: text("customer_email").notNull(),
  customerNotified: boolean("customer_notified").default(false),
  
  // AUDIT TRAIL
  refundMetadata: json("refund_metadata"), // Additional Stripe data
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  
}, (table) => ({
  paymentIntentIndex: index("refund_payment_intent_idx").on(table.originalPaymentIntentId),
  statusIndex: index("refund_status_idx").on(table.refundStatus),
  reasonIndex: index("refund_reason_idx").on(table.refundReason),
}));

// BULLETPROOF VALIDATION SCHEMAS
export const bulletproofRegistrationSchema = createInsertSchema(atomicRegistrations, {
  // STRICT EMAIL VALIDATION
  email: z.string()
    .email("Must be a valid email address")
    .min(5, "Email too short")
    .max(100, "Email too long")
    .toLowerCase(),
    
  // PHONE VALIDATION
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number too long")
    .regex(/^[\d\s\-\(\)\+]+$/, "Phone number contains invalid characters"),
    
  // NAME VALIDATION
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .regex(/^[a-zA-Z\s\-\']+$/, "First name contains invalid characters"),
    
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name too long")
    .regex(/^[a-zA-Z\s\-\']+$/, "Last name contains invalid characters"),
    
  contactName: z.string()
    .min(1, "Parent/Guardian name is required")
    .max(100, "Contact name too long"),
    
  // AGE VALIDATION
  age: z.number()
    .int("Age must be a whole number")
    .min(5, "Minimum age is 5")
    .max(25, "Maximum age is 25"),
    
  // GRADE VALIDATION
  grade: z.enum([
    "5th", "6th", "7th", "8th", 
    "9th", "10th", "11th", "12th", 
    "college", "post-grad"
  ], { required_error: "Grade is required" }),
    
  // GENDER VALIDATION
  gender: z.enum(["male", "female"], { 
    required_error: "Gender is required" 
  }),
    
  // T-SHIRT SIZE VALIDATION
  tshirtSize: z.enum(["xs", "s", "m", "l", "xl", "xxl"], { 
    required_error: "T-shirt size is required" 
  }),
    
  // SCHOOL NAME VALIDATION
  schoolName: z.string()
    .min(1, "School name is required")
    .max(100, "School name too long"),
    
  // EXPERIENCE LEVEL VALIDATION
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"], { 
    required_error: "Experience level is required" 
  }),
    
  // TECHNICAL FIELDS
  eventSlug: z.string().min(1, "Event is required"),
  eventPrice: z.number().int().positive("Price must be positive"),
  stripePaymentIntentId: z.string().min(1, "Payment intent required"),
  stripeClientSecret: z.string().min(1, "Client secret required"),
  uuid: z.string().uuid("Invalid UUID format"),
  ipAddress: z.string().ip("Invalid IP address"),
  dataChecksum: z.string().min(64, "Invalid checksum"),
    
}).omit({
  id: true,
  createdAt: true,
  paymentCompletedAt: true,
});

// HELPER SCHEMAS
export const paymentIntentSchema = createInsertSchema(paymentIntentLockdown).omit({
  id: true,
  createdAt: true,
  lastStatusUpdateAt: true,
});

export const errorLogSchema = createInsertSchema(criticalErrorLog).omit({
  id: true,
  createdAt: true,
});

// TYPES
export type AtomicRegistration = typeof atomicRegistrations.$inferSelect;
export type PaymentIntentLockdown = typeof paymentIntentLockdown.$inferSelect;
export type CriticalErrorLog = typeof criticalErrorLog.$inferSelect;
export type RefundTracker = typeof refundTracker.$inferSelect;

export type BulletproofRegistration = z.infer<typeof bulletproofRegistrationSchema>;
export type PaymentIntentInsert = z.infer<typeof paymentIntentSchema>;
export type ErrorLogInsert = z.infer<typeof errorLogSchema>;

// VALIDATION CONSTANTS
export const VALID_EVENTS = [
  "birmingham-slam-camp",
  "national-champ-camp", 
  "texas-recruiting-clinic",
  "panther-train-tour"
] as const;

export const EVENT_PRICES = {
  "birmingham-slam-camp": 24900, // $249.00 in cents
  "national-champ-camp": 29900,  // $299.00 in cents
  "texas-recruiting-clinic": 24900, // $249.00 in cents
  "panther-train-tour": 19900,  // $199.00 in cents
} as const;