import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function finalUniqueMatching() {
  try {
    console.log('Final matching - each customer email appears only once...');
    
    // Get all successful payment intents
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

    // Get all registrations
    const allRegistrations = await sql`
      SELECT 
        id, event_id, first_name, last_name, contact_name, email, phone, 
        school_name, club_name, registration_type, stripe_payment_intent_id, 
        created_at, payment_status, t_shirt_size, grade, age, experience
      FROM event_registrations 
      ORDER BY created_at ASC
    `;

    console.log(`Found ${allRegistrations.length} registration entries`);

    // Track used customer emails to ensure absolutely no duplicates
    const usedCustomerEmails = new Set();

    // Process each payment and find the best unused customer match
    for (const intent of successfulPayments) {
      const paymentDate = new Date(intent.created * 1000);
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      
      console.log(`\nProcessing Payment: ${intent.id} - ${eventName} - $${intent.amount/100}`);
      
      // Find the best registration that hasn't been used yet (by email)
      let bestMatch = null;
      let shortestTimeDiff = Infinity;
      
      for (const registration of allRegistrations) {
        // Skip if this customer email has already been used
        if (usedCustomerEmails.has(registration.email)) {
          continue;
        }
        
        const registrationDate = new Date(registration.created_at);
        
        // Only consider registrations that occurred before the payment
        if (registrationDate < paymentDate) {
          const timeDiff = Math.abs(paymentDate - registrationDate);
          
          if (timeDiff < shortestTimeDiff) {
            shortestTimeDiff = timeDiff;
            bestMatch = registration;
          }
        }
      }
      
      // Mark this customer email as used
      if (bestMatch) {
        usedCustomerEmails.add(bestMatch.email);
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
        const timeDiff = paymentDate - regDate;
        const minutes = Math.floor(timeDiff / 60000);
        const seconds = Math.floor((timeDiff % 60000) / 1000);
        
        console.log(`  ✓ Matched: ${reg.first_name} ${reg.last_name} (${reg.email})`);
        console.log(`    Registration: ${regDate.toISOString()}`);
        console.log(`    Time difference: ${minutes} minutes, ${seconds} seconds`);
      } else {
        console.log(`  ⚠ No unused customer registration available`);
      }
    }

    // Final verification - should be zero duplicates
    const duplicateCheck = await sql`
      SELECT 
        email, COUNT(*) as count
      FROM paid_customers 
      WHERE email IS NOT NULL
      GROUP BY email
      HAVING COUNT(*) > 1
    `;

    if (duplicateCheck.length === 0) {
      console.log('\n✅ SUCCESS - Zero duplicate customers!');
    } else {
      console.log(`\n⚠ Still found ${duplicateCheck.length} duplicates`);
    }

    // Check Ameer Hasty specifically
    const ameerCheck = await sql`
      SELECT stripe_payment_intent_id, event_name, first_name, last_name, email
      FROM paid_customers 
      WHERE first_name ILIKE '%ameer%'
    `;
    
    if (ameerCheck.length > 0) {
      console.log('\n🔍 Ameer Hasty final result:');
      ameerCheck.forEach(entry => {
        console.log(`  ${entry.first_name} ${entry.last_name} -> ${entry.event_name}`);
      });
    }

    const summary = await sql`
      SELECT 
        event_name,
        COUNT(*) as payments,
        COUNT(email) as with_data,
        SUM(amount_paid)/100 as revenue
      FROM paid_customers 
      GROUP BY event_name
      ORDER BY revenue DESC
    `;

    console.log('\n=== FINAL RESULTS ===');
    summary.forEach(row => {
      console.log(`${row.event_name}: ${row.with_data}/${row.payments} - $${row.revenue}`);
    });

    console.log('\n✅ Final unique matching completed!');

  } catch (error) {
    console.error('Error in final matching:', error);
  }
}

finalUniqueMatching();