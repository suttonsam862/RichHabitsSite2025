import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  data: jsonb("data"), // Store the full Shopify product data
  featured: boolean("featured").default(false),
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
  data: true,
  featured: true
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
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  age: text("age"),
  experience: text("experience"),
  shopifyOrderId: text("shopify_order_id"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).pick({
  eventId: true,
  name: true,
  email: true,
  phone: true,
  age: true,
  experience: true,
  shopifyOrderId: true
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

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
