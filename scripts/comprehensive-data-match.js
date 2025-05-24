import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

async function comprehensiveDataMatch() {
  try {
    console.log('Starting comprehensive data matching across ALL databases...');
    
    // Get ALL unique successful payment intents with no duplicates
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

    // Get only unique successful payments
    const uniqueSuccessfulPayments = allPaymentIntents
      .filter(intent => intent.status === 'succeeded')
      .reduce((unique, intent) => {
        if (!unique.find(u => u.id === intent.id)) {
          unique.push(intent);
        }
        return unique;
      }, []);

    console.log(`Found ${uniqueSuccessfulPayments.length} unique successful payments`);

    // Get ALL registration data from EVERY possible table
    const allRegistrationSources = await Promise.all([
      sql`SELECT *, 'verified_customer_registrations' as source_table FROM verified_customer_registrations`,
      sql`SELECT *, 'event_registrations' as source_table FROM event_registrations WHERE email IS NOT NULL`,
      sql`SELECT *, 'completed_event_registrations' as source_table FROM completed_event_registrations WHERE email IS NOT NULL`,
      sql`SELECT *, 'complete_registrations' as source_table FROM complete_registrations WHERE email IS NOT NULL`,
      sql`SELECT *, 'verified_registrations' as source_table FROM verified_registrations WHERE email IS NOT NULL`
    ]);

    // Flatten all registration sources into one comprehensive list
    const allRegistrations = allRegistrationSources.flat();
    console.log(`Found ${allRegistrations.length} total registration records across all tables`);

    // Process each unique payment intent
    for (const intent of uniqueSuccessfulPayments) {
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      const paymentDate = new Date(intent.created * 1000);
      
      console.log(`\nProcessing payment: ${intent.id} - ${eventName} - $${intent.amount/100} - ${paymentDate.toISOString().split('T')[0]}`);
      
      // Find ALL possible registration matches that occurred BEFORE this payment
      const possibleMatches = allRegistrations.filter(reg => {
        const regDate = new Date(reg.payment_date || reg.created_at || reg.registration_date);
        return regDate <= paymentDate && 
               (reg.event_name === eventName || 
                reg.event_name?.toLowerCase().includes(eventName.toLowerCase()) ||
                eventName.toLowerCase().includes(reg.event_name?.toLowerCase() || ''));
      });

      console.log(`  Found ${possibleMatches.length} possible registration matches`);

      // Find the best match (closest in time, most complete data)
      let bestMatch = null;
      let shortestTimeDiff = Infinity;
      
      for (const reg of possibleMatches) {
        const regDate = new Date(reg.payment_date || reg.created_at || reg.registration_date);
        const timeDiff = Math.abs(paymentDate - regDate);
        
        // Prefer matches within 7 days with complete data
        if (timeDiff < 7 * 24 * 60 * 60 * 1000) {
          const dataCompleteness = (reg.email ? 1 : 0) + (reg.phone ? 1 : 0) + (reg.camper_name ? 1 : 0);
          
          if (timeDiff < shortestTimeDiff || (timeDiff === shortestTimeDiff && dataCompleteness > 2)) {
            shortestTimeDiff = timeDiff;
            bestMatch = reg;
          }
        }
      }
      
      // Insert the unique payment with best matched registration data
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
          ${bestMatch?.school_name || bestMatch?.school || null},
          ${bestMatch?.registration_type || 'full'},
          ${intent.amount},
          ${paymentDate.toISOString()}
        )
      `;
      
      if (bestMatch) {
        console.log(`  ✓ Matched with: ${bestMatch.camper_name} (${bestMatch.email}) from ${bestMatch.source_table}`);
      } else {
        console.log(`  ⚠ No registration match found`);
      }
    }

    // Final verification - check for any duplicates
    const duplicateCheck = await sql`
      SELECT stripe_payment_intent_id, COUNT(*) as count 
      FROM paid_customers 
      GROUP BY stripe_payment_intent_id 
      HAVING COUNT(*) > 1
    `;

    if (duplicateCheck.length > 0) {
      console.log(`WARNING: Found ${duplicateCheck.length} duplicate payment intents!`);
    } else {
      console.log('✓ No duplicates found - all payment intents are unique');
    }

    // Get final summary
    const summary = await sql`
      SELECT 
        event_name,
        COUNT(*) as unique_payments,
        COUNT(email) as with_registration_data,
        SUM(amount_paid)/100 as revenue
      FROM paid_customers 
      GROUP BY event_name
      ORDER BY revenue DESC
    `;

    console.log('\n=== FINAL COMPREHENSIVE DATABASE ===');
    summary.forEach(row => {
      const matchRate = ((row.with_registration_data / row.unique_payments) * 100).toFixed(1);
      console.log(`${row.event_name}: ${row.with_registration_data}/${row.unique_payments} matched (${matchRate}%) - $${row.revenue}`);
    });

    const totals = await sql`
      SELECT 
        COUNT(*) as total_unique_payments,
        COUNT(email) as matched_with_data,
        SUM(amount_paid)/100 as total_revenue
      FROM paid_customers
    `;

    console.log(`\nTOTAL: ${totals[0].matched_with_data}/${totals[0].total_unique_payments} unique payments with registration data`);
    console.log(`Revenue: $${totals[0].total_revenue}`);
    console.log('\n✅ Comprehensive paid customers database completed!');

  } catch (error) {
    console.error('Error in comprehensive data matching:', error);
  }
}

// Run the script
comprehensiveDataMatch();