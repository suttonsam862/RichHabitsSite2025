
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function runDatabaseDiagnostic() {
  console.log('🏥 Running Database Diagnostic...');
  
  try {
    // Test basic connectivity
    console.log('\n1. Testing database connection...');
    const connectionTest = await sql`SELECT NOW() as current_time, version() as postgres_version`;
    console.log('✅ Connection successful');
    console.log(`   Time: ${connectionTest[0].current_time}`);
    console.log(`   Version: ${connectionTest[0].postgres_version.split(' ')[0]}`);

    // List all tables
    console.log('\n2. Discovering all tables...');
    const tables = await sql`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log(`📊 Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   ${table.table_name} (${table.column_count} columns)`);
    });

    // Focus on registration-related tables
    console.log('\n3. Analyzing registration-related tables...');
    const regTables = tables.filter(t => 
      t.table_name.includes('registration') || 
      t.table_name.includes('customer') ||
      t.table_name.includes('event')
    );

    for (const table of regTables) {
      console.log(`\n📋 Table: ${table.table_name}`);
      
      try {
        // Get column details
        const columns = await sql`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = ${table.table_name}
          AND table_schema = 'public'
          ORDER BY ordinal_position
        `;
        
        console.log(`   Columns (${columns.length}):`);
        columns.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'nullable' : 'not null';
          console.log(`     ${col.column_name} (${col.data_type}, ${nullable})`);
        });

        // Get row count
        const countResult = await sql`
          SELECT COUNT(*) as row_count FROM ${sql(table.table_name)}
        `;
        console.log(`   Rows: ${countResult[0].row_count}`);

        // Sample a few rows if any exist
        if (countResult[0].row_count > 0) {
          const sample = await sql`
            SELECT * FROM ${sql(table.table_name)} LIMIT 2
          `;
          console.log(`   Sample data: ${JSON.stringify(sample[0], null, 2).slice(0, 200)}...`);
        }

      } catch (error) {
        console.log(`   ⚠️ Cannot access table: ${error.message}`);
      }
    }

    // Test specific searches
    console.log('\n4. Testing search capabilities...');
    
    const searchTables = ['event_registrations', 'comprehensive_registrations', 'atomic_registrations'];
    
    for (const tableName of searchTables) {
      try {
        const testSearch = await sql`
          SELECT COUNT(*) as total_count
          FROM ${sql(tableName)}
        `;
        console.log(`✅ ${tableName}: ${testSearch[0].total_count} total records`);
        
        // Try searching for any "J" names
        const jNames = await sql`
          SELECT COUNT(*) as j_count
          FROM ${sql(tableName)}
          WHERE LOWER(last_name) LIKE 'j%'
        `;
        console.log(`   Names starting with 'J': ${jNames[0].j_count}`);
        
      } catch (error) {
        console.log(`❌ ${tableName}: Not accessible (${error.message})`);
      }
    }

    console.log('\n🎯 Diagnostic Complete');

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

// Run the diagnostic
runDatabaseDiagnostic()
  .then(() => {
    console.log('✅ Diagnostic completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Diagnostic failed:', error);
    process.exit(1);
  });
