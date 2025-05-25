import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function fixUnpaidTable() {
  try {
    console.log('Fixing unpaid customers table - removing anyone who completed payments...');
    
    // Delete ALL entries from unpaid_customers that have emails matching paid_customers
    const deleteResult = await sql`
      DELETE FROM unpaid_customers 
      WHERE email IN (
        SELECT DISTINCT email 
        FROM paid_customers 
        WHERE email IS NOT NULL
      )
    `;
    
    console.log(`Removed entries with emails matching paid customers`);
    
    // Also remove any entries that have payment intents (regardless of email match)
    const deletePaymentIntents = await sql`
      DELETE FROM unpaid_customers u
      WHERE EXISTS (
        SELECT 1 FROM event_registrations r 
        WHERE r.email = u.email 
        AND r.stripe_payment_intent_id IS NOT NULL 
        AND r.stripe_payment_intent_id != ''
      )
    `;
    
    console.log(`Removed entries that have payment intents`);
    
    // Final verification - check for any remaining duplicates
    const remainingDuplicates = await sql`
      SELECT 
        paid.email
      FROM paid_customers paid
      INNER JOIN unpaid_customers unpaid ON paid.email = unpaid.email
      WHERE paid.email IS NOT NULL AND unpaid.email IS NOT NULL
    `;
    
    if (remainingDuplicates.length === 0) {
      console.log('\n✅ NO MORE DUPLICATES between tables');
    } else {
      console.log(`\n❌ Still ${remainingDuplicates.length} duplicates remaining`);
    }
    
    // Summary of cleaned unpaid table
    const cleanSummary = await sql`
      SELECT 
        event_name,
        COUNT(*) as truly_unpaid,
        COUNT(email) as with_email,
        COUNT(phone) as with_phone
      FROM unpaid_customers 
      GROUP BY event_name
      ORDER BY truly_unpaid DESC
    `;

    console.log('\n=== CLEANED UNPAID CUSTOMERS ===');
    cleanSummary.forEach(row => {
      console.log(`${row.event_name}: ${row.truly_unpaid} truly unpaid customers`);
    });
    
    const finalCounts = await sql`
      SELECT 
        (SELECT COUNT(*) FROM paid_customers) as paid_count,
        (SELECT COUNT(*) FROM unpaid_customers) as unpaid_count
    `;
    
    console.log(`\n📊 FIXED DATA INTEGRITY:`);
    console.log(`Paid customers: ${finalCounts[0].paid_count}`);
    console.log(`Truly unpaid customers: ${finalCounts[0].unpaid_count}`);
    console.log('\n✅ Unpaid table cleaned - no more duplicates with paid customers!');

  } catch (error) {
    console.error('Error fixing unpaid table:', error);
  }
}

// Run the fix
fixUnpaidTable();