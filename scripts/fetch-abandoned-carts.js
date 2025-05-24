import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function fetchAbandonedCarts() {
  try {
    console.log('Fetching abandoned checkout sessions from Stripe...');
    
    // Get all payment intents from the last 6 months that were not completed
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      created: {
        gte: Math.floor(Date.now() / 1000) - (6 * 30 * 24 * 60 * 60) // 6 months ago
      }
    });

    console.log(`Found ${paymentIntents.data.length} payment intents total`);

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

    if (abandonedCarts.length === 0) {
      console.log('No abandoned carts found in Stripe for wrestling events');
      return [];
    }

    // Format the abandoned cart data
    const formattedAbandonedCarts = abandonedCarts.map(intent => ({
      stripe_payment_intent_id: intent.id,
      status: intent.status,
      amount: intent.amount,
      currency: intent.currency,
      created: new Date(intent.created * 1000).toISOString(),
      customer_email: intent.receipt_email || intent.metadata.email || 'Not provided',
      event_name: intent.metadata.event_name || intent.metadata.eventName || 'Unknown Event',
      event_id: intent.metadata.event_id || intent.metadata.eventId || null,
      camper_name: intent.metadata.camper_name || intent.metadata.camperName || 
                   `${intent.metadata.first_name || ''} ${intent.metadata.last_name || ''}`.trim() || 
                   'Not provided',
      first_name: intent.metadata.first_name || intent.metadata.firstName || 'Not provided',
      last_name: intent.metadata.last_name || intent.metadata.lastName || 'Not provided',
      phone: intent.metadata.phone || 'Not provided',
      school_name: intent.metadata.school_name || intent.metadata.schoolName || 'Not provided',
      registration_type: intent.metadata.registration_type || intent.metadata.registrationType || 'full',
      last_updated: new Date(intent.created * 1000).toISOString()
    }));

    console.log('Abandoned cart summary:');
    formattedAbandonedCarts.forEach((cart, index) => {
      console.log(`${index + 1}. ${cart.camper_name} - ${cart.event_name} - $${cart.amount/100} - ${cart.status}`);
    });

    return formattedAbandonedCarts;

  } catch (error) {
    console.error('Error fetching abandoned carts from Stripe:', error);
    return [];
  }
}

// Run the script
fetchAbandonedCarts().then(results => {
  if (results.length > 0) {
    console.log(`\nSuccess! Found ${results.length} abandoned carts ready for database insertion.`);
  } else {
    console.log('\nNo abandoned carts found in Stripe data.');
  }
}).catch(error => {
  console.error('Script execution failed:', error);
});