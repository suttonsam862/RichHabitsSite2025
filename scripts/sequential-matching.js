import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function sequentialMatching() {
  try {
    console.log('Starting sequential matching - registration entry right before payment...');
    
    // Get ALL unique successful payment intents
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
      .sort((a, b) => a.created - b.created); // Sort by creation time

    console.log(`Found ${uniqueSuccessfulPayments.length} unique successful payments`);

    // Get ALL registration entries sorted chronologically
    const allRegistrations = await sql`
      SELECT *, 'verified_customer_registrations' as source_table,
             payment_date as entry_time
      FROM verified_customer_registrations 
      WHERE email IS NOT NULL
      ORDER BY payment_date ASC
    `;

    console.log(`Found ${allRegistrations.length} registration entries sorted chronologically`);

    // For each payment, find the registration entry immediately before it
    for (const intent of uniqueSuccessfulPayments) {
      const paymentDate = new Date(intent.created * 1000);
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      
      console.log(`\nProcessing payment: ${intent.id} - ${eventName} - $${intent.amount/100} - ${paymentDate.toISOString()}`);
      
      // Find the registration entry that appears right before this payment chronologically
      let matchingRegistration = null;
      
      for (let i = allRegistrations.length - 1; i >= 0; i--) {
        const reg = allRegistrations[i];
        const regDate = new Date(reg.entry_time);
        
        // Find the most recent registration entry before this payment
        if (regDate < paymentDate) {
          // Check if it's for the same event or close match
          if (reg.event_name === eventName || 
              reg.event_name?.toLowerCase().includes(eventName.toLowerCase()) ||
              eventName.toLowerCase().includes(reg.event_name?.toLowerCase() || '')) {
            matchingRegistration = reg;
            break;
          }
        }
      }
      
      // If no event-specific match, just find the chronologically previous registration
      if (!matchingRegistration) {
        for (let i = allRegistrations.length - 1; i >= 0; i--) {
          const reg = allRegistrations[i];
          const regDate = new Date(reg.entry_time);
          
          if (regDate < paymentDate) {
            matchingRegistration = reg;
            break;
          }
        }
      }
      
      // Insert the payment with the sequential registration data
      await sql`
        INSERT INTO paid_customers (
          stripe_payment_intent_id, event_name, camper_name, first_name, last_name,
          email, phone, school_name, registration_type, amount_paid, payment_date
        ) VALUES (
          ${intent.id},
          ${eventName},
          ${matchingRegistration?.camper_name || null},
          ${matchingRegistration?.first_name || null},
          ${matchingRegistration?.last_name || null},
          ${matchingRegistration?.email || null},
          ${matchingRegistration?.phone || null},
          ${matchingRegistration?.school_name || null},
          ${matchingRegistration?.registration_type || 'full'},
          ${intent.amount},
          ${paymentDate.toISOString()}
        )
      `;
      
      if (matchingRegistration) {
        const regDate = new Date(matchingRegistration.entry_time);
        console.log(`  ✓ Matched with registration entry: ${matchingRegistration.camper_name} (${matchingRegistration.email})`);
        console.log(`    Registration time: ${regDate.toISOString()}`);
        console.log(`    Payment time: ${paymentDate.toISOString()}`);
      } else {
        console.log(`  ⚠ No prior registration entry found`);
      }
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

    console.log('\n=== SEQUENTIAL MATCHING RESULTS ===');
    summary.forEach(row => {
      const matchRate = ((row.with_registration_data / row.unique_payments) * 100).toFixed(1);
      console.log(`${row.event_name}: ${row.with_registration_data}/${row.unique_payments} matched (${matchRate}%) - $${row.revenue}`);
    });

    const totals = await sql`
      SELECT 
        COUNT(*) as total_unique_payments,
        COUNT(email) as matched_with_data,
        SUM(amount_paid)/100 as total_revenue
      FROM paid_customers
    `;

    console.log(`\nTOTAL: ${totals[0].matched_with_data}/${totals[0].total_unique_payments} unique payments`);
    console.log(`Revenue: $${totals[0].total_revenue}`);
    console.log('\n✅ Sequential matching completed!');

  } catch (error) {
    console.error('Error in sequential matching:', error);
  }
}

// Run the script
sequentialMatching();