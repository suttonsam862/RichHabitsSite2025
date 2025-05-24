import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function directEntryMatching() {
  try {
    console.log('Starting direct entry matching - using payment intent IDs to find exact entries...');
    
    // Get ALL entries from verified_customer_registrations in exact order
    const allEntries = await sql`
      SELECT 
        event_name, camper_name, first_name, last_name, email, phone, 
        school_name, registration_type, stripe_payment_intent_id, 
        payment_date, payment_status,
        ROW_NUMBER() OVER (ORDER BY payment_date ASC) as row_num
      FROM verified_customer_registrations 
      ORDER BY payment_date ASC
    `;

    console.log(`Found ${allEntries.length} total entries in verified_customer_registrations`);

    // Get unique successful payment intents from Stripe
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

    const successfulPayments = allPaymentIntents.filter(intent => intent.status === 'succeeded');
    console.log(`Found ${successfulPayments.length} successful payments from Stripe`);

    // For each successful payment, find it in the verified_customer_registrations and use the entry above it
    for (const intent of successfulPayments) {
      const paymentIntentId = intent.id;
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      const paymentDate = new Date(intent.created * 1000);
      
      console.log(`\nProcessing payment: ${paymentIntentId} - ${eventName} - $${intent.amount/100}`);
      
      // Find this payment intent in the entries OR find the closest entry before this payment time
      let registrationEntry = null;
      let entryIndex = -1;
      
      // First, try to find by payment intent ID in the data
      for (let i = 0; i < allEntries.length; i++) {
        if (allEntries[i].stripe_payment_intent_id === paymentIntentId) {
          entryIndex = i;
          break;
        }
      }
      
      // If found by payment intent ID, use the entry immediately before it
      if (entryIndex > 0) {
        registrationEntry = allEntries[entryIndex - 1];
        console.log(`  Found payment intent in data at index ${entryIndex}, using entry ${entryIndex - 1}`);
      } else {
        // If not found by payment intent, find the closest entry before payment time
        for (let i = allEntries.length - 1; i >= 0; i--) {
          const entryDate = new Date(allEntries[i].payment_date);
          if (entryDate < paymentDate) {
            registrationEntry = allEntries[i];
            entryIndex = i;
            console.log(`  Payment intent not found in data, using closest entry before payment time at index ${i}`);
            break;
          }
        }
      }
      
      // Insert the payment with the correct registration data
      if (registrationEntry) {
        await sql`
          INSERT INTO paid_customers (
            stripe_payment_intent_id, event_name, camper_name, first_name, last_name,
            email, phone, school_name, registration_type, amount_paid, payment_date
          ) VALUES (
            ${paymentIntentId},
            ${eventName},
            ${registrationEntry.camper_name},
            ${registrationEntry.first_name},
            ${registrationEntry.last_name},
            ${registrationEntry.email},
            ${registrationEntry.phone},
            ${registrationEntry.school_name},
            ${registrationEntry.registration_type || 'full'},
            ${intent.amount},
            ${paymentDate.toISOString()}
          )
        `;
        
        console.log(`  ✓ Matched with: ${registrationEntry.camper_name} (${registrationEntry.email}) from ${registrationEntry.event_name}`);
        console.log(`    Registration time: ${registrationEntry.payment_date}`);
      } else {
        console.log(`  ⚠ No registration entry found before this payment`);
        
        // Insert payment without registration data
        await sql`
          INSERT INTO paid_customers (
            stripe_payment_intent_id, event_name, camper_name, first_name, last_name,
            email, phone, school_name, registration_type, amount_paid, payment_date
          ) VALUES (
            ${paymentIntentId},
            ${eventName},
            ${null}, ${null}, ${null}, ${null}, ${null}, ${null}, 'full',
            ${intent.amount},
            ${paymentDate.toISOString()}
          )
        `;
      }
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

    console.log('\n=== DIRECT ENTRY MATCHING RESULTS ===');
    summary.forEach(row => {
      const matchRate = ((row.with_registration_data / row.total_payments) * 100).toFixed(1);
      console.log(`${row.event_name}: ${row.with_registration_data}/${row.total_payments} matched (${matchRate}%) - $${row.revenue}`);
    });

    // Check for duplicates
    const duplicateCheck = await sql`
      SELECT camper_name, email, COUNT(*) as count
      FROM paid_customers 
      WHERE camper_name IS NOT NULL AND email IS NOT NULL
      GROUP BY camper_name, email
      HAVING COUNT(*) > 1
    `;

    if (duplicateCheck.length === 0) {
      console.log('\n✅ No duplicate customers found - all entries are unique!');
    } else {
      console.log(`\n⚠ Found ${duplicateCheck.length} duplicate customers`);
    }

    const totals = await sql`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(email) as matched_with_data,
        SUM(amount_paid)/100 as total_revenue
      FROM paid_customers
    `;

    console.log(`\nTOTAL: ${totals[0].matched_with_data}/${totals[0].total_payments} payments matched`);
    console.log(`Revenue: $${totals[0].total_revenue}`);
    console.log('\n✅ Direct entry matching completed!');

  } catch (error) {
    console.error('Error in direct entry matching:', error);
  }
}

// Run the script
directEntryMatching();