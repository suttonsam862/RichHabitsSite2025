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
  eventCoaches, type EventCoach, type InsertEventCoach,
  completedEventRegistrations, type CompletedEventRegistration, type InsertCompletedEventRegistration
} from "@shared/schema";
import { db, pool } from "./db";
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
  getRegistration(id: number): Promise<EventRegistration | undefined>;
  getEventRegistrationByEmail(email: string, eventId: number): Promise<EventRegistration | undefined>;
  updateRegistration(id: number, data: Partial<EventRegistration>): Promise<EventRegistration | undefined>;
  updateEventRegistrationPaymentStatus(paymentIntentId: string, status: string): Promise<boolean>;
  getEventRegistrations(eventId?: number, paymentStatus?: string): Promise<EventRegistration[]>;
  getCompletedEventRegistrations(eventId?: number, paymentVerified?: string): Promise<CompletedEventRegistration[]>;
  createCompletedEventRegistration(registrationId: number, stripePaymentIntentId?: string): Promise<CompletedEventRegistration | undefined>;
  updateCompletedRegistration(id: number, data: Record<string, any>): Promise<CompletedEventRegistration | undefined>;
  
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
  
  async getRegistration(id: number): Promise<EventRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.id, id));
    return registration;
  }
  
  async getEventRegistrationByEmail(email: string, eventId: number): Promise<EventRegistration | undefined> {
    try {
      const client = await pool.connect();
      
      try {
        const query = `
          SELECT * FROM event_registrations 
          WHERE email = $1 AND event_id = $2
        `;
        
        const result = await client.query(query, [email, eventId]);
        
        if (result.rows.length === 0) {
          return undefined;
        }
        
        const row = result.rows[0];
        
        // Map the database row to our TypeScript type
        return {
          id: row.id,
          eventId: row.event_id,
          firstName: row.first_name,
          lastName: row.last_name,
          contactName: row.contact_name,
          email: row.email,
          phone: row.phone,
          tShirtSize: row.t_shirt_size,
          grade: row.grade,
          schoolName: row.school_name,
          clubName: row.club_name,
          medicalReleaseAccepted: row.medical_release_accepted,
          registrationType: row.registration_type,
          shopifyOrderId: row.shopify_order_id,
          stripePaymentIntentId: row.stripe_payment_intent_id,
          paymentStatus: row.payment_status,
          day1: row.day1,
          day2: row.day2,
          day3: row.day3,
          age: row.age,
          experience: row.experience,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error in getEventRegistrationByEmail:', error);
      return undefined;
    }
  }
  
  async updateRegistration(id: number, data: Partial<EventRegistration>): Promise<EventRegistration | undefined> {
    const [updated] = await db
      .update(eventRegistrations)
      .set(data)
      .where(eq(eventRegistrations.id, id))
      .returning();
    return updated;
  }
  
  async updateEventRegistrationPaymentStatus(paymentIntentId: string, status: string): Promise<boolean> {
    try {
      const client = await pool.connect();
      
      try {
        // Find registrations with this payment intent ID
        const findQuery = `
          SELECT id FROM event_registrations 
          WHERE stripe_payment_intent_id = $1
        `;
        
        const result = await client.query(findQuery, [paymentIntentId]);
        
        if (result.rows.length === 0) {
          console.warn(`No registration found with payment intent ID ${paymentIntentId}`);
          return false;
        }
        
        // Update payment status and complete registration if necessary
        for (const row of result.rows) {
          const registrationId = row.id;
          
          // Update the existing registration record
          const updateQuery = `
            UPDATE event_registrations 
            SET payment_status = $1, 
                updated_at = NOW() 
            WHERE id = $2
          `;
          
          await client.query(updateQuery, [status, registrationId]);
          
          // If payment is completed, create a completed registration record
          if (status === 'completed') {
            await this.createCompletedEventRegistration(registrationId, paymentIntentId);
          }
        }
        
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating registration payment status:', error);
      return false;
    }
  }
  
  async getEventRegistrations(eventId?: number, paymentStatus?: string): Promise<EventRegistration[]> {
    // Use direct SQL query for more flexibility with filtering
    try {
      const client = await pool.connect();
      
      try {
        let query = `
          SELECT * FROM event_registrations
          WHERE 1=1
        `;
        
        const params: any[] = [];
        
        // Apply event filter if provided
        if (eventId) {
          params.push(eventId);
          query += ` AND event_id = $${params.length}`;
        }
        
        // Apply payment status filter if provided
        if (paymentStatus) {
          params.push(paymentStatus);
          query += ` AND payment_status = $${params.length}`;
        }
        
        // Add sorting
        query += ` ORDER BY created_at DESC NULLS LAST`;
        
        // Execute the query
        const result = await client.query(query, params);
        
        // Map the results to our TypeScript types
        return result.rows.map(row => ({
          id: row.id,
          eventId: row.event_id,
          firstName: row.first_name,
          lastName: row.last_name,
          contactName: row.contact_name,
          email: row.email,
          phone: row.phone,
          tShirtSize: row.t_shirt_size,
          grade: row.grade,
          schoolName: row.school_name,
          clubName: row.club_name,
          medicalReleaseAccepted: row.medical_release_accepted,
          registrationType: row.registration_type,
          shopifyOrderId: row.shopify_order_id,
          stripePaymentIntentId: row.stripe_payment_intent_id,
          paymentStatus: row.payment_status,
          day1: row.day1,
          day2: row.day2,
          day3: row.day3,
          age: row.age,
          experience: row.experience,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      return [];
    }
  }
  
  async getCompletedEventRegistrations(eventId?: number, paymentVerified?: string): Promise<CompletedEventRegistration[]> {
    // Use direct SQL query for the completed registrations
    try {
      // Use the pool to execute raw SQL queries
      const client = await pool.connect();
      
      try {
        let query = `
          SELECT * FROM completed_event_registrations
        `;
        
        const params: any[] = [];
        let whereClauseAdded = false;
        
        // Add WHERE clause for event_id if provided
        if (eventId) {
          params.push(eventId);
          query += ` WHERE event_id = $${params.length}`;
          whereClauseAdded = true;
        }
        
        // Add filter for payment_verified status if provided
        if (paymentVerified) {
          const clause = whereClauseAdded ? ' AND' : ' WHERE';
          
          if (paymentVerified === 'true') {
            query += `${clause} payment_verified = TRUE`;
          } else if (paymentVerified === 'false') {
            query += `${clause} (payment_verified = FALSE OR payment_verified IS NULL)`;
          }
        }
        
        // Add sorting
        query += ` ORDER BY completed_date DESC NULLS LAST`;
        
        // Execute query with parameters
        const result = await client.query(query, params);
        
        return result.rows as CompletedEventRegistration[];
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching completed registrations:', error);
      return [];
    }
  }
  
  async getCompletedRegistrationsForSync(): Promise<CompletedEventRegistration[]> {
    // Get all completed registrations that need to be synced with Shopify
    try {
      // Use the pool to execute raw SQL queries
      const client = await pool.connect();
      
      try {
        // Get registrations that have a stripe payment intent ID (meaning payment completed)
        // We're not filtering by shopify_order_id being null here so we can force-update if needed
        const query = `
          SELECT * FROM completed_event_registrations
          WHERE stripe_payment_intent_id IS NOT NULL
          ORDER BY id ASC
        `;
        
        const result = await client.query(query);
        return result.rows as CompletedEventRegistration[];
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching completed registrations for sync:', error);
      return [];
    }
  }
  
  /**
   * Creates a completed event registration record by copying data from the original registration
   * @param registrationId The ID of the original registration to mark as completed
   * @param stripePaymentIntentId Optional Stripe payment intent ID
   * @returns The created completed registration record
   */
  async createCompletedEventRegistration(registrationId: number, stripePaymentIntentId?: string): Promise<CompletedEventRegistration | undefined> {
    try {
      // Get the original registration
      const [registration] = await db
        .select()
        .from(eventRegistrations)
        .where(eq(eventRegistrations.id, registrationId));
        
      if (!registration) {
        console.error(`Registration with ID ${registrationId} not found`);
        return undefined;
      }
      
      // CRITICAL: Verify payment status before creating completed record
      let paymentVerified = false;
      const paymentId = stripePaymentIntentId || registration.stripePaymentIntentId;
      
      // If we have a Stripe payment intent, verify it directly with Stripe
      if (paymentId) {
        try {
          // Import the Stripe verification function
          const { verifyPaymentIntent } = require('./stripe');
          
          // Verify the payment intent is valid and successful
          const isPaymentValid = await verifyPaymentIntent(paymentId);
          
          if (!isPaymentValid) {
            console.error(`Payment verification failed for Stripe payment ${paymentId} - aborting completion`);
            return undefined; // Don't create completed registration if payment is invalid
          }
          
          paymentVerified = true;
        } catch (error) {
          console.error(`Error verifying payment ${paymentId}:`, error);
          return undefined; // Don't create completed registration if verification fails
        }
      } else if (registration.shopifyOrderId) {
        // If we have a Shopify order ID, consider it verified (was created directly in Shopify)
        paymentVerified = true;
      } else {
        // No payment verification method found
        console.error(`No payment verification method available for registration ${registrationId}`);
        return undefined;
      }
      
      // Get a client from the pool
      const client = await pool.connect();
      
      try {
        // Use a direct SQL approach with simple parameter binding for maximum compatibility
        const query = `
          INSERT INTO completed_event_registrations (
            original_registration_id, event_id, first_name, last_name, contact_name, 
            email, phone, t_shirt_size, grade, school_name, club_name, 
            medical_release_accepted, registration_type, shopify_order_id, 
            stripe_payment_intent_id, day1, day2, day3, age, experience, registration_date,
            payment_verified
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
            $16, $17, $18, $19, $20, $21, $22
          ) 
          RETURNING *
        `;
        
        const values = [
          registration.id,
          registration.eventId,
          registration.firstName,
          registration.lastName,
          registration.contactName,
          registration.email,
          registration.phone,
          registration.tShirtSize,
          registration.grade,
          registration.schoolName,
          registration.clubName,
          registration.medicalReleaseAccepted,
          registration.registrationType,
          registration.shopifyOrderId,
          paymentId,
          registration.day1,
          registration.day2,
          registration.day3,
          registration.age,
          registration.experience,
          registration.createdAt,
          paymentVerified
        ];
        
        const result = await client.query(query, values);
        
        if (result.rows.length > 0) {
          return result.rows[0] as CompletedEventRegistration;
        }
        
        return undefined;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error creating completed registration:", error);
      return undefined;
    }
  }
  
  async updateCompletedRegistration(id: number, data: Record<string, any>): Promise<CompletedEventRegistration | undefined> {
    try {
      // Get a client from the pool
      const client = await pool.connect();
      
      try {
        // Build the SET part of the query dynamically based on the data object
        const setClause = Object.entries(data)
          .map(([key, _], index) => `${key} = $${index + 2}`)
          .join(', ');
        
        const values = [id, ...Object.values(data)];
        
        // Construct and execute the update query
        const query = `
          UPDATE completed_event_registrations
          SET ${setClause}
          WHERE id = $1
          RETURNING *
        `;
        
        const result = await client.query(query, values);
        
        if (result.rows.length > 0) {
          return result.rows[0] as CompletedEventRegistration;
        }
        
        return undefined;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error updating completed registration:", error);
      return undefined;
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
