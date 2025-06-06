import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  collections, type Collection, type InsertCollection,
  events, type Event, type InsertEvent,
  registrations, type Registration, type InsertRegistration,
  eventRegistrationLog, type EventRegistrationLog, type EventRegistrationLogInsert,
  completeRegistrations, type CompleteRegistration, type CompleteRegistrationInsert,
  customApparelInquiries, type CustomApparelInquiry, type InsertCustomApparelInquiry,
  contactSubmissions, type ContactSubmission, type InsertContactSubmission,
  newsletterSubscribers, type NewsletterSubscriber, type InsertNewsletterSubscriber,
  collaborations, type Collaboration, type InsertCollaboration,
  coaches, type Coach, type InsertCoach,
  eventCoaches, type EventCoach, type InsertEventCoach,
  recruitingClinicRequests, type RecruitingClinicRequest, type RecruitingClinicRequestInsert,
  // Keep backward compatibility types
  type EventRegistration, type InsertEventRegistration
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and } from "drizzle-orm";

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
  getEventBySlug(slug: string): Promise<Event | undefined>;
  
  // Unified registration methods
  createRegistration(data: InsertRegistration): Promise<Registration>;
  getRegistration(id: number): Promise<Registration | undefined>;
  getRegistrationByEmail(email: string, eventId: number): Promise<Registration | undefined>;
  getRegistrationsByPaymentIntent(paymentIntentId: string): Promise<Registration[]>;
  updateRegistration(id: number, data: Partial<Registration>): Promise<Registration | undefined>;
  completeRegistration(paymentIntentId: string): Promise<boolean>;
  getRegistrations(eventId?: number, status?: string): Promise<Registration[]>;
  
  // Backward compatibility methods (delegate to unified methods)
  createEventRegistration(data: InsertEventRegistration): Promise<EventRegistration>;
  getEventRegistrationByEmail(email: string, eventId: number): Promise<EventRegistration | undefined>;
  getEventRegistrationsByPaymentIntent(paymentIntentId: string): Promise<EventRegistration[]>;
  updateEventRegistrationPaymentStatus(paymentIntentId: string, status: string): Promise<boolean>;
  getEventRegistrations(eventId?: number, paymentStatus?: string): Promise<EventRegistration[]>;
  
  // Event Registration Log methods - Single source of truth for ALL registration attempts
  createRegistrationLog(data: EventRegistrationLogInsert): Promise<EventRegistrationLog>;
  updateRegistrationLog(id: string, data: Partial<EventRegistrationLogInsert>): Promise<EventRegistrationLog>;
  getRegistrationLogByFormSession(formSessionId: string): Promise<EventRegistrationLog | undefined>;
  getRegistrationLogByPaymentIntent(paymentIntentId: string): Promise<EventRegistrationLog | undefined>;
  updateRegistrationLogPaymentStatus(id: string, status: string, paymentIntentId?: string): Promise<EventRegistrationLog>;
  logEventRegistration(data: {
    email: string;
    eventSlug: string;
    finalAmount: number;
    discountCode: string | null;
    stripeIntentId: string;
    sessionId: string;
    registrationType: string;
    originalAmount: number;
    discountAmount: number;
  }): Promise<EventRegistrationLog>;
  
  // Complete registrations - consolidated paid signups only
  createCompleteRegistration(registration: CompleteRegistrationInsert): Promise<CompleteRegistration>;
  getCompleteRegistrations(): Promise<CompleteRegistration[]>;
  getCompleteRegistrationsByEvent(eventId: number): Promise<CompleteRegistration[]>;
  getCompleteRegistrationByPaymentIntent(paymentIntentId: string): Promise<CompleteRegistration | undefined>;
  
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
  
  // Recruiting clinic request methods
  createRecruitingClinicRequest(data: RecruitingClinicRequestInsert): Promise<RecruitingClinicRequest>;
  getRecruitingClinicRequestByEmail(email: string, eventId: number): Promise<RecruitingClinicRequest | undefined>;
  getRecruitingClinicRequests(eventId?: number): Promise<RecruitingClinicRequest[]>;
}

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
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProducts(collection?: string): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductByHandle(handle: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.handle, handle));
    return product;
  }

  async getCollections(): Promise<Collection[]> {
    return await db.select().from(collections);
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.eventDate));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventBySlug(slug: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.slug, slug));
    return event;
  }

  // Unified registration methods
  async createRegistration(data: InsertRegistration): Promise<Registration> {
    const [registration] = await db
      .insert(registrations)
      .values({
        ...data,
        status: data.status || 'pending',
        paymentVerified: data.paymentVerified || false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return registration;
  }

  async getRegistration(id: number): Promise<Registration | undefined> {
    const [registration] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, id));
    return registration;
  }

  async getRegistrationByEmail(email: string, eventId: number): Promise<Registration | undefined> {
    const [registration] = await db
      .select()
      .from(registrations)
      .where(and(eq(registrations.email, email), eq(registrations.eventId, eventId)));
    return registration;
  }

  async getRegistrationsByPaymentIntent(paymentIntentId: string): Promise<Registration[]> {
    return await db
      .select()
      .from(registrations)
      .where(eq(registrations.stripePaymentIntentId, paymentIntentId));
  }

  async updateRegistration(id: number, data: Partial<Registration>): Promise<Registration | undefined> {
    const [updatedRegistration] = await db
      .update(registrations)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(registrations.id, id))
      .returning();
    return updatedRegistration;
  }

  async completeRegistration(paymentIntentId: string): Promise<boolean> {
    const result = await db
      .update(registrations)
      .set({
        status: 'paid',
        paymentVerified: true,
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(registrations.stripePaymentIntentId, paymentIntentId))
      .returning();
    return result.length > 0;
  }

  async getRegistrations(eventId?: number, status?: string): Promise<Registration[]> {
    let query = db.select().from(registrations);
    
    const conditions = [];
    if (eventId) {
      conditions.push(eq(registrations.eventId, eventId));
    }
    if (status) {
      conditions.push(eq(registrations.status, status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(registrations.createdAt));
  }

  // Backward compatibility methods
  async createEventRegistration(data: InsertEventRegistration): Promise<EventRegistration> {
    return this.createRegistration(data) as Promise<EventRegistration>;
  }

  async getEventRegistrationByEmail(email: string, eventId: number): Promise<EventRegistration | undefined> {
    return this.getRegistrationByEmail(email, eventId) as Promise<EventRegistration | undefined>;
  }

  async getEventRegistrationsByPaymentIntent(paymentIntentId: string): Promise<EventRegistration[]> {
    return this.getRegistrationsByPaymentIntent(paymentIntentId) as Promise<EventRegistration[]>;
  }

  async updateEventRegistrationPaymentStatus(paymentIntentId: string, status: string): Promise<boolean> {
    return this.completeRegistration(paymentIntentId);
  }

  async getEventRegistrations(eventId?: number, paymentStatus?: string): Promise<EventRegistration[]> {
    const statusMap: Record<string, string> = {
      'completed': 'paid',
      'succeeded': 'paid',
      'pending': 'pending'
    };
    
    const mappedStatus = paymentStatus ? statusMap[paymentStatus] || paymentStatus : undefined;
    return this.getRegistrations(eventId, mappedStatus) as Promise<EventRegistration[]>;
  }

  // Complete registrations methods - keeping these for backward compatibility
  async createCompleteRegistration(registration: CompleteRegistrationInsert): Promise<CompleteRegistration> {
    const [created] = await db
      .insert(completeRegistrations)
      .values(registration)
      .returning();
    return created;
  }

  async getCompleteRegistrations(): Promise<CompleteRegistration[]> {
    return await db.select().from(completeRegistrations);
  }

  async getCompleteRegistrationsByEvent(eventId: number): Promise<CompleteRegistration[]> {
    return await db.select().from(completeRegistrations).where(eq(completeRegistrations.eventId, eventId));
  }

  async getCompleteRegistrationByPaymentIntent(paymentIntentId: string): Promise<CompleteRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(completeRegistrations)
      .where(eq(completeRegistrations.stripePaymentIntentId, paymentIntentId));
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

  // Coach methods
  async getCoaches(): Promise<Coach[]> {
    return await db.select().from(coaches);
  }

  async getCoach(id: number): Promise<Coach | undefined> {
    const [coach] = await db.select().from(coaches).where(eq(coaches.id, id));
    return coach;
  }

  async createCoach(data: InsertCoach): Promise<Coach> {
    const [coach] = await db.insert(coaches).values(data).returning();
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
    const result = await db.delete(coaches).where(eq(coaches.id, id)).returning({ id: coaches.id });
    return result.length > 0;
  }

  async getEventCoaches(eventId: number): Promise<Coach[]> {
    const eventCoachRecords = await db
      .select({
        coach: coaches
      })
      .from(eventCoaches)
      .innerJoin(coaches, eq(eventCoaches.coachId, coaches.id))
      .where(eq(eventCoaches.eventId, eventId));
    
    return eventCoachRecords.map(record => record.coach);
  }

  async addCoachToEvent(data: InsertEventCoach): Promise<EventCoach> {
    const [eventCoach] = await db.insert(eventCoaches).values(data).returning();
    return eventCoach;
  }

  async removeCoachFromEvent(eventId: number, coachId: number): Promise<boolean> {
    const result = await db
      .delete(eventCoaches)
      .where(and(eq(eventCoaches.eventId, eventId), eq(eventCoaches.coachId, coachId)))
      .returning({ id: eventCoaches.id });
    return result.length > 0;
  }

  // Event Registration Log methods
  async createRegistrationLog(data: EventRegistrationLogInsert): Promise<EventRegistrationLog> {
    const [log] = await db.insert(eventRegistrationLog).values(data).returning();
    return log;
  }

  async updateRegistrationLog(id: string, data: Partial<EventRegistrationLogInsert>): Promise<EventRegistrationLog> {
    const [updatedLog] = await db
      .update(eventRegistrationLog)
      .set(data)
      .where(eq(eventRegistrationLog.id, id))
      .returning();
    return updatedLog;
  }

  async getRegistrationLogByFormSession(formSessionId: string): Promise<EventRegistrationLog | undefined> {
    const [log] = await db
      .select()
      .from(eventRegistrationLog)
      .where(eq(eventRegistrationLog.formSessionId, formSessionId));
    return log;
  }

  async getRegistrationLogByPaymentIntent(paymentIntentId: string): Promise<EventRegistrationLog | undefined> {
    const [log] = await db
      .select()
      .from(eventRegistrationLog)
      .where(eq(eventRegistrationLog.stripeIntentId, paymentIntentId));
    return log;
  }

  async updateRegistrationLogPaymentStatus(id: string, status: string, paymentIntentId?: string): Promise<EventRegistrationLog> {
    const updateData: any = { paymentStatus: status };
    if (paymentIntentId) {
      updateData.stripeIntentId = paymentIntentId;
    }

    const [updatedLog] = await db
      .update(eventRegistrationLog)
      .set(updateData)
      .where(eq(eventRegistrationLog.id, id))
      .returning();
    return updatedLog;
  }

  async logEventRegistration(data: {
    email: string;
    eventSlug: string;
    finalAmount: number;
    discountCode: string | null;
    stripeIntentId: string;
    sessionId: string;
    registrationType: string;
    originalAmount: number;
    discountAmount: number;
  }): Promise<EventRegistrationLog> {
    const logData: EventRegistrationLogInsert = {
      email: data.email,
      eventSlug: data.eventSlug,
      finalAmount: data.finalAmount,
      discountCode: data.discountCode,
      stripeIntentId: data.stripeIntentId,
      formSessionId: data.sessionId,
      registrationType: data.registrationType,
      originalAmount: data.originalAmount,
      discountAmount: data.discountAmount,
      paymentStatus: 'pending',
      createdAt: new Date(),
    };

    return this.createRegistrationLog(logData);
  }

  async createRecruitingClinicRequest(data: RecruitingClinicRequestInsert): Promise<RecruitingClinicRequest> {
    try {
      const [request] = await db
        .insert(recruitingClinicRequests)
        .values(data)
        .returning();
      
      console.log('Created recruiting clinic request:', request);
      return request;
    } catch (error) {
      console.error('Error creating recruiting clinic request:', error);
      throw error;
    }
  }

  async getRecruitingClinicRequestByEmail(email: string, eventId: number): Promise<RecruitingClinicRequest | undefined> {
    try {
      const [request] = await db
        .select()
        .from(recruitingClinicRequests)
        .where(and(
          eq(recruitingClinicRequests.email, email),
          eq(recruitingClinicRequests.eventId, eventId)
        ));
      
      return request;
    } catch (error) {
      console.error('Error getting recruiting clinic request by email:', error);
      return undefined;
    }
  }

  async getRecruitingClinicRequests(eventId?: number): Promise<RecruitingClinicRequest[]> {
    try {
      let query = db.select().from(recruitingClinicRequests);
      
      if (eventId) {
        query = query.where(eq(recruitingClinicRequests.eventId, eventId));
      }
      
      return await query;
    } catch (error) {
      console.error('Error getting recruiting clinic requests:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();