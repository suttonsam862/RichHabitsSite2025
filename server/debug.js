// Simple script to check database connection
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.error("⚠️ DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkConnection() {
  try {
    // Basic connection test
    const result = await pool.query('SELECT NOW()');
    console.log("✅ Database connection successful");
    console.log(`Current server time: ${result.rows[0].now}`);
    
    // Check if sessions table exists
    try {
      await pool.query(`SELECT * FROM sessions LIMIT 1`);
      console.log("✅ Sessions table exists");
    } catch (err) {
      console.log("❌ Sessions table does not exist or cannot be accessed");
      console.log("Creating sessions table...");
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS sessions (
            sid VARCHAR NOT NULL PRIMARY KEY,
            sess JSON NOT NULL,
            expire TIMESTAMP(6) NOT NULL
          )
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire)`);
        console.log("✅ Sessions table created successfully");
      } catch (createErr) {
        console.error("Failed to create sessions table:", createErr.message);
      }
    }
    
    // Check registration tables
    try {
      const regCount = await pool.query('SELECT COUNT(*) FROM event_registrations');
      console.log(`✅ Found ${regCount.rows[0].count} registrations in event_registrations table`);
      
      const compCount = await pool.query('SELECT COUNT(*) FROM completed_event_registrations');
      console.log(`✅ Found ${compCount.rows[0].count} completed registrations`);
    } catch (err) {
      console.log("❌ Error checking registration tables:", err.message);
    }
    
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  } finally {
    await pool.end();
  }
}

checkConnection();