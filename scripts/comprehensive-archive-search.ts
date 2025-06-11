import { neon } from '@neondatabase/serverless';
import { writeFileSync } from 'fs';

const sql = neon(process.env.DATABASE_URL!);

interface ComprehensiveRegistration {
  // Core identification
  id: string;
  uuid?: string;
  source_table: string;

  // Personal information
  first_name: string;
  last_name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  date_of_birth?: string;

  // Event information
  event_id?: string;
  event_slug?: string;
  event_name?: string;
  camp_date?: string;

  // Athletic information
  age?: number;
  grade?: string;
  weight?: string;
  gender?: string;
  experience?: string;
  experience_level?: string;

  // School/Club information
  school_name?: string;
  club_name?: string;
  team_name?: string;

  // Registration details
  registration_type?: string;
  shirt_size?: string;
  gear_selection?: any;
  selected_days?: any;

  // Parent/Guardian information
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;

  // Pricing and payment
  base_price?: number;
  discount_code?: string;
  discount_amount?: number;
  final_price?: number;
  amount_paid?: number;
  payment_status?: string;
  payment_method?: string;

  // External references
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
  stripe_client_secret?: string;
  shopify_order_id?: string;

  // Waivers and agreements
  waiver_accepted?: boolean;
  waiver_signed_at?: string;
  terms_accepted?: boolean;

  // Session and tracking
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;
  confirmed_at?: string;

  // Status flags
  status?: string;
  is_archived?: boolean;

  // Additional fields that might exist
  [key: string]: any;
}

async function comprehensiveArchiveSearch() {
  try {
    console.log('🔍 Starting comprehensive archive search...');
    console.log('📊 Identifying all registration-related tables...');

    // Get all tables that might contain registration data
    const allTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (
        table_name LIKE '%registration%' 
        OR table_name LIKE '%customer%'
        OR table_name LIKE '%event%'
        OR table_name LIKE '%atomic%'
        OR table_name LIKE '%complete%'
        OR table_name LIKE '%verified%'
        OR table_name LIKE '%payment%'
      )
      ORDER BY table_name
    `;

    console.log('📋 Found registration tables:', allTables.map(t => t.table_name).join(', '));

    // Get all available events from the events table
    const events = await sql`
      SELECT 
        id,
        slug,
        title as event_name
      FROM events
      ORDER BY id
    `;

    console.log('🎯 Found events:');
    events.forEach(event => {
      console.log(`  - Event ID ${event.id}: ${event.event_name} (${event.slug})`);
    });

    // Comprehensive data collection from all possible sources
    console.log('📊 Collecting data from all registration sources...');

    const allRegistrationSources = [];

    // Check if event_registrations table exists and collect data
    try {
      const eventRegistrations = await sql`
        SELECT 
          id::text,
          'event_registrations' as source_table,
          "firstName" as first_name,
          "lastName" as last_name,
          email,
          phone,
          "eventId" as event_id,
          grade,
          "schoolName" as school_name,
          "clubName" as club_name,
          "shirtSize" as shirt_size,
          "registrationType" as registration_type,
          "teamName" as team_name,
          "selectedDays" as selected_days,
          "gearSelection" as gear_selection,
          "basePrice" as base_price,
          "discountCode" as discount_code,
          "discountAmount" as discount_amount,
          "finalPrice" as final_price,
          status,
          "waiverAccepted" as waiver_accepted,
          "waiverSignedAt" as waiver_signed_at,
          "termsAccepted" as terms_accepted,
          "sessionId" as session_id,
          "ipAddress" as ip_address,
          "userAgent" as user_agent,
          "deviceType" as device_type,
          "confirmedAt" as confirmed_at,
          "createdAt" as created_at,
          "updatedAt" as updated_at
        FROM event_registrations 
        WHERE email IS NOT NULL
        ORDER BY "createdAt" ASC
      `;
      allRegistrationSources.push(...eventRegistrations);
      console.log(`✅ Found ${eventRegistrations.length} records in event_registrations`);
    } catch (error) {
      console.log('⚠️ event_registrations table not found or error accessing it');
    }

    // Check for atomic_registrations table
    try {
      const atomicRegistrations = await sql`
        SELECT 
          uuid::text as id,
          'atomic_registrations' as source_table,
          first_name,
          last_name,
          contact_name,
          email,
          phone,
          event_slug,
          age,
          weight,
          grade,
          gender,
          tshirt_size as shirt_size,
          school_name,
          experience_level,
          club_name,
          payment_status,
          stripe_customer_id,
          stripe_client_secret,
          registration_source,
          ip_address,
          user_agent,
          data_checksum,
          system_version,
          stripe_payment_intent_id,
          event_price_cents,
          payment_completed_at,
          created_at
        FROM atomic_registrations 
        WHERE email IS NOT NULL
        ORDER BY created_at ASC
      `;
      allRegistrationSources.push(...atomicRegistrations);
      console.log(`✅ Found ${atomicRegistrations.length} records in atomic_registrations`);
    } catch (error) {
      console.log('⚠️ atomic_registrations table not found or error accessing it');
    }

    // Check for any other registration tables that might exist
    for (const table of allTables) {
      const tableName = table.table_name;
      if (tableName === 'event_registrations' || tableName === 'atomic_registrations' || tableName === 'events') {
        continue; // Already processed
      }

      try {
        // Get table structure first
        const columns = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = ${tableName}
          AND column_name IN ('id', 'email', 'first_name', 'last_name', 'firstName', 'lastName')
        `;

        if (columns.length > 0) {
          const hasEmail = columns.some(c => c.column_name === 'email');
          const hasFirstName = columns.some(c => c.column_name === 'first_name' || c.column_name === 'firstName');
          const hasLastName = columns.some(c => c.column_name === 'last_name' || c.column_name === 'lastName');

          if (hasEmail && hasFirstName && hasLastName) {
            console.log(`🔍 Checking table: ${tableName}`);
            const data = await sql`SELECT * FROM ${sql(tableName)} WHERE email IS NOT NULL LIMIT 100`;
            if (data.length > 0) {
              data.forEach(record => {
                record.source_table = tableName;
                record.id = record.id?.toString() || Math.random().toString();
              });
              allRegistrationSources.push(...data);
              console.log(`✅ Found ${data.length} records in ${tableName}`);
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Error accessing table ${tableName}:`, error.message);
      }
    }

    console.log(`📋 Found ${allRegistrationSources.length} total registration records across all tables`);

    if (allRegistrationSources.length === 0) {
      console.log('❌ No registration data found in any tables');
      return;
    }

    // Enhanced deduplication with complete data preservation
    console.log('🔄 Deduplicating while preserving all unique registrations...');

    const uniqueRegistrations = new Map<string, ComprehensiveRegistration>();
    const duplicateGroups = new Map<string, ComprehensiveRegistration[]>();

    for (const reg of allRegistrationSources) {
      if (!reg.email) continue;

      // Determine event info
      const eventId = reg.event_id || reg.eventId || (
        reg.event_slug === 'birmingham-slam-camp' ? '1' :
        reg.event_slug === 'texas-recruiting-clinic' ? '2' :
        reg.event_slug === 'national-champ-camp' ? '3' : '0'
      );

      const eventName = reg.event_name || (
        eventId === '1' ? 'Birmingham Slam Camp' :
        eventId === '2' ? 'Texas Recruiting Clinic' :
        eventId === '3' ? 'National Champ Camp' :
        reg.event_slug || 'Unknown Event'
      );

      // Create comprehensive registration record
      const comprehensiveReg: ComprehensiveRegistration = {
        id: reg.id?.toString() || Math.random().toString(),
        source_table: reg.source_table,
        first_name: reg.first_name || reg.firstName || '',
        last_name: reg.last_name || reg.lastName || '',
        email: reg.email,
        phone: reg.phone,
        event_id: eventId,
        event_name: eventName,
        event_slug: reg.event_slug,
        grade: reg.grade,
        school_name: reg.school_name || reg.schoolName,
        club_name: reg.club_name || reg.clubName,
        shirt_size: reg.shirt_size || reg.shirtSize || reg.tshirt_size,
        registration_type: reg.registration_type || reg.registrationType,
        team_name: reg.team_name || reg.teamName,
        payment_status: reg.payment_status || reg.status,
        stripe_payment_intent_id: reg.stripe_payment_intent_id,
        created_at: reg.created_at || reg.createdAt,
        ...reg // Include all other fields
      };

      const key = `${reg.email.toLowerCase()}:${eventId}`;

      if (uniqueRegistrations.has(key)) {
        // Store duplicate
        if (!duplicateGroups.has(key)) {
          duplicateGroups.set(key, [uniqueRegistrations.get(key)!]);
        }
        duplicateGroups.get(key)!.push(comprehensiveReg);

        // Keep the most complete record (prefer paid over pending, newer over older)
        const existing = uniqueRegistrations.get(key)!;
        if (
          (comprehensiveReg.payment_status === 'paid' || comprehensiveReg.payment_status === 'succeeded' || comprehensiveReg.payment_status === 'completed') &&
          existing.payment_status !== 'paid' && existing.payment_status !== 'succeeded' && existing.payment_status !== 'completed'
        ) {
          uniqueRegistrations.set(key, comprehensiveReg);
        } else if (
          comprehensiveReg.stripe_payment_intent_id && !existing.stripe_payment_intent_id
        ) {
          uniqueRegistrations.set(key, comprehensiveReg);
        }
      } else {
        uniqueRegistrations.set(key, comprehensiveReg);
      }
    }

    const finalRegistrations = Array.from(uniqueRegistrations.values());
    console.log(`✅ Deduplicated to ${finalRegistrations.length} unique registrations`);
    console.log(`🔄 Found ${duplicateGroups.size} sets of duplicates`);

    // Create comprehensive tables for each event
    console.log('🗃️ Creating comprehensive registration tables...');

    // First, create a master comprehensive table
    await sql`DROP TABLE IF EXISTS comprehensive_registrations`;
    await sql`
      CREATE TABLE comprehensive_registrations (
        id TEXT PRIMARY KEY,
        source_table TEXT NOT NULL,

        -- Personal information
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        contact_name TEXT,
        email TEXT NOT NULL,
        phone TEXT,

        -- Event information
        event_id TEXT,
        event_slug TEXT,
        event_name TEXT,

        -- Athletic information
        age INTEGER,
        grade TEXT,
        weight TEXT,
        gender TEXT,
        experience TEXT,
        experience_level TEXT,

        -- School/Club information
        school_name TEXT,
        club_name TEXT,
        team_name TEXT,

        -- Registration details
        registration_type TEXT,
        shirt_size TEXT,
        gear_selection JSONB,
        selected_days JSONB,

        -- Pricing and payment
        base_price DECIMAL(10,2),
        discount_code TEXT,
        discount_amount DECIMAL(10,2),
        final_price DECIMAL(10,2),
        payment_status TEXT,
        payment_method TEXT,

        -- External references
        stripe_payment_intent_id TEXT,
        stripe_customer_id TEXT,
        shopify_order_id TEXT,

        -- Waivers and agreements
        waiver_accepted BOOLEAN,
        terms_accepted BOOLEAN,
        waiver_signed_at TIMESTAMP,

        -- Session and tracking
        session_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        device_type TEXT,

        -- Timestamps
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        confirmed_at TIMESTAMP,
        confirmed_at TIMESTAMP,

        -- Status flags
        status TEXT,
        is_archived BOOLEAN DEFAULT FALSE,

        -- Metadata
        raw_data JSONB,

        -- Indexes for performance
        UNIQUE(email, event_id)
      )
    `;

    // Insert all comprehensive registrations
    for (const reg of finalRegistrations) {
      await sql`
        INSERT INTO comprehensive_registrations (
          id, source_table, first_name, last_name, contact_name, email, phone,
          event_id, event_slug, event_name, age, grade, weight, gender,
          experience, experience_level, school_name, club_name, team_name,
          registration_type, shirt_size, gear_selection, selected_days,
          base_price, discount_code, discount_amount, final_price,
          payment_status, payment_method, stripe_payment_intent_id, 
          stripe_customer_id, shopify_order_id, waiver_accepted, terms_accepted,
          waiver_signed_at, session_id, ip_address, user_agent, device_type,
          created_at, updated_at, confirmed_at, status, is_archived, raw_data
        ) VALUES (
          ${reg.id}, ${reg.source_table}, ${reg.first_name}, ${reg.last_name},
          ${reg.contact_name}, ${reg.email}, ${reg.phone}, ${reg.event_id}, 
          ${reg.event_slug}, ${reg.event_name}, ${reg.age}, ${reg.grade}, 
          ${reg.weight}, ${reg.gender}, ${reg.experience}, ${reg.experience_level},
          ${reg.school_name}, ${reg.club_name}, ${reg.team_name}, ${reg.registration_type},
          ${reg.shirt_size}, ${reg.gear_selection ? JSON.stringify(reg.gear_selection) : null},
          ${reg.selected_days ? JSON.stringify(reg.selected_days) : null}, 
          ${reg.base_price}, ${reg.discount_code}, ${reg.discount_amount}, 
          ${reg.final_price}, ${reg.payment_status}, ${reg.payment_method},
          ${reg.stripe_payment_intent_id}, ${reg.stripe_customer_id}, 
          ${reg.shopify_order_id}, ${reg.waiver_accepted}, ${reg.terms_accepted},
          ${reg.waiver_signed_at}, ${reg.session_id}, ${reg.ip_address}, 
          ${reg.user_agent}, ${reg.device_type}, ${reg.created_at}, 
          ${reg.updated_at}, ${reg.confirmed_at}, ${reg.status}, 
          ${reg.is_archived || false}, ${JSON.stringify(reg)}
        )
        ON CONFLICT (email, event_id) DO UPDATE SET
          source_table = EXCLUDED.source_table,
          payment_status = EXCLUDED.payment_status,
          stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
          updated_at = EXCLUDED.updated_at,
          raw_data = EXCLUDED.raw_data
      `;
    }

    console.log(`✅ Inserted ${finalRegistrations.length} comprehensive registrations`);

    // Create event-specific tables
    const eventGroups = new Map<string, ComprehensiveRegistration[]>();

    for (const reg of finalRegistrations) {
      const eventKey = reg.event_slug || `event_${reg.event_id}`;
      if (!eventGroups.has(eventKey)) {
        eventGroups.set(eventKey, []);
      }
      eventGroups.get(eventKey)!.push(reg);
    }

    for (const [eventSlug, registrations] of eventGroups) {
      if (registrations.length === 0) continue;

      const tableName = `comprehensive_${eventSlug.replace(/-/g, '_')}_registrations`;
      console.log(`📊 Creating table: ${tableName} with ${registrations.length} registrations`);

      // Drop and recreate event-specific table
      await sql`DROP TABLE IF EXISTS ${sql(tableName)}`;
      await sql`
        CREATE TABLE ${sql(tableName)} (
          id TEXT PRIMARY KEY,
          source_table TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          grade TEXT,
          school_name TEXT,
          club_name TEXT,
          registration_type TEXT,
          shirt_size TEXT,
          payment_status TEXT,
          stripe_payment_intent_id TEXT,
          created_at TIMESTAMP,
          raw_data JSONB
        )
      `;

      // Insert registrations for this event
      for (const reg of registrations) {
        await sql`
          INSERT INTO ${sql(tableName)} (
            id, source_table, first_name, last_name, email, phone, grade,
            school_name, club_name, registration_type, shirt_size,
            payment_status, stripe_payment_intent_id, created_at, raw_data
          ) VALUES (
            ${reg.id}, ${reg.source_table}, ${reg.first_name}, ${reg.last_name},
            ${reg.email}, ${reg.phone}, ${reg.grade}, ${reg.school_name},
            ${reg.club_name}, ${reg.registration_type}, ${reg.shirt_size},
            ${reg.payment_status}, ${reg.stripe_payment_intent_id}, 
            ${reg.created_at}, ${JSON.stringify(reg)}
          )
        `;
      }
    }

    // Generate comprehensive summary report
    const finalSummary = await sql`
      SELECT 
        event_name,
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN payment_status IN ('paid', 'succeeded', 'completed') THEN 1 END) as paid_registrations,
        COUNT(CASE WHEN payment_status NOT IN ('paid', 'succeeded', 'completed') OR payment_status IS NULL THEN 1 END) as pending_registrations,
        COUNT(DISTINCT source_table) as source_tables
      FROM comprehensive_registrations
      GROUP BY event_name
      ORDER BY event_name
    `;

    // Create detailed CSV export
    const csvHeaders = [
      'ID', 'Source Table', 'First Name', 'Last Name', 'Email', 'Phone', 'Event',
      'Grade', 'School', 'Club', 'Shirt Size', 'Payment Status', 'Amount Paid',
      'Stripe Payment Intent', 'Registration Date', 'All Fields (JSON)'
    ];

    const csvRows = finalRegistrations.map(reg => [
      reg.id,
      reg.source_table,
      reg.first_name,
      reg.last_name,
      reg.email,
      reg.phone || '',
      reg.event_name,
      reg.grade || '',
      reg.school_name || '',
      reg.club_name || '',
      reg.shirt_size || '',
      reg.payment_status || '',
      reg.final_price || reg.base_price || '',
      reg.stripe_payment_intent_id || '',
      reg.created_at || '',
      JSON.stringify(reg)
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

    writeFileSync('comprehensive-registrations-export.csv', csvContent);

    console.log('\n🎉 COMPREHENSIVE ARCHIVE SEARCH COMPLETE!');
    console.log('=====================================');
    console.log('📊 SUMMARY BY EVENT:');
    finalSummary.forEach(summary => {
      console.log(`${summary.event_name}:`);
      console.log(`  Total: ${summary.total_registrations}`);
      console.log(`  Paid: ${summary.paid_registrations}`);
      console.log(`  Pending: ${summary.pending_registrations}`);
      console.log(`  Sources: ${summary.source_tables}`);
      console.log('');
    });

    console.log('🗃️ TABLES CREATED:');
    console.log('  - comprehensive_registrations (master table)');
    Array.from(eventGroups.keys()).forEach(eventSlug => {
      console.log(`  - comprehensive_${eventSlug.replace(/-/g, '_')}_registrations`);
    });

    console.log('\n📁 FILES CREATED:');
    console.log('  - comprehensive-registrations-export.csv');

    console.log('\n✨ All registration data has been comprehensively archived with complete field information!');

  } catch (error) {
    console.error('❌ Error during comprehensive archive search:', error);
    throw error;
  }
}

// Run the comprehensive search
comprehensiveArchiveSearch()
  .then(() => {
    console.log('✅ Comprehensive archive search completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Comprehensive archive search failed:', error);
    process.exit(1);
  });