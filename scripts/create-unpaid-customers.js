import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function createUnpaidCustomers() {
  try {
    console.log('Creating unpaid customers table with people NOT in paid_customers...');
    
    // Clear the unpaid_customers table
    await sql`TRUNCATE TABLE unpaid_customers RESTART IDENTITY`;
    
    // Get all emails that are already in the paid_customers table
    const paidEmails = await sql`
      SELECT DISTINCT email 
      FROM paid_customers 
      WHERE email IS NOT NULL
    `;
    
    const paidEmailList = paidEmails.map(row => row.email);
    console.log(`Found ${paidEmailList.length} emails in paid customers table`);
    
    // Get all registration entries that are NOT in the paid customers table
    const unpaidRegistrations = await sql`
      SELECT DISTINCT ON (email)
        first_name, last_name, contact_name, email, phone, 
        school_name, club_name, registration_type, created_at, payment_status,
        CASE 
          WHEN event_id = 1 THEN 'Birmingham Slam Camp'
          WHEN event_id = 2 THEN 'Texas Recruiting Clinic' 
          WHEN event_id = 3 THEN 'National Champ Camp'
          ELSE 'Unknown Event'
        END as event_name
      FROM event_registrations 
      WHERE email IS NOT NULL 
      AND email NOT IN (${paidEmailList.length > 0 ? sql`SELECT UNNEST(${paidEmailList})` : sql`SELECT NULL WHERE FALSE`})
      ORDER BY email, created_at DESC
    `;
    
    console.log(`Found ${unpaidRegistrations.length} unpaid customers`);
    
    // Insert unpaid customers into the new table
    for (const customer of unpaidRegistrations) {
      await sql`
        INSERT INTO unpaid_customers (
          first_name, last_name, contact_name, email, phone,
          school_name, club_name, event_name, registration_type, 
          created_at, payment_status
        ) VALUES (
          ${customer.first_name},
          ${customer.last_name}, 
          ${customer.contact_name},
          ${customer.email},
          ${customer.phone},
          ${customer.school_name},
          ${customer.club_name},
          ${customer.event_name},
          ${customer.registration_type},
          ${customer.created_at},
          ${customer.payment_status}
        )
      `;
    }
    
    // Summary by event
    const summary = await sql`
      SELECT 
        event_name,
        COUNT(*) as unpaid_customers,
        COUNT(phone) as with_phone,
        COUNT(school_name) as with_school
      FROM unpaid_customers 
      GROUP BY event_name
      ORDER BY unpaid_customers DESC
    `;

    console.log('\n=== UNPAID CUSTOMERS SUMMARY ===');
    summary.forEach(row => {
      console.log(`${row.event_name}: ${row.unpaid_customers} customers`);
      console.log(`  - With phone: ${row.with_phone}`);
      console.log(`  - With school: ${row.with_school}`);
    });

    // Sample of unpaid customers
    const samples = await sql`
      SELECT first_name, last_name, email, phone, event_name
      FROM unpaid_customers 
      ORDER BY created_at DESC
      LIMIT 5
    `;

    console.log('\n=== SAMPLE UNPAID CUSTOMERS ===');
    samples.forEach(customer => {
      console.log(`${customer.first_name} ${customer.last_name} (${customer.email}) - ${customer.event_name}`);
    });

    const totalUnpaid = await sql`SELECT COUNT(*) as count FROM unpaid_customers`;
    console.log(`\nTotal unpaid customers: ${totalUnpaid[0].count}`);
    console.log('\n✅ Unpaid customers table created successfully!');

  } catch (error) {
    console.error('Error creating unpaid customers:', error);
  }
}

// Run the script
createUnpaidCustomers();