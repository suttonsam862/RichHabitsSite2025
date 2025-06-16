import type { Express, Request, Response } from "express";
import express from "express";
import { getDatabaseHealthStatus } from "../db.js";
import { storage } from "../storage.js";
import { handleStripeWebhook } from "../stripe.js";
import { setupEventRoutes } from "./events.js";
import { setupRetailRoutes } from "./retail.js";

/**
 * Main Routes Index - Organized by Business Logic
 * Separates retail (Shopify) and event registration (Stripe + internal DB) logic
 */
export function setupRoutes(app: Express): void {
  // Setup modular route handlers
  setupEventRoutes(app);  // Event registration and Stripe payments
  setupRetailRoutes(app); // Product browsing and Shopify cart checkout

  // Stripe webhook endpoint for automatic Shopify order creation
  app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

  // Health check endpoint
  app.get("/api/health", async (req: Request, res: Response) => {
    try {
      const dbHealth = await getDatabaseHealthStatus();
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: dbHealth
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Users endpoints
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      res.json({
        message: "Rich Habits User Management - UUID-based system ready",
        features: [
          "Role-based user management (customer, coach, designer, staff, sales_agent, admin)",
          "Team/organization hierarchy support", 
          "Comprehensive user profiles with preferences",
          "OAuth and password authentication support"
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Payments endpoints
  app.get("/api/payments/user/:userId", async (req: Request, res: Response) => {
    try {
      const payments = await storage.getPaymentsByUser(req.params.userId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  // Custom orders endpoints
  app.get("/api/custom-orders/:customerId", async (req: Request, res: Response) => {
    try {
      const orders = await storage.getCustomOrdersByCustomer(req.params.customerId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch custom orders" });
    }
  });

  // Stripe webhook endpoint - secure payment verification
  app.post("/api/stripe-webhook", express.raw({ type: 'application/json' }), handleStripeWebhook);
}