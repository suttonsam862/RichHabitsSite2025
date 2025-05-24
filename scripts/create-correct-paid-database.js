import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function createCorrectPaidDatabase() {
  try {
    console.log('Creating correct database with all 36 successful payments...');
    
    // Clear existing table and recreate
    await sql`DROP TABLE IF EXISTS paid_customers`;
    
    await sql`
      CREATE TABLE paid_customers (
        id SERIAL PRIMARY KEY,
        stripe_payment_intent_id TEXT UNIQUE NOT NULL,
        event_name TEXT NOT NULL,
        camper_name TEXT,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        school_name TEXT,
        registration_type TEXT,
        amount_paid INTEGER NOT NULL,
        payment_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

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

    const successfulPayments = allPaymentIntents.filter(intent => intent.status === 'succeeded');
    
    console.log(`Found ${successfulPayments.length} successful payments. Inserting into database...`);

    // Insert each successful payment
    for (const intent of successfulPayments) {
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      const camperName = intent.metadata?.camper_name || intent.metadata?.camperName || 
                        `${intent.metadata?.first_name || ''} ${intent.metadata?.last_name || ''}`.trim() || 
                        null;
      
      await sql`
        INSERT INTO paid_customers (
          stripe_payment_intent_id, event_name, camper_name, first_name, last_name,
          email, phone, school_name, registration_type, amount_paid, payment_date
        ) VALUES (
          ${intent.id},
          ${eventName},
          ${camperName},
          ${intent.metadata?.first_name || intent.metadata?.firstName || null},
          ${intent.metadata?.last_name || intent.metadata?.lastName || null},
          ${intent.receipt_email || intent.metadata?.email || null},
          ${intent.metadata?.phone || null},
          ${intent.metadata?.school_name || intent.metadata?.schoolName || null},
          ${intent.metadata?.registration_type || intent.metadata?.registrationType || 'full'},
          ${intent.amount},
          ${new Date(intent.created * 1000).toISOString()}
        )
        ON CONFLICT (stripe_payment_intent_id) DO NOTHING
      `;
    }

    // Get summary by event
    const summary = await sql`
      SELECT 
        event_name,
        COUNT(*) as customer_count,
        SUM(amount_paid)/100 as total_revenue
      FROM paid_customers 
      GROUP BY event_name
      ORDER BY total_revenue DESC
    `;

    console.log('\n=== PAID CUSTOMERS DATABASE SUMMARY ===');
    summary.forEach(row => {
      console.log(`${row.event_name}: ${row.customer_count} customers - $${row.total_revenue} revenue`);
    });

    const totals = await sql`
      SELECT 
        COUNT(*) as total_customers,
        SUM(amount_paid)/100 as total_revenue
      FROM paid_customers
    `;

    console.log(`\nTOTAL: ${totals[0].total_customers} paid customers - $${totals[0].total_revenue} total revenue`);
    console.log('\n✅ Correct paid customers database created successfully!');

  } catch (error) {
    console.error('Error creating paid customers database:', error);
  }
}

// Run the script
createCorrectPaidDatabase();