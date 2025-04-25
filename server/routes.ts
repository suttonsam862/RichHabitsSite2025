import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertCustomApparelInquirySchema, 
  insertEventRegistrationSchema,
  insertNewsletterSubscriberSchema
} from "@shared/schema";
import { z } from "zod";
import { createEventRegistrationCheckout, EVENT_PRODUCTS, EventRegistrationData, listProducts } from "./shopify";

// Shopify configuration - in a real app, store these in environment variables
const SHOPIFY_ADMIN_API_KEY = process.env.SHOPIFY_ADMIN_API_KEY || "";
const SHOPIFY_ADMIN_API_PASSWORD = process.env.SHOPIFY_ADMIN_API_PASSWORD || "";
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "rich-habits.myshopify.com";
const SHOPIFY_API_VERSION = "2023-07"; // Update to latest version as needed

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for products
  app.get("/api/products", async (req, res) => {
    try {
      const collection = req.query.collection as string | undefined;
      const products = await storage.getProducts(collection);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products", error: (error as Error).message });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const featuredProducts = await storage.getFeaturedProducts();
      res.json(featuredProducts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured products", error: (error as Error).message });
    }
  });

  app.get("/api/products/:handle", async (req, res) => {
    try {
      const { handle } = req.params;
      const product = await storage.getProductByHandle(handle);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product", error: (error as Error).message });
    }
  });

  // API routes for collections
  app.get("/api/collections", async (req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ message: "Error fetching collections", error: (error as Error).message });
    }
  });

  // API routes for events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching events", error: (error as Error).message });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const event = await storage.getEvent(parseInt(id));
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Error fetching event", error: (error as Error).message });
    }
  });

  app.post("/api/events/:id/register", async (req, res) => {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);
      
      // Validate request body
      const validatedData = insertEventRegistrationSchema.parse({
        ...req.body,
        eventId
      });
      
      // Get the event to check if it exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Create event registration in our database
      const registration = await storage.createEventRegistration(validatedData);
      
      // For Birmingham Slam Camp, connect to Shopify
      let checkoutUrl = null;
      if (event.id === 1) { // Birmingham Slam Camp
        try {
          console.log('Creating Shopify checkout for Birmingham Slam Camp...');
          // Format the registration data for Shopify
          const registrationData: EventRegistrationData = {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            contactName: validatedData.contactName,
            email: validatedData.email,
            phone: validatedData.phone || '',
            tShirtSize: validatedData.tShirtSize || '',
            grade: validatedData.grade || '',
            schoolName: validatedData.schoolName || '',
            clubName: validatedData.clubName || '',
            medicalReleaseAccepted: validatedData.medicalReleaseAccepted || false,
            option: validatedData.registrationType === 'full' ? 'full' : 'single'
          };
          console.log('Registration data prepared:', JSON.stringify(registrationData));
          
          // Determine which product variant to use based on registration type
          let variantId = '';
          if (validatedData.registrationType === 'full') {
            variantId = EVENT_PRODUCTS['birmingham-slam-camp']?.fullCamp?.variantId || '';
            console.log('Using full camp variant ID:', variantId);
          } else {
            variantId = EVENT_PRODUCTS['birmingham-slam-camp']?.singleDay?.variantId || '';
            console.log('Using single day variant ID:', variantId);
          }
          
          // If we have a valid variantId, create a checkout in Shopify
          if (variantId) {
            console.log('Creating checkout with variant ID:', variantId);
            
            // Check for applyDiscount in request or body
            const applyDiscount = req.query.applyDiscount === 'true' || 
                                  req.body.applyDiscount === true;
            
            // Log when the discount code is applied
            if (applyDiscount) {
              console.log('Will apply universal discount code to checkout URL');
            }
            
            const checkout = await createEventRegistrationCheckout(
              eventId.toString(),
              variantId,
              registrationData,
              applyDiscount
            );
            
            console.log('Checkout response received:', JSON.stringify(checkout));
            
            if (checkout && checkout.webUrl) {
              checkoutUrl = checkout.webUrl;
              console.log('Checkout URL created:', checkoutUrl);
            } else {
              console.warn('No webUrl in checkout response');
            }
          } else {
            console.warn('No Shopify variant ID configured for this event registration type');
          }
        } catch (shopifyError) {
          console.error('Error creating Shopify checkout:', shopifyError);
          if (shopifyError instanceof Error) {
            console.error('Error message:', shopifyError.message);
            console.error('Error stack:', shopifyError.stack);
          }
          // Continue with registration process even if Shopify checkout fails
        }
      }
      
      res.status(201).json({
        message: "Registration successful",
        registration,
        checkoutUrl
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Error registering for event", error: (error as Error).message });
    }
  });

  // API routes for custom apparel inquiries
  app.post("/api/custom-apparel/inquiry", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertCustomApparelInquirySchema.parse(req.body);
      
      // Create custom apparel inquiry
      const inquiry = await storage.createCustomApparelInquiry(validatedData);
      
      res.status(201).json({
        message: "Inquiry submitted successfully",
        inquiry
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Error submitting inquiry", error: (error as Error).message });
    }
  });

  // API routes for contact form
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      
      // Create contact submission
      const submission = await storage.createContactSubmission(validatedData);
      
      res.status(201).json({
        message: "Contact form submitted successfully",
        submission
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Error submitting contact form", error: (error as Error).message });
    }
  });

  // API route to list products from Shopify
  app.get("/api/shopify/products", async (req, res) => {
    try {
      console.log('Listing products from Shopify...');
      const products = await listProducts();
      
      // Extract variant information for easier reference
      const productsWithVariants = products.map((product: any) => {
        return {
          id: product.id,
          title: product.title,
          variants: product.variants.map((variant: any) => ({
            id: variant.id,
            title: variant.title,
            price: variant.price,
            globalId: `gid://shopify/ProductVariant/${variant.id}`
          }))
        };
      });
      
      res.json({
        products: productsWithVariants
      });
    } catch (error) {
      console.error('Error listing Shopify products:', error);
      res.status(500).json({ 
        message: "Error listing Shopify products", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Test endpoint for Shopify
  app.all("/api/test-shopify-checkout", async (req, res) => {
    try {
      console.log('Testing Shopify checkout...');
      
      // Use data from request body if available, otherwise use default test data
      let registrationData: EventRegistrationData;
      
      if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
        console.log('Using registration data from request body:', req.body);
        registrationData = {
          firstName: req.body.firstName || "Test",
          lastName: req.body.lastName || "User",
          contactName: req.body.contactName || "Test Contact",
          email: req.body.email || "test@example.com",
          phone: req.body.phone || "123-456-7890",
          tShirtSize: req.body.tShirtSize || "AL",
          grade: req.body.grade || "10th",
          schoolName: req.body.schoolName || "Test School",
          clubName: req.body.clubName || "Test Club",
          medicalReleaseAccepted: true,
          option: (req.body.option || req.body.registrationType || "full") as 'full' | 'single'
        };
      } else {
        // Default test data
        registrationData = {
          firstName: "Test",
          lastName: "User",
          contactName: "Test Contact",
          email: "test@example.com",
          phone: "123-456-7890",
          tShirtSize: "AL",
          grade: "10th",
          schoolName: "Test School",
          clubName: "Test Club",
          medicalReleaseAccepted: true,
          option: "full"
        };
      }
      
      // Determine which variant to use based on the option
      let variantId = '';
      if (registrationData.option === 'full') {
        variantId = EVENT_PRODUCTS['birmingham-slam-camp']?.fullCamp?.variantId || '';
        console.log('Using full camp variant ID:', variantId);
      } else {
        variantId = EVENT_PRODUCTS['birmingham-slam-camp']?.singleDay?.variantId || '';
        console.log('Using single day variant ID:', variantId);
      }
      
      if (!variantId) {
        return res.status(400).json({ message: "No valid variant ID found" });
      }
      
      // Check if the discount should be applied
      const applyDiscount = req.query.applyDiscount === 'true' || req.body.applyDiscount === true;
      
      // Log discount application
      if (applyDiscount) {
        console.log('Test checkout: Will apply universal discount code');
      }
      
      const checkout = await createEventRegistrationCheckout(
        "1", // test event ID
        variantId,
        registrationData,
        applyDiscount
      );
      
      res.json({
        message: "Test checkout created",
        checkout: checkout
      });
    } catch (error) {
      console.error('Error testing Shopify checkout:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      res.status(500).json({ 
        message: "Error testing Shopify checkout", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // API routes for newsletter
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      // Validate request body
      const { email } = insertNewsletterSubscriberSchema.parse(req.body);
      
      // Check if email already exists
      const existingSubscriber = await storage.getNewsletterSubscriberByEmail(email);
      if (existingSubscriber) {
        return res.json({
          message: "You are already subscribed to our newsletter",
          subscriber: existingSubscriber
        });
      }
      
      // Create newsletter subscriber
      const subscriber = await storage.createNewsletterSubscriber({ email });
      
      res.status(201).json({
        message: "Subscribed to newsletter successfully",
        subscriber
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email address", errors: error.errors });
      }
      res.status(500).json({ message: "Error subscribing to newsletter", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
