import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function sequentialOrderMatching() {
  try {
    console.log('Building payment system with sequential order matching...');
    
    // Get all successful payment intents from Stripe
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

    // Get all registrations ordered by creation time with row numbers
    const allRegistrations = await sql`
      SELECT 
        id, event_id, first_name, last_name, contact_name, email, phone, 
        school_name, club_name, registration_type, stripe_payment_intent_id, 
        created_at, payment_status, t_shirt_size, grade, age, experience,
        ROW_NUMBER() OVER (ORDER BY created_at ASC) as sequence_number
      FROM event_registrations 
      ORDER BY created_at ASC
    `;

    console.log(`Found ${allRegistrations.length} registration entries in chronological order`);

    // Track which registrations have been used to prevent duplicates
    const usedRegistrationIds = new Set();

    // For each payment, find the registration that comes immediately before it in the sequence
    for (const intent of successfulPayments) {
      const paymentDate = new Date(intent.created * 1000);
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      
      console.log(`\nProcessing Payment: ${intent.id} - ${eventName} - $${intent.amount/100}`);
      console.log(`Payment created at: ${paymentDate.toISOString()}`);
      
      // Find the registration entry that comes immediately PRIOR to this payment time
      let bestMatch = null;
      
      // Go through registrations in reverse order to find the most recent one before payment
      for (let i = allRegistrations.length - 1; i >= 0; i--) {
        const registration = allRegistrations[i];
        
        // Skip if already used
        if (usedRegistrationIds.has(registration.id)) {
          continue;
        }
        
        const registrationDate = new Date(registration.created_at);
        
        // Only consider registrations that occurred BEFORE the payment
        if (registrationDate < paymentDate) {
          bestMatch = registration;
          break; // Take the first (most recent) unused registration before payment
        }
      }
      
      // Mark this registration as used
      if (bestMatch) {
        usedRegistrationIds.add(bestMatch.id);
      }
      
      const reg = bestMatch;
      
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
        const regDate = new Date(bestMatch.created_at);
        const timeDiff = Math.abs(paymentDate - regDate);
        const minutes = Math.floor(timeDiff / 60000);
        const seconds = Math.floor((timeDiff % 60000) / 1000);
        
        console.log(`  ✓ Sequential match: ${reg.first_name} ${reg.last_name} (${reg.email}) - Seq #${reg.sequence_number}`);
        console.log(`    Registration: ${regDate.toISOString()}`);
        console.log(`    Time difference: ${minutes} minutes, ${seconds} seconds`);
      } else {
        console.log(`  ⚠ No unused registration found before this payment`);
      }
    }

    // Verify no duplicates by email
    const duplicateCheck = await sql`
      SELECT 
        email, COUNT(*) as count
      FROM paid_customers 
      WHERE email IS NOT NULL
      GROUP BY email
      HAVING COUNT(*) > 1
    `;

    if (duplicateCheck.length === 0) {
      console.log('\n✅ ZERO DUPLICATES - All entries are unique!');
    } else {
      console.log(`\n⚠ Found ${duplicateCheck.length} duplicate emails:`);
      duplicateCheck.forEach(dup => {
        console.log(`  - ${dup.email}: ${dup.count} entries`);
      });
    }

    // Check specific examples like Ameer Hasty
    const ameerCheck = await sql`
      SELECT stripe_payment_intent_id, event_name, camper_name, first_name, last_name, email
      FROM paid_customers 
      WHERE first_name ILIKE '%ameer%' OR camper_name ILIKE '%ameer%'
    `;
    
    if (ameerCheck.length > 0) {
      console.log('\n🔍 Ameer Hasty verification:');
      ameerCheck.forEach(entry => {
        console.log(`  ${entry.first_name} ${entry.last_name} -> ${entry.event_name}`);
      });
    }

    // Final summary
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

    console.log('\n=== SEQUENTIAL ORDER MATCHING SUMMARY ===');
    summary.forEach(row => {
      const matchRate = ((row.with_registration_data / row.total_payments) * 100).toFixed(1);
      console.log(`${row.event_name}: ${row.with_registration_data}/${row.total_payments} matched (${matchRate}%) - $${row.revenue}`);
    });

    console.log('\n✅ Sequential order matching completed!');

  } catch (error) {
    console.error('Error in sequential order matching:', error);
  }
}

// Run the script
sequentialOrderMatching();