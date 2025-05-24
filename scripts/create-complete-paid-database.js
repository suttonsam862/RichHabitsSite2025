import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function createCompletePaidDatabase() {
  try {
    console.log('Creating complete paid database with proper matching...');
    
    // Get ALL successful payment intents (no limit)
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
    console.log(`Found ${successfulPayments.length} unique successful payments`);

    // Get ALL registration entries from the database
    const allRegistrations = await sql`
      SELECT * FROM verified_customer_registrations 
      WHERE email IS NOT NULL 
      ORDER BY payment_date ASC
    `;
    
    console.log(`Found ${allRegistrations.length} registration entries to match against`);

    // Insert each successful payment as unique record
    for (const intent of successfulPayments) {
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      const paymentDate = new Date(intent.created * 1000);
      
      // Find the best matching registration that occurred BEFORE this payment
      let bestMatch = null;
      let shortestTimeDiff = Infinity;
      
      for (const reg of allRegistrations) {
        const regDate = new Date(reg.payment_date);
        
        // Only consider registrations that happened BEFORE the payment
        if (regDate <= paymentDate) {
          // Match by event name
          if (reg.event_name === eventName) {
            const timeDiff = Math.abs(paymentDate - regDate);
            
            // Find the closest registration within 7 days
            if (timeDiff < 7 * 24 * 60 * 60 * 1000 && timeDiff < shortestTimeDiff) {
              shortestTimeDiff = timeDiff;
              bestMatch = reg;
            }
          }
        }
      }
      
      // Insert the payment with matched registration data (if found)
      await sql`
        INSERT INTO paid_customers (
          stripe_payment_intent_id, event_name, camper_name, first_name, last_name,
          email, phone, school_name, registration_type, amount_paid, payment_date
        ) VALUES (
          ${intent.id},
          ${eventName},
          ${bestMatch?.camper_name || null},
          ${bestMatch?.first_name || null},
          ${bestMatch?.last_name || null},
          ${bestMatch?.email || null},
          ${bestMatch?.phone || null},
          ${bestMatch?.school_name || null},
          ${bestMatch?.registration_type || 'full'},
          ${intent.amount},
          ${paymentDate.toISOString()}
        )
      `;
      
      if (bestMatch) {
        console.log(`✓ Matched payment ${intent.id} with registration: ${bestMatch.camper_name} (${bestMatch.email})`);
      } else {
        console.log(`⚠ No registration match found for payment: ${intent.id} - ${eventName}`);
      }
    }

    // Get final summary
    const summary = await sql`
      SELECT 
        event_name,
        COUNT(*) as total_payments,
        COUNT(email) as payments_with_registration_data,
        SUM(amount_paid)/100 as total_revenue
      FROM paid_customers 
      GROUP BY event_name
      ORDER BY total_revenue DESC
    `;

    console.log('\n=== FINAL PAID CUSTOMERS DATABASE ===');
    summary.forEach(row => {
      const matchRate = ((row.payments_with_registration_data / row.total_payments) * 100).toFixed(1);
      console.log(`${row.event_name}: ${row.payments_with_registration_data}/${row.total_payments} matched (${matchRate}%) - $${row.total_revenue}`);
    });

    const totals = await sql`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(email) as matched_with_registration,
        SUM(amount_paid)/100 as total_revenue
      FROM paid_customers
    `;

    console.log(`\nTOTAL: ${totals[0].matched_with_registration}/${totals[0].total_payments} payments matched with registration data`);
    console.log(`Revenue: $${totals[0].total_revenue}`);
    console.log('\n✅ Complete paid customers database created successfully!');

  } catch (error) {
    console.error('Error creating complete paid database:', error);
  }
}

// Run the script
createCompletePaidDatabase();