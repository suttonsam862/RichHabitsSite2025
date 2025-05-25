import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function createTrueUnpaidCustomers() {
  try {
    console.log('Finding contact info for people NOT associated with anyone in paid customers...');
    
    // Get ALL unique contact info from registrations that isn't associated with paid customers
    const unpaidContacts = await sql`
      SELECT DISTINCT ON (reg.email)
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
        CASE 
          WHEN reg.event_id = 1 THEN 'Birmingham Slam Camp'
          WHEN reg.event_id = 2 THEN 'Texas Recruiting Clinic' 
          WHEN reg.event_id = 3 THEN 'National Champ Camp'
          ELSE 'Unknown Event'
        END as event_name
      FROM event_registrations reg
      WHERE reg.email IS NOT NULL 
      AND reg.email NOT IN (
        SELECT DISTINCT email 
        FROM paid_customers 
        WHERE email IS NOT NULL
      )
      ORDER BY reg.email, reg.created_at DESC
    `;
    
    console.log(`Found ${unpaidContacts.length} people with contact info who are NOT in paid customers`);
    
    // Insert these truly unpaid/unmatched customers
    for (const contact of unpaidContacts) {
      await sql`
        INSERT INTO unpaid_customers (
          first_name, last_name, contact_name, email, phone,
          school_name, club_name, event_name, registration_type, 
          created_at, payment_status
        ) VALUES (
          ${contact.first_name},
          ${contact.last_name}, 
          ${contact.contact_name},
          ${contact.email},
          ${contact.phone},
          ${contact.school_name},
          ${contact.club_name},
          ${contact.event_name},
          ${contact.registration_type},
          ${contact.created_at},
          ${contact.payment_status}
        )
      `;
    }
    
    // Summary of truly unpaid customers
    const summary = await sql`
      SELECT 
        event_name,
        COUNT(*) as unpaid_registrations,
        COUNT(phone) as with_phone,
        COUNT(school_name) as with_school
      FROM unpaid_customers 
      GROUP BY event_name
      ORDER BY unpaid_registrations DESC
    `;

    console.log('\n=== TRUE UNPAID CUSTOMERS SUMMARY ===');
    summary.forEach(row => {
      console.log(`${row.event_name}: ${row.unpaid_registrations} unpaid registrations`);
      console.log(`  - With phone: ${row.with_phone}`);
      console.log(`  - With school: ${row.with_school}`);
    });

    // Show examples of unpaid customers
    const examples = await sql`
      SELECT first_name, last_name, email, phone, event_name, payment_status
      FROM unpaid_customers 
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log('\n=== EXAMPLES OF UNPAID CUSTOMERS ===');
    examples.forEach(customer => {
      console.log(`${customer.first_name} ${customer.last_name} (${customer.email}) - ${customer.event_name} [${customer.payment_status}]`);
    });

    const totalUnpaid = await sql`SELECT COUNT(*) as count FROM unpaid_customers`;
    const totalPaid = await sql`SELECT COUNT(*) as count FROM paid_customers`;
    
    console.log(`\n📊 FINAL BREAKDOWN:`);
    console.log(`Paid customers: ${totalPaid[0].count}`);
    console.log(`Unpaid customers: ${totalUnpaid[0].count}`);
    console.log(`Total unique people: ${totalPaid[0].count + totalUnpaid[0].count}`);
    console.log('\n✅ True unpaid customers identified!');

  } catch (error) {
    console.error('Error creating true unpaid customers:', error);
  }
}

// Run the script
createTrueUnpaidCustomers();