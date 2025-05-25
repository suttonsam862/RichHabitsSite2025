import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function addCorrelatedData() {
  try {
    console.log('Adding all directly correlated Stripe payment data from verified registrations...');
    
    // Get ALL entries that have stripe payment intent IDs (regardless of status)
    const entriesWithPaymentIds = await sql`
      SELECT 
        event_name, camper_name, first_name, last_name, email, phone, 
        school_name, registration_type, stripe_payment_intent_id, 
        payment_date, payment_status
      FROM verified_customer_registrations 
      WHERE stripe_payment_intent_id IS NOT NULL 
      AND stripe_payment_intent_id != ''
      ORDER BY payment_date ASC
    `;

    console.log(`Found ${entriesWithPaymentIds.length} entries with Stripe payment intent IDs`);
    
    // For each entry with a payment intent ID, get the actual Stripe data and add to paid_customers
    for (const entry of entriesWithPaymentIds) {
      try {
        console.log(`Processing: ${entry.camper_name} - ${entry.stripe_payment_intent_id}`);
        
        const paymentIntent = await stripe.paymentIntents.retrieve(entry.stripe_payment_intent_id);
        const paymentDate = new Date(paymentIntent.created * 1000);
        const eventName = paymentIntent.metadata?.event_name || paymentIntent.metadata?.eventName || entry.event_name;
        
        // Insert into paid_customers with verified registration data
        await sql`
          INSERT INTO paid_customers (
            stripe_payment_intent_id, event_name, camper_name, first_name, last_name,
            email, phone, school_name, registration_type, amount_paid, payment_date
          ) VALUES (
            ${entry.stripe_payment_intent_id},
            ${eventName},
            ${entry.camper_name},
            ${entry.first_name},
            ${entry.last_name},
            ${entry.email},
            ${entry.phone},
            ${entry.school_name},
            ${entry.registration_type || 'full'},
            ${paymentIntent.amount},
            ${paymentDate.toISOString()}
          )
        `;
        
        console.log(`✓ Added: ${entry.camper_name} - ${eventName} - $${paymentIntent.amount/100} - Status: ${paymentIntent.status}`);
        
      } catch (error) {
        console.log(`⚠ Error processing ${entry.stripe_payment_intent_id}: ${error.message}`);
      }
    }

    // Summary of what was added
    const summary = await sql`
      SELECT 
        event_name,
        COUNT(*) as customers,
        SUM(amount_paid)/100 as revenue,
        STRING_AGG(camper_name, ', ') as customer_names
      FROM paid_customers 
      GROUP BY event_name
      ORDER BY revenue DESC
    `;

    console.log('\n=== CORRELATED DATA SUMMARY ===');
    if (summary.length > 0) {
      summary.forEach(row => {
        console.log(`${row.event_name}: ${row.customers} customers - $${row.revenue}`);
        console.log(`  Customers: ${row.customer_names}`);
      });
    } else {
      console.log('No data added to paid_customers table');
    }

    const totals = await sql`
      SELECT 
        COUNT(*) as total_customers,
        SUM(amount_paid)/100 as total_revenue
      FROM paid_customers
    `;

    console.log(`\nTOTAL: ${totals[0].total_customers || 0} customers with correlated data - $${totals[0].total_revenue || 0} total amount`);
    console.log('\n✅ Correlated data processing completed!');

  } catch (error) {
    console.error('Error adding correlated data:', error);
  }
}

// Run the script
addCorrelatedData();