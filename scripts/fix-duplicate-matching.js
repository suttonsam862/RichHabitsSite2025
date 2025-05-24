import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function fixDuplicateMatching() {
  try {
    console.log('Fixing duplicate matching - ensuring each payment gets unique registration...');
    
    // Get ALL unique successful payment intents, sorted chronologically
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

    const uniqueSuccessfulPayments = allPaymentIntents
      .filter(intent => intent.status === 'succeeded')
      .sort((a, b) => a.created - b.created);

    console.log(`Found ${uniqueSuccessfulPayments.length} unique successful payments`);

    // Get ALL registration entries sorted chronologically
    const allRegistrations = await sql`
      SELECT * FROM verified_customer_registrations 
      WHERE email IS NOT NULL
      ORDER BY payment_date ASC
    `;

    console.log(`Found ${allRegistrations.length} registration entries`);

    // Track which registrations have been used
    const usedRegistrations = new Set();

    // Process each payment and find the closest unused registration before it
    for (const intent of uniqueSuccessfulPayments) {
      const paymentDate = new Date(intent.created * 1000);
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      
      console.log(`\nProcessing: ${intent.id} - ${eventName} - $${intent.amount/100} - ${paymentDate.toISOString()}`);
      
      let bestMatch = null;
      let shortestTimeDiff = Infinity;
      
      // Find the best unused registration that occurred before this payment
      for (let i = 0; i < allRegistrations.length; i++) {
        const reg = allRegistrations[i];
        const regDate = new Date(reg.payment_date);
        
        // Skip if already used
        if (usedRegistrations.has(i)) continue;
        
        // Only consider registrations before payment
        if (regDate < paymentDate) {
          // Prefer same event, but allow cross-event matching if needed
          const eventMatch = reg.event_name === eventName || 
                            reg.event_name?.toLowerCase().includes(eventName.toLowerCase()) ||
                            eventName.toLowerCase().includes(reg.event_name?.toLowerCase() || '');
          
          const timeDiff = Math.abs(paymentDate - regDate);
          
          // Prioritize: same event + close time, then any close time
          const priority = eventMatch ? timeDiff : timeDiff + 1000000;
          
          if (priority < shortestTimeDiff) {
            shortestTimeDiff = priority;
            bestMatch = { registration: reg, index: i };
          }
        }
      }
      
      // If no unused registration found before payment, use any unused registration
      if (!bestMatch) {
        for (let i = 0; i < allRegistrations.length; i++) {
          const reg = allRegistrations[i];
          
          if (!usedRegistrations.has(i)) {
            bestMatch = { registration: reg, index: i };
            break;
          }
        }
      }
      
      // Mark this registration as used
      if (bestMatch) {
        usedRegistrations.add(bestMatch.index);
      }
      
      // Insert the payment with unique registration data
      await sql`
        INSERT INTO paid_customers (
          stripe_payment_intent_id, event_name, camper_name, first_name, last_name,
          email, phone, school_name, registration_type, amount_paid, payment_date
        ) VALUES (
          ${intent.id},
          ${eventName},
          ${bestMatch?.registration.camper_name || null},
          ${bestMatch?.registration.first_name || null},
          ${bestMatch?.registration.last_name || null},
          ${bestMatch?.registration.email || null},
          ${bestMatch?.registration.phone || null},
          ${bestMatch?.registration.school_name || null},
          ${bestMatch?.registration.registration_type || 'full'},
          ${intent.amount},
          ${paymentDate.toISOString()}
        )
      `;
      
      if (bestMatch) {
        const regDate = new Date(bestMatch.registration.payment_date);
        console.log(`  ✓ Matched with: ${bestMatch.registration.camper_name} (${bestMatch.registration.email})`);
        console.log(`    Registration: ${regDate.toISOString()}, Payment: ${paymentDate.toISOString()}`);
      } else {
        console.log(`  ⚠ No available registration found`);
      }
    }

    // Verify no duplicates exist
    const duplicateCheck = await sql`
      SELECT 
        camper_name, 
        email, 
        COUNT(*) as count
      FROM paid_customers 
      WHERE camper_name IS NOT NULL AND email IS NOT NULL
      GROUP BY camper_name, email
      HAVING COUNT(*) > 1
    `;

    if (duplicateCheck.length > 0) {
      console.log(`\n⚠ WARNING: Still found ${duplicateCheck.length} duplicate customer entries:`);
      duplicateCheck.forEach(dup => {
        console.log(`  - ${dup.camper_name} (${dup.email}): ${dup.count} entries`);
      });
    } else {
      console.log('\n✅ No duplicate customers found - all entries are unique!');
    }

    // Final summary
    const summary = await sql`
      SELECT 
        event_name,
        COUNT(*) as unique_payments,
        COUNT(email) as with_registration_data,
        SUM(amount_paid)/100 as revenue
      FROM paid_customers 
      GROUP BY event_name
      ORDER BY revenue DESC
    `;

    console.log('\n=== FINAL FIXED DATABASE ===');
    summary.forEach(row => {
      const matchRate = ((row.with_registration_data / row.unique_payments) * 100).toFixed(1);
      console.log(`${row.event_name}: ${row.with_registration_data}/${row.unique_payments} matched (${matchRate}%) - $${row.revenue}`);
    });

    const totals = await sql`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(DISTINCT camper_name || email) as unique_customers,
        COUNT(email) as matched_with_data,
        SUM(amount_paid)/100 as total_revenue
      FROM paid_customers
    `;

    console.log(`\nTOTAL: ${totals[0].matched_with_data}/${totals[0].total_payments} payments with ${totals[0].unique_customers} unique customers`);
    console.log(`Revenue: $${totals[0].total_revenue}`);
    console.log('\n✅ Duplicate fixing completed!');

  } catch (error) {
    console.error('Error fixing duplicates:', error);
  }
}

// Run the script
fixDuplicateMatching();