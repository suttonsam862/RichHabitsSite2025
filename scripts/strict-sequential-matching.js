import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function strictSequentialMatching() {
  try {
    console.log('Building strict sequential matching - each payment gets the IMMEDIATELY PRIOR registration...');
    
    // Get all successful payment intents from Stripe
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

    const successfulPayments = allPaymentIntents
      .filter(intent => intent.status === 'succeeded')
      .sort((a, b) => a.created - b.created);

    console.log(`Found ${successfulPayments.length} successful payment intents`);

    // Get all registrations in strict chronological order
    const allRegistrations = await sql`
      SELECT 
        id, event_id, first_name, last_name, contact_name, email, phone, 
        school_name, club_name, registration_type, stripe_payment_intent_id, 
        created_at, payment_status, t_shirt_size, grade, age, experience,
        ROW_NUMBER() OVER (ORDER BY created_at ASC) as sequence_number
      FROM event_registrations 
      ORDER BY created_at ASC
    `;

    console.log(`Found ${allRegistrations.length} registration entries in strict order`);

    // Track used registrations by their sequence number to ensure no reuse
    const usedSequenceNumbers = new Set();

    // For each payment, find the unused registration that comes IMMEDIATELY before it
    for (const intent of successfulPayments) {
      const paymentDate = new Date(intent.created * 1000);
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      
      console.log(`\nProcessing Payment: ${intent.id} - ${eventName} - $${intent.amount/100}`);
      console.log(`Payment created at: ${paymentDate.toISOString()}`);
      
      // Find the registration IMMEDIATELY PRIOR to this payment (and not already used)
      let priorRegistration = null;
      
      // Start from the end and work backwards to find the most recent unused registration before payment
      for (let i = allRegistrations.length - 1; i >= 0; i--) {
        const registration = allRegistrations[i];
        const registrationDate = new Date(registration.created_at);
        
        // Must be before payment time AND not already used
        if (registrationDate < paymentDate && !usedSequenceNumbers.has(registration.sequence_number)) {
          priorRegistration = registration;
          break; // Take the first (most recent) available registration before payment
        }
      }
      
      // Mark this registration as used
      if (priorRegistration) {
        usedSequenceNumbers.add(priorRegistration.sequence_number);
      }
      
      const reg = priorRegistration;
      
      await sql`
        INSERT INTO paid_customers (
          stripe_payment_intent_id, event_name, camper_name, first_name, last_name,
          email, phone, school_name, registration_type, amount_paid, payment_date
        ) VALUES (
          ${intent.id},
          ${eventName},
          ${reg?.contact_name || null},
          ${reg?.first_name || null},
          ${reg?.last_name || null},
          ${reg?.email || null},
          ${reg?.phone || null},
          ${reg?.school_name || null},
          ${reg?.registration_type || null},
          ${intent.amount},
          ${paymentDate.toISOString()}
        )
      `;
      
      if (priorRegistration) {
        const regDate = new Date(priorRegistration.created_at);
        const timeDiff = paymentDate - regDate;
        const minutes = Math.floor(timeDiff / 60000);
        const seconds = Math.floor((timeDiff % 60000) / 1000);
        
        console.log(`  ✓ Prior registration: ${reg.first_name} ${reg.last_name} (${reg.email}) - Seq #${reg.sequence_number}`);
        console.log(`    Registration: ${regDate.toISOString()}`);
        console.log(`    Time after registration: ${minutes} minutes, ${seconds} seconds`);
      } else {
        console.log(`  ⚠ No prior registration available`);
      }
    }

    // Check for any duplicate emails
    const duplicateCheck = await sql`
      SELECT 
        email, COUNT(*) as count,
        STRING_AGG(stripe_payment_intent_id, ', ') as payment_ids
      FROM paid_customers 
      WHERE email IS NOT NULL
      GROUP BY email
      HAVING COUNT(*) > 1
    `;

    if (duplicateCheck.length === 0) {
      console.log('\n✅ NO DUPLICATES - Each registration used only once!');
    } else {
      console.log(`\n⚠ Found ${duplicateCheck.length} duplicate emails:`);
      duplicateCheck.forEach(dup => {
        console.log(`  - ${dup.email}: ${dup.count} entries (${dup.payment_ids})`);
      });
    }

    // Verify Ameer Hasty specifically
    const ameerCheck = await sql`
      SELECT stripe_payment_intent_id, event_name, camper_name, first_name, last_name, email
      FROM paid_customers 
      WHERE first_name ILIKE '%ameer%' OR camper_name ILIKE '%ameer%'
    `;
    
    if (ameerCheck.length > 0) {
      console.log('\n🔍 Ameer Hasty verification:');
      ameerCheck.forEach(entry => {
        console.log(`  ${entry.first_name} ${entry.last_name} -> ${entry.event_name} (${entry.stripe_payment_intent_id})`);
      });
    }

    const finalCount = await sql`SELECT COUNT(*) as count FROM paid_customers`;
    console.log(`\nTotal payments stored: ${finalCount[0].count}`);
    console.log('\n✅ Strict sequential matching completed!');

  } catch (error) {
    console.error('Error in strict sequential matching:', error);
  }
}

// Run the script
strictSequentialMatching();