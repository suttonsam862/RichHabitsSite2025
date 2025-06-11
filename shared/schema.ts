import { pgTable, text, integer, boolean, timestamp, jsonb, index, uuid, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// =====================================================
// RICH HABITS - SCALABLE UUID-BASED DATABASE SCHEMA
// =====================================================

// Session storage table for express-session (keep existing for compatibility)
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums for better data consistency
export const userRoleEnum = pgEnum('user_role', ['customer', 'coach', 'designer', 'staff', 'sales_agent', 'admin']);
export const paymentMethodEnum = pgEnum('payment_method', ['stripe', 'cash', 'quickbooks', 'paypal']);
export const paymentSourceEnum = pgEnum('payment_source', ['retail', 'custom', 'event']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'completed', 'cancelled', 'refunded']);
export const deviceTypeEnum = pgEnum('device_type', ['mobile', 'tablet', 'desktop']);

// =====================================================
// CORE USER MANAGEMENT
// =====================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  password: text("password"), // Nullable for OAuth users
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  
  // Role and organization management
  role: userRoleEnum("role").notNull().default('customer'),
  teamId: uuid("team_id"), // Self-referencing for team/organization structure
  organizationName: text("organization_name"), // For coaches, schools, etc.
  
  // Profile and preferences
  profileImage: text("profile_image"),
  bio: text("bio"),
  preferences: jsonb("preferences"), // Store user preferences as JSON
  
  // Account status and metadata
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  
  // Soft delete and audit
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User relations for team/organization hierarchy
export const userRelations = relations(users, ({ one, many }) => ({
  team: one(users, {
    fields: [users.teamId],
    references: [users.id],
    relationName: "team_members"
  }),
  teamMembers: many(users, { relationName: "team_members" }),
  customOrders: many(customOrders),
  retailSales: many(retailSales),
  payments: many(payments),
  eventRegistrations: many(eventRegistrations),
  siteSessions: many(siteSessions)
}));

// =====================================================
// CUSTOM APPAREL MANAGEMENT
// =====================================================

export const customOrders = pgTable("custom_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull(),
  salesAgentId: uuid("sales_agent_id"), // Who handled the sale
  
  // Order details
  orderNumber: text("order_number").notNull().unique(), // Human-readable order number
  title: text("title").notNull(), // e.g., "Westfield High Wrestling Team Gear"
  description: text("description"),
  
  // Gear pack and design files
  gearPackRequests: jsonb("gear_pack_requests"), // Array of requested items
  designFiles: jsonb("design_files"), // URLs and metadata for design files
  itemizedRequests: jsonb("itemized_requests"), // Detailed breakdown of quantities, sizes, etc.
  
  // Pricing and status
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }),
  status: orderStatusEnum("status").default('pending'),
  
  // External references
  invoiceReference: text("invoice_reference"), // QuickBooks or other invoice system
  shopifyOrderId: text("shopify_order_id"), // If processed through Shopify
  
  // Timeline tracking
  estimateProvidedAt: timestamp("estimate_provided_at"),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
  
  // Soft delete and audit
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const customOrderRelations = relations(customOrders, ({ one, many }) => ({
  customer: one(users, {
    fields: [customOrders.customerId],
    references: [users.id]
  }),
  salesAgent: one(users, {
    fields: [customOrders.salesAgentId],
    references: [users.id]
  }),
  payments: many(payments)
}));

// =====================================================
// RETAIL SALES MANAGEMENT
// =====================================================

export const retailSales = pgTable("retail_sales", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id"),
  salesAgentId: uuid("sales_agent_id"), // Staff member who processed sale
  
  // Transaction details
  transactionNumber: text("transaction_number").notNull().unique(),
  source: text("source").notNull(), // 'shopify' or 'pos'
  
  // Product information
  productId: text("product_id"), // Shopify product ID or internal SKU
  productTitle: text("product_title").notNull(),
  productVariant: text("product_variant"), // Size, color, etc.
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Discount and tax information
  discountCode: text("discount_code"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default('0'),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default('0'),
  
  // Status and external references
  paymentStatus: orderStatusEnum("payment_status").default('pending'),
  shopifyOrderId: text("shopify_order_id"),
  shopifyOrderNumber: text("shopify_order_number"),
  
  // Fulfillment tracking
  fulfilledAt: timestamp("fulfilled_at"),
  trackingNumber: text("tracking_number"),
  
  // Soft delete and audit
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const retailSaleRelations = relations(retailSales, ({ one, many }) => ({
  customer: one(users, {
    fields: [retailSales.customerId],
    references: [users.id]
  }),
  salesAgent: one(users, {
    fields: [retailSales.salesAgentId],
    references: [users.id]
  }),
  payments: many(payments)
}));

// =====================================================
// UNIVERSAL PAYMENT SYSTEM
// =====================================================

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  
  // Payment amount and method
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default('USD'),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentSource: paymentSourceEnum("payment_source").notNull(),
  
  // External payment references
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  quickbooksTransactionId: text("quickbooks_transaction_id"),
  paypalTransactionId: text("paypal_transaction_id"),
  
  // Order linkage (polymorphic relationship)
  customOrderId: uuid("custom_order_id"), // Links to custom_orders
  retailSaleId: uuid("retail_sale_id"), // Links to retail_sales
  eventRegistrationId: uuid("event_registration_id"), // Links to event_registrations
  
  // Payment status and metadata
  status: orderStatusEnum("status").default('pending'),
  paymentDate: timestamp("payment_date"),
  refundedAt: timestamp("refunded_at"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  refundReason: text("refund_reason"),
  
  // Additional metadata
  metadata: jsonb("metadata"), // Store additional payment processor data
  notes: text("notes"),
  
  // Soft delete and audit
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const paymentRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id]
  }),
  customOrder: one(customOrders, {
    fields: [payments.customOrderId],
    references: [customOrders.id]
  }),
  retailSale: one(retailSales, {
    fields: [payments.retailSaleId],
    references: [retailSales.id]
  }),
  eventRegistration: one(eventRegistrations, {
    fields: [payments.eventRegistrationId],
    references: [eventRegistrations.id]
  })
}));

// =====================================================
// EVENT MANAGEMENT SYSTEM
// =====================================================

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'camp', 'clinic', 'tournament', etc.
  
  // Event scheduling
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  timezone: text("timezone").default('America/New_York'),
  location: text("location").notNull(),
  venue: text("venue"),
  
  // Registration and capacity
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  registrationOpenDate: timestamp("registration_open_date"),
  registrationCloseDate: timestamp("registration_close_date"),
  
  // Pricing
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  earlyBirdPrice: decimal("early_bird_price", { precision: 10, scale: 2 }),
  earlyBirdDeadline: timestamp("early_bird_deadline"),
  
  // External integrations
  shopifyProductId: text("shopify_product_id"),
  image: text("image"),
  additionalImages: jsonb("additional_images"),
  
  // Event configuration
  requiresWaiver: boolean("requires_waiver").default(true),
  allowsTeamRegistration: boolean("allows_team_registration").default(false),
  gearOptions: jsonb("gear_options"), // Available gear packages
  
  // Status and visibility
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  
  // Soft delete and audit
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const eventRelations = relations(events, ({ many }) => ({
  registrations: many(eventRegistrations),
  payments: many(eventPayments),
  attendance: many(eventAttendance),
  gearDistribution: many(eventGear),
  feedback: many(eventFeedback)
}));

// =====================================================
// EVENT REGISTRATION SYSTEM
// =====================================================

export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull(),
  userId: uuid("user_id"), // Nullable for guest registrations
  
  // Participant information
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  
  // Athletic information
  grade: text("grade"),
  schoolName: text("school_name"),
  clubName: text("club_name"),
  experience: text("experience"),
  weight: text("weight"),
  
  // Parent/Guardian information (for minors)
  parentName: text("parent_name"),
  parentEmail: text("parent_email"),
  parentPhone: text("parent_phone"),
  
  // Registration details
  registrationType: text("registration_type").default('individual'), // individual, team
  teamName: text("team_name"), // For team registrations
  selectedDays: jsonb("selected_days"), // For multi-day events
  gearSelection: jsonb("gear_selection"), // Selected gear packages
  shirtSize: text("shirt_size"),
  
  // Pricing
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  discountCode: text("discount_code"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default('0'),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }).notNull(),
  
  // Waivers and agreements
  waiverAccepted: boolean("waiver_accepted").default(false),
  waiverSignedAt: timestamp("waiver_signed_at"),
  termsAccepted: boolean("terms_accepted").default(false),
  
  // Status tracking
  status: orderStatusEnum("status").default('pending'),
  confirmedAt: timestamp("confirmed_at"),
  
  // Session tracking
  sessionId: text("session_id"), // Browser session for tracking
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceType: deviceTypeEnum("device_type"),
  
  // Soft delete and audit
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const eventRegistrationRelations = relations(eventRegistrations, ({ one, many }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id]
  }),
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id]
  }),
  payments: many(payments),
  attendance: many(eventAttendance),
  gearDistribution: many(eventGear)
}));

// =====================================================
// EVENT PAYMENT TRACKING
// =====================================================

export const eventPayments = pgTable("event_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull(),
  registrationId: uuid("registration_id").notNull(),
  paymentId: uuid("payment_id").notNull(), // Links to main payments table
  
  // Event-specific payment details
  earlyBirdApplied: boolean("early_bird_applied").default(false),
  teamDiscountApplied: boolean("team_discount_applied").default(false),
  gearCost: decimal("gear_cost", { precision: 10, scale: 2 }).default('0'),
  
  // Soft delete and audit
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const eventPaymentRelations = relations(eventPayments, ({ one }) => ({
  event: one(events, {
    fields: [eventPayments.eventId],
    references: [events.id]
  }),
  registration: one(eventRegistrations, {
    fields: [eventPayments.registrationId],
    references: [eventRegistrations.id]
  }),
  payment: one(payments, {
    fields: [eventPayments.paymentId],
    references: [payments.id]
  })
}));

// =====================================================
// EVENT ATTENDANCE TRACKING
// =====================================================

export const eventAttendance = pgTable("event_attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull(),
  registrationId: uuid("registration_id").notNull(),
  
  // Check-in details
  checkedInAt: timestamp("checked_in_at"),
  checkedInBy: uuid("checked_in_by"), // Staff member who checked them in
  checkInMethod: text("check_in_method"), // 'manual', 'qr_code', 'app'
  
  // Session attendance for multi-day events
  dayAttended: text("day_attended"), // 'day1', 'day2', 'day3'
  sessionAttended: text("session_attended"), // 'morning', 'afternoon', 'evening'
  
  // Check-out details
  checkedOutAt: timestamp("checked_out_at"),
  checkedOutBy: uuid("checked_out_by"),
  
  // Notes and special circumstances
  notes: text("notes"),
  lateArrival: boolean("late_arrival").default(false),
  earlyDeparture: boolean("early_departure").default(false),
  
  // Soft delete and audit
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const eventAttendanceRelations = relations(eventAttendance, ({ one }) => ({
  event: one(events, {
    fields: [eventAttendance.eventId],
    references: [events.id]
  }),
  registration: one(eventRegistrations, {
    fields: [eventAttendance.registrationId],
    references: [eventRegistrations.id]
  }),
  checkedInByUser: one(users, {
    fields: [eventAttendance.checkedInBy],
    references: [users.id]
  }),
  checkedOutByUser: one(users, {
    fields: [eventAttendance.checkedOutBy],
    references: [users.id]
  })
}));

// =====================================================
// EVENT GEAR DISTRIBUTION
// =====================================================

export const eventGear = pgTable("event_gear", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull(),
  registrationId: uuid("registration_id").notNull(),
  
  // Gear item details
  itemName: text("item_name").notNull(),
  itemSku: text("item_sku"),
  size: text("size"),
  color: text("color"),
  quantity: integer("quantity").default(1),
  
  // Distribution tracking
  distributedAt: timestamp("distributed_at"),
  distributedBy: uuid("distributed_by"), // Staff member who distributed
  distributionMethod: text("distribution_method"), // 'pickup', 'shipped', 'event_day'
  
  // Shipping information (if applicable)
  trackingNumber: text("tracking_number"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  
  // Return tracking
  returnRequested: boolean("return_requested").default(false),
  returnedAt: timestamp("returned_at"),
  returnReason: text("return_reason"),
  
  // Status and notes
  status: text("status").default('ordered'), // ordered, distributed, shipped, delivered, returned
  notes: text("notes"),
  
  // Soft delete and audit
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const eventGearRelations = relations(eventGear, ({ one }) => ({
  event: one(events, {
    fields: [eventGear.eventId],
    references: [events.id]
  }),
  registration: one(eventRegistrations, {
    fields: [eventGear.registrationId],
    references: [eventRegistrations.id]
  }),
  distributedByUser: one(users, {
    fields: [eventGear.distributedBy],
    references: [users.id]
  })
}));

// =====================================================
// EVENT FEEDBACK SYSTEM
// =====================================================

export const eventFeedback = pgTable("event_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull(),
  registrationId: uuid("registration_id"), // Nullable for anonymous feedback
  userId: uuid("user_id"), // If user is logged in
  
  // Feedback details
  overallRating: integer("overall_rating"), // 1-5 scale
  coachRating: integer("coach_rating"),
  facilityRating: integer("facility_rating"),
  organizationRating: integer("organization_rating"),
  
  // Breakout session feedback
  breakoutSession: text("breakout_session"), // Which session they're rating
  sessionRating: integer("session_rating"),
  sessionFeedback: text("session_feedback"),
  
  // General feedback
  whatWorkedWell: text("what_worked_well"),
  areasForImprovement: text("areas_for_improvement"),
  overallComments: text("overall_comments"),
  wouldRecommend: boolean("would_recommend"),
  likelyToReturn: boolean("likely_to_return"),
  
  // Feedback submission details
  submittedAt: timestamp("submitted_at").defaultNow(),
  isAnonymous: boolean("is_anonymous").default(false),
  
  // Soft delete and audit
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const eventFeedbackRelations = relations(eventFeedback, ({ one }) => ({
  event: one(events, {
    fields: [eventFeedback.eventId],
    references: [events.id]
  }),
  registration: one(eventRegistrations, {
    fields: [eventFeedback.registrationId],
    references: [eventRegistrations.id]
  }),
  user: one(users, {
    fields: [eventFeedback.userId],
    references: [users.id]
  })
}));

// =====================================================
// SITE SESSION TRACKING
// =====================================================

export const siteSessions = pgTable("site_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"), // Nullable for anonymous sessions
  sessionToken: text("session_token").notNull().unique(),
  
  // Session details
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceType: deviceTypeEnum("device_type"),
  browserName: text("browser_name"),
  operatingSystem: text("operating_system"),
  
  // Geographic information
  country: text("country"),
  region: text("region"),
  city: text("city"),
  
  // Referrer and marketing
  referrer: text("referrer"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  
  // Session activity
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  timeSpentSeconds: integer("time_spent_seconds").default(0),
  pageViews: integer("page_views").default(0),
  pagesVisited: jsonb("pages_visited"), // Array of page paths visited
  
  // Engagement metrics
  bouncedSession: boolean("bounced_session").default(false), // Only viewed one page
  convertedSession: boolean("converted_session").default(false), // Made a purchase/registration
  conversionType: text("conversion_type"), // 'purchase', 'registration', 'contact'
  conversionValue: decimal("conversion_value", { precision: 10, scale: 2 }),
  
  // Session status
  isActive: boolean("is_active").default(true),
  
  // Soft delete and audit
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const siteSessionRelations = relations(siteSessions, ({ one }) => ({
  user: one(users, {
    fields: [siteSessions.userId],
    references: [users.id]
  })
}));

// =====================================================
// INSERT SCHEMAS AND TYPES
// =====================================================

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type UserInsert = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Custom order schemas
export const insertCustomOrderSchema = createInsertSchema(customOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type CustomOrderInsert = z.infer<typeof insertCustomOrderSchema>;
export type CustomOrder = typeof customOrders.$inferSelect;

// Retail sale schemas
export const insertRetailSaleSchema = createInsertSchema(retailSales).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type RetailSaleInsert = z.infer<typeof insertRetailSaleSchema>;
export type RetailSale = typeof retailSales.$inferSelect;

// Payment schemas
export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type PaymentInsert = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Event schemas
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type EventInsert = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Event registration schemas
export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type EventRegistrationInsert = z.infer<typeof insertEventRegistrationSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;

// Site session schemas
export const insertSiteSessionSchema = createInsertSchema(siteSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type SiteSessionInsert = z.infer<typeof insertSiteSessionSchema>;
export type SiteSession = typeof siteSessions.$inferSelect;

// Event feedback schemas
export const insertEventFeedbackSchema = createInsertSchema(eventFeedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type EventFeedbackInsert = z.infer<typeof insertEventFeedbackSchema>;
export type EventFeedback = typeof eventFeedback.$inferSelect;

// Event gear schemas
export const insertEventGearSchema = createInsertSchema(eventGear).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type EventGearInsert = z.infer<typeof insertEventGearSchema>;
export type EventGear = typeof eventGear.$inferSelect;

// Event attendance schemas
export const insertEventAttendanceSchema = createInsertSchema(eventAttendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type EventAttendanceInsert = z.infer<typeof insertEventAttendanceSchema>;
export type EventAttendance = typeof eventAttendance.$inferSelect;

// Event payment schemas
export const insertEventPaymentSchema = createInsertSchema(eventPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type EventPaymentInsert = z.infer<typeof insertEventPaymentSchema>;
export type EventPayment = typeof eventPayments.$inferSelect;