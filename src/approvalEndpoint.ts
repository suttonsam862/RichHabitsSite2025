// Registration approval endpoint
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { db, pool } from './db';
import { eq, inArray } from 'drizzle-orm';
import { eventRegistrations, completedEventRegistrations } from '@shared/schema';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil', // Use the appropriate API version
});

export async function approveRegistrations(req: Request, res: Response) {
  try {
    const { registrationIds, verifyPayment = true } = req.body;
    
    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({
        message: 'Please provide valid registration IDs',
        approved: 0,
        failed: 0
      });
    }
    
    // Get all registrations to approve using raw SQL for maximum reliability
    const client = await pool.connect();
    let approvedIds: number[] = [];
    let failedIds: number[] = [];
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      for (const regId of registrationIds) {
        try {
          // Get the registration details
          const registrationResult = await client.query(
            'SELECT * FROM event_registrations WHERE id = $1',
            [regId]
          );
          
          if (registrationResult.rows.length === 0) {
            console.log(`Registration with ID ${regId} not found`);
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
              console.log(`Payment verification for ${regId}: ${paymentVerified ? 'Succeeded' : 'Failed'}`);
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
          
          // Insert into completed registrations
          const insertResult = await client.query(`
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
            ) RETURNING id
          `, [
            registration.id,
            registration.event_id,
            registration.first_name,
            registration.last_name,
            registration.contact_name,
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
      // Rollback the transaction on error
      await client.query('ROLLBACK');
      console.error('Error in approval transaction:', error);
      return res.status(500).json({
        message: 'Error processing registrations',
        approved: 0,
        failed: registrationIds.length
      });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error in approveRegistrations:', error);
    return res.status(500).json({
      message: 'Internal server error',
      approved: 0,
      failed: 0
    });
    return res.status(500).json({
      message: 'Internal server error',
      approved: 0,
      failed: 0
    });
  }
}