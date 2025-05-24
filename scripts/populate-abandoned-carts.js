import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function populateAbandonedCarts() {
  try {
    console.log('Fetching detailed abandoned cart data from Stripe...');
    
    // Get all payment intents from the last 6 months that were not completed
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      created: {
        gte: Math.floor(Date.now() / 1000) - (6 * 30 * 24 * 60 * 60) // 6 months ago
      }
    });

    // Filter for incomplete payment intents (abandoned carts)
    const abandonedCarts = paymentIntents.data.filter(intent => 
      intent.status !== 'succeeded' && 
      intent.status !== 'canceled' &&
      intent.metadata && (
        intent.metadata.event_name || 
        intent.metadata.eventName ||
        intent.metadata.event_id ||
        intent.metadata.eventId
      )
    );

    console.log(`Found ${abandonedCarts.length} abandoned carts for wrestling events`);

    // Insert each abandoned cart into the database
    for (const intent of abandonedCarts) {
      const eventName = intent.metadata.event_name || intent.metadata.eventName || 'Unknown Event';
      const eventId = intent.metadata.event_id || intent.metadata.eventId || null;
      const camperName = intent.metadata.camper_name || intent.metadata.camperName || 
                        `${intent.metadata.first_name || ''} ${intent.metadata.last_name || ''}`.trim() || 
                        'Not provided';
      
      try {
        await sql`
          INSERT INTO abandoned_carts (
            stripe_payment_intent_id, event_name, event_id, amount_cents,
            customer_email, camper_name, first_name, last_name, phone,
            school_name, registration_type, cart_status, cart_abandoned_date
          ) VALUES (
            ${intent.id},
            ${eventName},
            ${eventId ? parseInt(eventId) : null},
            ${intent.amount},
            ${intent.receipt_email || intent.metadata.email || null},
            ${camperName},
            ${intent.metadata.first_name || intent.metadata.firstName || null},
            ${intent.metadata.last_name || intent.metadata.lastName || null},
            ${intent.metadata.phone || null},
            ${intent.metadata.school_name || intent.metadata.schoolName || null},
            ${intent.metadata.registration_type || intent.metadata.registrationType || 'full'},
            ${intent.status},
            ${new Date(intent.created * 1000).toISOString()}
          )
          ON CONFLICT (stripe_payment_intent_id) DO NOTHING
        `;
        console.log(`✓ Inserted abandoned cart: ${camperName} - ${eventName} - $${intent.amount/100}`);
      } catch (insertError) {
        console.error(`✗ Failed to insert cart ${intent.id}:`, insertError.message);
      }
    }

    // Get summary of inserted data
    const summary = await sql`
      SELECT 
        event_name,
        COUNT(*) as cart_count,
        SUM(amount_cents)/100 as total_potential_revenue,
        cart_status
      FROM abandoned_carts 
      GROUP BY event_name, cart_status
      ORDER BY event_name, cart_status
    `;

    console.log('\n=== ABANDONED CART SUMMARY ===');
    summary.forEach(row => {
      console.log(`${row.event_name}: ${row.cart_count} carts - $${row.total_potential_revenue} potential - Status: ${row.cart_status}`);
    });

    const total = await sql`
      SELECT 
        COUNT(*) as total_carts,
        SUM(amount_cents)/100 as total_potential_revenue
      FROM abandoned_carts
    `;

    console.log(`\nTOTAL: ${total[0].total_carts} abandoned carts worth $${total[0].total_potential_revenue} in potential revenue`);
    console.log('\n✅ Abandoned cart database populated successfully!');

  } catch (error) {
    console.error('Error populating abandoned carts:', error);
  }
}

// Run the script
populateAbandonedCarts();