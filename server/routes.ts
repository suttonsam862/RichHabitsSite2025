import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import "express-session";
import multer from "multer";
import { pool } from "./db";
import Stripe from "stripe";

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
  app.post("/api/approve-registrations", authenticateAdmin, async (req, res) => {
    try {
      const { registrationIds, verifyPayment = true } = req.body;
      
      if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "No registration IDs provided" 
        });
      }
      
      const client = await pool.connect();
      const messages: string[] = [];
      let approved = 0;
      let failed = 0;
      
      try {
        // Start a transaction
        await client.query('BEGIN');
        
        for (const registrationId of registrationIds) {
          try {
            // Get the original registration
            const registrationResult = await client.query(
              'SELECT * FROM event_registrations WHERE id = $1',
              [registrationId]
            );
            
            if (registrationResult.rows.length === 0) {
              messages.push(`Registration #${registrationId} not found`);
              failed++;
              continue;
            }
            
            const registration = registrationResult.rows[0];
            
            // Check payment if required
            let paymentVerified = false;
            if (registration.stripe_payment_intent_id && verifyPayment) {
              paymentVerified = await verifyPaymentIntent(registration.stripe_payment_intent_id);
              if (!paymentVerified) {
                messages.push(`Payment verification failed for registration #${registrationId}`);
                failed++;
                continue;
              }
            } else if (!registration.stripe_payment_intent_id && verifyPayment) {
              // If we require payment verification and there's no payment ID, skip this registration
              messages.push(`No payment found for registration #${registrationId}`);
              failed++;
              continue;
            } else {
              // If we don't need to verify payment (e.g., for free registrations)
              paymentVerified = true;
            }
            
            // Check if this registration is already in completed_event_registrations
            const existingResult = await client.query(
              'SELECT id FROM completed_event_registrations WHERE original_registration_id = $1',
              [registrationId]
            );
            
            if (existingResult.rows.length > 0) {
              messages.push(`Registration #${registrationId} already approved`);
              approved++; // Count as approved even though we didn't do anything
              continue;
            }
            
            // Insert into completed_event_registrations
            await client.query(`
              INSERT INTO completed_event_registrations (
                event_id, first_name, last_name, contact_name, email, phone, 
                t_shirt_size, grade, school_name, club_name, medical_release_accepted, 
                registration_type, day1, day2, day3, age, experience, stripe_payment_intent_id,
                shopify_order_id, original_registration_id, payment_verified, completed_date
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW()
              )
            `, [
              registration.event_id, registration.first_name, registration.last_name, 
              registration.contact_name, registration.email, registration.phone,
              registration.t_shirt_size, registration.grade, registration.school_name, 
              registration.club_name, registration.medical_release_accepted,
              registration.registration_type, registration.day1, registration.day2, 
              registration.day3, registration.age, registration.experience,
              registration.stripe_payment_intent_id, registration.shopify_order_id,
              registrationId, paymentVerified
            ]);
            
            messages.push(`Registration #${registrationId} approved successfully`);
            approved++;
          } catch (error) {
            console.error(`Error processing registration #${registrationId}:`, error);
            messages.push(`Error processing registration #${registrationId}: ${error}`);
            failed++;
          }
        }
        
        // Commit the transaction
        await client.query('COMMIT');
        
        res.status(failed === 0 ? 200 : 207).json({
          success: failed === 0,
          approved,
          failed,
          messages
        });
      } catch (error) {
        // Rollback on error
        await client.query('ROLLBACK');
        console.error('Transaction failed:', error);
        res.status(500).json({
          success: false,
          approved: 0,
          failed: registrationIds.length,
          messages: [`Transaction failed: ${error}`]
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error approving registrations:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to approve registrations",
        error: (error as Error).message 
      });
    }
  });

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
      
      // Fetch completed registrations from storage
      const completedRegistrations = await storage.getCompletedEventRegistrations(eventId);
      
      // Return the completed registrations
      res.status(200).json(completedRegistrations);
    } catch (error) {
      console.error("Error fetching completed registrations:", error);
      res.status(500).json({ error: "Failed to fetch completed registrations" });
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