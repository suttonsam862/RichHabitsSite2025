import { pgTable, text, serial, integer, boolean, timestamp, jsonb, foreignKey, varchar, index, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for express-session
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true
});

// Products table (for storing local cache of Shopify products)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  shopifyId: text("shopify_id").notNull().unique(),
  title: text("title").notNull(),
  handle: text("handle").notNull().unique(),
  description: text("description"),
  productType: text("product_type"),
  image: text("image"),
  price: text("price"),
  collection: text("collection"),
  color: text("color"),
  data: jsonb("data"), // Store the full Shopify product data
  featured: boolean("featured").default(false),
  availableForSale: boolean("available_for_sale").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertProductSchema = createInsertSchema(products).pick({
  shopifyId: true,
  title: true,
  handle: true,
  description: true,
  productType: true,
  image: true,
  price: true,
  collection: true,
  color: true,
  data: true,
  featured: true,
  availableForSale: true
});

// Collections table (for storing local cache of Shopify collections)
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  shopifyId: text("shopify_id").notNull().unique(),
  title: text("title").notNull(),
  handle: text("handle").notNull().unique(),
  description: text("description"),
  image: text("image"),
  data: jsonb("data"), // Store the full Shopify collection data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertCollectionSchema = createInsertSchema(collections).pick({
  shopifyId: true,
  title: true,
  handle: true,
  description: true,
  image: true,
  data: true
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // Text-based identifier
  title: text("title").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  shopifyProductId: text("shopify_product_id"),
  image: text("image"),
  maxParticipants: integer("max_participants"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  category: true,
  date: true,
  time: true,
  location: true,
  description: true,
  price: true,
  shopifyProductId: true,
  image: true,
  maxParticipants: true
});

// Event registrations table
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  eventSlug: text("event_slug").notNull(), // Text-based event identifier
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  tShirtSize: text("t_shirt_size"),
  grade: text("grade"),
  gender: text("gender"),
  schoolName: text("school_name"),
  clubName: text("club_name"),
  medicalReleaseAccepted: boolean("medical_release_accepted").default(false),
  registrationType: text("registration_type"),
  shopifyOrderId: text("shopify_order_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"), // Added for Stripe integration
  paymentStatus: text("payment_status").default("pending"), // Added for tracking payment status
  day1: boolean("day1").default(false), // For multi-day events to track day selection
  day2: boolean("day2").default(false), // For multi-day events to track day selection
  day3: boolean("day3").default(false), // For multi-day events to track day selection
  numberOfDays: integer("number_of_days"), // For National Champ Camp flexible options
  selectedDates: text("selected_dates").array(), // For National Champ Camp flexible date selection
  age: text("age"), // Adding this to match existing database column
  experience: text("experience"), // Adding this to match existing database column
  shirtSize: text("shirt_size"), // New field for shirt size selection
  parentName: text("parent_name"), // New field for parent/guardian name
  parentPhoneNumber: text("parent_phone_number"), // New field for parent phone
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Event Registration Log - Single source of truth for ALL registration attempts
export const eventRegistrationLog = pgTable("event_registration_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  formSessionId: text("form_session_id").notNull(), // Generated at page load
  stripePaymentIntentId: text("stripe_payment_intent_id"), // Added when checkout created
  
  // Form Data - captured immediately on submission
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  eventSlug: text("event_slug").notNull(),
  eventId: integer("event_id"),
  campDate: text("camp_date"),
  teamName: text("team_name"), // For team registrations
  
  // Additional form fields
  grade: text("grade"),
  schoolName: text("school_name"),
  clubName: text("club_name"),
  tShirtSize: text("t_shirt_size"),
  gender: text("gender"),
  experience: text("experience"),
  registrationType: text("registration_type").notNull().default("individual"), // individual, team
  
  // Days selection
  day1: boolean("day1").default(false),
  day2: boolean("day2").default(false),
  day3: boolean("day3").default(false),
  
  // Gear and pricing
  gearSelection: jsonb("gear_selection"), // Store selected gear items
  basePrice: integer("base_price").notNull(), // Price in cents before discount
  discountCode: text("discount_code"),
  discountAmount: integer("discount_amount").default(0), // Discount in cents
  finalPrice: integer("final_price").notNull(), // Final price in cents
  
  // Payment tracking
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed, cancelled
  paymentMethod: text("payment_method"), // card, etc.
  stripePaymentIntentId: text("stripe_payment_intent_id"), // Stripe payment intent ID
  shopifyOrderId: text("shopify_order_id"), // Shopify order ID after successful order creation
  
  // Session and device tracking
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceType: text("device_type"), // mobile, tablet, desktop
  
  // Recovery and integrity
  recovered: boolean("recovered").default(false), // Used if filled via webhook repair
  dataSource: text("data_source").notNull().default("form_submission"), // form_submission, webhook_recovery, manual
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Validation flags
  medicalReleaseAccepted: boolean("medical_release_accepted").default(true),
  termsAccepted: boolean("terms_accepted").default(true)
});

// Consolidated complete registrations table - ONLY for paid, complete signups
export const completeRegistrations = pgTable("complete_registrations", {
  id: serial("id").primaryKey(),
  // Event Information
  eventId: integer("event_id").notNull(),
  eventName: text("event_name").notNull(),
  eventDate: text("event_date").notNull(),
  eventLocation: text("event_location").notNull(),
  
  // Camper Information
  camperName: text("camper_name").notNull(), // firstName + lastName combined
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  grade: text("grade").notNull(),
  gender: text("gender").notNull(),
  schoolName: text("school_name").notNull(),
  clubName: text("club_name"),
  tShirtSize: text("t_shirt_size").notNull(),
  
  // Parent/Guardian Information
  parentGuardianName: text("parent_guardian_name").notNull(),
  
  // Registration Details
  registrationType: text("registration_type").notNull(), // full, single
  day1: boolean("day1").default(false),
  day2: boolean("day2").default(false),
  day3: boolean("day3").default(false),
  medicalReleaseAccepted: boolean("medical_release_accepted").default(true),
  
  // Payment Information
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  shopifyOrderId: text("shopify_order_id"),
  amountPaid: integer("amount_paid").notNull(), // Amount in cents
  paymentDate: timestamp("payment_date").notNull(),
  paymentStatus: text("payment_status").notNull().default("completed"),
  
  // Administrative
  source: text("source").notNull().default("website"), // website, manual, import
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Recruiting clinic requests table for college coaches
export const recruitingClinicRequests = pgTable("recruiting_clinic_requests", {
  id: serial("id").primaryKey(),
  
  // Coach Information
  fullName: text("full_name").notNull(),
  title: text("title").notNull(), // Head Coach, Assistant Coach, etc.
  collegeName: text("college_name").notNull(),
  email: text("email").notNull(),
  cellPhone: text("cell_phone").notNull(),
  schoolPhone: text("school_phone"),
  schoolWebsite: text("school_website"),
  
  // Program Details
  divisionLevel: text("division_level").notNull(), // D1, D2, D3, NAIA, JUCO, Other
  conference: text("conference").notNull(),
  numberOfAthletes: integer("number_of_athletes"),
  areasOfInterest: text("areas_of_interest").array(), // Lightweight, Middleweight, etc.
  
  // Event Attendance
  eventId: integer("event_id").notNull().default(2), // National Champ Camp
  daysAttending: text("days_attending").array(), // June 5, June 6, June 7
  
  // Additional Information
  notes: text("notes"),
  schoolLogoUrl: text("school_logo_url"),
  
  // Administrative
  status: text("status").notNull().default("pending"), // pending, approved, declined
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Create the base schema first
export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).pick({
  eventId: true,
  firstName: true,
  lastName: true,
  contactName: true,
  email: true,
  phone: true,
  tShirtSize: true,
  grade: true,
  schoolName: true,
  clubName: true,
  medicalReleaseAccepted: true,
  registrationType: true,
  shopifyOrderId: true,
  stripePaymentIntentId: true,
  paymentStatus: true,
  day1: true,
  day2: true,
  day3: true,
  numberOfDays: true,
  selectedDates: true,
  age: true,
  experience: true
});

// Event Registration Log schema - Single source of truth for all attempts
export const insertEventRegistrationLogSchema = createInsertSchema(eventRegistrationLog).pick({
  formSessionId: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  eventSlug: true,
  eventId: true,
  campDate: true,
  teamName: true,
  grade: true,
  schoolName: true,
  clubName: true,
  tShirtSize: true,
  gender: true,
  experience: true,
  registrationType: true,
  day1: true,
  day2: true,
  day3: true,
  gearSelection: true,
  basePrice: true,
  discountCode: true,
  discountAmount: true,
  finalPrice: true,
  paymentStatus: true,
  ipAddress: true,
  userAgent: true,
  deviceType: true,
  medicalReleaseAccepted: true,
  termsAccepted: true
});

// Complete registrations schema - for consolidated paid signups only
export const insertCompleteRegistrationSchema = createInsertSchema(completeRegistrations).pick({
  eventId: true,
  eventName: true,
  eventDate: true,
  eventLocation: true,
  camperName: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  grade: true,
  gender: true,
  schoolName: true,
  clubName: true,
  tShirtSize: true,
  parentGuardianName: true,
  registrationType: true,
  day1: true,
  day2: true,
  day3: true,
  medicalReleaseAccepted: true,
  stripePaymentIntentId: true,
  shopifyOrderId: true,
  amountPaid: true,
  paymentDate: true,
  paymentStatus: true,
  source: true,
  notes: true
});

// Type definitions
export type EventRegistrationLog = typeof eventRegistrationLog.$inferSelect;
export type EventRegistrationLogInsert = z.infer<typeof insertEventRegistrationLogSchema>;

export type CompleteRegistration = typeof completeRegistrations.$inferSelect;
export type CompleteRegistrationInsert = z.infer<typeof insertCompleteRegistrationSchema>;

// Recruiting clinic requests schema and types
export const insertRecruitingClinicRequestSchema = createInsertSchema(recruitingClinicRequests).pick({
  fullName: true,
  title: true,
  collegeName: true,
  email: true,
  cellPhone: true,
  schoolPhone: true,
  schoolWebsite: true,
  divisionLevel: true,
  conference: true,
  numberOfAthletes: true,
  areasOfInterest: true,
  eventId: true,
  daysAttending: true,
  notes: true,
  schoolLogoUrl: true
});

export type RecruitingClinicRequest = typeof recruitingClinicRequests.$inferSelect;
export type RecruitingClinicRequestInsert = z.infer<typeof insertRecruitingClinicRequestSchema>;

// Strict validation schema for recruiting clinic requests
export const strictRecruitingClinicRequestSchema = insertRecruitingClinicRequestSchema.extend({
  fullName: z.string().min(1, "Full name is required"),
  title: z.string().min(1, "Title/Position is required"),
  collegeName: z.string().min(1, "College/University name is required"),
  email: z.string().email("Valid email is required"),
  cellPhone: z.string().min(1, "Cell phone is required"),
  divisionLevel: z.string().min(1, "Division level is required"),
  conference: z.string().min(1, "Conference is required"),
  daysAttending: z.array(z.string()).min(1, "At least one day must be selected"),
  areasOfInterest: z.array(z.string()).optional()
});

// Now extend the original schema with stricter validation
export const strictEventRegistrationSchema = insertEventRegistrationSchema.extend({
  // Make all required fields truly required with string validation
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  contactName: z.string().min(1, "Parent/Guardian name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  tShirtSize: z.string().min(1, "T-shirt size is required"),
  grade: z.string().min(1, "Grade is required"),
  schoolName: z.string().min(1, "School name is required"),
  // Make medicalReleaseAccepted explicitly true
  medicalReleaseAccepted: z.boolean().refine(val => val === true, "Medical release must be accepted"),
  // Ensure registrationType is either "full" or "single"
  registrationType: z.enum(["full", "single"]),
  // Make clubName optional but still validate if provided
  clubName: z.string().optional(),
  // Keep the rest of the fields as is
});

// Custom apparel inquiries table
export const customApparelInquiries = pgTable("custom_apparel_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  organizationName: text("organization_name").notNull(),
  sport: text("sport").notNull(),
  details: text("details").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertCustomApparelInquirySchema = createInsertSchema(customApparelInquiries).pick({
  name: true,
  email: true,
  phone: true,
  organizationName: true,
  sport: true,
  details: true
});

// Contact form submissions table
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("unread"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  email: true,
  phone: true,
  subject: true,
  message: true
});

// Newsletter subscribers table
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).pick({
  email: true
});

// Collaborations table
export const collaborations = pgTable("collaborations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoSrc: text("logo_src"),
  website: text("website").notNull(),
  description: text("description").notNull(),
  isComingSoon: boolean("is_coming_soon").default(false),
  displayOrder: integer("display_order").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertCollaborationSchema = createInsertSchema(collaborations).pick({
  name: true,
  logoSrc: true,
  website: true,
  description: true,
  isComingSoon: true,
  displayOrder: true,
  active: true
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;

export type InsertCustomApparelInquiry = z.infer<typeof insertCustomApparelInquirySchema>;
export type CustomApparelInquiry = typeof customApparelInquiries.$inferSelect;

// Error logging table for payment intent failures and mobile issues
export const errorLogs = pgTable('error_logs', {
  id: serial('id').primaryKey(),
  errorType: text('error_type').notNull(), // 'payment_intent_failure', 'mobile_crash', 'validation_error'
  sessionId: text('session_id').notNull(),
  userId: text('user_id'),
  eventId: integer('event_id'),
  userAgent: text('user_agent'),
  deviceType: text('device_type'), // 'mobile', 'desktop', 'tablet'
  errorMessage: text('error_message').notNull(),
  errorStack: text('error_stack'),
  requestPayload: jsonb('request_payload'), // Full request data for debugging
  registrationData: jsonb('registration_data'), // Form data at time of error
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  resolved: boolean('resolved').default(false),
  notes: text('notes')
});

export const insertErrorLogSchema = createInsertSchema(errorLogs).pick({
  errorType: true,
  sessionId: true,
  userId: true,
  eventId: true,
  userAgent: true,
  deviceType: true,
  errorMessage: true,
  errorStack: true,
  requestPayload: true,
  registrationData: true,
  resolved: true,
  notes: true
});

export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = z.infer<typeof insertErrorLogSchema>;

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Coaches table
export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  image: text("image").notNull(),
  school: text("school"),
  schoolLogo: text("school_logo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertCoachSchema = createInsertSchema(coaches).pick({
  name: true,
  title: true,
  bio: true,
  image: true,
  school: true,
  schoolLogo: true
});

// Event coaches junction table
export const eventCoaches = pgTable("event_coaches", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: 'cascade' }),
  coachId: integer("coach_id").notNull().references(() => coaches.id, { onDelete: 'cascade' }),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertEventCoachSchema = createInsertSchema(eventCoaches).pick({
  eventId: true,
  coachId: true,
  displayOrder: true
});

export type InsertCollaboration = z.infer<typeof insertCollaborationSchema>;
export type Collaboration = typeof collaborations.$inferSelect;

export type InsertCoach = z.infer<typeof insertCoachSchema>;
export type Coach = typeof coaches.$inferSelect;

export type InsertEventCoach = z.infer<typeof insertEventCoachSchema>;
export type EventCoach = typeof eventCoaches.$inferSelect;

// Completed Event registrations table - for storing finalized/paid registrations
export const completedEventRegistrations = pgTable("completed_event_registrations", {
  id: serial("id").primaryKey(),
  originalRegistrationId: integer("original_registration_id").notNull(),
  eventId: integer("event_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  tShirtSize: text("t_shirt_size"),
  grade: text("grade"),
  gender: text("gender"),
  schoolName: text("school_name"),
  clubName: text("club_name"),
  medicalReleaseAccepted: boolean("medical_release_accepted").default(false),
  registrationType: text("registration_type"),
  shopifyOrderId: text("shopify_order_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  day1: boolean("day1").default(false),
  day2: boolean("day2").default(false), 
  day3: boolean("day3").default(false),
  age: text("age"),
  experience: text("experience"),
  registrationDate: timestamp("registration_date").notNull(),
  completedDate: timestamp("completed_date").defaultNow(),
  paymentVerified: boolean("payment_verified").default(false) // Track if payment has been verified
});

export const insertCompletedEventRegistrationSchema = createInsertSchema(completedEventRegistrations).omit({
  id: true,
  completedDate: true
});

export type InsertCompletedEventRegistration = z.infer<typeof insertCompletedEventRegistrationSchema>;
export type CompletedEventRegistration = typeof completedEventRegistrations.$inferSelect;

// Verified customer registrations table - contains only authentic customer data
export const verifiedCustomerRegistrations = pgTable("verified_customer_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  eventName: text("event_name").notNull(),
  camperName: text("camper_name").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  grade: text("grade"),
  gender: text("gender"),
  schoolName: text("school_name"),
  clubName: text("club_name"),
  registrationType: text("registration_type").notNull(),
  amountPaid: integer("amount_paid").notNull(), // in cents
  paymentStatus: text("payment_status").notNull(), // 'completed', 'payment_failed'
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paymentDate: timestamp("payment_date"),
  paymentSource: text("payment_source"), // 'stripe', 'database_verified', 'abandoned_checkout'
  createdAt: timestamp("created_at").defaultNow()
});

export const insertVerifiedCustomerRegistrationSchema = createInsertSchema(verifiedCustomerRegistrations).omit({
  id: true,
  createdAt: true
});

export type VerifiedCustomerRegistration = typeof verifiedCustomerRegistrations.$inferSelect;
export type InsertVerifiedCustomerRegistration = z.infer<typeof insertVerifiedCustomerRegistrationSchema>;

// Completed registrations table - only customers who actually paid
export const completedRegistrations = pgTable("completed_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  eventName: text("event_name").notNull(),
  camperName: text("camper_name").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  grade: text("grade"),
  gender: text("gender"),
  schoolName: text("school_name"),
  clubName: text("club_name"),
  registrationType: text("registration_type").notNull(),
  amountPaid: integer("amount_paid").notNull(), // in cents
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paymentDate: timestamp("payment_date"),
  paymentSource: text("payment_source"), // 'stripe', 'database_verified'
  createdAt: timestamp("created_at").defaultNow()
});

// Customer leads table - customers who filled forms but didn't complete payment
export const customerLeads = pgTable("customer_leads", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  eventName: text("event_name").notNull(),
  camperName: text("camper_name").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  grade: text("grade"),
  gender: text("gender"),
  schoolName: text("school_name"),
  clubName: text("club_name"),
  registrationType: text("registration_type").notNull(),
  leadSource: text("lead_source"), // 'form_only', 'reached_checkout'
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  formCompletedDate: timestamp("form_completed_date"),
  followUpStatus: text("follow_up_status").default('pending'), // 'pending', 'contacted', 'converted', 'declined'
  createdAt: timestamp("created_at").defaultNow()
});

export const insertCompletedRegistrationSchema = createInsertSchema(completedRegistrations).omit({
  id: true,
  createdAt: true
});

export const insertCustomerLeadSchema = createInsertSchema(customerLeads).omit({
  id: true,
  createdAt: true
});

export type CompletedRegistration = typeof completedRegistrations.$inferSelect;
export type InsertCompletedRegistration = z.infer<typeof insertCompletedRegistrationSchema>;

export type CustomerLead = typeof customerLeads.$inferSelect;
export type InsertCustomerLead = z.infer<typeof insertCustomerLeadSchema>;
