import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertCustomApparelInquirySchema, 
  insertEventRegistrationSchema,
  insertNewsletterSubscriberSchema,
  insertCollaborationSchema
} from "@shared/schema";
import { z } from "zod";
import { createEventRegistrationCheckout, EVENT_PRODUCTS, EventRegistrationData, listProducts } from "./shopify";

// Shopify configuration - in a real app, store these in environment variables
const SHOPIFY_ADMIN_API_KEY = process.env.SHOPIFY_ADMIN_API_KEY || "";
const SHOPIFY_ADMIN_API_PASSWORD = process.env.SHOPIFY_ADMIN_API_PASSWORD || "";
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "rich-habits.myshopify.com";
const SHOPIFY_API_VERSION = "2023-07"; // Update to latest version as needed

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve designs files directly
  app.use('/designs', express.static(path.join(process.cwd(), 'public/designs')));
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
  
  // API route to fetch products from a specific collection by handle
  app.get("/api/collections/:handle/products", async (req, res) => {
    try {
      const { handle } = req.params;
      console.log(`Fetching products for collection with handle "${handle}"`);
      
      // Import getCollectionByHandle from shopify.ts
      const { getCollectionByHandle } = await import('./shopify');
      
      const result = await getCollectionByHandle(handle);
      
      if (!result) {
        return res.status(404).json({ message: `Collection with handle "${handle}" not found` });
      }
      
      // Format the products to match our expected format
      const formattedProducts = result.products.map(product => {
        // Get the first variant as default
        const firstVariant = product.variants && product.variants.length > 0 
          ? product.variants[0] 
          : null;
        
        // Get the first image as default
        const firstImage = product.images && product.images.length > 0 
          ? product.images[0].src 
          : null;
        
        return {
          id: product.id.toString(),
          shopifyId: product.id.toString(),
          title: product.title,
          handle: product.handle,
          description: product.body_html,
          productType: product.product_type,
          image: firstImage,
          price: firstVariant ? `$${parseFloat(firstVariant.price).toFixed(2)}` : "",
          collection: handle,
          availableForSale: firstVariant ? firstVariant.available : false,
          variants: product.variants.map(variant => ({
            id: variant.id.toString(),
            title: variant.title,
            price: `$${parseFloat(variant.price).toFixed(2)}`,
            availableForSale: variant.available
          }))
        };
      });
      
      res.json(formattedProducts);
    } catch (error) {
      console.error('Error fetching collection products:', error);
      res.status(500).json({ 
        message: "Error fetching collection products", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // API routes for events
  app.get("/api/events", async (req, res) => {
    try {
      // Get events from database
      const events = await storage.getEvents();
      
      // Add built-in events that might not be in the database
      
      // Check if Birmingham Slam Camp is already in the list
      const birminghamSlamCampExists = events.some(event => event.id === 1);
      
      if (!birminghamSlamCampExists) {
        // Add Birmingham Slam Camp to the list if it doesn't exist
        const birminghamSlamCampEvent = {
          id: 1,
          title: "Birmingham Slam Camp",
          category: "Wrestling",
          date: "June 19-21, 2025",
          time: "9:00 AM - 4:00 PM",
          location: "Clay-Chalkville Middle School, Birmingham, AL",
          description: "A 3-day intensive wrestling camp featuring elite coaching from Zahid Valencia, Josh Shields, Brandon Courtney, and Michael McGee. This camp provides technical instruction in a high-energy, competitive environment. Limited to 200 wrestlers.",
          price: "$249 full camp or $149 single day",
          shopifyProductId: "birmingham-slam-camp",
          image: "/assets/DSC09374--.JPG",
          maxParticipants: 200,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        events.push(birminghamSlamCampEvent);
      }
      
      // Check if National Champ Camp is already in the list
      const nationalChampCampExists = events.some(event => event.id === 2);
      
      if (!nationalChampCampExists) {
        // Add National Champ Camp to the list if it doesn't exist
        const nationalChampCampEvent = {
          id: 2,
          title: "National Champ Camp",
          category: "Wrestling",
          date: "June 4-7, 2025",
          time: "9:00 AM - 4:00 PM",
          location: "Rancho High School, Las Vegas",
          description: "An intensive 4-day wrestling camp featuring elite coaching from Penn State NCAA champions. This camp combines technical instruction, live wrestling, and competitive training in a high-energy environment. Limited to 200 wrestlers.",
          price: "$349 full camp or $175 per day",
          shopifyProductId: "national-champ-camp",
          image: "/assets/LongSitePhotovegas.png",
          maxParticipants: 200,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        events.push(nationalChampCampEvent);
      }
      
      // Check if Texas Recruiting Clinic is already in the list
      const texasRecruitingClinicExists = events.some(event => event.id === 3);
      
      if (!texasRecruitingClinicExists) {
        // Add Texas Recruiting Clinic to the list if it doesn't exist
        const texasRecruitingClinicEvent = {
          id: 3,
          title: "Texas Recruiting Clinic",
          category: "Wrestling",
          date: "June 12-13, 2025",
          time: "9:00 AM - 4:00 PM",
          location: "Arlington Martin High School, TX",
          description: "A specialized two-day clinic focusing on collegiate wrestling recruitment with coaches from top university programs. This event combines technical training with recruiting seminars and one-on-one feedback sessions.",
          price: "$249",
          shopifyProductId: "texas-recruiting-clinic",
          image: "/assets/RecruitingWebsiteimage4.png",
          maxParticipants: 150,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        events.push(texasRecruitingClinicEvent);
      }
      
      // Check if Cory Land Tour is already in the list
      const coryLandTourExists = events.some(event => event.id === 4);
      
      if (!coryLandTourExists) {
        // Add Cory Land Tour to the list if it doesn't exist
        const coryLandTourEvent = {
          id: 4,
          title: "Cory Land Tour",
          category: "Wrestling",
          date: "July 10-12, 2025",
          time: "9:00 AM - 4:00 PM",
          location: "Multiple Locations Across Alabama",
          description: "A three-day wrestling tour featuring elite instruction from Northern Iowa wrestlers Cory Land, Wyatt Voelker, Trever Andersen, and Garrett Funk. Each day focuses on different techniques and is held at a different location in Alabama.",
          price: "$99 per day or $200 for all three days",
          shopifyProductId: "cory-land-tour",
          image: "/assets/DSC09354.JPG",
          maxParticipants: 75,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        events.push(coryLandTourEvent);
      }
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching events", error: (error as Error).message });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);
      
      // Special case for Birmingham Slam Camp which might not be in the database yet
      if (eventId === 1) {
        // Return mock data for Birmingham Slam Camp
        const birminghamSlamCampEvent = {
          id: 1,
          title: "Birmingham Slam Camp",
          category: "Wrestling",
          date: "June 19-21, 2025",
          time: "9:00 AM - 4:00 PM",
          location: "Clay-Chalkville Middle School, Birmingham, AL",
          description: "A 3-day intensive wrestling camp featuring elite coaching from Zahid Valencia, Josh Shields, Brandon Courtney, and Michael McGee. This camp provides technical instruction in a high-energy, competitive environment. Limited to 200 wrestlers.",
          price: "$249 full camp or $149 single day",
          shopifyProductId: "birmingham-slam-camp",
          image: "/assets/DSC09374--.JPG",
          maxParticipants: 200,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return res.json(birminghamSlamCampEvent);
      }
      
      // Special case for National Champ Camp which might not be in the database yet
      if (eventId === 2) {
        // Return mock data for National Champ Camp
        const nationalChampCampEvent = {
          id: 2,
          title: "National Champ Camp",
          category: "Wrestling",
          date: "June 4-7, 2025",
          time: "9:00 AM - 4:00 PM",
          location: "Rancho High School, Las Vegas",
          description: "An intensive 4-day wrestling camp featuring elite coaching from Penn State NCAA champions. This camp combines technical instruction, live wrestling, and competitive training in a high-energy environment. Limited to 200 wrestlers.",
          price: "$349 full camp or $175 per day",
          shopifyProductId: "national-champ-camp",
          image: "/assets/LongSitePhotovegas.png",
          maxParticipants: 200,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return res.json(nationalChampCampEvent);
      }
      
      // Special case for Texas Recruiting Clinic which might not be in the database yet
      if (eventId === 3) {
        // Return mock data for Texas Recruiting Clinic
        const texasRecruitingClinicEvent = {
          id: 3,
          title: "Texas Recruiting Clinic",
          category: "Wrestling",
          date: "June 12-13, 2025",
          time: "9:00 AM - 4:00 PM",
          location: "Arlington Martin High School, TX",
          description: "A specialized two-day clinic focusing on collegiate wrestling recruitment with coaches from top university programs. This event combines technical training with recruiting seminars and one-on-one feedback sessions.",
          price: "$249",
          shopifyProductId: "texas-recruiting-clinic",
          image: "/assets/RecruitingWebsiteimage4.png",
          maxParticipants: 150,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return res.json(texasRecruitingClinicEvent);
      }
      
      // Special case for Cory Land Tour which might not be in the database yet
      if (eventId === 4) {
        // Return mock data for Cory Land Tour
        const coryLandTourEvent = {
          id: 4,
          title: "Cory Land Tour",
          category: "Wrestling",
          date: "July 10-12, 2025",
          time: "9:00 AM - 4:00 PM",
          location: "Multiple Locations Across Alabama",
          description: "A three-day wrestling tour featuring elite instruction from Northern Iowa wrestlers Cory Land, Wyatt Voelker, Trever Andersen, and Garrett Funk. Each day focuses on different techniques and is held at a different location in Alabama.",
          price: "$99 per day or $200 for all three days",
          shopifyProductId: "cory-land-tour",
          image: "/assets/DSC09354.JPG",
          maxParticipants: 75,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return res.json(coryLandTourEvent);
      }
      
      // Regular case for other events
      const event = await storage.getEvent(eventId);
      
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
      
      // For registered events, connect to Shopify checkout
      let checkoutUrl = null;
      if (event.id === 1 || event.id === 2 || event.id === 3 || event.id === 4) { // All events support Shopify checkout
        try {
          let eventName, eventKey;
          
          // Map event ID to the proper name and key
          switch(event.id) {
            case 1:
              eventName = 'Birmingham Slam Camp';
              eventKey = 'birmingham-slam-camp';
              break;
            case 2:
              eventName = 'National Champ Camp';
              eventKey = 'national-champ-camp';
              break;
            case 3:
              eventName = 'Texas Recruiting Clinic';
              eventKey = 'texas-recruiting-clinic';
              break;
            case 4:
              eventName = 'Cory Land Tour';
              eventKey = 'cory-land-tour';
              break;
            default:
              eventName = 'Unknown Event';
              eventKey = 'birmingham-slam-camp'; // Default fallback
          }
          
          // Type safety for event keys
          const validEventKey = eventKey as keyof typeof EVENT_PRODUCTS;
          
          console.log(`Creating Shopify checkout for ${eventName}...`);
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
          
          // For Cory Land Tour, add day selection data
          if (eventId === 4) {
            registrationData.day1 = validatedData.day1 || false;
            registrationData.day2 = validatedData.day2 || false;
            registrationData.day3 = validatedData.day3 || false;
            
            // Validate that at least one day is selected for single day registration
            if (validatedData.registrationType === 'single' && 
                !registrationData.day1 && !registrationData.day2 && !registrationData.day3) {
              return res.status(400).json({ 
                message: "Please select at least one day for the Cory Land Tour single day registration" 
              });
            }
          }
          console.log('Registration data prepared:', JSON.stringify(registrationData));
          
          // Determine which product variant to use based on registration type
          let variantId = '';
          if (validatedData.registrationType === 'full') {
            variantId = EVENT_PRODUCTS[validEventKey]?.fullCamp?.variantId || '';
            console.log('Using full camp variant ID:', variantId);
          } else {
            variantId = EVENT_PRODUCTS[validEventKey]?.singleDay?.variantId || '';
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
          variants: product.variants.map((variant: {id: string, title: string, price: string}) => ({
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
          option: "full",
          day1: true,
          day2: true,
          day3: true
        };
      }
      
      // Determine which variant to use based on the option
      const testEventKey = 'birmingham-slam-camp' as keyof typeof EVENT_PRODUCTS;
      let variantId = '';
      if (registrationData.option === 'full') {
        variantId = EVENT_PRODUCTS[testEventKey]?.fullCamp?.variantId || '';
        console.log('Using full camp variant ID:', variantId);
      } else {
        variantId = EVENT_PRODUCTS[testEventKey]?.singleDay?.variantId || '';
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
  
  // API routes for collaborations
  app.get("/api/collaborations/all", async (req, res) => {
    try {
      const collaborations = await storage.getCollaborations();
      res.json(collaborations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching all collaborations", error: (error as Error).message });
    }
  });
  
  app.get("/api/collaborations", async (req, res) => {
    try {
      const collaborations = await storage.getActiveCollaborations();
      res.json(collaborations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching collaborations", error: (error as Error).message });
    }
  });
  
  app.get("/api/collaborations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const collaboration = await storage.getCollaboration(parseInt(id));
      
      if (!collaboration) {
        return res.status(404).json({ message: "Collaboration not found" });
      }
      
      res.json(collaboration);
    } catch (error) {
      res.status(500).json({ message: "Error fetching collaboration", error: (error as Error).message });
    }
  });
  
  app.post("/api/collaborations", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertCollaborationSchema.parse(req.body);
      
      // Create collaboration
      const collaboration = await storage.createCollaboration(validatedData);
      
      res.status(201).json({
        message: "Collaboration created successfully",
        collaboration
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating collaboration", error: (error as Error).message });
    }
  });
  
  app.put("/api/collaborations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate request body
      const validatedData = insertCollaborationSchema.partial().parse(req.body);
      
      // Check if collaboration exists
      const existingCollaboration = await storage.getCollaboration(parseInt(id));
      if (!existingCollaboration) {
        return res.status(404).json({ message: "Collaboration not found" });
      }
      
      // Update collaboration
      const updatedCollaboration = await storage.updateCollaboration(parseInt(id), validatedData);
      
      res.json({
        message: "Collaboration updated successfully",
        collaboration: updatedCollaboration
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating collaboration", error: (error as Error).message });
    }
  });
  
  app.delete("/api/collaborations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if collaboration exists
      const existingCollaboration = await storage.getCollaboration(parseInt(id));
      if (!existingCollaboration) {
        return res.status(404).json({ message: "Collaboration not found" });
      }
      
      // Delete collaboration
      const result = await storage.deleteCollaboration(parseInt(id));
      
      res.json({
        message: "Collaboration deleted successfully",
        success: result
      });
    } catch (error) {
      res.status(500).json({ message: "Error deleting collaboration", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
