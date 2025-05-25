import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function addVerifiedCustomers() {
  try {
    console.log('Adding only verified customers with authentic correlary data...');
    
    // Get the 3 verified entries that have actual payment intent IDs
    const verifiedEntries = await sql`
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

    console.log(`Found ${verifiedEntries.length} verified entries with payment intent IDs:`);
    
    for (const entry of verifiedEntries) {
      console.log(`  - ${entry.camper_name} (${entry.email}) - ${entry.event_name} - ${entry.stripe_payment_intent_id}`);
    }

    // Get the corresponding Stripe payment data for each verified entry
    for (const entry of verifiedEntries) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(entry.stripe_payment_intent_id);
        
        if (paymentIntent.status === 'succeeded') {
          const paymentDate = new Date(paymentIntent.created * 1000);
          const eventName = paymentIntent.metadata?.event_name || paymentIntent.metadata?.eventName || entry.event_name;
          
          // Insert verified customer with authentic data
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
          
          console.log(`✓ Added: ${entry.camper_name} - ${eventName} - $${paymentIntent.amount/100} - VERIFIED`);
        } else {
          console.log(`⚠ Skipped: ${entry.camper_name} - Payment status: ${paymentIntent.status}`);
        }
      } catch (error) {
        console.log(`⚠ Error retrieving payment ${entry.stripe_payment_intent_id}: ${error.message}`);
      }
    }

    // Final summary of verified customers
    const summary = await sql`
      SELECT 
        event_name,
        COUNT(*) as verified_customers,
        SUM(amount_paid)/100 as verified_revenue,
        STRING_AGG(camper_name, ', ') as customer_names
      FROM paid_customers 
      GROUP BY event_name
      ORDER BY verified_revenue DESC
    `;

    console.log('\n=== VERIFIED CUSTOMERS DATABASE ===');
    summary.forEach(row => {
      console.log(`${row.event_name}: ${row.verified_customers} customers - $${row.verified_revenue}`);
      console.log(`  Customers: ${row.customer_names}`);
    });

    const totals = await sql`
      SELECT 
        COUNT(*) as total_verified_customers,
        SUM(amount_paid)/100 as total_verified_revenue
      FROM paid_customers
    `;

    console.log(`\nTOTAL VERIFIED: ${totals[0].total_verified_customers} customers - $${totals[0].total_verified_revenue} revenue`);
    console.log('\n✅ Verified customers database completed with authentic data only!');

  } catch (error) {
    console.error('Error adding verified customers:', error);
  }
}

// Run the script
addVerifiedCustomers();