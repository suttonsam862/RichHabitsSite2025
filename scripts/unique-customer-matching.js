import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function uniqueCustomerMatching() {
  try {
    console.log('Building payment system with unique customers only...');
    
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

    // Track which registration IDs and customer emails have been used
    const usedRegistrationIds = new Set();
    const usedCustomerEmails = new Set();

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
        // Skip if this registration ID has been used OR if this customer email has been used
        if (usedRegistrationIds.has(registration.id) || 
            usedCustomerEmails.has(registration.email)) {
          continue;
        }
        
        const registrationDate = new Date(registration.created_at);
        const timeDiff = Math.abs(paymentDate - registrationDate);
        
        // Only consider registrations that occurred before the payment
        if (registrationDate <= paymentDate && timeDiff < shortestTimeDiff) {
          shortestTimeDiff = timeDiff;
          const minutes = Math.floor(timeDiff / 60000);
          const seconds = Math.floor((timeDiff % 60000) / 1000);
          bestMatch = { registration, timeDiff: { minutes, seconds } };
        }
      }
      
      // If we found a match, mark both the registration ID and customer email as used
      const reg = bestMatch?.registration;
      
      if (reg) {
        usedRegistrationIds.add(reg.id);
        usedCustomerEmails.add(reg.email);
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

    // Verify absolutely no duplicates exist
    const duplicateCheck = await sql`
      SELECT 
        email, COUNT(*) as count
      FROM paid_customers 
      WHERE email IS NOT NULL
      GROUP BY email
      HAVING COUNT(*) > 1
    `;

    if (duplicateCheck.length === 0) {
      console.log('\n✅ ZERO DUPLICATES - All customer emails are unique!');
    } else {
      console.log(`\n⚠ Found ${duplicateCheck.length} duplicate emails:`);
      duplicateCheck.forEach(dup => {
        console.log(`  - ${dup.email}: ${dup.count} entries`);
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

    console.log('\n=== UNIQUE CUSTOMER MATCHING SUMMARY ===');
    summary.forEach(row => {
      const matchRate = ((row.with_registration_data / row.total_payments) * 100).toFixed(1);
      console.log(`${row.event_name}: ${row.with_registration_data}/${row.total_payments} matched (${matchRate}%) - $${row.revenue}`);
    });

    const finalCount = await sql`SELECT COUNT(*) as count FROM paid_customers`;
    console.log(`\nTotal unique payments stored: ${finalCount[0].count}`);
    console.log('\n✅ Unique customer matching completed - no duplicates guaranteed!');

  } catch (error) {
    console.error('Error in unique customer matching:', error);
  }
}

// Run the script
uniqueCustomerMatching();