
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
  event_id?: number;
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
  t_shirt_size?: string;
  tshirt_size?: string;
  gear_selection?: any;
  selected_days?: any;
  day1?: boolean;
  day2?: boolean;
  day3?: boolean;
  
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
  event_price_cents?: number;
  payment_status?: string;
  payment_method?: string;
  
  // External references
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
  stripe_client_secret?: string;
  shopify_order_id?: string;
  invoice_reference?: string;
  
  // Waivers and agreements
  waiver_accepted?: boolean;
  medical_release_accepted?: boolean;
  terms_accepted?: boolean;
  waiver_signed_at?: string;
  
  // Session and tracking
  form_session_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  registration_source?: string;
  data_source?: string;
  
  // Metadata and checksums
  data_checksum?: string;
  system_version?: string;
  metadata?: any;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  payment_completed_at?: string;
  confirmed_at?: string;
  payment_date?: string;
  completed_date?: string;
  registration_date?: string;
  
  // Status flags
  is_archived?: boolean;
  recovered?: boolean;
  
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
      )
      ORDER BY table_name
    `;
    
    console.log('📋 Found registration tables:', allTables.map(t => t.table_name).join(', '));
    
    // Get all available events
    const events = await sql`
      SELECT DISTINCT 
        COALESCE(event_id, 0) as event_id,
        CASE 
          WHEN event_id = 1 OR event_slug = 'birmingham-slam-camp' THEN 'Birmingham Slam Camp'
          WHEN event_id = 2 OR event_slug = 'texas-recruiting-clinic' THEN 'Texas Recruiting Clinic'
          WHEN event_id = 3 OR event_slug = 'national-champ-camp' THEN 'National Champ Camp'
          ELSE COALESCE(event_slug, 'Unknown Event')
        END as event_name,
        COALESCE(event_slug, 'unknown') as event_slug
      FROM (
        SELECT event_id, event_slug FROM event_registration_log WHERE event_id IS NOT NULL OR event_slug IS NOT NULL
        UNION
        SELECT event_id, NULL as event_slug FROM event_registrations WHERE event_id IS NOT NULL
        UNION
        SELECT event_id, NULL as event_slug FROM completed_event_registrations WHERE event_id IS NOT NULL
        UNION
        SELECT NULL as event_id, event_slug FROM atomic_registrations WHERE event_slug IS NOT NULL
      ) combined_events
      ORDER BY event_id
    `;
    
    console.log('🎯 Found events:');
    events.forEach(event => {
      console.log(`  - Event ID ${event.event_id}: ${event.event_name} (${event.event_slug})`);
    });
    
    // Comprehensive data collection from all possible sources
    console.log('📊 Collecting data from all registration sources...');
    
    const allRegistrationSources = await Promise.all([
      // Event registration log (primary unified source)
      sql`
        SELECT 
          id::text,
          'event_registration_log' as source_table,
          first_name,
          last_name,
          email,
          phone,
          event_id,
          event_slug,
          camp_date,
          team_name,
          grade,
          school_name,
          club_name,
          t_shirt_size,
          gender,
          experience,
          registration_type,
          day1,
          day2,
          day3,
          gear_selection,
          base_price,
          discount_code,
          discount_amount,
          final_price,
          payment_status,
          payment_method,
          stripe_payment_intent_id,
          form_session_id,
          ip_address,
          user_agent,
          device_type,
          medical_release_accepted,
          terms_accepted,
          data_source,
          created_at,
          updated_at
        FROM event_registration_log 
        WHERE email IS NOT NULL
        ORDER BY created_at ASC
      `,
      
      // Atomic registrations (bulletproof system)
      sql`
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
          tshirt_size,
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
      `,
      
      // Event registrations (original system)
      sql`
        SELECT 
          id::text,
          'event_registrations' as source_table,
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
          payment_status,
          stripe_payment_intent_id,
          shopify_order_id,
          created_at
        FROM event_registrations 
        WHERE email IS NOT NULL
        ORDER BY created_at ASC
      `,
      
      // Completed event registrations
      sql`
        SELECT 
          id::text,
          'completed_event_registrations' as source_table,
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
          created_at
        FROM completed_event_registrations 
        WHERE email IS NOT NULL
        ORDER BY created_at ASC
      `,
      
      // Complete registrations
      sql`
        SELECT 
          id::text,
          'complete_registrations' as source_table,
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
          created_at
        FROM complete_registrations 
        WHERE email IS NOT NULL
        ORDER BY payment_date ASC
      `,
      
      // Verified customer registrations
      sql`
        SELECT 
          id::text,
          'verified_customer_registrations' as source_table,
          first_name,
          last_name,
          email,
          phone,
          event_name,
          grade,
          school_name,
          club_name,
          t_shirt_size,
          registration_type,
          payment_status,
          amount_paid,
          stripe_payment_intent_id,
          created_at
        FROM verified_customer_registrations 
        WHERE email IS NOT NULL
        ORDER BY created_at ASC
      `
    ]);
    
    // Flatten all sources
    const allRegistrations: ComprehensiveRegistration[] = allRegistrationSources.flat();
    console.log(`📋 Found ${allRegistrations.length} total registration records across all tables`);
    
    // Enhanced deduplication with complete data preservation
    console.log('🔄 Deduplicating while preserving all unique registrations...');
    
    const uniqueRegistrations = new Map<string, ComprehensiveRegistration>();
    const duplicateGroups = new Map<string, ComprehensiveRegistration[]>();
    
    for (const reg of allRegistrations) {
      // Determine event info
      const eventId = reg.event_id || (
        reg.event_slug === 'birmingham-slam-camp' ? 1 :
        reg.event_slug === 'texas-recruiting-clinic' ? 2 :
        reg.event_slug === 'national-champ-camp' ? 3 : 0
      );
      
      const eventName = reg.event_name || (
        eventId === 1 ? 'Birmingham Slam Camp' :
        eventId === 2 ? 'Texas Recruiting Clinic' :
        eventId === 3 ? 'National Champ Camp' :
        reg.event_slug || 'Unknown Event'
      );
      
      // Create comprehensive registration record
      const comprehensiveReg: ComprehensiveRegistration = {
        ...reg,
        event_id: eventId,
        event_name: eventName,
        event_slug: reg.event_slug || (
          eventId === 1 ? 'birmingham-slam-camp' :
          eventId === 2 ? 'texas-recruiting-clinic' :
          eventId === 3 ? 'national-champ-camp' : 'unknown'
        )
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
          (comprehensiveReg.payment_status === 'paid' || comprehensiveReg.payment_status === 'succeeded') &&
          existing.payment_status !== 'paid' && existing.payment_status !== 'succeeded'
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
        uuid TEXT,
        source_table TEXT NOT NULL,
        
        -- Personal information
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        contact_name TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        date_of_birth TIMESTAMP,
        
        -- Event information
        event_id INTEGER,
        event_slug TEXT,
        event_name TEXT,
        camp_date TEXT,
        
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
        t_shirt_size TEXT,
        tshirt_size TEXT,
        gear_selection JSONB,
        selected_days JSONB,
        day1 BOOLEAN,
        day2 BOOLEAN,
        day3 BOOLEAN,
        
        -- Parent/Guardian information
        parent_name TEXT,
        parent_email TEXT,
        parent_phone TEXT,
        
        -- Pricing and payment
        base_price DECIMAL(10,2),
        discount_code TEXT,
        discount_amount DECIMAL(10,2),
        final_price DECIMAL(10,2),
        amount_paid DECIMAL(10,2),
        event_price_cents INTEGER,
        payment_status TEXT,
        payment_method TEXT,
        
        -- External references
        stripe_payment_intent_id TEXT,
        stripe_customer_id TEXT,
        stripe_client_secret TEXT,
        shopify_order_id TEXT,
        invoice_reference TEXT,
        
        -- Waivers and agreements
        waiver_accepted BOOLEAN,
        medical_release_accepted BOOLEAN,
        terms_accepted BOOLEAN,
        waiver_signed_at TIMESTAMP,
        
        -- Session and tracking
        form_session_id TEXT,
        session_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        device_type TEXT,
        registration_source TEXT,
        data_source TEXT,
        
        -- Metadata and checksums
        data_checksum TEXT,
        system_version TEXT,
        metadata JSONB,
        
        -- Timestamps
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        payment_completed_at TIMESTAMP,
        confirmed_at TIMESTAMP,
        payment_date TIMESTAMP,
        completed_date TIMESTAMP,
        registration_date TIMESTAMP,
        
        -- Status flags
        is_archived BOOLEAN DEFAULT FALSE,
        recovered BOOLEAN,
        
        -- Indexes for performance
        UNIQUE(email, event_id)
      )
    `;
    
    // Insert all comprehensive registrations
    for (const reg of finalRegistrations) {
      await sql`
        INSERT INTO comprehensive_registrations (
          id, uuid, source_table, first_name, last_name, contact_name, email, phone,
          event_id, event_slug, event_name, camp_date, age, grade, weight, gender,
          experience, experience_level, school_name, club_name, team_name,
          registration_type, t_shirt_size, tshirt_size, gear_selection, selected_days,
          day1, day2, day3, base_price, discount_code, discount_amount, final_price,
          amount_paid, event_price_cents, payment_status, payment_method,
          stripe_payment_intent_id, stripe_customer_id, stripe_client_secret,
          shopify_order_id, medical_release_accepted, terms_accepted,
          form_session_id, ip_address, user_agent, device_type, registration_source,
          data_source, data_checksum, system_version, created_at, updated_at,
          payment_completed_at, payment_date, completed_date, is_archived, recovered
        ) VALUES (
          ${reg.id}, ${reg.uuid}, ${reg.source_table}, ${reg.first_name}, ${reg.last_name},
          ${reg.contact_name}, ${reg.email}, ${reg.phone}, ${reg.event_id}, ${reg.event_slug},
          ${reg.event_name}, ${reg.camp_date}, ${reg.age}, ${reg.grade}, ${reg.weight},
          ${reg.gender}, ${reg.experience}, ${reg.experience_level}, ${reg.school_name},
          ${reg.club_name}, ${reg.team_name}, ${reg.registration_type}, ${reg.t_shirt_size},
          ${reg.tshirt_size}, ${reg.gear_selection ? JSON.stringify(reg.gear_selection) : null},
          ${reg.selected_days ? JSON.stringify(reg.selected_days) : null}, ${reg.day1},
          ${reg.day2}, ${reg.day3}, ${reg.base_price}, ${reg.discount_code}, ${reg.discount_amount},
          ${reg.final_price}, ${reg.amount_paid}, ${reg.event_price_cents}, ${reg.payment_status},
          ${reg.payment_method}, ${reg.stripe_payment_intent_id}, ${reg.stripe_customer_id},
          ${reg.stripe_client_secret}, ${reg.shopify_order_id}, ${reg.medical_release_accepted},
          ${reg.terms_accepted}, ${reg.form_session_id}, ${reg.ip_address}, ${reg.user_agent},
          ${reg.device_type}, ${reg.registration_source}, ${reg.data_source}, ${reg.data_checksum},
          ${reg.system_version}, ${reg.created_at}, ${reg.updated_at}, ${reg.payment_completed_at},
          ${reg.payment_date}, ${reg.completed_date}, ${reg.is_archived || false}, ${reg.recovered}
        )
        ON CONFLICT (email, event_id) DO UPDATE SET
          source_table = EXCLUDED.source_table,
          payment_status = EXCLUDED.payment_status,
          stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
          updated_at = EXCLUDED.updated_at
      `;
    }
    
    console.log(`✅ Inserted ${finalRegistrations.length} comprehensive registrations`);
    
    // Create event-specific tables with duplicates included
    for (const event of events) {
      const tableName = `comprehensive_${event.event_slug.replace(/-/g, '_')}_registrations`;
      console.log(`📊 Creating table: ${tableName}`);
      
      // Drop and recreate event-specific table
      await sql`DROP TABLE IF EXISTS ${sql(tableName)}`;
      await sql`
        CREATE TABLE ${sql(tableName)} (
          id TEXT PRIMARY KEY,
          source_table TEXT NOT NULL,
          duplicate_group INTEGER,
          is_primary_record BOOLEAN DEFAULT TRUE,
          
          -- All the same fields as comprehensive_registrations
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          contact_name TEXT,
          email TEXT NOT NULL,
          phone TEXT,
          grade TEXT,
          age INTEGER,
          weight TEXT,
          gender TEXT,
          experience TEXT,
          experience_level TEXT,
          school_name TEXT,
          club_name TEXT,
          team_name TEXT,
          registration_type TEXT,
          t_shirt_size TEXT,
          tshirt_size TEXT,
          gear_selection JSONB,
          day1 BOOLEAN,
          day2 BOOLEAN,
          day3 BOOLEAN,
          base_price DECIMAL(10,2),
          discount_code TEXT,
          discount_amount DECIMAL(10,2),
          final_price DECIMAL(10,2),
          amount_paid DECIMAL(10,2),
          event_price_cents INTEGER,
          payment_status TEXT,
          payment_method TEXT,
          stripe_payment_intent_id TEXT,
          stripe_customer_id TEXT,
          shopify_order_id TEXT,
          medical_release_accepted BOOLEAN,
          terms_accepted BOOLEAN,
          form_session_id TEXT,
          ip_address TEXT,
          user_agent TEXT,
          device_type TEXT,
          registration_source TEXT,
          data_source TEXT,
          data_checksum TEXT,
          system_version TEXT,
          created_at TIMESTAMP,
          updated_at TIMESTAMP,
          payment_completed_at TIMESTAMP,
          payment_date TIMESTAMP,
          completed_date TIMESTAMP,
          is_archived BOOLEAN DEFAULT FALSE
        )
      `;
      
      // Get all registrations for this event (including duplicates)
      const eventRegistrations = allRegistrations.filter(reg => {
        const regEventId = reg.event_id || (
          reg.event_slug === 'birmingham-slam-camp' ? 1 :
          reg.event_slug === 'texas-recruiting-clinic' ? 2 :
          reg.event_slug === 'national-champ-camp' ? 3 : 0
        );
        return regEventId === event.event_id;
      });
      
      // Group duplicates and insert all records
      const emailGroups = new Map<string, ComprehensiveRegistration[]>();
      eventRegistrations.forEach(reg => {
        const email = reg.email.toLowerCase();
        if (!emailGroups.has(email)) {
          emailGroups.set(email, []);
        }
        emailGroups.get(email)!.push(reg);
      });
      
      let duplicateGroupId = 1;
      for (const [email, registrations] of emailGroups) {
        // Sort by payment status and date to identify primary record
        registrations.sort((a, b) => {
          // Prioritize paid registrations
          if ((a.payment_status === 'paid' || a.payment_status === 'succeeded') && 
              (b.payment_status !== 'paid' && b.payment_status !== 'succeeded')) return -1;
          if ((b.payment_status === 'paid' || b.payment_status === 'succeeded') && 
              (a.payment_status !== 'paid' && a.payment_status !== 'succeeded')) return 1;
          
          // Then by creation date (newer first)
          const aDate = new Date(a.created_at || 0);
          const bDate = new Date(b.created_at || 0);
          return bDate.getTime() - aDate.getTime();
        });
        
        for (let i = 0; i < registrations.length; i++) {
          const reg = registrations[i];
          const isPrimary = i === 0;
          const groupId = registrations.length > 1 ? duplicateGroupId : null;
          
          await sql`
            INSERT INTO ${sql(tableName)} (
              id, source_table, duplicate_group, is_primary_record,
              first_name, last_name, contact_name, email, phone, grade, age, weight,
              gender, experience, experience_level, school_name, club_name, team_name,
              registration_type, t_shirt_size, tshirt_size, gear_selection, day1, day2, day3,
              base_price, discount_code, discount_amount, final_price, amount_paid,
              event_price_cents, payment_status, payment_method, stripe_payment_intent_id,
              stripe_customer_id, shopify_order_id, medical_release_accepted, terms_accepted,
              form_session_id, ip_address, user_agent, device_type, registration_source,
              data_source, data_checksum, system_version, created_at, updated_at,
              payment_completed_at, payment_date, completed_date, is_archived
            ) VALUES (
              ${reg.id}, ${reg.source_table}, ${groupId}, ${isPrimary}, ${reg.first_name},
              ${reg.last_name}, ${reg.contact_name}, ${reg.email}, ${reg.phone}, ${reg.grade},
              ${reg.age}, ${reg.weight}, ${reg.gender}, ${reg.experience}, ${reg.experience_level},
              ${reg.school_name}, ${reg.club_name}, ${reg.team_name}, ${reg.registration_type},
              ${reg.t_shirt_size}, ${reg.tshirt_size},
              ${reg.gear_selection ? JSON.stringify(reg.gear_selection) : null},
              ${reg.day1}, ${reg.day2}, ${reg.day3}, ${reg.base_price}, ${reg.discount_code},
              ${reg.discount_amount}, ${reg.final_price}, ${reg.amount_paid}, ${reg.event_price_cents},
              ${reg.payment_status}, ${reg.payment_method}, ${reg.stripe_payment_intent_id},
              ${reg.stripe_customer_id}, ${reg.shopify_order_id}, ${reg.medical_release_accepted},
              ${reg.terms_accepted}, ${reg.form_session_id}, ${reg.ip_address}, ${reg.user_agent},
              ${reg.device_type}, ${reg.registration_source}, ${reg.data_source}, ${reg.data_checksum},
              ${reg.system_version}, ${reg.created_at}, ${reg.updated_at}, ${reg.payment_completed_at},
              ${reg.payment_date}, ${reg.completed_date}, ${reg.is_archived || false}
            )
          `;
        }
        
        if (registrations.length > 1) {
          duplicateGroupId++;
        }
      }
      
      const eventCount = await sql`SELECT COUNT(*) as count FROM ${sql(tableName)}`;
      console.log(`  ✅ ${tableName}: ${eventCount[0].count} registrations`);
    }
    
    // Generate comprehensive summary report
    const finalSummary = await sql`
      SELECT 
        event_name,
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN payment_status IN ('paid', 'succeeded') THEN 1 END) as paid_registrations,
        COUNT(CASE WHEN payment_status NOT IN ('paid', 'succeeded') OR payment_status IS NULL THEN 1 END) as pending_registrations,
        COUNT(DISTINCT source_table) as source_tables
      FROM comprehensive_registrations
      GROUP BY event_name
      ORDER BY event_name
    `;
    
    // Create detailed CSV export
    const csvHeaders = [
      'ID', 'Source Table', 'First Name', 'Last Name', 'Email', 'Phone', 'Event',
      'Grade', 'School', 'Club', 'T-Shirt Size', 'Payment Status', 'Amount Paid',
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
      reg.t_shirt_size || reg.tshirt_size || '',
      reg.payment_status || '',
      reg.amount_paid || reg.final_price || reg.event_price_cents || '',
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
    events.forEach(event => {
      console.log(`  - comprehensive_${event.event_slug.replace(/-/g, '_')}_registrations`);
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
