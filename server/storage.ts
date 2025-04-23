import { users, type User, type InsertUser } from "@shared/schema";
import type { Product, Collection } from "../client/src/types/shopify";

// Sample data for development
const sampleProducts: Product[] = [
  {
    id: "prod_1",
    title: "Performance Training Tee",
    handle: "performance-training-tee",
    color: "Black",
    price: "$45.00",
    image: "https://images.unsplash.com/photo-1565693413579-8a73ffa6de14?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    availableForSale: true,
    variants: [],
    collection: "performance"
  },
  {
    id: "prod_2",
    title: "Minimal Track Shorts",
    handle: "minimal-track-shorts",
    color: "Slate Gray",
    price: "$38.00",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    availableForSale: true,
    variants: [],
    collection: "essentials"
  },
  {
    id: "prod_3",
    title: "Premium Workout Hoodie",
    handle: "premium-workout-hoodie",
    color: "Deep Navy",
    price: "$75.00",
    image: "https://images.unsplash.com/photo-1618354691249-18772bbac3a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    availableForSale: true,
    variants: [],
    collection: "competition"
  },
  {
    id: "prod_4",
    title: "Tech Compression Leggings",
    handle: "tech-compression-leggings",
    color: "Black",
    price: "$65.00",
    image: "https://images.unsplash.com/photo-1525171254930-643fc658b64e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    availableForSale: true,
    variants: [],
    collection: "performance"
  },
  {
    id: "prod_5",
    title: "Athletic Performance Jacket",
    handle: "athletic-performance-jacket",
    color: "Gray",
    price: "$120.00",
    image: "https://images.unsplash.com/photo-1519931861629-54ee7ee2ec4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    availableForSale: true,
    variants: [],
    collection: "essentials"
  },
  {
    id: "prod_6",
    title: "Training Sweatpants",
    handle: "training-sweatpants",
    color: "Black",
    price: "$65.00",
    image: "https://images.unsplash.com/photo-1552902881-3a2dd2c0eeab?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    availableForSale: true,
    variants: [],
    collection: "essentials"
  }
];

const sampleCollections: Collection[] = [
  {
    id: "collection_1",
    title: "Performance Collection",
    handle: "performance",
    description: "Technical fabrics for intense training",
    image: "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    imageAlt: "Performance Collection"
  },
  {
    id: "collection_2",
    title: "Essentials Line",
    handle: "essentials",
    description: "Minimal design for everyday athletes",
    image: "https://images.unsplash.com/photo-1483721310020-03333e577078?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    imageAlt: "Essentials Line"
  },
  {
    id: "collection_3",
    title: "Competition Series",
    handle: "competition",
    description: "Elite gear for peak performance",
    image: "https://images.unsplash.com/photo-1616257460024-b12a0c4c8333?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    imageAlt: "Competition Series"
  }
];

// modify the interface with any CRUD methods
// you might need

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
  getEvents(): Promise<any[]>;
  getEvent(id: number): Promise<any | undefined>;
  createEventRegistration(data: any): Promise<any>;
  
  // Custom apparel methods
  createCustomApparelInquiry(data: any): Promise<any>;
  
  // Contact methods
  createContactSubmission(data: any): Promise<any>;
  
  // Newsletter methods
  getNewsletterSubscriberByEmail(email: string): Promise<any | undefined>;
  createNewsletterSubscriber(data: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Product[];
  private collections: Collection[];
  private events: any[];
  private eventRegistrations: any[];
  private customApparelInquiries: any[];
  private contactSubmissions: any[];
  private newsletterSubscribers: any[];
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Initialize with sample data
    this.products = [...sampleProducts];
    this.collections = [...sampleCollections];
    this.events = [];
    this.eventRegistrations = [];
    this.customApparelInquiries = [];
    this.contactSubmissions = [];
    this.newsletterSubscribers = [];
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Product methods
  async getProducts(collection?: string): Promise<Product[]> {
    if (collection) {
      return this.products.filter(product => product.collection === collection);
    }
    return this.products;
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    // For simplicity, just return the first 4 products as featured
    return this.products.slice(0, 4);
  }
  
  async getProductByHandle(handle: string): Promise<Product | undefined> {
    return this.products.find(product => product.handle === handle);
  }
  
  // Collection methods
  async getCollections(): Promise<Collection[]> {
    return this.collections;
  }
  
  // Event methods - simplified stubs
  async getEvents(): Promise<any[]> {
    return [];
  }
  
  async getEvent(id: number): Promise<any | undefined> {
    return undefined;
  }
  
  async createEventRegistration(data: any): Promise<any> {
    return { id: Date.now(), ...data };
  }
  
  // Custom apparel methods - simplified stubs
  async createCustomApparelInquiry(data: any): Promise<any> {
    return { id: Date.now(), ...data };
  }
  
  // Contact methods - simplified stubs
  async createContactSubmission(data: any): Promise<any> {
    return { id: Date.now(), ...data };
  }
  
  // Newsletter methods - simplified stubs
  async getNewsletterSubscriberByEmail(email: string): Promise<any | undefined> {
    return this.newsletterSubscribers.find(sub => sub.email === email);
  }
  
  async createNewsletterSubscriber(data: any): Promise<any> {
    const subscriber = { id: Date.now(), ...data };
    this.newsletterSubscribers.push(subscriber);
    return subscriber;
  }
}

export const storage = new MemStorage();
