import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  collections, type Collection, type InsertCollection,
  events, type Event, type InsertEvent,
  eventRegistrations, type EventRegistration, type InsertEventRegistration,
  customApparelInquiries, type CustomApparelInquiry, type InsertCustomApparelInquiry,
  contactSubmissions, type ContactSubmission, type InsertContactSubmission,
  newsletterSubscribers, type NewsletterSubscriber, type InsertNewsletterSubscriber,
  collaborations, type Collaboration, type InsertCollaboration,
  coaches, type Coach, type InsertCoach,
  eventCoaches, type EventCoach, type InsertEventCoach
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
  getEventRegistrations(eventId?: number): Promise<EventRegistration[]>;
  
  // Coach methods
  getCoaches(): Promise<Coach[]>;
  getCoach(id: number): Promise<Coach | undefined>;
  createCoach(data: InsertCoach): Promise<Coach>;
  updateCoach(id: number, data: Partial<InsertCoach>): Promise<Coach>;
  deleteCoach(id: number): Promise<boolean>;
  
  // Event Coach methods
  getEventCoaches(eventId: number): Promise<Coach[]>;
  addCoachToEvent(data: InsertEventCoach): Promise<EventCoach>;
  removeCoachFromEvent(eventId: number, coachId: number): Promise<boolean>;
  
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
  
  async getEventRegistrations(eventId?: number): Promise<EventRegistration[]> {
    // If eventId is provided, filter by that event, otherwise get all registrations
    if (eventId) {
      return await db
        .select()
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, eventId))
        .orderBy(desc(eventRegistrations.createdAt));
    } else {
      return await db
        .select()
        .from(eventRegistrations)
        .orderBy(desc(eventRegistrations.createdAt));
    }
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

  // Coach methods
  async getCoaches(): Promise<Coach[]> {
    return await db.select().from(coaches);
  }

  async getCoach(id: number): Promise<Coach | undefined> {
    const [coach] = await db.select().from(coaches).where(eq(coaches.id, id));
    return coach;
  }

  async createCoach(data: InsertCoach): Promise<Coach> {
    const [coach] = await db
      .insert(coaches)
      .values(data)
      .returning();
    return coach;
  }

  async updateCoach(id: number, data: Partial<InsertCoach>): Promise<Coach> {
    const [updatedCoach] = await db
      .update(coaches)
      .set(data)
      .where(eq(coaches.id, id))
      .returning();
    return updatedCoach;
  }

  async deleteCoach(id: number): Promise<boolean> {
    const result = await db
      .delete(coaches)
      .where(eq(coaches.id, id))
      .returning({ id: coaches.id });
    return result.length > 0;
  }

  // Event Coach methods
  async getEventCoaches(eventId: number): Promise<Coach[]> {
    // Get all coaches for a specific event with a join query
    const relations = await db
      .select({ coach: coaches })
      .from(eventCoaches)
      .where(eq(eventCoaches.eventId, eventId))
      .innerJoin(coaches, eq(eventCoaches.coachId, coaches.id))
      .orderBy(eventCoaches.displayOrder);
    
    // Extract the coach objects from the relations
    return relations.map(r => r.coach);
  }

  async addCoachToEvent(data: InsertEventCoach): Promise<EventCoach> {
    const [relation] = await db
      .insert(eventCoaches)
      .values(data)
      .returning();
    return relation;
  }

  async removeCoachFromEvent(eventId: number, coachId: number): Promise<boolean> {
    const result = await db
      .delete(eventCoaches)
      .where(eq(eventCoaches.eventId, eventId) && eq(eventCoaches.coachId, coachId))
      .returning({ id: eventCoaches.id });
    return result.length > 0;
  }
}

// Initialize database storage
export const storage = new DatabaseStorage();
