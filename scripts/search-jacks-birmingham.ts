
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function searchJacksBirmingham() {
  try {
    console.log('🔍 Searching for last name "Jacks" in Birmingham Slam Camp registrations...');
    
    // First, test database connectivity
    console.log('🔗 Testing database connection...');
    try {
      const connectionTest = await sql`SELECT 1 as test`;
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return;
    }
    
    // Search across all possible registration tables
    const searchResults = [];
    
    // 1. Check main event_registrations table
    try {
      const eventRegistrations = await sql`
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
          registration_type,
          payment_status,
          stripe_payment_intent_id,
          created_at,
          'event_registrations' as source_table
        FROM event_registrations 
        WHERE 
          LOWER(last_name) LIKE '%jacks%'
          AND (
            event_id = 1 
            OR LOWER(event_slug) LIKE '%birmingham%'
            OR LOWER(event_slug) LIKE '%slam%'
          )
        ORDER BY created_at DESC
      `;
      
      if (eventRegistrations.length > 0) {
        searchResults.push(...eventRegistrations);
        console.log(`✅ Found ${eventRegistrations.length} matches in event_registrations`);
      }
    } catch (error) {
      console.log('⚠️ event_registrations table not accessible');
    }

    // 2. Check comprehensive_registrations table
    try {
      const comprehensiveRegistrations = await sql`
        SELECT 
          id,
          first_name,
          last_name,
          email,
          phone,
          event_id,
          event_slug,
          event_name,
          grade,
          school_name,
          club_name,
          registration_type,
          payment_status,
          stripe_payment_intent_id,
          created_at,
          'comprehensive_registrations' as source_table
        FROM comprehensive_registrations 
        WHERE 
          LOWER(last_name) LIKE '%jacks%'
          AND (
            event_id = '1'
            OR LOWER(event_slug) LIKE '%birmingham%'
            OR LOWER(event_name) LIKE '%birmingham%'
            OR LOWER(event_name) LIKE '%slam%'
          )
        ORDER BY created_at DESC
      `;
      
      if (comprehensiveRegistrations.length > 0) {
        searchResults.push(...comprehensiveRegistrations);
        console.log(`✅ Found ${comprehensiveRegistrations.length} matches in comprehensive_registrations`);
      }
    } catch (error) {
      console.log('⚠️ comprehensive_registrations table not accessible');
    }

    // 3. Check Birmingham-specific tables
    try {
      const birminghamRegistrations = await sql`
        SELECT 
          id,
          first_name,
          last_name,
          email,
          phone,
          grade,
          school_name,
          club_name,
          registration_type,
          payment_status,
          stripe_payment_intent_id,
          created_at,
          'comprehensive_birmingham_slam_camp_registrations' as source_table
        FROM comprehensive_birmingham_slam_camp_registrations 
        WHERE LOWER(last_name) LIKE '%jacks%'
        ORDER BY created_at DESC
      `;
      
      if (birminghamRegistrations.length > 0) {
        searchResults.push(...birminghamRegistrations);
        console.log(`✅ Found ${birminghamRegistrations.length} matches in Birmingham-specific table`);
      }
    } catch (error) {
      console.log('⚠️ Birmingham-specific table not accessible');
    }

    // 4. Check event-specific tables with Birmingham naming patterns
    const eventTableNames = [
      'event_birmingham_slam_camp_registrations',
      'birmingham_slam_camp_registrations',
      'comprehensive_birmingham_slam_camp_registrations'
    ];

    for (const tableName of eventTableNames) {
      try {
        const tableResults = await sql`
          SELECT 
            stripe_payment_intent_id,
            payment_amount,
            payment_date,
            customer_email,
            customer_name,
            first_name,
            last_name,
            phone,
            school_name,
            club_name,
            grade,
            t_shirt_size,
            registration_type,
            source_table,
            correlation_method,
            '${tableName}' as search_table
          FROM ${sql(tableName)}
          WHERE LOWER(customer_name) LIKE '%jacks%'
             OR LOWER(last_name) LIKE '%jacks%'
          ORDER BY payment_date DESC
        `;
        
        if (tableResults.length > 0) {
          searchResults.push(...tableResults);
          console.log(`✅ Found ${tableResults.length} matches in ${tableName}`);
        }
      } catch (error) {
        console.log(`⚠️ Table ${tableName} not accessible or doesn't exist`);
      }
    }

    // 5. Check atomic_registrations table
    try {
      const atomicRegistrations = await sql`
        SELECT 
          uuid as id,
          first_name,
          last_name,
          email,
          phone,
          event_slug,
          age,
          grade,
          school_name,
          experience_level,
          club_name,
          payment_status,
          stripe_payment_intent_id,
          created_at,
          'atomic_registrations' as source_table
        FROM atomic_registrations 
        WHERE 
          LOWER(last_name) LIKE '%jacks%'
          AND (
            LOWER(event_slug) LIKE '%birmingham%'
            OR LOWER(event_slug) LIKE '%slam%'
          )
        ORDER BY created_at DESC
      `;
      
      if (atomicRegistrations.length > 0) {
        searchResults.push(...atomicRegistrations);
        console.log(`✅ Found ${atomicRegistrations.length} matches in atomic_registrations`);
      }
    } catch (error) {
      console.log('⚠️ atomic_registrations table not accessible');
    }

    // 6. Discover all available tables
    console.log('\n📋 Discovering available tables...');
    let allTables = [];
    try {
      allTables = await sql`
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns 
                WHERE table_name = t.table_name AND table_schema = 'public') as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;
      
      console.log(`📊 Found ${allTables.length} total tables in database`);
      
      // Show relevant tables
      const relevantTables = allTables.filter(t => 
        t.table_name.includes('registration') || 
        t.table_name.includes('customer') || 
        t.table_name.includes('event') ||
        t.table_name.includes('birmingham') ||
        t.table_name.includes('payment') ||
        t.table_name.includes('stripe')
      );
      
      console.log(`🎯 Found ${relevantTables.length} potentially relevant tables:`);
      relevantTables.forEach(table => {
        console.log(`  - ${table.table_name} (${table.column_count} columns)`);
      });

      console.log(`\n🔍 Searching ${relevantTables.length} relevant tables...`);

      for (const tableInfo of relevantTables) {
        const tableName = tableInfo.table_name;
        
        // Skip tables we already checked
        if (eventTableNames.includes(tableName) || 
            tableName === 'event_registrations' || 
            tableName === 'comprehensive_registrations' ||
            tableName === 'atomic_registrations') {
          continue;
        }

        try {
          // Get all columns for this table
          const allColumns = await sql`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = ${tableName}
            AND table_schema = 'public'
            ORDER BY ordinal_position
          `;

          console.log(`🔍 Checking table ${tableName} (${allColumns.length} columns)`);

          // Look for name-related columns
          const nameColumns = allColumns.filter(c => 
            c.column_name.toLowerCase().includes('name') ||
            c.column_name.toLowerCase().includes('customer') ||
            c.column_name.toLowerCase().includes('email')
          );

          if (nameColumns.length > 0) {
            console.log(`  Found potential search columns: ${nameColumns.map(c => c.column_name).join(', ')}`);
            
            // Try searching each name column
            for (const column of nameColumns) {
              if (column.data_type === 'text' || column.data_type.includes('varchar')) {
                try {
                  const results = await sql`
                    SELECT * 
                    FROM ${sql(tableName)} 
                    WHERE LOWER(${sql(column.column_name)}) LIKE '%jacks%'
                    LIMIT 5
                  `;

                  if (results.length > 0) {
                    results.forEach(result => {
                      result.source_table = tableName;
                      result.search_column = column.column_name;
                    });
                    searchResults.push(...results);
                    console.log(`✅ Found ${results.length} matches in ${tableName}.${column.column_name}`);
                    break; // Found matches, move to next table
                  }
                } catch (searchError) {
                  console.log(`  ⚠️ Could not search ${tableName}.${column.column_name}`);
                }
              }
            }
          } else {
            console.log(`  No searchable name columns found`);
          }
        } catch (error) {
          console.log(`  ⚠️ Could not access table ${tableName}`);
        }
      }
    } catch (error) {
      console.log('⚠️ Could not search additional tables:', error);
    }

    // 7. Try alternative search strategies if no results found
    if (searchResults.length === 0) {
      console.log('\n🔄 Trying alternative search strategies...');
      
      // Search for similar names
      const similarNames = ['Jack', 'Jackson', 'Jacques'];
      for (const name of similarNames) {
        try {
          console.log(`🔍 Searching for similar name: "${name}"`);
          
          for (const tableInfo of allTables.slice(0, 5)) { // Check first 5 tables
            const tableName = tableInfo.table_name;
            try {
              const columns = await sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = ${tableName}
                AND (column_name LIKE '%name%' OR column_name LIKE '%email%')
                AND data_type IN ('text', 'varchar', 'character varying')
                LIMIT 3
              `;

              for (const column of columns) {
                try {
                  const results = await sql`
                    SELECT * 
                    FROM ${sql(tableName)} 
                    WHERE LOWER(${sql(column.column_name)}) LIKE ${'%' + name.toLowerCase() + '%'}
                    LIMIT 3
                  `;

                  if (results.length > 0) {
                    console.log(`📍 Found ${results.length} matches for "${name}" in ${tableName}.${column.column_name}`);
                    results.forEach(result => {
                      result.source_table = tableName;
                      result.search_column = column.column_name;
                      result.search_term = name;
                    });
                    searchResults.push(...results);
                  }
                } catch (e) {
                  // Continue to next column
                }
              }
            } catch (e) {
              // Continue to next table
            }
          }
        } catch (error) {
          console.log(`⚠️ Could not search for ${name}`);
        }
      }
    }

    // Display results
    console.log('\n📊 SEARCH RESULTS FOR "JACKS" + BIRMINGHAM SLAM CAMP:');
    console.log('================================================');

    if (searchResults.length === 0) {
      console.log('❌ No registrations found for last name "Jacks" in Birmingham Slam Camp');
      
      // Try broader search without Birmingham filter
      console.log('\n🔍 Attempting broader search for "Jacks" across all events...');
      
      try {
        const broadSearch = await sql`
          SELECT 
            id,
            first_name,
            last_name,
            email,
            phone,
            event_id,
            event_slug,
            event_name,
            grade,
            school_name,
            payment_status,
            stripe_payment_intent_id,
            created_at,
            'comprehensive_registrations' as source_table
          FROM comprehensive_registrations 
          WHERE LOWER(last_name) LIKE '%jacks%'
          ORDER BY created_at DESC
        `;
        
        if (broadSearch.length > 0) {
          console.log(`\n✅ Found ${broadSearch.length} "Jacks" registrations across all events:`);
          broadSearch.forEach((reg, index) => {
            console.log(`\n${index + 1}. ${reg.first_name} ${reg.last_name}`);
            console.log(`   Email: ${reg.email || 'N/A'}`);
            console.log(`   Event: ${reg.event_name || reg.event_slug || `Event ID ${reg.event_id}`}`);
            console.log(`   School: ${reg.school_name || 'N/A'}`);
            console.log(`   Payment Status: ${reg.payment_status || 'N/A'}`);
            console.log(`   Registration Date: ${reg.created_at || 'N/A'}`);
          });
        } else {
          console.log('❌ No registrations found for "Jacks" in any event');
        }
      } catch (error) {
        console.log('⚠️ Could not perform broader search');
      }
    } else {
      // Remove duplicates and display unique results
      const uniqueResults = new Map();
      
      searchResults.forEach(result => {
        const key = `${result.email || result.customer_email}-${result.event_id || result.event_slug}`;
        if (!uniqueResults.has(key) || result.payment_status === 'paid') {
          uniqueResults.set(key, result);
        }
      });

      const finalResults = Array.from(uniqueResults.values());
      
      console.log(`✅ Found ${finalResults.length} unique registration(s) for "Jacks":`);
      
      finalResults.forEach((reg, index) => {
        console.log(`\n${index + 1}. Registration Details:`);
        console.log(`   Name: ${reg.first_name || reg.customer_name?.split(' ')[0] || 'N/A'} ${reg.last_name || reg.customer_name?.split(' ').slice(1).join(' ') || 'Jacks'}`);
        console.log(`   Email: ${reg.email || reg.customer_email || 'N/A'}`);
        console.log(`   Phone: ${reg.phone || 'N/A'}`);
        console.log(`   Event: ${reg.event_name || reg.event_slug || `Event ID ${reg.event_id}`}`);
        console.log(`   Grade: ${reg.grade || reg.age || 'N/A'}`);
        console.log(`   School: ${reg.school_name || 'N/A'}`);
        console.log(`   Club: ${reg.club_name || 'N/A'}`);
        console.log(`   Registration Type: ${reg.registration_type || 'N/A'}`);
        console.log(`   Payment Status: ${reg.payment_status || 'N/A'}`);
        console.log(`   Stripe Payment Intent: ${reg.stripe_payment_intent_id || 'N/A'}`);
        console.log(`   Registration Date: ${reg.created_at || reg.payment_date || 'N/A'}`);
        console.log(`   Source Table: ${reg.source_table || reg.search_table || 'N/A'}`);
        
        if (reg.correlation_method) {
          console.log(`   Correlation Method: ${reg.correlation_method}`);
        }
      });
    }

    console.log('\n🎯 SEARCH COMPLETE');

  } catch (error) {
    console.error('❌ Error during search:', error);
    throw error;
  }
}

// Run the search
searchJacksBirmingham()
  .then(() => {
    console.log('✅ Search completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Search failed:', error);
    process.exit(1);
  });
