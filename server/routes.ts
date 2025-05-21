import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import "express-session";
import multer from "multer";
import { pool } from "./db";
import Stripe from "stripe";
import { approveRegistrations } from "./registrationApproval";
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

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});

// Configure multer for file uploads (store in memory)
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

// Extend SessionData to include our custom properties
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}

// Admin authentication middleware
const authenticateAdmin = (req: Request, res: Response, next: any) => {
  // Check if already authenticated in session
  if (req.session && req.session.isAdmin === true) {
    return next();
  }
  
  // For direct access to protected routes, allow admin credentials in body
  if (req.body && req.body.username === "admin" && req.body.password === "richhabits2025") {
    req.session = req.session || {};
    req.session.isAdmin = true;
    return next();
  }
  
  // Not authenticated
  console.log("Authentication failed, unauthorized access attempt");
  res.status(401).json({ error: "Unauthorized" });
};

// Verify if a payment intent is successful
async function verifyPaymentIntent(paymentIntentId: string): Promise<boolean> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Error verifying payment intent:', error);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
  
  // API information endpoint (not at root to avoid interfering with the SPA)
  app.get("/api/info", (req, res) => {
    res.status(200).json({ 
      name: "Rich Habits API",
      status: "online",
      version: "1.0.0"
    });
  });
  
  // API endpoint to approve registrations and move them to completed
  app.post("/api/approve-registrations", authenticateAdmin, approveRegistrations);
  
  // API endpoint to fetch registrations with various filters
  app.get("/api/registrations", authenticateAdmin, async (req, res) => {
    try {
      // Get optional event ID filter from query parameters
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string, 10) : undefined;
      const paymentStatus = req.query.paymentStatus as string | undefined;
      
      // Fetch registrations from storage with filters
      const registrations = await storage.getEventRegistrations(eventId, paymentStatus);
      
      // Return the registrations
      res.status(200).json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });
  
  // API endpoint to fetch completed event registrations
  app.get("/api/completed-registrations", authenticateAdmin, async (req, res) => {
    try {
      // Get optional event ID filter from query parameters
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string, 10) : undefined;
      
      // Get optional payment verification filter
      const paymentVerified = req.query.paymentVerified as string | undefined;
      
      // Fetch completed registrations from storage with filters
      const completedRegistrations = await storage.getCompletedEventRegistrations(eventId, paymentVerified);
      
      // Return the completed registrations
      res.status(200).json(completedRegistrations);
    } catch (error) {
      console.error("Error fetching completed registrations:", error);
      res.status(500).json({ error: "Failed to fetch completed registrations" });
    }
  });

  // Get all events for the admin dashboard
  app.get("/api/events", authenticateAdmin, async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });
  
  // Admin login endpoint with simplified approach
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    
    console.log("Login attempt for:", username);
    
    // Direct credential check for maximum reliability
    if (username === "admin" && password === "richhabits2025") {
      req.session = req.session || {};
      req.session.isAdmin = true;
      
      res.status(200).json({
        success: true,
        message: "Authentication successful"
      });
    } else {
      console.log("Login failed: Invalid credentials");
      res.status(401).json({
        success: false,
        message: "Authentication failed"
      });
    }
  });

  // Create Express HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}