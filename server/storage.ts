import { 
  users, type User, type UserInsert,
  events, type Event, type EventInsert,
  eventRegistrations, type EventRegistration, type EventRegistrationInsert,
  customOrders, type CustomOrder, type CustomOrderInsert,
  retailSales, type RetailSale, type RetailSaleInsert,
  payments, type Payment, type PaymentInsert,
  siteSessions, type SiteSession, type SiteSessionInsert,
  eventFeedback, type EventFeedback, type EventFeedbackInsert,
  eventGear, type EventGear, type EventGearInsert,
  eventAttendance, type EventAttendance, type EventAttendanceInsert,
  eventPayments, type EventPayment, type EventPaymentInsert,
  cartItems, type CartItem, type CartItemInsert
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and, or, isNull } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UserInsert): Promise<User>;
  updateUser(id: string, data: Partial<UserInsert>): Promise<User | undefined>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  getEventBySlug(slug: string): Promise<Event | undefined>;
  createEvent(event: EventInsert): Promise<Event>;
  updateEvent(id: string, data: Partial<EventInsert>): Promise<Event | undefined>;
  
  // Event registration methods
  createEventRegistration(data: EventRegistrationInsert): Promise<EventRegistration>;
  getEventRegistration(id: string): Promise<EventRegistration | undefined>;
  getEventRegistrationsByEvent(eventId: string): Promise<EventRegistration[]>;
  getEventRegistrationByEmail(email: string, eventId: string): Promise<EventRegistration | undefined>;
  updateEventRegistration(id: string, data: Partial<EventRegistrationInsert>): Promise<EventRegistration | undefined>;
  
  // Payment methods
  createPayment(payment: PaymentInsert): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  updatePayment(id: string, data: Partial<PaymentInsert>): Promise<Payment | undefined>;
  
  // Custom order methods
  createCustomOrder(order: CustomOrderInsert): Promise<CustomOrder>;
  getCustomOrder(id: string): Promise<CustomOrder | undefined>;
  getCustomOrdersByCustomer(customerId: string): Promise<CustomOrder[]>;
  updateCustomOrder(id: string, data: Partial<CustomOrderInsert>): Promise<CustomOrder | undefined>;
  
  // Retail sales methods
  createRetailSale(sale: RetailSaleInsert): Promise<RetailSale>;
  getRetailSale(id: string): Promise<RetailSale | undefined>;
  getRetailSalesByCustomer(customerId: string): Promise<RetailSale[]>;
  
  // Site session methods
  createSiteSession(session: SiteSessionInsert): Promise<SiteSession>;
  getSiteSession(id: string): Promise<SiteSession | undefined>;
  updateSiteSession(id: string, data: Partial<SiteSessionInsert>): Promise<SiteSession | undefined>;
  
  // Event feedback methods
  createEventFeedback(feedback: EventFeedbackInsert): Promise<EventFeedback>;
  getEventFeedbackByEvent(eventId: string): Promise<EventFeedback[]>;
  
  // Event gear methods
  createEventGear(gear: EventGearInsert): Promise<EventGear>;
  getEventGearByRegistration(registrationId: string): Promise<EventGear[]>;
  updateEventGear(id: string, data: Partial<EventGearInsert>): Promise<EventGear | undefined>;
  
  // Event attendance methods
  createEventAttendance(attendance: EventAttendanceInsert): Promise<EventAttendance>;
  getEventAttendanceByEvent(eventId: string): Promise<EventAttendance[]>;
  updateEventAttendance(id: string, data: Partial<EventAttendanceInsert>): Promise<EventAttendance | undefined>;
  
  // Cart methods
  addToCart(cartItem: CartItemInsert): Promise<CartItem>;
  getCartItems(sessionId: string, userId?: string): Promise<CartItem[]>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string, userId?: string): Promise<boolean>;
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: UserInsert): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UserInsert>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.isArchived, false)).orderBy(desc(events.startDate));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventBySlug(slug: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.slug, slug));
    return event;
  }

  async createEvent(insertEvent: EventInsert): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateEvent(id: string, data: Partial<EventInsert>): Promise<Event | undefined> {
    const [updated] = await db
      .update(events)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  async createEventRegistration(data: EventRegistrationInsert): Promise<EventRegistration> {
    const [registration] = await db
      .insert(eventRegistrations)
      .values(data)
      .returning();
    return registration;
  }

  async getEventRegistration(id: string): Promise<EventRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.id, id));
    return registration;
  }

  async getEventRegistrationsByEvent(eventId: string): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.isArchived, false)
      ));
  }

  async getEventRegistrationByEmail(email: string, eventId: string): Promise<EventRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.email, email),
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.isArchived, false)
      ));
    return registration;
  }

  async updateEventRegistration(id: string, data: Partial<EventRegistrationInsert>): Promise<EventRegistration | undefined> {
    const [updated] = await db
      .update(eventRegistrations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(eventRegistrations.id, id))
      .returning();
    return updated;
  }

  async createPayment(insertPayment: PaymentInsert): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(and(
        eq(payments.userId, userId),
        eq(payments.isArchived, false)
      ));
  }

  async updatePayment(id: string, data: Partial<PaymentInsert>): Promise<Payment | undefined> {
    const [updated] = await db
      .update(payments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  async createCustomOrder(insertOrder: CustomOrderInsert): Promise<CustomOrder> {
    const [order] = await db
      .insert(customOrders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async getCustomOrder(id: string): Promise<CustomOrder | undefined> {
    const [order] = await db.select().from(customOrders).where(eq(customOrders.id, id));
    return order;
  }

  async getCustomOrdersByCustomer(customerId: string): Promise<CustomOrder[]> {
    return await db
      .select()
      .from(customOrders)
      .where(and(
        eq(customOrders.customerId, customerId),
        eq(customOrders.isArchived, false)
      ));
  }

  async updateCustomOrder(id: string, data: Partial<CustomOrderInsert>): Promise<CustomOrder | undefined> {
    const [updated] = await db
      .update(customOrders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customOrders.id, id))
      .returning();
    return updated;
  }

  async createRetailSale(insertSale: RetailSaleInsert): Promise<RetailSale> {
    const [sale] = await db
      .insert(retailSales)
      .values(insertSale)
      .returning();
    return sale;
  }

  async getRetailSale(id: string): Promise<RetailSale | undefined> {
    const [sale] = await db.select().from(retailSales).where(eq(retailSales.id, id));
    return sale;
  }

  async getRetailSalesByCustomer(customerId: string): Promise<RetailSale[]> {
    return await db
      .select()
      .from(retailSales)
      .where(and(
        eq(retailSales.customerId, customerId),
        eq(retailSales.isArchived, false)
      ));
  }

  async createSiteSession(insertSession: SiteSessionInsert): Promise<SiteSession> {
    const [session] = await db
      .insert(siteSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getSiteSession(id: string): Promise<SiteSession | undefined> {
    const [session] = await db.select().from(siteSessions).where(eq(siteSessions.id, id));
    return session;
  }

  async updateSiteSession(id: string, data: Partial<SiteSessionInsert>): Promise<SiteSession | undefined> {
    const [updated] = await db
      .update(siteSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(siteSessions.id, id))
      .returning();
    return updated;
  }

  async createEventFeedback(insertFeedback: EventFeedbackInsert): Promise<EventFeedback> {
    const [feedback] = await db
      .insert(eventFeedback)
      .values(insertFeedback)
      .returning();
    return feedback;
  }

  async getEventFeedbackByEvent(eventId: string): Promise<EventFeedback[]> {
    return await db
      .select()
      .from(eventFeedback)
      .where(and(
        eq(eventFeedback.eventId, eventId),
        eq(eventFeedback.isArchived, false)
      ));
  }

  async createEventGear(insertGear: EventGearInsert): Promise<EventGear> {
    const [gear] = await db
      .insert(eventGear)
      .values(insertGear)
      .returning();
    return gear;
  }

  async getEventGearByRegistration(registrationId: string): Promise<EventGear[]> {
    return await db
      .select()
      .from(eventGear)
      .where(and(
        eq(eventGear.registrationId, registrationId),
        eq(eventGear.isArchived, false)
      ));
  }

  async updateEventGear(id: string, data: Partial<EventGearInsert>): Promise<EventGear | undefined> {
    const [updated] = await db
      .update(eventGear)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(eventGear.id, id))
      .returning();
    return updated;
  }

  async createEventAttendance(insertAttendance: EventAttendanceInsert): Promise<EventAttendance> {
    const [attendance] = await db
      .insert(eventAttendance)
      .values(insertAttendance)
      .returning();
    return attendance;
  }

  async getEventAttendanceByEvent(eventId: string): Promise<EventAttendance[]> {
    return await db
      .select()
      .from(eventAttendance)
      .where(and(
        eq(eventAttendance.eventId, eventId),
        eq(eventAttendance.isArchived, false)
      ));
  }

  async updateEventAttendance(id: string, data: Partial<EventAttendanceInsert>): Promise<EventAttendance | undefined> {
    const [updated] = await db
      .update(eventAttendance)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(eventAttendance.id, id))
      .returning();
    return updated;
  }

  // Cart methods
  async addToCart(cartItem: CartItemInsert): Promise<CartItem> {
    // Check if item already exists in cart (simplified query)
    const whereConditions = [
      eq(cartItems.sessionId, cartItem.sessionId),
      eq(cartItems.shopifyProductId, cartItem.shopifyProductId),
      eq(cartItems.shopifyVariantId, cartItem.shopifyVariantId)
    ];

    if (cartItem.userId) {
      whereConditions.push(eq(cartItems.userId, cartItem.userId));
    }

    const existingItem = await db
      .select()
      .from(cartItems)
      .where(and(...whereConditions))
      .limit(1);

    if (existingItem.length > 0) {
      // Update quantity if item exists
      const [updated] = await db
        .update(cartItems)
        .set({ 
          quantity: existingItem[0].quantity + (cartItem.quantity || 1),
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();
      return updated;
    } else {
      // Insert new item
      const [newItem] = await db
        .insert(cartItems)
        .values(cartItem)
        .returning();
      return newItem;
    }
  }

  async getCartItems(sessionId: string, userId?: string): Promise<CartItem[]> {
    const whereConditions = [eq(cartItems.sessionId, sessionId)];
    
    if (userId) {
      whereConditions.push(eq(cartItems.userId, userId));
    }

    return await db
      .select()
      .from(cartItems)
      .where(and(...whereConditions))
      .orderBy(desc(cartItems.createdAt));
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await db.delete(cartItems).where(eq(cartItems.id, id));
      return undefined;
    }

    const [updated] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.id, id));
    return result.rowCount > 0;
  }

  async clearCart(sessionId: string, userId?: string): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(and(
        eq(cartItems.sessionId, sessionId),
        userId ? eq(cartItems.userId, userId) : eq(cartItems.userId, null)
      ));
    return result.rowCount > 0;
  }
}

// Create the storage instance
export const storage = new DatabaseStorage();