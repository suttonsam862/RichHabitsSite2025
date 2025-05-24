import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function sequentialMatching() {
  try {
    console.log('Starting sequential matching - matching payments to registration entries immediately before them...');
    
    // Get ALL entries from verified_customer_registrations in chronological order
    const allEntries = await sql`
      SELECT 
        event_name, camper_name, first_name, last_name, email, phone, 
        school_name, registration_type, stripe_payment_intent_id, 
        payment_date, payment_status
      FROM verified_customer_registrations 
      ORDER BY payment_date ASC
    `;

    console.log(`Found ${allEntries.length} entries in verified_customer_registrations`);

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

    console.log(`Found ${successfulPayments.length} successful payments from Stripe`);

    // Track which registration entries have been used
    const usedEntries = new Set();

    // For each payment, find the closest unused registration entry that occurred before it
    for (const intent of successfulPayments) {
      const paymentDate = new Date(intent.created * 1000);
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      
      console.log(`\nProcessing: ${intent.id} - ${eventName} - $${intent.amount/100} - ${paymentDate.toISOString()}`);
      
      let bestMatch = null;
      let shortestTimeDiff = Infinity;
      
      // Find the best unused registration entry that occurred before this payment
      for (let i = 0; i < allEntries.length; i++) {
        if (usedEntries.has(i)) continue; // Skip already used entries
        
        const entry = allEntries[i];
        const entryDate = new Date(entry.payment_date);
        
        // Only consider entries that occurred before the payment
        if (entryDate < paymentDate) {
          const timeDiff = Math.abs(paymentDate - entryDate);
          
          // Prefer entries from the same event, but allow cross-event if needed
          const eventMatch = entry.event_name === eventName || 
                            entry.event_name?.toLowerCase().includes(eventName.toLowerCase()) ||
                            eventName.toLowerCase().includes(entry.event_name?.toLowerCase() || '');
          
          // Priority: same event gets lower time diff, different event gets penalty
          const priority = eventMatch ? timeDiff : timeDiff + 3600000; // 1 hour penalty for different events
          
          if (priority < shortestTimeDiff) {
            shortestTimeDiff = priority;
            bestMatch = { entry, index: i };
          }
        }
      }
      
      // If no entry found before payment, take the earliest unused entry
      if (!bestMatch) {
        for (let i = 0; i < allEntries.length; i++) {
          if (!usedEntries.has(i)) {
            bestMatch = { entry: allEntries[i], index: i };
            break;
          }
        }
      }
      
      // Mark this entry as used
      if (bestMatch) {
        usedEntries.add(bestMatch.index);
      }
      
      // Insert the matched payment and registration data
      const entry = bestMatch?.entry;
      
      await sql`
        INSERT INTO paid_customers (
          stripe_payment_intent_id, event_name, camper_name, first_name, last_name,
          email, phone, school_name, registration_type, amount_paid, payment_date
        ) VALUES (
          ${intent.id},
          ${eventName},
          ${entry?.camper_name || null},
          ${entry?.first_name || null},
          ${entry?.last_name || null},
          ${entry?.email || null},
          ${entry?.phone || null},
          ${entry?.school_name || null},
          ${entry?.registration_type || 'full'},
          ${intent.amount},
          ${paymentDate.toISOString()}
        )
      `;
      
      if (entry) {
        const entryDate = new Date(entry.payment_date);
        const timeDiff = Math.abs(paymentDate - entryDate);
        const minutes = Math.round(timeDiff / 60000);
        console.log(`  ✓ Matched with: ${entry.camper_name} (${entry.email}) from ${entry.event_name}`);
        console.log(`    Time difference: ${minutes} minutes`);
      } else {
        console.log(`  ⚠ No registration entry available for matching`);
      }
    }

    // Final verification and summary
    const duplicateCheck = await sql`
      SELECT camper_name, email, COUNT(*) as count
      FROM paid_customers 
      WHERE camper_name IS NOT NULL AND email IS NOT NULL
      GROUP BY camper_name, email
      HAVING COUNT(*) > 1
    `;

    if (duplicateCheck.length > 0) {
      console.log(`\n⚠ Found ${duplicateCheck.length} duplicate customers:`);
      duplicateCheck.forEach(dup => {
        console.log(`  - ${dup.camper_name} (${dup.email}): ${dup.count} entries`);
      });
    } else {
      console.log('\n✅ No duplicate customers found!');
    }

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

    console.log('\n=== SEQUENTIAL MATCHING RESULTS ===');
    summary.forEach(row => {
      const matchRate = ((row.with_registration_data / row.total_payments) * 100).toFixed(1);
      console.log(`${row.event_name}: ${row.with_registration_data}/${row.total_payments} matched (${matchRate}%) - $${row.revenue}`);
    });

    const totals = await sql`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(email) as matched_with_data,
        SUM(amount_paid)/100 as total_revenue
      FROM paid_customers
    `;

    console.log(`\nTOTAL: ${totals[0].matched_with_data}/${totals[0].total_payments} payments matched`);
    console.log(`Revenue: $${totals[0].total_revenue}`);
    console.log('\n✅ Sequential matching completed!');

  } catch (error) {
    console.error('Error in sequential matching:', error);
  }
}

// Run the script
sequentialMatching();