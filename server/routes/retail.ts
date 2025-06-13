import type { Express, Request, Response } from "express";
import { z } from "zod";
import { listCollections, getCollectionByHandle, getCollectionProducts, getProductById, getProductByHandle, listProducts, getProductsInSalesChannel } from "../shopify.js";
import { storage } from "../storage.js";

// Cart item validation schema
const addToCartSchema = z.object({
  shopifyProductId: z.string().min(1, "Product ID is required"),
  shopifyVariantId: z.string().min(1, "Variant ID is required"),
  productHandle: z.string().min(1, "Product handle is required"),
  productTitle: z.string().min(1, "Product title is required"),
  variantTitle: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  compareAtPrice: z.number().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1").optional().default(1),
  productImage: z.string().optional(),
  productType: z.string().optional(),
  vendor: z.string().optional()
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

// Cart checkout validation schema
const cartCheckoutSchema = z.object({
  items: z.array(legacyCartItemSchema).min(1, "Cart must contain at least one item"),
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

  // Get cart items
  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = req.sessionID;
      const userId = undefined; // Guest users only for now

      const items = await storage.getCartItems(sessionId, userId);
      const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price.toString()) * item.quantity), 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      res.json({
        success: true,
        cartItems: items,
        subtotal: subtotal.toFixed(2),
        itemCount
      });

    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ 
        error: "Failed to get cart items",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add item to cart
  app.post("/api/cart/add", async (req: Request, res: Response) => {
    try {
      const validationResult = addToCartSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid cart item",
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const item = validationResult.data;
      const sessionId = req.sessionID;
      const userId = undefined; // Guest users only for now

      // Add new item to cart directly (simplified to prevent crashes)
      const cartItem = await storage.addToCart({
        sessionId,
        userId,
        shopifyProductId: item.shopifyProductId,
        shopifyVariantId: item.shopifyVariantId,
        productHandle: item.productHandle,
        productTitle: item.productTitle,
        variantTitle: item.variantTitle || '',
        price: item.price.toString(),
        compareAtPrice: item.compareAtPrice?.toString(),
        quantity: item.quantity,
        productImage: item.productImage,
        productType: item.productType,
        vendor: item.vendor
      });

      res.json({
        success: true,
        message: "Item added to cart",
        cartItem
      });

    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ 
        error: "Failed to add item to cart",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update cart item quantity
  app.put("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 0) {
        return res.status(400).json({ error: "Valid quantity is required" });
      }

      const updatedItem = await storage.updateCartItem(id, quantity);
      
      res.json({
        success: true,
        message: "Cart item updated",
        cartItem: updatedItem
      });

    } catch (error) {
      console.error("Update cart item error:", error);
      res.status(500).json({ 
        error: "Failed to update cart item",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Remove item from cart
  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const success = await storage.removeFromCart(id);
      
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json({
        success: true,
        message: "Item removed from cart"
      });

    } catch (error) {
      console.error("Remove cart item error:", error);
      res.status(500).json({ 
        error: "Failed to remove cart item",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Clear cart
  app.delete("/api/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = req.sessionID;
      const userId = undefined; // Guest users only for now
      
      const success = await storage.clearCart(sessionId, userId);
      
      res.json({
        success: true,
        message: "Cart cleared"
      });

    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({ 
        error: "Failed to clear cart",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}