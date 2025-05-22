import { Request, Response } from 'express';
import Stripe from 'stripe';
import { pool } from './db';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});

// Handle registration approval requests
export async function approveRegistrations(req: Request, res: Response) {
  // Get the client for database transaction
  const client = await pool.connect();
  
  try {
    const { registrationIds, verifyPayment = true } = req.body;
    
    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({
        message: 'Please provide valid registration IDs',
        approved: 0,
        failed: 0
      });
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    let approvedIds: number[] = [];
    let failedIds: number[] = [];
    
    // Process each registration
    for (const regId of registrationIds) {
      try {
        // Fetch the registration
        const registrationResult = await client.query(
          'SELECT * FROM event_registrations WHERE id = $1',
          [regId]
        );
        
        if (registrationResult.rows.length === 0) {
          console.log(`Registration ${regId} not found`);
          failedIds.push(regId);
          continue;
        }
        
        const registration = registrationResult.rows[0];
        let paymentVerified = false;
        
        // Verify payment with Stripe if needed
        if (verifyPayment && registration.stripe_payment_intent_id) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(
              registration.stripe_payment_intent_id
            );
            paymentVerified = paymentIntent.status === 'succeeded';
          } catch (stripeErr) {
            console.error('Stripe verification error:', stripeErr);
            failedIds.push(regId);
            continue;
          }
        } else if (!verifyPayment) {
          // Skip verification if requested
          paymentVerified = true;
          console.log(`Skipping payment verification for registration ${regId}`);
        }
        
        // Check for existing completed registration
        const existingResult = await client.query(
          'SELECT id FROM completed_event_registrations WHERE original_registration_id = $1',
          [regId]
        );
        
        if (existingResult.rows.length > 0) {
          console.log(`Registration ${regId} already approved, updating payment status`);
          
          // Update payment status if needed
          if (paymentVerified) {
            await client.query(
              'UPDATE completed_event_registrations SET payment_verified = true WHERE original_registration_id = $1',
              [regId]
            );
          }
          
          approvedIds.push(regId);
          continue;
        }
        
        // Insert into completed registrations table
        await client.query(`
          INSERT INTO completed_event_registrations (
            original_registration_id, event_id, first_name, last_name, 
            contact_name, email, phone, t_shirt_size, grade, school_name,
            club_name, medical_release_accepted, registration_type, 
            shopify_order_id, stripe_payment_intent_id, day1, day2, day3,
            age, experience, registration_date, payment_verified
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18,
            $19, $20, $21, $22
          )
        `, [
          registration.id,
          registration.event_id,
          registration.first_name,
          registration.last_name,
          registration.contact_name || registration.first_name + ' ' + registration.last_name,
          registration.email,
          registration.phone || null,
          registration.t_shirt_size || null,
          registration.grade || null,
          registration.school_name || null,
          registration.club_name || null,
          registration.medical_release_accepted || false,
          registration.registration_type || null,
          registration.shopify_order_id || null,
          registration.stripe_payment_intent_id || null,
          registration.day1 || false,
          registration.day2 || false,
          registration.day3 || false,
          registration.age || null,
          registration.experience || null,
          registration.created_at || new Date(),
          paymentVerified
        ]);
        
        approvedIds.push(regId);
        console.log(`Successfully approved registration ${regId}`);
      } catch (err) {
        console.error(`Error processing registration ${regId}:`, err);
        failedIds.push(regId);
      }
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    return res.status(200).json({
      message: 'Registrations processed',
      approved: approvedIds.length,
      failed: failedIds.length,
      approvedIds,
      failedIds
    });
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Error in approveRegistrations:', error);
    
    return res.status(500).json({
      message: 'Internal server error',
      approved: 0,
      failed: 0
    });
  } finally {
    // Release client back to pool
    client.release();
  }
}