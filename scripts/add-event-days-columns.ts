import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

async function addEventDaysColumns() {
  console.log('Starting to add day1, day2, day3 columns to event_registrations table...');
  
  // Connect to the database
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Check if the columns already exist
    const checkResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'event_registrations'
      AND column_name IN ('day1', 'day2', 'day3');
    `);
    
    const existingColumns = checkResult.rows.map(row => row.column_name);
    console.log('Existing columns:', existingColumns);
    
    // Add columns that don't exist
    const columnsToAdd: string[] = [];
    if (!existingColumns.includes('day1')) columnsToAdd.push('day1 BOOLEAN DEFAULT FALSE');
    if (!existingColumns.includes('day2')) columnsToAdd.push('day2 BOOLEAN DEFAULT FALSE');
    if (!existingColumns.includes('day3')) columnsToAdd.push('day3 BOOLEAN DEFAULT FALSE');
    
    if (columnsToAdd.length > 0) {
      console.log('Adding columns:', columnsToAdd);
      
      for (const columnDef of columnsToAdd) {
        await pool.query(`
          ALTER TABLE event_registrations
          ADD COLUMN IF NOT EXISTS ${columnDef};
        `);
      }
      
      console.log('Columns added successfully!');
    } else {
      console.log('All required columns already exist. No changes needed.');
    }
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    // Close the database connection
    await pool.end();
    console.log('Database connection closed.');
  }
}

// Run the function
addEventDaysColumns().then(() => {
  console.log('Migration completed!');
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});