import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function verifyDataIntegrity() {
  try {
    console.log('Verifying data integrity between paid and unpaid customers tables...');
    
    // Check for duplicate emails between paid and unpaid tables
    const duplicateEmails = await sql`
      SELECT 
        paid.email as paid_email,
        unpaid.email as unpaid_email,
        paid.first_name as paid_first_name,
        paid.last_name as paid_last_name,
        unpaid.first_name as unpaid_first_name,
        unpaid.last_name as unpaid_last_name
      FROM paid_customers paid
      INNER JOIN unpaid_customers unpaid ON paid.email = unpaid.email
      WHERE paid.email IS NOT NULL AND unpaid.email IS NOT NULL
    `;

    if (duplicateEmails.length > 0) {
      console.log(`\n❌ FOUND ${duplicateEmails.length} DUPLICATE EMAILS BETWEEN TABLES:`);
      duplicateEmails.forEach(dup => {
        console.log(`  - ${dup.paid_email}: ${dup.paid_first_name} ${dup.paid_last_name} (PAID) vs ${dup.unpaid_first_name} ${dup.unpaid_last_name} (UNPAID)`);
      });
    } else {
      console.log('\n✅ NO DUPLICATE EMAILS between paid and unpaid tables');
    }

    // Check for duplicate names between tables
    const duplicateNames = await sql`
      SELECT 
        paid.first_name || ' ' || paid.last_name as paid_name,
        unpaid.first_name || ' ' || unpaid.last_name as unpaid_name,
        paid.email as paid_email,
        unpaid.email as unpaid_email
      FROM paid_customers paid
      INNER JOIN unpaid_customers unpaid ON 
        LOWER(paid.first_name) = LOWER(unpaid.first_name) 
        AND LOWER(paid.last_name) = LOWER(unpaid.last_name)
      WHERE paid.first_name IS NOT NULL AND paid.last_name IS NOT NULL
        AND unpaid.first_name IS NOT NULL AND unpaid.last_name IS NOT NULL
    `;

    if (duplicateNames.length > 0) {
      console.log(`\n⚠ FOUND ${duplicateNames.length} MATCHING NAMES BETWEEN TABLES:`);
      duplicateNames.forEach(dup => {
        console.log(`  - ${dup.paid_name} (${dup.paid_email}) in PAID vs ${dup.unpaid_name} (${dup.unpaid_email}) in UNPAID`);
      });
    } else {
      console.log('\n✅ NO MATCHING NAMES between tables');
    }

    // Verify that unpaid customers truly have no payment intents
    const unpaidWithPaymentIntents = await sql`
      SELECT DISTINCT
        u.first_name,
        u.last_name,
        u.email,
        r.stripe_payment_intent_id,
        r.payment_status
      FROM unpaid_customers u
      INNER JOIN event_registrations r ON u.email = r.email
      WHERE r.stripe_payment_intent_id IS NOT NULL 
        AND r.stripe_payment_intent_id != ''
        AND u.email IS NOT NULL
    `;

    if (unpaidWithPaymentIntents.length > 0) {
      console.log(`\n❌ FOUND ${unpaidWithPaymentIntents.length} UNPAID CUSTOMERS WITH PAYMENT INTENTS:`);
      unpaidWithPaymentIntents.forEach(customer => {
        console.log(`  - ${customer.first_name} ${customer.last_name} (${customer.email}) has payment intent: ${customer.stripe_payment_intent_id}`);
      });
    } else {
      console.log('\n✅ ALL unpaid customers truly have NO payment intents');
    }

    // Count totals
    const paidCount = await sql`SELECT COUNT(*) as count FROM paid_customers`;
    const unpaidCount = await sql`SELECT COUNT(*) as count FROM unpaid_customers`;
    const totalUniqueEmails = await sql`
      SELECT COUNT(DISTINCT email) as count 
      FROM (
        SELECT email FROM paid_customers WHERE email IS NOT NULL
        UNION
        SELECT email FROM unpaid_customers WHERE email IS NOT NULL
      ) as all_emails
    `;

    console.log(`\n📊 DATA INTEGRITY SUMMARY:`);
    console.log(`Paid customers: ${paidCount[0].count}`);
    console.log(`Unpaid customers: ${unpaidCount[0].count}`);
    console.log(`Total unique emails: ${totalUniqueEmails[0].count}`);
    console.log(`Expected total if no duplicates: ${paidCount[0].count + unpaidCount[0].count}`);

    if (totalUniqueEmails[0].count === paidCount[0].count + unpaidCount[0].count) {
      console.log('\n✅ PERFECT DATA INTEGRITY - No duplicates between tables!');
    } else {
      console.log('\n❌ DATA INTEGRITY ISSUE - Duplicates detected!');
    }

  } catch (error) {
    console.error('Error verifying data integrity:', error);
  }
}

// Run the verification
verifyDataIntegrity();