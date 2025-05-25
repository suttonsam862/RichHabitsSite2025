import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function correctMatchingSystem() {
  try {
    console.log('Building correct payment matching system...');
    
    // Step 1: Get all 36 successful payment intents from Stripe
    const allPaymentIntents = [];
    let hasMore = true;
    let startingAfter = null;
    
    while (hasMore) {
      const params = {
        limit: 100,
        created: {
          gte: Math.floor(Date.now() / 1000) - (12 * 30 * 24 * 60 * 60)
        }
      };
      
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      const batch = await stripe.paymentIntents.list(params);
      allPaymentIntents.push(...batch.data);
      
      hasMore = batch.has_more;
      if (hasMore && batch.data.length > 0) {
        startingAfter = batch.data[batch.data.length - 1].id;
      }
    }

    const successfulPayments = allPaymentIntents
      .filter(intent => intent.status === 'succeeded')
      .sort((a, b) => a.created - b.created);

    console.log(`Found ${successfulPayments.length} successful payment intents`);

    // Step 2: Get all entries from the original event_registrations table
    const allRegistrations = await sql`
      SELECT 
        id, event_id, first_name, last_name, contact_name, email, phone, 
        school_name, club_name, registration_type, stripe_payment_intent_id, 
        created_at, payment_status, t_shirt_size, grade, age, experience
      FROM event_registrations 
      ORDER BY created_at ASC
    `;

    console.log(`Found ${allRegistrations.length} registration entries`);

    // Step 3: For each payment intent, create a primary row and find closest registration match
    for (const intent of successfulPayments) {
      const paymentDate = new Date(intent.created * 1000);
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      
      console.log(`\nProcessing Payment: ${intent.id} - ${eventName} - $${intent.amount/100}`);
      console.log(`Payment created at: ${paymentDate.toISOString()}`);
      
      // Find the closest registration entry by time difference
      let bestMatch = null;
      let shortestTimeDiff = Infinity;
      
      for (const registration of allRegistrations) {
        const registrationDate = new Date(registration.created_at);
        const timeDiff = Math.abs(paymentDate - registrationDate);
        
        // Calculate minutes and seconds difference
        const minutes = Math.floor(timeDiff / 60000);
        const seconds = Math.floor((timeDiff % 60000) / 1000);
        
        if (timeDiff < shortestTimeDiff) {
          shortestTimeDiff = timeDiff;
          bestMatch = { registration, timeDiff: { minutes, seconds } };
        }
      }
      
      // Insert payment with matched registration data (or nulls if no good match)
      const reg = bestMatch?.registration;
      
      await sql`
        INSERT INTO paid_customers (
          stripe_payment_intent_id, event_name, camper_name, first_name, last_name,
          email, phone, school_name, registration_type, amount_paid, payment_date
        ) VALUES (
          ${intent.id},
          ${eventName},
          ${reg?.contact_name || null},
          ${reg?.first_name || null},
          ${reg?.last_name || null},
          ${reg?.email || null},
          ${reg?.phone || null},
          ${reg?.school_name || null},
          ${reg?.registration_type || null},
          ${intent.amount},
          ${paymentDate.toISOString()}
        )
      `;
      
      if (bestMatch) {
        console.log(`  ✓ Matched with: ${reg.first_name} ${reg.last_name} (${reg.email})`);
        console.log(`    Registration: ${new Date(reg.created_at).toISOString()}`);
        console.log(`    Time difference: ${bestMatch.timeDiff.minutes} minutes, ${bestMatch.timeDiff.seconds} seconds`);
      } else {
        console.log(`  ⚠ No registration match found - stored payment data only`);
      }
    }

    // Final verification
    const finalCount = await sql`SELECT COUNT(*) as count FROM paid_customers`;
    console.log(`\n✅ Successfully stored ${finalCount[0].count} payment intents in paid_customers table`);

    // Summary by event
    const summary = await sql`
      SELECT 
        event_name,
        COUNT(*) as total_payments,
        COUNT(email) as with_registration_data,
        SUM(amount_paid)/100 as revenue
      FROM paid_customers 
      GROUP BY event_name
      ORDER BY revenue DESC
    `;

    console.log('\n=== PAYMENT MATCHING SUMMARY ===');
    summary.forEach(row => {
      const matchRate = ((row.with_registration_data / row.total_payments) * 100).toFixed(1);
      console.log(`${row.event_name}: ${row.with_registration_data}/${row.total_payments} matched (${matchRate}%) - $${row.revenue}`);
    });

    console.log('\n✅ Correct matching system completed!');

  } catch (error) {
    console.error('Error in correct matching system:', error);
  }
}

// Run the script
correctMatchingSystem();