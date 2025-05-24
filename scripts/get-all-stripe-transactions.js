import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getAllStripeTransactions() {
  try {
    console.log('Fetching ALL Stripe transactions (payment intents, charges, and checkout sessions)...');
    
    // Get all payment intents from last 12 months with higher limit
    const allPaymentIntents = [];
    let hasMore = true;
    let startingAfter = null;
    
    while (hasMore) {
      const params = {
        limit: 100,
        created: {
          gte: Math.floor(Date.now() / 1000) - (12 * 30 * 24 * 60 * 60) // 12 months ago
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

    console.log(`Found ${allPaymentIntents.length} total payment intents`);

    // Separate successful vs failed payments
    const successfulPayments = allPaymentIntents.filter(intent => intent.status === 'succeeded');
    const failedPayments = allPaymentIntents.filter(intent => intent.status !== 'succeeded');

    console.log(`Successful payments: ${successfulPayments.length}`);
    console.log(`Failed/incomplete payments: ${failedPayments.length}`);

    // Also check charges (in case some payments went through charges API)
    const charges = await stripe.charges.list({
      limit: 100,
      created: {
        gte: Math.floor(Date.now() / 1000) - (12 * 30 * 24 * 60 * 60)
      }
    });

    const successfulCharges = charges.data.filter(charge => charge.status === 'succeeded');
    console.log(`Successful charges: ${successfulCharges.length}`);

    // Also check checkout sessions
    const checkoutSessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: {
        gte: Math.floor(Date.now() / 1000) - (12 * 30 * 24 * 60 * 60)
      }
    });

    const completedSessions = checkoutSessions.data.filter(session => session.status === 'complete');
    console.log(`Completed checkout sessions: ${completedSessions.length}`);

    console.log('\n=== BREAKDOWN BY DATE ===');
    const paymentsByDate = {};
    
    successfulPayments.forEach(intent => {
      const date = new Date(intent.created * 1000).toISOString().split('T')[0];
      if (!paymentsByDate[date]) paymentsByDate[date] = [];
      paymentsByDate[date].push({
        id: intent.id,
        amount: intent.amount / 100,
        event: intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown'
      });
    });

    Object.keys(paymentsByDate).sort().reverse().forEach(date => {
      console.log(`\n${date}: ${paymentsByDate[date].length} payments`);
      paymentsByDate[date].forEach(payment => {
        console.log(`  - $${payment.amount} (${payment.event}) - ${payment.id}`);
      });
    });

    console.log(`\n=== TOTAL SUMMARY ===`);
    console.log(`Payment Intents (successful): ${successfulPayments.length}`);
    console.log(`Charges (successful): ${successfulCharges.length}`);
    console.log(`Checkout Sessions (completed): ${completedSessions.length}`);
    console.log(`Total revenue from payment intents: $${successfulPayments.reduce((sum, p) => sum + p.amount, 0) / 100}`);

    return {
      paymentIntents: successfulPayments,
      charges: successfulCharges,
      checkoutSessions: completedSessions
    };

  } catch (error) {
    console.error('Error fetching Stripe transactions:', error);
    return null;
  }
}

// Run the script
getAllStripeTransactions();