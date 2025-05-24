import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function getAllSuccessfulPayments() {
  try {
    console.log('Fetching ALL successful payment intents from Stripe...');
    
    // Get all successful payment intents from the last 12 months
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      created: {
        gte: Math.floor(Date.now() / 1000) - (12 * 30 * 24 * 60 * 60) // 12 months ago
      }
    });

    console.log(`Found ${paymentIntents.data.length} total payment intents`);

    // Filter for ONLY successful payments
    const successfulPayments = paymentIntents.data.filter(intent => 
      intent.status === 'succeeded'
    );

    console.log(`Found ${successfulPayments.length} SUCCESSFUL payments`);

    if (successfulPayments.length === 0) {
      console.log('No successful payments found in Stripe');
      return [];
    }

    // Format the successful payment data
    const paidCustomers = successfulPayments.map(intent => ({
      stripe_payment_intent_id: intent.id,
      amount_paid: intent.amount,
      currency: intent.currency,
      payment_date: new Date(intent.created * 1000).toISOString(),
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
      registration_type: intent.metadata.registration_type || intent.metadata.registrationType || 'full'
    }));

    console.log('\n=== ALL SUCCESSFUL PAYMENTS ===');
    paidCustomers.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.camper_name} - ${payment.event_name} - $${payment.amount_paid/100} - ${payment.payment_date.split('T')[0]}`);
    });

    console.log(`\nTOTAL: ${paidCustomers.length} successful payments worth $${paidCustomers.reduce((sum, p) => sum + p.amount_paid, 0)/100}`);

    return paidCustomers;

  } catch (error) {
    console.error('Error fetching successful payments from Stripe:', error);
    return [];
  }
}

// Run the script
getAllSuccessfulPayments().then(results => {
  if (results.length > 0) {
    console.log(`\nSuccess! Found ${results.length} successful payments ready for database insertion.`);
  } else {
    console.log('\nNo successful payments found in Stripe data.');
  }
}).catch(error => {
  console.error('Script execution failed:', error);
});