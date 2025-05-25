import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function noDuplicateMatching() {
  try {
    console.log('Building payment system with no duplicate entries...');
    
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

    // Get all registrations from original database
    const allRegistrations = await sql`
      SELECT 
        id, event_id, first_name, last_name, contact_name, email, phone, 
        school_name, club_name, registration_type, stripe_payment_intent_id, 
        created_at, payment_status, t_shirt_size, grade, age, experience
      FROM event_registrations 
      ORDER BY created_at ASC
    `;

    console.log(`Found ${allRegistrations.length} registration entries`);

    // Track which registrations have been used to prevent duplicates
    const usedRegistrationIds = new Set();

    // Process each payment intent and find unique closest match
    for (const intent of successfulPayments) {
      const paymentDate = new Date(intent.created * 1000);
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      
      console.log(`\nProcessing Payment: ${intent.id} - ${eventName} - $${intent.amount/100}`);
      console.log(`Payment created at: ${paymentDate.toISOString()}`);
      
      // Find the closest unused registration entry by time
      let bestMatch = null;
      let shortestTimeDiff = Infinity;
      
      for (const registration of allRegistrations) {
        // Skip if this registration has already been used
        if (usedRegistrationIds.has(registration.id)) {
          continue;
        }
        
        const registrationDate = new Date(registration.created_at);
        const timeDiff = Math.abs(paymentDate - registrationDate);
        
        // Only consider registrations that occurred before the payment (within reason)
        if (registrationDate <= paymentDate && timeDiff < shortestTimeDiff) {
          shortestTimeDiff = timeDiff;
          const minutes = Math.floor(timeDiff / 60000);
          const seconds = Math.floor((timeDiff % 60000) / 1000);
          bestMatch = { registration, timeDiff: { minutes, seconds } };
        }
      }
      
      // If we found a match, mark it as used and insert the data
      const reg = bestMatch?.registration;
      
      if (reg) {
        usedRegistrationIds.add(reg.id);
      }
      
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
        console.log(`  ✓ Matched with: ${reg.first_name} ${reg.last_name} (${reg.email}) - ID: ${reg.id}`);
        console.log(`    Registration: ${new Date(reg.created_at).toISOString()}`);
        console.log(`    Time difference: ${bestMatch.timeDiff.minutes} minutes, ${bestMatch.timeDiff.seconds} seconds`);
      } else {
        console.log(`  ⚠ No unused registration found - stored payment data only`);
      }
    }

    // Verify no duplicates exist
    const duplicateCheck = await sql`
      SELECT 
        first_name, last_name, email, COUNT(*) as count
      FROM paid_customers 
      WHERE first_name IS NOT NULL AND last_name IS NOT NULL AND email IS NOT NULL
      GROUP BY first_name, last_name, email
      HAVING COUNT(*) > 1
    `;

    if (duplicateCheck.length === 0) {
      console.log('\n✅ NO DUPLICATES FOUND - All entries are unique!');
    } else {
      console.log(`\n⚠ Found ${duplicateCheck.length} duplicate customers:`);
      duplicateCheck.forEach(dup => {
        console.log(`  - ${dup.first_name} ${dup.last_name} (${dup.email}): ${dup.count} entries`);
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

    console.log('\n=== NO DUPLICATE MATCHING SUMMARY ===');
    summary.forEach(row => {
      const matchRate = ((row.with_registration_data / row.total_payments) * 100).toFixed(1);
      console.log(`${row.event_name}: ${row.with_registration_data}/${row.total_payments} matched (${matchRate}%) - $${row.revenue}`);
    });

    const finalCount = await sql`SELECT COUNT(*) as count FROM paid_customers`;
    console.log(`\nTotal unique payments stored: ${finalCount[0].count}`);
    console.log('\n✅ No duplicate matching system completed!');

  } catch (error) {
    console.error('Error in no duplicate matching:', error);
  }
}

// Run the script
noDuplicateMatching();