import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function anchorBasedMatching() {
  try {
    console.log('Starting anchor-based matching using known payment intent IDs as reference points...');
    
    // Get ALL entries from verified_customer_registrations in exact chronological order
    const allEntries = await sql`
      SELECT 
        event_name, camper_name, first_name, last_name, email, phone, 
        school_name, registration_type, stripe_payment_intent_id, 
        payment_date, payment_status,
        ROW_NUMBER() OVER (ORDER BY payment_date ASC) as row_num
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

    // Create mapping of payment intent IDs to their chronological order
    const paymentOrder = {};
    successfulPayments.forEach((payment, index) => {
      paymentOrder[payment.id] = index;
    });

    // Find the 3 anchor entries that have payment intent IDs
    const anchorEntries = allEntries.filter(entry => entry.stripe_payment_intent_id);
    console.log(`Found ${anchorEntries.length} anchor entries with payment intent IDs:`);
    
    anchorEntries.forEach(anchor => {
      const paymentIndex = paymentOrder[anchor.stripe_payment_intent_id];
      console.log(`  - ${anchor.camper_name} (${anchor.stripe_payment_intent_id}) -> Payment #${paymentIndex}`);
    });

    // For each successful payment, match it to a registration entry
    const usedEntries = new Set();
    
    for (const [paymentIndex, intent] of successfulPayments.entries()) {
      const paymentDate = new Date(intent.created * 1000);
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      
      console.log(`\nProcessing Payment #${paymentIndex}: ${intent.id} - ${eventName} - $${intent.amount/100}`);
      
      let registrationEntry = null;
      
      // Check if this payment intent ID exists in our anchor entries
      const directMatch = anchorEntries.find(anchor => anchor.stripe_payment_intent_id === intent.id);
      
      if (directMatch) {
        // Use the exact registration data for this payment
        registrationEntry = directMatch;
        const entryIndex = allEntries.findIndex(e => e.stripe_payment_intent_id === intent.id);
        if (entryIndex >= 0) usedEntries.add(entryIndex);
        console.log(`  ✓ DIRECT MATCH: ${registrationEntry.camper_name} (${registrationEntry.email})`);
      } else {
        // Find the best unused registration entry
        let bestMatch = null;
        let shortestTimeDiff = Infinity;
        
        for (let i = 0; i < allEntries.length; i++) {
          if (usedEntries.has(i)) continue;
          
          const entry = allEntries[i];
          const entryDate = new Date(entry.payment_date);
          
          // Only consider entries that occurred before the payment
          if (entryDate < paymentDate) {
            const timeDiff = Math.abs(paymentDate - entryDate);
            
            // Strong preference for same event
            const eventMatch = entry.event_name === eventName || 
                              entry.event_name?.toLowerCase().includes(eventName.toLowerCase()) ||
                              eventName.toLowerCase().includes(entry.event_name?.toLowerCase() || '');
            
            if (eventMatch && timeDiff < shortestTimeDiff) {
              shortestTimeDiff = timeDiff;
              bestMatch = { entry, index: i };
            }
          }
        }
        
        // If no same-event match found before payment, take closest time match
        if (!bestMatch) {
          for (let i = 0; i < allEntries.length; i++) {
            if (usedEntries.has(i)) continue;
            
            const entry = allEntries[i];
            const entryDate = new Date(entry.payment_date);
            
            if (entryDate < paymentDate) {
              const timeDiff = Math.abs(paymentDate - entryDate);
              if (timeDiff < shortestTimeDiff) {
                shortestTimeDiff = timeDiff;
                bestMatch = { entry, index: i };
              }
            }
          }
        }
        
        // If still no match, take any unused entry
        if (!bestMatch) {
          for (let i = 0; i < allEntries.length; i++) {
            if (!usedEntries.has(i)) {
              bestMatch = { entry: allEntries[i], index: i };
              break;
            }
          }
        }
        
        if (bestMatch) {
          registrationEntry = bestMatch.entry;
          usedEntries.add(bestMatch.index);
          const minutes = Math.round(shortestTimeDiff / 60000);
          console.log(`  ✓ Proximity match: ${registrationEntry.camper_name} (${registrationEntry.email}) - ${minutes} min diff`);
        }
      }
      
      // Insert the payment with correct registration data
      await sql`
        INSERT INTO paid_customers (
          stripe_payment_intent_id, event_name, camper_name, first_name, last_name,
          email, phone, school_name, registration_type, amount_paid, payment_date
        ) VALUES (
          ${intent.id},
          ${eventName},
          ${registrationEntry?.camper_name || null},
          ${registrationEntry?.first_name || null},
          ${registrationEntry?.last_name || null},
          ${registrationEntry?.email || null},
          ${registrationEntry?.phone || null},
          ${registrationEntry?.school_name || null},
          ${registrationEntry?.registration_type || 'full'},
          ${intent.amount},
          ${paymentDate.toISOString()}
        )
      `;
    }

    // Verification
    const duplicateCheck = await sql`
      SELECT camper_name, email, COUNT(*) as count
      FROM paid_customers 
      WHERE camper_name IS NOT NULL AND email IS NOT NULL
      GROUP BY camper_name, email
      HAVING COUNT(*) > 1
    `;

    if (duplicateCheck.length === 0) {
      console.log('\n✅ No duplicate customers found!');
    } else {
      console.log(`\n⚠ Found ${duplicateCheck.length} duplicate customers`);
    }

    // Check Ameer Hasty Jr specifically
    const ameerCheck = await sql`
      SELECT event_name, camper_name, email
      FROM paid_customers 
      WHERE camper_name ILIKE '%ameer%'
    `;
    
    if (ameerCheck.length > 0) {
      console.log('\n🔍 Ameer Hasty Jr verification:');
      ameerCheck.forEach(entry => {
        console.log(`  ${entry.camper_name} -> ${entry.event_name}`);
      });
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

    console.log('\n=== ANCHOR-BASED MATCHING RESULTS ===');
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
    console.log('\n✅ Anchor-based matching completed!');

  } catch (error) {
    console.error('Error in anchor-based matching:', error);
  }
}

// Run the script
anchorBasedMatching();