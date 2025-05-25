import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function collectAllLooseData() {
  try {
    console.log('Collecting ALL loose data not associated with any payment intents...');
    
    // Clear the unpaid_customers table to include ALL loose data
    await sql`TRUNCATE TABLE unpaid_customers RESTART IDENTITY`;
    
    // Get ALL registration entries that don't have payment intent associations
    const allLooseData = await sql`
      SELECT 
        reg.id,
        reg.first_name, 
        reg.last_name, 
        reg.contact_name, 
        reg.email, 
        reg.phone, 
        reg.school_name, 
        reg.club_name, 
        reg.registration_type, 
        reg.created_at, 
        reg.payment_status,
        reg.age,
        reg.grade,
        reg.t_shirt_size,
        reg.experience,
        reg.stripe_payment_intent_id,
        CASE 
          WHEN reg.event_id = 1 THEN 'Birmingham Slam Camp'
          WHEN reg.event_id = 2 THEN 'Texas Recruiting Clinic' 
          WHEN reg.event_id = 3 THEN 'National Champ Camp'
          ELSE 'Unknown Event'
        END as event_name
      FROM event_registrations reg
      WHERE reg.stripe_payment_intent_id IS NULL 
      OR reg.stripe_payment_intent_id = ''
      OR reg.payment_status != 'completed'
      ORDER BY reg.created_at DESC
    `;
    
    console.log(`Found ${allLooseData.length} loose registration entries without payment intent associations`);
    
    // Insert ALL loose data into unpaid_customers table
    for (const data of allLooseData) {
      await sql`
        INSERT INTO unpaid_customers (
          first_name, last_name, contact_name, email, phone,
          school_name, club_name, event_name, registration_type, 
          created_at, payment_status
        ) VALUES (
          ${data.first_name || null},
          ${data.last_name || null}, 
          ${data.contact_name || null},
          ${data.email || null},
          ${data.phone || null},
          ${data.school_name || null},
          ${data.club_name || null},
          ${data.event_name || null},
          ${data.registration_type || null},
          ${data.created_at || null},
          ${data.payment_status || null}
        )
      `;
    }
    
    // Summary of all loose data
    const eventSummary = await sql`
      SELECT 
        event_name,
        COUNT(*) as total_entries,
        COUNT(email) as with_email,
        COUNT(phone) as with_phone,
        COUNT(school_name) as with_school
      FROM unpaid_customers 
      GROUP BY event_name
      ORDER BY total_entries DESC
    `;

    console.log('\n=== ALL LOOSE DATA SUMMARY ===');
    eventSummary.forEach(row => {
      console.log(`${row.event_name}: ${row.total_entries} entries`);
      console.log(`  - With email: ${row.with_email}`);
      console.log(`  - With phone: ${row.with_phone}`);
      console.log(`  - With school: ${row.with_school}`);
    });

    // Payment status breakdown
    const statusSummary = await sql`
      SELECT 
        payment_status,
        COUNT(*) as count
      FROM unpaid_customers 
      GROUP BY payment_status
      ORDER BY count DESC
    `;

    console.log('\n=== PAYMENT STATUS BREAKDOWN ===');
    statusSummary.forEach(row => {
      console.log(`${row.payment_status || 'NULL'}: ${row.count} entries`);
    });

    // Show sample entries
    const samples = await sql`
      SELECT first_name, last_name, email, phone, event_name, payment_status
      FROM unpaid_customers 
      WHERE email IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log('\n=== SAMPLE LOOSE DATA ENTRIES ===');
    samples.forEach(entry => {
      console.log(`${entry.first_name || 'NULL'} ${entry.last_name || 'NULL'} (${entry.email || 'NULL'}) - ${entry.event_name || 'NULL'} [${entry.payment_status || 'NULL'}]`);
    });

    // Final counts
    const totalLoose = await sql`SELECT COUNT(*) as count FROM unpaid_customers`;
    const totalPaid = await sql`SELECT COUNT(*) as count FROM paid_customers`;
    const withEmail = await sql`SELECT COUNT(*) as count FROM unpaid_customers WHERE email IS NOT NULL`;
    const withPhone = await sql`SELECT COUNT(*) as count FROM unpaid_customers WHERE phone IS NOT NULL`;
    
    console.log(`\n📊 COMPLETE DATA BREAKDOWN:`);
    console.log(`Paid customers (with payment intents): ${totalPaid[0].count}`);
    console.log(`Loose data entries (no payment intents): ${totalLoose[0].count}`);
    console.log(`Loose entries with email: ${withEmail[0].count}`);
    console.log(`Loose entries with phone: ${withPhone[0].count}`);
    console.log('\n✅ All loose data collected and stored!');

  } catch (error) {
    console.error('Error collecting loose data:', error);
  }
}

// Run the script
collectAllLooseData();