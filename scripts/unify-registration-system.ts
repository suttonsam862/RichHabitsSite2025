
import { neon } from '@neondatabase/serverless';
import { writeFileSync } from 'fs';

const sql = neon(process.env.DATABASE_URL!);

interface RegistrationRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  eventSlug: string;
  eventName: string;
  eventId?: number;
  paymentStatus: string;
  stripePaymentIntentId?: string;
  amountPaid?: number;
  registrationDate: string;
  source: string;
}

async function unifyRegistrationSystem() {
  console.log('🚀 Starting registration system unification...');
  
  try {
    // Step 0: Verify table structures
    console.log('🔍 Verifying table structures...');
    
    const atomicColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'atomic_registrations'
    `;
    
    const eventLogColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'event_registration_log'
    `;
    
    console.log('Atomic registrations columns:', atomicColumns.map(c => c.column_name).join(', '));
    console.log('Event registration log columns:', eventLogColumns.map(c => c.column_name).join(', '));
    
    // Step 1: Collect all registration data from every table
    console.log('📊 Collecting data from all registration tables...');
    
    const allSources = await Promise.all([
      // Event registration log (primary source) - Enhanced search
      sql`
        SELECT 
          id::text,
          first_name,
          last_name,
          email,
          phone,
          event_slug,
          event_id,
          CASE 
            WHEN event_slug = 'birmingham-slam-camp' THEN 'Birmingham Slam Camp'
            WHEN event_slug = 'texas-recruiting-clinic' THEN 'Texas Recruiting Clinic'
            WHEN event_slug = 'national-champ-camp' THEN 'National Champ Camp'
            WHEN event_id = 2 THEN 'Texas Recruiting Clinic'
            ELSE COALESCE(event_slug, 'Unknown Event')
          END as event_name,
          payment_status,
          stripe_payment_intent_id,
          final_price as amount_paid,
          created_at as registration_date,
          'event_registration_log' as source_table
        FROM event_registration_log 
        WHERE email IS NOT NULL
        ORDER BY created_at ASC
      `,
      
      // Original event registrations - Enhanced search
      sql`
        SELECT 
          id::text,
          first_name,
          last_name,
          email,
          phone,
          CASE 
            WHEN event_id = 1 THEN 'birmingham-slam-camp'
            WHEN event_id = 2 THEN 'texas-recruiting-clinic' 
            WHEN event_id = 3 THEN 'national-champ-camp'
            ELSE 'unknown-event'
          END as event_slug,
          CASE 
            WHEN event_id = 1 THEN 'Birmingham Slam Camp'
            WHEN event_id = 2 THEN 'Texas Recruiting Clinic'
            WHEN event_id = 3 THEN 'National Champ Camp'
            ELSE 'Unknown Event'
          END as event_name,
          COALESCE(payment_status, 'pending') as payment_status,
          stripe_payment_intent_id,
          NULL as amount_paid,
          created_at as registration_date,
          event_id,
          'event_registrations' as source_table
        FROM event_registrations 
        WHERE email IS NOT NULL
        ORDER BY created_at ASC
      `,
      
      // Atomic registrations (bulletproof)
      sql`
        SELECT 
          uuid::text as id,
          first_name,
          last_name,
          email,
          phone,
          event_slug,
          CASE 
            WHEN event_slug = 'birmingham-slam-camp' THEN 'Birmingham Slam Camp'
            WHEN event_slug = 'texas-recruiting-clinic' THEN 'Texas Recruiting Clinic'
            WHEN event_slug = 'national-champ-camp' THEN 'National Champ Camp'
            ELSE event_slug
          END as event_name,
          payment_status,
          stripe_payment_intent_id,
          event_price_cents as amount_paid,
          created_at as registration_date,
          'atomic_registrations' as source_table
        FROM atomic_registrations 
        WHERE email IS NOT NULL
        ORDER BY created_at ASC
      `,
      
      // Verified customer registrations
      sql`
        SELECT 
          id::text,
          first_name,
          last_name,
          email,
          phone,
          CASE 
            WHEN event_name = 'Birmingham Slam Camp' THEN 'birmingham-slam-camp'
            WHEN event_name = 'Texas Recruiting Clinic' THEN 'texas-recruiting-clinic'
            WHEN event_name = 'National Champ Camp' THEN 'national-champ-camp'
            ELSE 'unknown-event'
          END as event_slug,
          event_name,
          payment_status,
          stripe_payment_intent_id,
          amount_paid,
          created_at as registration_date,
          'verified_customer_registrations' as source_table
        FROM verified_customer_registrations 
        WHERE email IS NOT NULL
        ORDER BY created_at ASC
      `
    ]);
    
    // Flatten all sources
    const allRegistrations: RegistrationRecord[] = allSources.flat();
    console.log(`📋 Found ${allRegistrations.length} total registration records across all tables`);
    
    // Step 2: Deduplicate by email + event combination
    console.log('🔄 Deduplicating registrations...');
    
    const uniqueRegistrations = new Map<string, RegistrationRecord>();
    const duplicates: RegistrationRecord[] = [];
    
    for (const reg of allRegistrations) {
      const key = `${reg.email.toLowerCase()}:${reg.eventSlug}`;
      
      if (uniqueRegistrations.has(key)) {
        const existing = uniqueRegistrations.get(key)!;
        duplicates.push(reg);
        
        // Keep the record with payment information if available
        if (reg.paymentStatus === 'paid' || reg.paymentStatus === 'succeeded') {
          uniqueRegistrations.set(key, reg);
        }
      } else {
        uniqueRegistrations.set(key, reg);
      }
    }
    
    const finalRegistrations = Array.from(uniqueRegistrations.values());
    console.log(`✅ Deduplicated to ${finalRegistrations.length} unique registrations`);
    console.log(`🗑️ Found ${duplicates.length} duplicate records`);
    
    // Step 3: Create unified export with proper event names
    console.log('📝 Creating unified registration export...');
    
    // Enhanced event name mapping
    const eventNameMap: Record<string, string> = {
      'birmingham-slam-camp': 'Birmingham Slam Camp',
      'texas-recruiting-clinic': 'Texas Recruiting Clinic', 
      'national-champ-camp': 'National Champ Camp',
      'unknown-event': 'Unknown Event',
      'texas': 'Texas Recruiting Clinic',
      'recruiting': 'Texas Recruiting Clinic',
      'clinic': 'Texas Recruiting Clinic'
    };
    
    // Function to determine event name with enhanced logic
    function getEventName(reg: RegistrationRecord): string {
      // First try the existing event name
      if (reg.eventName && reg.eventName !== 'Unknown Event') {
        return reg.eventName;
      }
      
      // Try mapping from event slug
      if (reg.eventSlug && eventNameMap[reg.eventSlug]) {
        return eventNameMap[reg.eventSlug];
      }
      
      // Try partial matching on event slug
      if (reg.eventSlug) {
        const slug = reg.eventSlug.toLowerCase();
        if (slug.includes('texas') || slug.includes('recruiting')) {
          return 'Texas Recruiting Clinic';
        }
        if (slug.includes('birmingham') || slug.includes('slam')) {
          return 'Birmingham Slam Camp';
        }
        if (slug.includes('national') || slug.includes('champ')) {
          return 'National Champ Camp';
        }
      }
      
      // Map by event ID if available
      if (reg.eventId === 1) return 'Birmingham Slam Camp';
      if (reg.eventId === 2) return 'Texas Recruiting Clinic';
      if (reg.eventId === 3) return 'National Champ Camp';
      
      return reg.eventSlug || 'Unknown Event';
    }
    
    // Ensure all registrations have proper event names
    const registrationsWithEventNames = finalRegistrations.map(reg => ({
      ...reg,
      eventName: getEventName(reg)
    }));
    
    console.log('📋 Sample registrations after event name mapping:');
    registrationsWithEventNames.slice(0, 5).forEach(reg => {
      console.log(`  - ${reg.firstName} ${reg.lastName}: ${reg.eventName} (slug: ${reg.eventSlug}, id: ${reg.eventId})`);
    });
    
    const csvHeaders = [
      'ID',
      'First Name',
      'Last Name', 
      'Email',
      'Phone',
      'Event',
      'Event Slug',
      'Payment Status',
      'Payment Intent ID',
      'Amount Paid (cents)',
      'Registration Date',
      'Source Table'
    ];
    
    const csvRows = registrationsWithEventNames.map(reg => [
      reg.id,
      reg.firstName || '',
      reg.lastName || '',
      reg.email,
      reg.phone || '',
      reg.eventName,
      reg.eventSlug,
      reg.paymentStatus,
      reg.stripePaymentIntentId || '',
      reg.amountPaid || '',
      reg.registrationDate,
      reg.source
    ]);
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(',')
      )
    ].join('\n');
    
    // Write unified export
    writeFileSync('unified-registrations.csv', csvContent);
    
    // Step 3.1: Create separate Texas Recruiting Clinic export
    console.log('📝 Creating Texas Recruiting Clinic specific export...');
    
    // Enhanced Texas Recruiting Clinic detection
    const texasRegistrations = registrationsWithEventNames.filter(reg => {
      const eventSlug = (reg.eventSlug || '').toLowerCase();
      const eventName = (reg.eventName || '').toLowerCase();
      
      return eventSlug.includes('texas') || 
             eventSlug.includes('recruiting') ||
             eventName.includes('texas') ||
             eventName.includes('recruiting') ||
             eventSlug === 'texas-recruiting-clinic' ||
             eventName === 'Texas Recruiting Clinic' ||
             reg.eventId === 2; // Texas Recruiting Clinic has event ID 2
    });
    
    console.log(`Found ${texasRegistrations.length} Texas Recruiting Clinic registrations`);
    
    // Debug: Show what events we actually found
    const uniqueEvents = [...new Set(registrationsWithEventNames.map(reg => 
      `${reg.eventSlug || 'no-slug'} | ${reg.eventName || 'no-name'} | ID: ${reg.eventId || 'no-id'}`
    ))];
    console.log('📋 All unique events found:', uniqueEvents);
    
    if (texasRegistrations.length > 0) {
      const texasCsvContent = [
        csvHeaders.join(','),
        ...texasRegistrations.map(reg => [
          reg.id,
          reg.firstName || '',
          reg.lastName || '',
          reg.email,
          reg.phone || '',
          reg.eventName,
          reg.eventSlug,
          reg.paymentStatus,
          reg.stripePaymentIntentId || '',
          reg.amountPaid || '',
          reg.registrationDate,
          reg.source
        ]).map(row => 
          row.map(cell => 
            typeof cell === 'string' && cell.includes(',') 
              ? `"${cell.replace(/"/g, '""')}"` 
              : cell
          ).join(',')
        )
      ].join('\n');
      
      writeFileSync('texas-recruiting-clinic-registrations.csv', texasCsvContent);
      console.log('✅ Texas Recruiting Clinic export created');
    } else {
      console.log('⚠️ No Texas Recruiting Clinic registrations found');
    }
    
    // Step 4: Generate summary report
    const eventSummary = finalRegistrations.reduce((acc, reg) => {
      const event = reg.eventName;
      if (!acc[event]) {
        acc[event] = { total: 0, paid: 0, pending: 0 };
      }
      acc[event].total++;
      if (reg.paymentStatus === 'paid' || reg.paymentStatus === 'succeeded') {
        acc[event].paid++;
      } else {
        acc[event].pending++;
      }
      return acc;
    }, {} as Record<string, { total: number; paid: number; pending: number }>);
    
    console.log('\n📊 UNIFIED REGISTRATION SUMMARY:');
    console.log('=====================================');
    
    let totalRegistrations = 0;
    let totalPaid = 0;
    
    Object.entries(eventSummary).forEach(([event, stats]) => {
      console.log(`${event}:`);
      console.log(`  Total: ${stats.total}`);
      console.log(`  Paid: ${stats.paid}`);
      console.log(`  Pending: ${stats.pending}`);
      console.log('');
      
      totalRegistrations += stats.total;
      totalPaid += stats.paid;
    });
    
    console.log(`OVERALL TOTALS:`);
    console.log(`Total Unique Registrations: ${totalRegistrations}`);
    console.log(`Total Paid Registrations: ${totalPaid}`);
    console.log(`Total Pending Registrations: ${totalRegistrations - totalPaid}`);
    
    // Step 5: Create backup of current tables before cleanup
    console.log('\n💾 Creating backup of existing tables...');
    
    await sql`CREATE TABLE IF NOT EXISTS backup_event_registrations AS TABLE event_registrations`;
    await sql`CREATE TABLE IF NOT EXISTS backup_completed_event_registrations AS TABLE completed_event_registrations`;
    await sql`CREATE TABLE IF NOT EXISTS backup_verified_customer_registrations AS TABLE verified_customer_registrations`;
    
    console.log('✅ Backup tables created');
    
    // Calculate Texas-specific statistics
    const texasStats = eventSummary['Texas Recruiting Clinic'] || { total: 0, paid: 0, pending: 0 };
    
    // Export detailed report
    const reportContent = `
REGISTRATION SYSTEM UNIFICATION REPORT
=====================================
Date: ${new Date().toISOString()}

SUMMARY:
- Total records found: ${allRegistrations.length}
- Unique registrations: ${finalRegistrations.length}
- Duplicate records removed: ${duplicates.length}

BY EVENT:
${Object.entries(eventSummary).map(([event, stats]) => 
  `${event}: ${stats.total} total (${stats.paid} paid, ${stats.pending} pending)`
).join('\n')}

TOTAL UNIQUE REGISTRATIONS: ${totalRegistrations}
TOTAL PAID REGISTRATIONS: ${totalPaid}

TEXAS RECRUITING CLINIC SPECIFIC:
- Total Texas registrations: ${texasStats.total}
- Paid Texas registrations: ${texasStats.paid}
- Pending Texas registrations: ${texasStats.pending}

FILES CREATED:
- unified-registrations.csv (all events with event names)
${texasStats.total > 0 ? '- texas-recruiting-clinic-registrations.csv (Texas-specific export)' : ''}
- unification-report.txt (this file)

BACKUP TABLES CREATED:
- backup_event_registrations (if exists)
- backup_completed_event_registrations (if exists)
- backup_verified_customer_registrations (if exists)
`;
    
    writeFileSync('unification-report.txt', reportContent);
    
    console.log('\n🎉 Unification complete!');
    console.log('📁 Files created:');
    console.log('  - unified-registrations.csv (all events)');
    if (texasRegistrations && texasRegistrations.length > 0) {
      console.log('  - texas-recruiting-clinic-registrations.csv (Texas-specific)');
    }
    console.log('  - unification-report.txt');
    
  } catch (error) {
    console.error('❌ Error during unification:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  unifyRegistrationSystem().catch(console.error);
}

export { unifyRegistrationSystem };
