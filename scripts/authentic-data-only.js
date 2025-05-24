import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function authenticDataOnly() {
  try {
    console.log('Building paid customers database with authentic data only...');
    
    // Get only the entries that actually have completed payments with payment intent IDs
    const completedEntries = await sql`
      SELECT 
        event_name, camper_name, first_name, last_name, email, phone, 
        school_name, registration_type, stripe_payment_intent_id, 
        payment_date, payment_status
      FROM verified_customer_registrations 
      WHERE stripe_payment_intent_id IS NOT NULL 
      AND stripe_payment_intent_id != '' 
      AND payment_status = 'completed'
      ORDER BY payment_date ASC
    `;

    console.log(`Found ${completedEntries.length} verified completed registrations with payment IDs`);

    // Get all successful payments from Stripe
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

    // Insert only the payments that have verified registration data
    let matchedCount = 0;
    let unmatchedCount = 0;

    for (const intent of successfulPayments) {
      const paymentDate = new Date(intent.created * 1000);
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      
      // Find the corresponding registration entry by payment intent ID
      const registrationEntry = completedEntries.find(entry => entry.stripe_payment_intent_id === intent.id);
      
      if (registrationEntry) {
        // Insert with verified registration data
        await sql`
          INSERT INTO paid_customers (
            stripe_payment_intent_id, event_name, camper_name, first_name, last_name,
            email, phone, school_name, registration_type, amount_paid, payment_date
          ) VALUES (
            ${intent.id},
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
        
        matchedCount++;
        console.log(`✓ Verified match: ${registrationEntry.camper_name} - ${eventName} - $${intent.amount/100}`);
      } else {
        // Insert payment data only (no registration data available)
        await sql`
          INSERT INTO paid_customers (
            stripe_payment_intent_id, event_name, camper_name, first_name, last_name,
            email, phone, school_name, registration_type, amount_paid, payment_date
          ) VALUES (
            ${intent.id},
            ${eventName},
            ${null}, ${null}, ${null}, ${null}, ${null}, ${null}, 'full',
            ${intent.amount},
            ${paymentDate.toISOString()}
          )
        `;
        
        unmatchedCount++;
        console.log(`⚠ Payment only: ${intent.id} - ${eventName} - $${intent.amount/100} (no registration data)`);
      }
    }

    // Final summary
    const summary = await sql`
      SELECT 
        event_name,
        COUNT(*) as total_payments,
        COUNT(email) as with_registration_data,
        COUNT(email) - COUNT(*) as missing_data,
        SUM(amount_paid)/100 as revenue
      FROM paid_customers 
      GROUP BY event_name
      ORDER BY revenue DESC
    `;

    console.log('\n=== AUTHENTIC DATA SUMMARY ===');
    summary.forEach(row => {
      const matchRate = ((row.with_registration_data / row.total_payments) * 100).toFixed(1);
      console.log(`${row.event_name}: ${row.with_registration_data}/${row.total_payments} verified matches (${matchRate}%) - $${row.revenue}`);
    });

    console.log(`\nAuthentic matches: ${matchedCount}`);
    console.log(`Payments without registration data: ${unmatchedCount}`);
    console.log(`Total revenue: $${(successfulPayments.reduce((sum, p) => sum + p.amount, 0) / 100)}`);
    
    console.log('\n✅ Authentic data-only database completed!');

  } catch (error) {
    console.error('Error building authentic data:', error);
  }
}

// Run the script
authenticDataOnly();