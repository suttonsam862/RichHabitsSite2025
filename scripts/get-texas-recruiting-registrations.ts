
import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';
import { writeFileSync } from 'fs';

async function getTexasRecruitingRegistrations() {
  try {
    console.log('🔍 Searching for Texas Recruiting Clinic registrations...');
    
    // Search across multiple tables for Texas Recruiting Clinic registrations
    
    // 1. Check event_registration_log table
    const logRegistrations = await db.execute(sql`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        event_slug,
        event_id,
        grade,
        school_name,
        club_name,
        t_shirt_size,
        registration_type,
        payment_status,
        stripe_payment_intent_id,
        final_price,
        created_at,
        'event_registration_log' as source_table
      FROM event_registration_log 
      WHERE 
        LOWER(event_slug) LIKE '%texas%' 
        OR LOWER(event_slug) LIKE '%recruiting%'
        OR event_id = 3
        OR event_id = 2
      ORDER BY created_at DESC
    `);
    
    // 2. Check completed_event_registrations table
    const completedRegistrations = await db.execute(sql`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        event_id,
        grade,
        school_name,
        club_name,
        t_shirt_size,
        registration_type,
        stripe_payment_intent_id,
        shopify_order_id,
        completed_date,
        'completed_event_registrations' as source_table
      FROM completed_event_registrations 
      WHERE event_id = 3 OR event_id = 2
      ORDER BY completed_date DESC
    `);
    
    // 3. Check event_registrations table
    const eventRegistrations = await db.execute(sql`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        event_id,
        event_slug,
        grade,
        school_name,
        club_name,
        t_shirt_size,
        registration_type,
        payment_status,
        stripe_payment_intent_id,
        shopify_order_id,
        created_at,
        'event_registrations' as source_table
      FROM event_registrations 
      WHERE 
        event_id = 3 
        OR event_id = 2
        OR LOWER(event_slug) LIKE '%texas%'
        OR LOWER(event_slug) LIKE '%recruiting%'
      ORDER BY created_at DESC
    `);
    
    // 4. Check complete_registrations table
    const completeRegistrations = await db.execute(sql`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        event_id,
        event_name,
        grade,
        school_name,
        club_name,
        t_shirt_size,
        registration_type,
        amount_paid,
        stripe_payment_intent_id,
        shopify_order_id,
        payment_date,
        'complete_registrations' as source_table
      FROM complete_registrations 
      WHERE 
        event_id = 3 
        OR event_id = 2
        OR LOWER(event_name) LIKE '%texas%'
        OR LOWER(event_name) LIKE '%recruiting%'
      ORDER BY payment_date DESC
    `);
    
    // 5. Get event information
    const events = await db.execute(sql`
      SELECT id, title, slug FROM events 
      WHERE id IN (2, 3) OR LOWER(title) LIKE '%texas%' OR LOWER(title) LIKE '%recruiting%'
    `);
    
    console.log('📊 Search Results:');
    console.log(`Event Registration Log: ${logRegistrations.rows.length} records`);
    console.log(`Completed Event Registrations: ${completedRegistrations.rows.length} records`);
    console.log(`Event Registrations: ${eventRegistrations.rows.length} records`);
    console.log(`Complete Registrations: ${completeRegistrations.rows.length} records`);
    
    console.log('\n🎯 Available Events:');
    events.rows.forEach(event => {
      console.log(`  ID: ${event.id} | Title: ${event.title} | Slug: ${event.slug}`);
    });
    
    // Combine all results
    const allRegistrations = [
      ...logRegistrations.rows,
      ...completedRegistrations.rows,
      ...eventRegistrations.rows,
      ...completeRegistrations.rows
    ];
    
    // Deduplicate by email
    const uniqueRegistrations = new Map();
    
    allRegistrations.forEach(reg => {
      const key = `${reg.email}-${reg.event_id || 'unknown'}`;
      if (!uniqueRegistrations.has(key) || 
          (reg.payment_status === 'paid' || reg.payment_status === 'succeeded')) {
        uniqueRegistrations.set(key, reg);
      }
    });
    
    const finalRegistrations = Array.from(uniqueRegistrations.values());
    
    console.log(`\n✅ Found ${finalRegistrations.length} unique Texas Recruiting Clinic registrations`);
    
    // Create detailed report
    const csvHeaders = [
      'ID',
      'First Name',
      'Last Name', 
      'Email',
      'Phone',
      'Event ID',
      'Event Slug',
      'Grade',
      'School Name',
      'Club Name',
      'T-Shirt Size',
      'Registration Type',
      'Payment Status',
      'Amount Paid',
      'Stripe Payment Intent',
      'Shopify Order ID',
      'Registration Date',
      'Source Table'
    ];
    
    const csvContent = [
      csvHeaders.join(','),
      ...finalRegistrations.map(reg => [
        reg.id || '',
        reg.first_name || '',
        reg.last_name || '',
        reg.email || '',
        reg.phone || '',
        reg.event_id || '',
        reg.event_slug || '',
        reg.grade || '',
        reg.school_name || '',
        reg.club_name || '',
        reg.t_shirt_size || '',
        reg.registration_type || '',
        reg.payment_status || '',
        reg.amount_paid || reg.final_price || '',
        reg.stripe_payment_intent_id || '',
        reg.shopify_order_id || '',
        reg.created_at || reg.completed_date || reg.payment_date || '',
        reg.source_table || ''
      ]).map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(',')
      )
    ].join('\n');
    
    // Save to file
    writeFileSync('texas-recruiting-clinic-registrations.csv', csvContent);
    
    // Display summary
    console.log('\n📋 TEXAS RECRUITING CLINIC REGISTRATIONS:');
    console.log('===========================================');
    
    finalRegistrations.forEach((reg, index) => {
      console.log(`${index + 1}. ${reg.first_name} ${reg.last_name}`);
      console.log(`   Email: ${reg.email}`);
      console.log(`   School: ${reg.school_name || 'Not provided'}`);
      console.log(`   Grade: ${reg.grade || 'Not provided'}`);
      console.log(`   Payment: ${reg.payment_status || 'Unknown'}`);
      console.log(`   Source: ${reg.source_table}`);
      console.log('   ---');
    });
    
    console.log(`\n💾 Report saved to: texas-recruiting-clinic-registrations.csv`);
    console.log(`📊 Total registrations: ${finalRegistrations.length}`);
    
    // Count by payment status
    const paymentSummary = finalRegistrations.reduce((acc, reg) => {
      const status = reg.payment_status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n💰 Payment Status Summary:');
    Object.entries(paymentSummary).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error finding Texas Recruiting Clinic registrations:', error);
    throw error;
  }
}

// Run the function
getTexasRecruitingRegistrations()
  .then(() => {
    console.log('✅ Texas Recruiting Clinic registration search completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to find registrations:', error);
    process.exit(1);
  });
