import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function extractCustomerEmails() {
  try {
    console.log('Extracting customer contact information from Stripe payment intents...');
    
    // Get all abandoned carts from our database
    const abandonedCarts = await sql`
      SELECT stripe_payment_intent_id, event_name, amount_cents
      FROM abandoned_carts 
      WHERE customer_email IS NULL OR customer_email = ''
    `;

    console.log(`Found ${abandonedCarts.length} abandoned carts missing contact information`);

    let updatedCount = 0;
    let emailsFound = 0;

    for (const cart of abandonedCarts) {
      try {
        console.log(`\nProcessing payment intent: ${cart.stripe_payment_intent_id}`);
        
        // Get detailed payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(cart.stripe_payment_intent_id, {
          expand: ['customer', 'latest_charge', 'latest_charge.billing_details']
        });

        let customerEmail = null;
        let customerName = null;
        let customerPhone = null;

        // Extract email from multiple sources
        if (paymentIntent.receipt_email) {
          customerEmail = paymentIntent.receipt_email;
          console.log(`✓ Found receipt email: ${customerEmail}`);
        } else if (paymentIntent.metadata?.email) {
          customerEmail = paymentIntent.metadata.email;
          console.log(`✓ Found metadata email: ${customerEmail}`);
        } else if (paymentIntent.customer && typeof paymentIntent.customer === 'object') {
          customerEmail = paymentIntent.customer.email;
          console.log(`✓ Found customer email: ${customerEmail}`);
        } else if (paymentIntent.latest_charge?.billing_details?.email) {
          customerEmail = paymentIntent.latest_charge.billing_details.email;
          console.log(`✓ Found billing email: ${customerEmail}`);
        }

        // Extract name information
        if (paymentIntent.metadata?.first_name && paymentIntent.metadata?.last_name) {
          customerName = `${paymentIntent.metadata.first_name} ${paymentIntent.metadata.last_name}`;
        } else if (paymentIntent.metadata?.camper_name) {
          customerName = paymentIntent.metadata.camper_name;
        } else if (paymentIntent.latest_charge?.billing_details?.name) {
          customerName = paymentIntent.latest_charge.billing_details.name;
        }

        // Extract phone
        if (paymentIntent.metadata?.phone) {
          customerPhone = paymentIntent.metadata.phone;
        } else if (paymentIntent.latest_charge?.billing_details?.phone) {
          customerPhone = paymentIntent.latest_charge.billing_details.phone;
        }

        // Update the database with any information we found
        if (customerEmail || customerName || customerPhone) {
          await sql`
            UPDATE abandoned_carts 
            SET 
              customer_email = ${customerEmail || null},
              camper_name = ${customerName || camper_name},
              first_name = ${paymentIntent.metadata?.first_name || null},
              last_name = ${paymentIntent.metadata?.last_name || null},
              phone = ${customerPhone || null}
            WHERE stripe_payment_intent_id = ${cart.stripe_payment_intent_id}
          `;
          
          updatedCount++;
          if (customerEmail) emailsFound++;
          
          console.log(`✓ Updated: ${customerName || 'Unknown'} - ${customerEmail || 'No email'} - ${customerPhone || 'No phone'}`);
        } else {
          console.log(`✗ No contact information found for ${cart.stripe_payment_intent_id}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`✗ Error processing ${cart.stripe_payment_intent_id}:`, error.message);
      }
    }

    // Get updated summary
    const summary = await sql`
      SELECT 
        event_name,
        COUNT(*) as total_carts,
        COUNT(customer_email) as carts_with_email,
        SUM(amount_cents)/100 as potential_revenue
      FROM abandoned_carts 
      GROUP BY event_name
      ORDER BY event_name
    `;

    console.log('\n=== UPDATED ABANDONED CART SUMMARY ===');
    summary.forEach(row => {
      const emailRate = ((row.carts_with_email / row.total_carts) * 100).toFixed(1);
      console.log(`${row.event_name}: ${row.carts_with_email}/${row.total_carts} emails (${emailRate}%) - $${row.potential_revenue} potential`);
    });

    const totals = await sql`
      SELECT 
        COUNT(*) as total_carts,
        COUNT(customer_email) as total_with_email,
        SUM(amount_cents)/100 as total_potential_revenue
      FROM abandoned_carts
    `;

    const totalEmailRate = ((totals[0].total_with_email / totals[0].total_carts) * 100).toFixed(1);
    console.log(`\nTOTAL: ${totals[0].total_with_email}/${totals[0].total_carts} emails (${totalEmailRate}%) - $${totals[0].total_potential_revenue} potential revenue`);
    console.log(`\n✅ Successfully updated ${updatedCount} abandoned carts with ${emailsFound} email addresses!`);

  } catch (error) {
    console.error('Error extracting customer emails:', error);
  }
}

// Run the script
extractCustomerEmails();