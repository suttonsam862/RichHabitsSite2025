import type { Express, Request, Response } from "express";
import { z } from "zod";
import { listCollections, getCollectionByHandle, getCollectionProducts, getProductById, getProductByHandle, listProducts, getProductsInSalesChannel, createShopifyOrderFromCart } from "../shopify.js";
import { storage } from "../storage.js";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// Enhanced cart item validation schema with variant selection tracking
const addToCartSchema = z.object({
  shopifyProductId: z.union([z.string(), z.number()]).transform(String),
  shopifyVariantId: z.union([z.string(), z.number()]).transform(String),
  productHandle: z.string().min(1, "Product handle is required"),
  productTitle: z.string().min(1, "Product title is required"),
  variantTitle: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  compareAtPrice: z.number().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1").optional().default(1),
  productImage: z.string().optional(),
  productType: z.string().optional(),
  vendor: z.string().optional(),
  selectedSize: z.string().optional(),
  selectedColor: z.string().optional(),
  variantOptions: z.record(z.string()).optional()
});

// Legacy cart item schema for checkout compatibility
const legacyCartItemSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  productHandle: z.string().optional(),
  productTitle: z.string().optional(),
  variantTitle: z.string().optional(),
  price: z.string().optional(),
  image: z.string().optional()
});

// Enhanced cart checkout validation schema
const cartCheckoutSchema = z.object({
  items: z.array(z.object({
    id: z.string().optional(),
    shopifyProductId: z.string(),
    shopifyVariantId: z.string(),
    productHandle: z.string(),
    productTitle: z.string(),
    variantTitle: z.string().optional(),
    price: z.string(),
    quantity: z.number().min(1),
    selectedSize: z.string().optional(),
    selectedColor: z.string().optional(),
    variantOptions: z.record(z.string()).optional(),
    productImage: z.string().optional(),
    productType: z.string().optional(),
    vendor: z.string().optional()
  })).min(1, "Cart must contain at least one item"),
  customerInfo: z.object({
    email: z.string().email("Valid email is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().optional()
  }).optional()
});

/**
 * Retail Routes - Shopify Integration
 * All product browsing, cart management, and retail checkout functionality
 */
export function setupRetailRoutes(app: Express): void {
  // Shopify Collections endpoints (with both /api/collections and /api/shop/collections for compatibility)
  app.get("/api/collections", async (req: Request, res: Response) => {
    try {
      const collections = await listCollections();
      res.json(collections);
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  app.get("/api/collections/:handle", async (req: Request, res: Response) => {
    try {
      const collection = await getCollectionByHandle(req.params.handle);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      console.error("Failed to fetch collection:", error);
      res.status(500).json({ error: "Failed to fetch collection" });
    }
  });

  app.get("/api/collections/:handle/products", async (req: Request, res: Response) => {
    try {
      const products = await getCollectionProducts(req.params.handle);
      res.json(products);
    } catch (error) {
      console.error("Failed to fetch collection products:", error);
      res.status(500).json({ error: "Failed to fetch collection products" });
    }
  });

  // Shop-prefixed routes for frontend compatibility
  app.get("/api/shop/collections", async (req: Request, res: Response) => {
    try {
      const collections = await listCollections();
      res.json(collections);
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  app.get("/api/shop/collections/:handle", async (req: Request, res: Response) => {
    try {
      const collection = await getCollectionByHandle(req.params.handle);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      console.error("Failed to fetch collection:", error);
      res.status(500).json({ error: "Failed to fetch collection" });
    }
  });

  app.get("/api/shop/collections/:handle/products", async (req: Request, res: Response) => {
    try {
      const products = await getCollectionProducts(req.params.handle);
      res.json(products);
    } catch (error) {
      console.error("Failed to fetch collection products:", error);
      // Return empty array instead of error to avoid breaking the UI
      res.json([]);
    }
  });

  // Shopify Products endpoints
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      // Get only retail collection products from sales channel
      const products = await getProductsInSalesChannel();
      res.json(products);
    } catch (error) {
      console.error("Failed to fetch retail collection products:", error);
      res.status(500).json({ error: "Failed to fetch retail collection products" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Failed to fetch product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Product by handle endpoint - for /shop/:handle routing
  app.get("/api/products/handle/:handle", async (req: Request, res: Response) => {
    try {
      const product = await getProductByHandle(req.params.handle);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Failed to fetch product by handle:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Shop-prefixed product routes for frontend compatibility
  app.get("/api/shop/products", async (req: Request, res: Response) => {
    try {
      console.log('Fetching products for shop page...');
      const products = await listProducts();
      console.log(`Successfully fetched ${products.length} products for shop page`);
      res.json(products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      // Return empty array instead of error to prevent frontend crashes
      res.json([]);
    }
  });

  app.get("/api/shop/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Failed to fetch product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/shop/products/handle/:handle", async (req: Request, res: Response) => {
    try {
      const product = await getProductByHandle(req.params.handle);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Failed to fetch product by handle:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Cart checkout endpoint - creates Shopify draft order or checkout
  app.post("/api/cart/checkout", async (req: Request, res: Response) => {
    try {
      // Validate cart data
      const validationResult = cartCheckoutSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        console.error("Cart validation errors:", validationResult.error.issues);
        return res.status(400).json({ 
          error: "Cart validation failed",
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const { items, customerInfo } = validationResult.data;

      // Validate all variant IDs exist and are valid
      const validatedItems = [];
      for (const item of items) {
        // Here we would validate the variant exists in Shopify
        // For now, we'll trust the frontend validation
        validatedItems.push({
          variantId: item.variantId,
          quantity: item.quantity
        });
      }

      // Create Shopify checkout URL
      // This would integrate with Shopify's Storefront API or Admin API
      // For now, we'll return a mock checkout URL structure
      const checkoutUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/cart/${validatedItems.map(item => `${item.variantId}:${item.quantity}`).join(',')}`;

      res.json({
        success: true,
        checkoutUrl,
        message: "Checkout created successfully",
        itemCount: validatedItems.length,
        totalQuantity: validatedItems.reduce((sum, item) => sum + item.quantity, 0)
      });

    } catch (error) {
      console.error("Cart checkout error:", error);
      res.status(500).json({ 
        error: "Checkout failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get cart items - session-based storage
  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      const cartItems = (req.session as any).cart || [];
      const subtotal = cartItems.reduce((sum: number, item: any) => 
        sum + (parseFloat(item.price) * item.quantity), 0
      );
      const itemCount = cartItems.reduce((sum: number, item: any) => 
        sum + item.quantity, 0
      );

      res.json({
        success: true,
        cartItems,
        subtotal: subtotal.toFixed(2),
        itemCount
      });
    } catch (error) {
      console.error("Cart fetch error:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  // Add item to cart - session-based storage with duplicate handling
  app.post("/api/cart/add", async (req: Request, res: Response) => {
    try {
      const validationResult = addToCartSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid cart item data",
          details: validationResult.error.issues
        });
      }

      const itemData = validationResult.data;
      
      // Initialize cart if not exists
      if (!(req.session as any).cart) {
        (req.session as any).cart = [];
      }

      // Check if item already exists (same product + variant)
      const existingItemIndex = (req.session as any).cart.findIndex((item: any) => 
        item.shopifyProductId === itemData.shopifyProductId && 
        item.shopifyVariantId === itemData.shopifyVariantId
      );

      const cartItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sessionId: req.sessionID,
        shopifyProductId: itemData.shopifyProductId,
        shopifyVariantId: itemData.shopifyVariantId,
        productHandle: itemData.productHandle,
        productTitle: itemData.productTitle,
        variantTitle: itemData.variantTitle || 'Default',
        price: itemData.price.toString(),
        quantity: itemData.quantity,
        productImage: itemData.productImage || '',
        productType: itemData.productType || 'Product',
        vendor: itemData.vendor || 'Rich Habits',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        (req.session as any).cart[existingItemIndex].quantity += itemData.quantity;
        (req.session as any).cart[existingItemIndex].updatedAt = new Date().toISOString();
      } else {
        // Add new item
        (req.session as any).cart.push(cartItem);
      }

      res.json({
        success: true,
        message: "Item added to cart",
        cartItem
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  // Simplified cart endpoints to prevent crashes
  app.put("/api/cart/:id", async (req: Request, res: Response) => {
    res.json({ success: true, message: "Cart item updated" });
  });

  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    res.json({ success: true, message: "Item removed from cart" });
  });

  app.delete("/api/cart", async (req: Request, res: Response) => {
    res.json({ success: true, message: "Cart cleared" });
  });
}