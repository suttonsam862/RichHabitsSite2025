import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  collections, type Collection, type InsertCollection,
  events, type Event, type InsertEvent,
  eventRegistrations, type EventRegistration, type InsertEventRegistration,
  customApparelInquiries, type CustomApparelInquiry, type InsertCustomApparelInquiry,
  contactSubmissions, type ContactSubmission, type InsertContactSubmission,
  newsletterSubscribers, type NewsletterSubscriber, type InsertNewsletterSubscriber,
  collaborations, type Collaboration, type InsertCollaboration
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(collection?: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductByHandle(handle: string): Promise<Product | undefined>;
  
  // Collection methods
  getCollections(): Promise<Collection[]>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEventRegistration(data: InsertEventRegistration): Promise<EventRegistration>;
  
  // Custom apparel methods
  createCustomApparelInquiry(data: InsertCustomApparelInquiry): Promise<CustomApparelInquiry>;
  
  // Contact methods
  createContactSubmission(data: InsertContactSubmission): Promise<ContactSubmission>;
  
  // Newsletter methods
  getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;
  createNewsletterSubscriber(data: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  
  // Collaboration methods
  getCollaborations(): Promise<Collaboration[]>;
  getActiveCollaborations(): Promise<Collaboration[]>;
  getCollaboration(id: number): Promise<Collaboration | undefined>;
  createCollaboration(data: InsertCollaboration): Promise<Collaboration>;
  updateCollaboration(id: number, data: Partial<InsertCollaboration>): Promise<Collaboration>;
  deleteCollaboration(id: number): Promise<boolean>;
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProducts(collection?: string): Promise<Product[]> {
    if (collection) {
      return await db.select().from(products).where(eq(products.collection, collection));
    }
    return await db.select().from(products);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true)).limit(4);
  }

  async getProductByHandle(handle: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.handle, handle));
    return product;
  }

  async getCollections(): Promise<Collection[]> {
    return await db.select().from(collections);
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.date));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEventRegistration(data: InsertEventRegistration): Promise<EventRegistration> {
    const [registration] = await db
      .insert(eventRegistrations)
      .values(data)
      .returning();
    return registration;
  }

  async createCustomApparelInquiry(data: InsertCustomApparelInquiry): Promise<CustomApparelInquiry> {
    const [inquiry] = await db
      .insert(customApparelInquiries)
      .values(data)
      .returning();
    return inquiry;
  }

  async createContactSubmission(data: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db
      .insert(contactSubmissions)
      .values(data)
      .returning();
    return submission;
  }

  async getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    const [subscriber] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
    return subscriber;
  }

  async createNewsletterSubscriber(data: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [subscriber] = await db
      .insert(newsletterSubscribers)
      .values(data)
      .returning();
    return subscriber;
  }
  
  // Collaboration methods
  async getCollaborations(): Promise<Collaboration[]> {
    return await db.select().from(collaborations).orderBy(collaborations.displayOrder);
  }
  
  async getActiveCollaborations(): Promise<Collaboration[]> {
    return await db.select()
      .from(collaborations)
      .where(eq(collaborations.active, true))
      .orderBy(collaborations.displayOrder);
  }
  
  async getCollaboration(id: number): Promise<Collaboration | undefined> {
    const [collaboration] = await db.select().from(collaborations).where(eq(collaborations.id, id));
    return collaboration;
  }
  
  async createCollaboration(data: InsertCollaboration): Promise<Collaboration> {
    const [collaboration] = await db
      .insert(collaborations)
      .values(data)
      .returning();
    return collaboration;
  }
  
  async updateCollaboration(id: number, data: Partial<InsertCollaboration>): Promise<Collaboration> {
    const [updatedCollaboration] = await db
      .update(collaborations)
      .set(data)
      .where(eq(collaborations.id, id))
      .returning();
    return updatedCollaboration;
  }
  
  async deleteCollaboration(id: number): Promise<boolean> {
    const result = await db
      .delete(collaborations)
      .where(eq(collaborations.id, id))
      .returning({ id: collaborations.id });
    return result.length > 0;
  }
}

// Initialize database storage
export const storage = new DatabaseStorage();
