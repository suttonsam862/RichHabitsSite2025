import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertCustomApparelInquirySchema, 
  insertEventRegistrationSchema,
  insertNewsletterSubscriberSchema,
  insertCollaborationSchema,
  insertCoachSchema,
  insertEventCoachSchema
} from "@shared/schema";
import { z } from "zod";
import { createEventRegistrationCheckout, EVENT_PRODUCTS, EventRegistrationData, listProducts, createShopifyDraftOrder, ShopifyDraftOrderParams } from "./shopify";
import { createPaymentIntent, handleSuccessfulPayment, handleStripeWebhook } from "./stripe";
import { getStripePriceId, getStripeProductId } from "./stripeProducts";
import { validateDiscountCode, updatePaymentIntent } from "./discounts";
import { registerImageOptimizationRoutes } from "./imageOptimizer";

// Shopify configuration - in a real app, store these in environment variables
const SHOPIFY_ADMIN_API_KEY = process.env.SHOPIFY_ADMIN_API_KEY || "";
const SHOPIFY_ADMIN_API_PASSWORD = process.env.SHOPIFY_ADMIN_API_PASSWORD || "";
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "rich-habits.myshopify.com";
const SHOPIFY_API_VERSION = "2023-07"; // Update to latest version as needed

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup image optimization routes
  const assetsDir = path.join(process.cwd(), 'attached_assets');
  registerImageOptimizationRoutes(app, assetsDir);
  
  // Serve static files directly with various optimizations
  const staticOptions = {
    maxAge: 86400000, // 1 day caching for static assets
    etag: true,       // Use ETags for cache validation
    lastModified: true // Use Last-Modified for cache validation
  };
  
  app.use('/designs', express.static(path.join(process.cwd(), 'public/designs'), staticOptions));
  
  // Serve attached assets files with detailed logging and improved file path handling
  app.use('/assets', (req, res, next) => {
    console.log('[media] Asset request:', req.path);
    
    // Remove URL encoding
    const decodedPath = decodeURIComponent(req.path);
    console.log('[media] Decoded path:', decodedPath);
    
    // Build full path
    const fullPath = path.join(process.cwd(), 'attached_assets', decodedPath);
    console.log('[media] Checking file exists:', fullPath);
    
    if (fs.existsSync(fullPath)) {
      console.log('[media] Found asset file:', decodedPath);
      // Serve the file directly with proper content type
      const fileExtension = path.extname(fullPath).toLowerCase();
      let contentType = 'application/octet-stream';
      
      // Set content type based on file extension
      if (fileExtension === '.png') contentType = 'image/png';
      else if (fileExtension === '.jpg' || fileExtension === '.jpeg') contentType = 'image/jpeg';
      else if (fileExtension === '.gif') contentType = 'image/gif';
      else if (fileExtension === '.svg') contentType = 'image/svg+xml';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      fs.createReadStream(fullPath).pipe(res);
    } else {
      console.log('[media] Asset file not found:', decodedPath);
      next();
    }
  }, express.static(path.join(process.cwd(), 'attached_assets'), staticOptions));
  
  // Serve video files with proper headers
  app.get('/videos/:filename', (req, res) => {
    const videoPath = path.join(process.cwd(), 'public/videos', req.params.filename);
    res.sendFile(videoPath, {
      headers: {
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
      }
    });
  });
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
          variants: product.variants.map((variant: any) => ({
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
          date: "July 23-25, 2025",
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
      
      // Define event - get from db or use special case data
      let event;
      
      // Special cases for events that might not be in the database yet
      if (eventId === 2) { // National Champ Camp
        event = {
          id: 2,
          title: "National Champ Camp",
          category: "Wrestling",
          date: "June 4-7, 2025",
          time: "9:00 AM - 4:00 PM",
          location: "Rancho High School, Las Vegas",
          description: "The flagship wrestling camp led by NCAA Champions from Penn State. Features technique sessions, live wrestling, and mental preparation workshops. Special spotlight matches for all participants.",
          price: "$349 full camp, $175 per day",
          shopifyProductId: "national-champ-camp",
          image: "/assets/image_1745552776326.png",
          maxParticipants: 200,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else if (eventId === 3) { // Texas Recruiting Clinic 
        event = {
          id: 3,
          title: "Texas Recruiting Clinic",
          category: "Wrestling",
          date: "June 12-13, 2025",
          time: "9:00 AM - 4:00 PM",
          location: "Arlington Martin High School, Texas",
          description: "An intensive two-day clinic focused on connecting high school wrestlers with college coaches. Features technique sessions, competitive matches, and direct meetings with coaching staff from 5 different college programs.",
          price: "$249",
          shopifyProductId: "texas-recruiting-clinic",
          image: "/assets/DSC09273.JPG",
          maxParticipants: 150,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else if (eventId === 4) { // Cory Land Tour
        event = {
          id: 4,
          title: "Cory Land Tour",
          category: "Wrestling",
          date: "July 23-25, 2025",
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
      } else {
        // Regular case for other events
        event = await storage.getEvent(eventId);
        
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }
      }
      
      console.log(`Processing registration for event ${event.title}`, validatedData);
      
      // Format data for different events; make sure day1, day2, day3 are boolean values
      const registrationData = {
        ...validatedData,
        day1: validatedData.day1 === true,
        day2: validatedData.day2 === true,
        day3: validatedData.day3 === true
      };
      
      console.log('Saving registration with data:', registrationData);
      
      // Create event registration in our database
      const registration = await storage.createEventRegistration(registrationData);
      
      // For registered events, get the Shopify checkout URL
      let checkoutUrl = null;
      let shopifyError = null;
      
      console.log(`Registration successful, creating Shopify checkout for event ${event.title}`);
      
      if (eventId === 1 || eventId === 2 || eventId === 3 || eventId === 4) { // All events support Shopify checkout
        try {
          // Create a simplified mapping of event IDs to their keys
          const eventKeyMap = {
            1: 'birmingham-slam-camp',
            2: 'national-champ-camp',
            3: 'texas-recruiting-clinic',
            4: 'cory-land-tour'
          };
          
          const eventKey = eventKeyMap[eventId as keyof typeof eventKeyMap] || 'birmingham-slam-camp';
          const eventName = event.title;
          
          // Type safety for event keys
          const validEventKey = eventKey as keyof typeof EVENT_PRODUCTS;
          
          console.log(`Creating Shopify checkout for ${eventName}...`);
          
          // Determine which product variant to use based on registration type
          let variantId = '';
          if (validatedData.registrationType === 'full') {
            variantId = EVENT_PRODUCTS[validEventKey]?.fullCamp?.variantId || '';
            console.log('Using full camp variant ID:', variantId);
          } else {
            variantId = EVENT_PRODUCTS[validEventKey]?.singleDay?.variantId || '';
            console.log('Using single day variant ID:', variantId);
          }
          
          if (!variantId) {
            console.error('No Shopify variant ID configured for this event registration type');
            throw new Error('No Shopify variant ID configured for this event registration type');
          }
          
          // For Cory Land Tour, validate day selection for single-day registrations
          if (eventId === 4 && validatedData.registrationType === 'single') {
            const anyDaySelected = validatedData.day1 || validatedData.day2 || validatedData.day3;
            if (!anyDaySelected) {
              return res.status(400).json({ 
                message: "Please select at least one day for the Cory Land Tour single day registration" 
              });
            }
          }
          
          // Format the registration data for Shopify - all fields now required due to schema validation
          const registrationData: EventRegistrationData = {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            contactName: validatedData.contactName,
            email: validatedData.email,
            phone: validatedData.phone,
            tShirtSize: validatedData.tShirtSize,
            grade: validatedData.grade,
            schoolName: validatedData.schoolName,
            clubName: validatedData.clubName || '', // Only clubName remains optional
            medicalReleaseAccepted: validatedData.medicalReleaseAccepted,
            option: validatedData.registrationType === 'full' ? 'full' : 'single'
          };
          
          // For Cory Land Tour, add day selection data
          if (eventId === 4) {
            registrationData.day1 = validatedData.day1 || false;
            registrationData.day2 = validatedData.day2 || false;
            registrationData.day3 = validatedData.day3 || false;
          }
          
          console.log('Registration data prepared:', JSON.stringify(registrationData, null, 2));
          
          // Create checkout in Shopify
          console.log('Creating checkout with variant ID:', variantId);
          
          // Check for discount
          const applyDiscount = req.query.applyDiscount === 'true' || 
                                req.body.applyDiscount === true;
          
          if (applyDiscount) {
            console.log('Will apply universal discount code to checkout URL');
          }
          
          // Create checkout with robust error handling
          try {
            console.log('Creating event registration checkout with validated data...');
            
            const checkout = await createEventRegistrationCheckout(
              eventId.toString(),
              variantId,
              registrationData,
              applyDiscount
            );
            
            if (!checkout) {
              throw new Error('No checkout object returned from Shopify');
            }
            
            console.log('Checkout created successfully with ID:', checkout.id || 'unknown');
            
            if (checkout && checkout.webUrl) {
              checkoutUrl = checkout.webUrl;
              
              // Ensure URL is properly formatted with https://
              if (!checkoutUrl.startsWith('http')) {
                checkoutUrl = 'https://' + checkoutUrl;
              }
              
              console.log('Checkout URL created and formatted:', checkoutUrl);
            } else {
              console.error('No webUrl in checkout response:', checkout);
              throw new Error('No checkout URL returned from Shopify');
            }
          } catch (error) {
            console.error('Error in Shopify checkout creation:', error);
            if (error instanceof Error) {
              console.error('Error details:', {
                message: error.message,
                stack: error.stack?.substring(0, 500)
              });
            }
            shopifyError = error;
            throw error; // Re-throw to be caught by outer try/catch
          }
        } catch (error) {
          console.error('Error creating Shopify checkout:', error);
          if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
          }
          
          // Improved error details for debugging
          if (typeof error === 'object' && error !== null) {
            const errorObj = error as any;
            if (errorObj.response) {
              try {
                // If there's a GraphQL response with errors
                console.error('GraphQL error details:', JSON.stringify(errorObj.response, null, 2));
              } catch (e) {
                console.error('Could not stringify error.response');
              }
            }
          }
          
          shopifyError = error;
          // We'll continue with the database registration but will return the error later
        }
      }

      
      // Even if checkout URL creation failed, we consider the registration successful
      // since we have stored the data in the database
      const responseStatus = checkoutUrl ? 201 : 207; // Use 207 Multi-Status to indicate partial success
      
      // Create a direct classic Shopify cart URL as fallback
      let fallbackUrl = '';
      
      try {
        if (!checkoutUrl) {
          const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || 'rich-habits-2022.myshopify.com';
          const eventId = registrationData.eventId.toString();
          const optionKey = (registrationData as any).option === 'full' || 
                           registrationData.registrationType === 'full' 
                           ? 'fullCamp' : 'singleDay';
          
          // Get the appropriate variant ID for this event and option
          let variantId = '';
          let shopifyKey = '';
          
          switch (eventId) {
            case '1':
              shopifyKey = 'birmingham-slam-camp';
              break;
            case '2':
              shopifyKey = 'national-champ-camp';
              break;
            case '3':
              shopifyKey = 'texas-recruiting-clinic';
              break;
            case '4':
              shopifyKey = 'cory-land-tour';
              break;
          }
          
          if (shopifyKey) {
            // Use type assertion to handle the string indexing
            const eventProducts = EVENT_PRODUCTS as any;
            if (eventProducts[shopifyKey]) {
              const eventProduct = eventProducts[shopifyKey];
              const variantDetails = eventProduct[optionKey];
              if (variantDetails) {
                variantId = variantDetails.variantId.replace('gid://shopify/ProductVariant/', '');
                console.log(`Using fallback variant ID ${variantId} for ${shopifyKey} (${optionKey})`);
                
                // Build classic Shopify cart URL with attributes
                fallbackUrl = `https://${shopifyDomain}/cart/${variantId}:1`;
                
                // Add key registration details as attributes
                fallbackUrl += `?attributes[Registration_ID]=${registration.id}`;
                
                // Get the actual event name based on event ID
                let eventName = '';
                switch (registrationData.eventId.toString()) {
                  case '1':
                    eventName = 'Birmingham Slam Camp';
                    break;
                  case '2':
                    eventName = 'National Champ Camp';
                    break;
                  case '3':
                    eventName = 'Texas Recruiting Clinic';
                    break;
                  case '4':
                    eventName = 'Cory Land Tour';
                    break;
                  default:
                    eventName = 'Wrestling Event';
                }
                
                fallbackUrl += `&attributes[Event_Name]=${encodeURIComponent(eventName)}`;
                fallbackUrl += `&attributes[Event_ID]=${registrationData.eventId}`;
                fallbackUrl += `&attributes[Camper_Name]=${encodeURIComponent(registrationData.firstName + ' ' + registrationData.lastName)}`;
                
                console.log('Created fallback URL:', fallbackUrl);
              }
            }
          }
        }
      } catch (fallbackError) {
        console.error('Error creating fallback URL:', fallbackError);
      }
      
      // Create response object with the proper properties
      const responseObj: any = {
        message: checkoutUrl 
          ? "Registration successful" 
          : "Registration saved but checkout creation failed",
        registration,
        checkoutUrl, // This property is used by the client
      };
      
      // Add fallback URL if available
      if (fallbackUrl) {
        responseObj.fallbackUrl = fallbackUrl;
      }
      
      // Always include the variant ID for direct checkout
      try {
        const eventKeyMap = {
          1: 'birmingham-slam-camp',
          2: 'national-champ-camp',
          3: 'texas-recruiting-clinic',
          4: 'cory-land-tour'
        };
        
        const eventKey = eventKeyMap[registrationData.eventId as keyof typeof eventKeyMap] || 'birmingham-slam-camp';
        // Type safety for event keys
        const validEventKey = eventKey as keyof typeof EVENT_PRODUCTS;
        // Get the registration type, checking multiple possible fields
        let registrationType = 'full';
        if (typeof registrationData.registrationType === 'string') {
          registrationType = registrationData.registrationType;
        } else if (typeof (registrationData as any).option === 'string') {
          registrationType = (registrationData as any).option;
        }
        
        const optionKey = registrationType === 'full' ? 'fullCamp' : 'singleDay';
        
        // Get the variant ID from our mapping
        const productVariantId = EVENT_PRODUCTS[validEventKey]?.[optionKey as keyof (typeof EVENT_PRODUCTS)[typeof validEventKey]]?.variantId || '';
        
        if (productVariantId) {
          responseObj.variantId = productVariantId;
          console.log('Including variant ID in response:', productVariantId);
        }
      } catch (error) {
        console.error('Error getting variant ID for response:', error);
      }
      
      // Log the response being sent back to client
      console.log('Sending registration response:', {
        status: responseStatus,
        checkoutUrl: checkoutUrl ? checkoutUrl.substring(0, 100) + '...' : null,
        hasCheckoutUrl: !!checkoutUrl
      });
      
      // If there was a Shopify error, include it in the response
      if (shopifyError && !checkoutUrl) {
        responseObj.shopifyError = shopifyError instanceof Error 
          ? shopifyError.message 
          : 'Unknown error creating checkout';
        
        console.warn('Returning registration without checkout URL due to error:', responseObj.shopifyError);
      }
      
      res.status(responseStatus).json(responseObj);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error('Error registering for event:', error);
      let errorMessage = error instanceof Error ? error.message : String(error);
      
      // Try to provide a more detailed error message for better debugging
      if (error instanceof Error && error.stack) {
        console.error('Error stack:', error.stack);
      }
      
      res.status(500).json({ 
        message: "Error registering for event", 
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      });
    }
  });

  // API routes for custom apparel inquiries
  app.post("/api/custom-apparel/inquiry", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertCustomApparelInquirySchema.parse(req.body);
      
      // Create custom apparel inquiry
      const inquiry = await storage.createCustomApparelInquiry(validatedData);
      
      // Create a Shopify draft order to notify the admin
      try {
        // Split the name to get first and last name parts
        const nameParts = validatedData.name.split(' ');
        const firstName = nameParts[0] || validatedData.name;
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        await createShopifyDraftOrder({
          lineItems: [
            {
              title: `Custom Apparel Inquiry: ${validatedData.organizationName}`,
              quantity: 1,
              price: 0
            }
          ],
          customer: {
            firstName,
            lastName,
            email: validatedData.email,
            phone: validatedData.phone || ''
          },
          note: `Custom Apparel Inquiry:\n\nOrganization: ${validatedData.organizationName}\n\nSport/Activity: ${validatedData.sport}\n\nDetails: ${validatedData.details}\n\nSubmitted on: ${new Date().toLocaleString()}`
        });
        console.log('Created Shopify draft order for custom apparel inquiry');
      } catch (shopifyError) {
        console.error('Failed to create Shopify draft order for custom apparel inquiry:', shopifyError);
        // We still want to return success to the user even if Shopify notification fails
      }
      
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
      
      // Create a Shopify draft order to notify the admin
      try {
        await createShopifyDraftOrder({
          lineItems: [
            {
              title: `Contact Form: ${validatedData.subject}`,
              quantity: 1,
              price: 0
            }
          ],
          customer: {
            firstName: validatedData.name.split(' ')[0] || validatedData.name,
            lastName: validatedData.name.split(' ').slice(1).join(' ') || '',
            email: validatedData.email,
            phone: validatedData.phone || ''
          },
          note: `Contact Form Submission:\n\nSubject: ${validatedData.subject}\n\nMessage: ${validatedData.message}\n\nSubmitted on: ${new Date().toLocaleString()}`
        });
        console.log('Created Shopify draft order for contact form submission');
      } catch (shopifyError) {
        console.error('Failed to create Shopify draft order for contact form:', shopifyError);
        // We still want to return success to the user even if Shopify notification fails
      }
      
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

  // API routes for coaches
  app.get("/api/coaches", async (req, res) => {
    try {
      const coaches = await storage.getCoaches();
      res.json(coaches);
    } catch (error) {
      res.status(500).json({ message: "Error fetching coaches", error: (error as Error).message });
    }
  });

  app.get("/api/coaches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const coach = await storage.getCoach(parseInt(id));
      
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }
      
      res.json(coach);
    } catch (error) {
      res.status(500).json({ message: "Error fetching coach", error: (error as Error).message });
    }
  });

  // API routes for event coaches
  app.get("/api/events/:eventId/coaches", async (req, res) => {
    try {
      const { eventId } = req.params;
      const coaches = await storage.getEventCoaches(parseInt(eventId));
      res.json(coaches);
    } catch (error) {
      res.status(500).json({ message: "Error fetching event coaches", error: (error as Error).message });
    }
  });
  
  // API endpoint to get the correct variant ID for an event (Shopify)
  app.get("/api/events/:eventId/variant", async (req, res) => {
    try {
      const { eventId } = req.params;
      const option = req.query.option as string || 'fullCamp';
      
      // Map event ID to Shopify product key
      let shopifyKey = '';
      
      switch (parseInt(eventId)) {
        case 1:
          shopifyKey = 'birmingham-slam-camp';
          break;
        case 2:
          shopifyKey = 'national-champ-camp';
          break;
        case 3:
          shopifyKey = 'texas-recruiting-clinic';
          break;
        case 4:
          shopifyKey = 'cory-land-tour';
          break;
        default:
          return res.status(404).json({ message: "Event not found" });
      }
      
      // Ensure option is valid
      const validOption = option === 'fullCamp' || option === 'singleDay' ? option : 'fullCamp';
      
      // Get variant details from EVENT_PRODUCTS constant
      const eventProduct = EVENT_PRODUCTS[shopifyKey as keyof typeof EVENT_PRODUCTS];
      if (!eventProduct) {
        return res.status(404).json({ message: "Product not found for event" });
      }
      
      const variantDetails = eventProduct[validOption as keyof typeof eventProduct];
      if (!variantDetails) {
        return res.status(404).json({ message: "Variant not found for option" });
      }
      
      // Return the variant ID and price
      res.json({
        variantId: variantDetails.variantId,
        price: variantDetails.price
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching variant details", error: (error as Error).message });
    }
  });
  
  // API endpoint to get Stripe product details for an event
  app.get("/api/events/:eventId/stripe-product", async (req, res) => {
    try {
      const { eventId } = req.params;
      const option = req.query.option as 'full' | 'single' || 'full';
      
      // Import Stripe product helper functions
      const { getStripePriceId, getStripeProductId } = await import('./stripeProducts');
      
      // Get the price ID for this event and option
      const priceId = getStripePriceId(parseInt(eventId), option);
      if (!priceId) {
        return res.status(404).json({ message: "Stripe price not found for event and option" });
      }
      
      // Get the product ID for this event
      const productId = getStripeProductId(parseInt(eventId));
      if (!productId) {
        return res.status(404).json({ message: "Stripe product not found for event" });
      }
      
      // Get the event details from database
      const event = await storage.getEvent(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Return the Stripe product and price IDs along with event details
      res.json({
        eventId: eventId,
        eventName: event.title,
        option: option,
        priceId: priceId,
        productId: productId
      });
    } catch (error) {
      console.error('Error fetching Stripe product details:', error);
      res.status(500).json({ message: "Error fetching Stripe product details", error: (error as Error).message });
    }
  });

  // Admin API routes for coach management
  app.post("/api/coaches", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertCoachSchema.parse(req.body);
      
      // Create coach
      const coach = await storage.createCoach(validatedData);
      
      res.status(201).json({
        message: "Coach created successfully",
        coach
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating coach", error: (error as Error).message });
    }
  });

  app.put("/api/coaches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Validate request body
      const validatedData = insertCoachSchema.partial().parse(req.body);
      
      // Update coach
      const coach = await storage.updateCoach(parseInt(id), validatedData);
      
      res.json({
        message: "Coach updated successfully",
        coach
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating coach", error: (error as Error).message });
    }
  });

  app.delete("/api/coaches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await storage.deleteCoach(parseInt(id));
      
      if (!result) {
        return res.status(404).json({ message: "Coach not found" });
      }
      
      res.json({ message: "Coach deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting coach", error: (error as Error).message });
    }
  });

  // API routes for managing event-coach relationships
  app.post("/api/events/:eventId/coaches", async (req, res) => {
    try {
      const { eventId } = req.params;
      const { coachId, displayOrder } = req.body;
      
      // Validate request data
      const validatedData = insertEventCoachSchema.parse({
        eventId: parseInt(eventId),
        coachId: parseInt(coachId),
        displayOrder: displayOrder || 0
      });
      
      // Add coach to event
      const relation = await storage.addCoachToEvent(validatedData);
      
      res.status(201).json({
        message: "Coach added to event successfully",
        relation
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Error adding coach to event", error: (error as Error).message });
    }
  });

  app.delete("/api/events/:eventId/coaches/:coachId", async (req, res) => {
    try {
      const { eventId, coachId } = req.params;
      const result = await storage.removeCoachFromEvent(parseInt(eventId), parseInt(coachId));
      
      if (!result) {
        return res.status(404).json({ message: "Coach-event relationship not found" });
      }
      
      res.json({ message: "Coach removed from event successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error removing coach from event", error: (error as Error).message });
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
  
  // API route to test event registration checkout directly
  app.post("/api/events/:id/test-register", async (req, res) => {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);
      
      console.log(`Test registration for event ID ${eventId}`, req.body);
      
      // Use a simplified event registration form
      const registrationData: EventRegistrationData = {
        firstName: req.body.firstName || "Test",
        lastName: req.body.lastName || "User",
        contactName: req.body.contactName || "Parent Name",
        email: req.body.email || "test@example.com",
        phone: req.body.phone || "123-456-7890",
        tShirtSize: req.body.tShirtSize || "AL",
        grade: req.body.grade || "10th",
        schoolName: req.body.schoolName || "Test School",
        clubName: req.body.clubName || "Test Club",
        medicalReleaseAccepted: true,
        option: (req.body.registrationType === 'full' ? 'full' : 'single') as 'full' | 'single',
        day1: req.body.day1 || false,
        day2: req.body.day2 || false,
        day3: req.body.day3 || false
      };
      
      // Create a simplified mapping of event IDs to their keys
      const eventKeyMap = {
        1: 'birmingham-slam-camp',
        2: 'national-champ-camp',
        3: 'texas-recruiting-clinic',
        4: 'cory-land-tour'
      };
      
      const eventKey = eventKeyMap[eventId as keyof typeof eventKeyMap] || 'birmingham-slam-camp';
      
      // Type safety for event keys
      const validEventKey = eventKey as keyof typeof EVENT_PRODUCTS;
      
      // Determine which product variant to use based on registration type
      let variantId = '';
      if (req.body.registrationType === 'full') {
        variantId = EVENT_PRODUCTS[validEventKey]?.fullCamp?.variantId || '';
      } else {
        variantId = EVENT_PRODUCTS[validEventKey]?.singleDay?.variantId || '';
      }
      
      if (!variantId) {
        return res.status(400).json({ message: "No valid variant ID found for this registration type" });
      }
      
      // Create checkout in Shopify
      console.log('Test API: Creating checkout with variant ID:', variantId);
      
      const checkout = await createEventRegistrationCheckout(
        eventId.toString(),
        variantId,
        registrationData,
        false // don't apply discount for test
      );
      
      res.json({
        message: "Test registration checkout created",
        checkoutUrl: checkout.webUrl,
        registrationData
      });
    } catch (error) {
      console.error('Error in test registration:', error);
      res.status(500).json({ 
        message: "Error creating test registration checkout", 
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
      
      // Create a Shopify draft order to notify the admin
      try {
        await createShopifyDraftOrder({
          lineItems: [
            {
              title: `Newsletter Subscription`,
              quantity: 1,
              price: 0
            }
          ],
          customer: {
            firstName: 'Newsletter',
            lastName: 'Subscriber',
            email: email
          },
          note: `New Newsletter Subscription\n\nEmail: ${email}\n\nSubmitted on: ${new Date().toLocaleString()}`
        });
        console.log('Created Shopify draft order for newsletter subscription');
      } catch (shopifyError) {
        console.error('Failed to create Shopify draft order for newsletter subscription:', shopifyError);
        // We still want to return success to the user even if Shopify notification fails
      }
      
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

  // Stripe payment routes
  app.post('/api/events/:eventId/create-payment-intent', createPaymentIntent);
  app.post('/api/events/:eventId/update-payment-intent', updatePaymentIntent);
  app.post('/api/events/:eventId/stripe-payment-success', handleSuccessfulPayment);
  app.post('/api/stripe/webhook', handleStripeWebhook);
  
  // Get Stripe product details for an event
  app.get('/api/events/:eventId/stripe-product', async (req, res) => {
    try {
      const { eventId } = req.params;
      const { option = 'full' } = req.query;
      
      // Validate parameters
      if (!eventId || isNaN(parseInt(eventId))) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Get relevant Stripe product and price IDs
      const productId = getStripeProductId(parseInt(eventId));
      const priceId = getStripePriceId(parseInt(eventId), option as 'full' | 'single');
      
      if (!productId || !priceId) {
        console.warn(`No Stripe product or price ID found for event ${eventId} with option ${option}`);
      }
      
      // Fetch the event details
      const event = await storage.getEvent(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Return the Stripe product and price IDs along with event details
      res.json({
        eventId: eventId,
        eventName: event.title,
        option: option,
        priceId: priceId,
        productId: productId
      });
    } catch (error) {
      console.error('Error fetching Stripe product details:', error);
      res.status(500).json({ message: "Error fetching Stripe product details", error: (error as Error).message });
    }
  });
  
  // Discount code routes
  app.post('/api/discount/validate', validateDiscountCode);

  const httpServer = createServer(app);

  return httpServer;
}
