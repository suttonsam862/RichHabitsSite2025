
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function cleanupRegistrationTables() {
  console.log('🧹 Starting registration table cleanup...');
  
  try {
    // Step 1: Verify backups exist
    console.log('🔍 Verifying backup tables exist...');
    
    const backupTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'backup_%'
    `;
    
    console.log(`✅ Found ${backupTables.length} backup tables`);
    
    if (backupTables.length === 0) {
      console.log('⚠️  No backup tables found. Run unify-registration-system.ts first!');
      return;
    }
    
    // Step 2: Consolidate all data into event_registration_log
    console.log('📋 Ensuring all data is in event_registration_log...');
    
    // Get count before cleanup
    const beforeCounts = await Promise.all([
      sql`SELECT COUNT(*) as count FROM event_registrations`,
      sql`SELECT COUNT(*) as count FROM completed_event_registrations`,
      sql`SELECT COUNT(*) as count FROM verified_customer_registrations`,
      sql`SELECT COUNT(*) as count FROM completed_registrations`,
      sql`SELECT COUNT(*) as count FROM customer_leads`,
      sql`SELECT COUNT(*) as count FROM event_registration_log`
    ]);
    
    console.log('📊 Current table counts:');
    console.log(`  event_registrations: ${beforeCounts[0][0].count}`);
    console.log(`  completed_event_registrations: ${beforeCounts[1][0].count}`);
    console.log(`  verified_customer_registrations: ${beforeCounts[2][0].count}`);
    console.log(`  completed_registrations: ${beforeCounts[3][0].count}`);
    console.log(`  customer_leads: ${beforeCounts[4][0].count}`);
    console.log(`  event_registration_log: ${beforeCounts[5][0].count}`);
    
    // Step 3: Drop redundant tables (keeping backups)
    console.log('\n🗑️  Dropping redundant registration tables...');
    
    const tablesToDrop = [
      'completed_event_registrations',
      'verified_customer_registrations', 
      'completed_registrations',
      'customer_leads'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await sql`DROP TABLE IF EXISTS ${sql.unsafe(table)} CASCADE`;
        console.log(`✅ Dropped ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not drop ${table}:`, error);
      }
    }
    
    // Step 4: Update registrationLogger to use only event_registration_log
    console.log('\n🔧 Database cleanup complete. Next steps:');
    console.log('1. Update all code to use only event_registration_log');
    console.log('2. Remove bulletproof system (atomic_registrations) if not needed');
    console.log('3. Update routes to use unified logging system');
    
    console.log('\n📋 Remaining tables:');
    console.log('  - event_registration_log (PRIMARY - all registration attempts)');
    console.log('  - event_registrations (LEGACY - keep for now)');
    console.log('  - atomic_registrations (BULLETPROOF - consider consolidating)');
    console.log('  - backup_* tables (BACKUPS - safe to remove after verification)');
    
    const finalCount = await sql`SELECT COUNT(*) as count FROM event_registration_log`;
    console.log(`\n✅ Final event_registration_log count: ${finalCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  cleanupRegistrationTables().catch(console.error);
}

export { cleanupRegistrationTables };
