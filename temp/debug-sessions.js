// ESM module to check and fix sessions table
import { Pool } from 'pg';
import fs from 'fs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixSessions() {
  try {
    console.log("Checking database connection...");
    await pool.query('SELECT NOW()');
    console.log("Database connection successful!");
    
    try {
      console.log("Creating sessions table if it doesn't exist...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          sid VARCHAR NOT NULL PRIMARY KEY,
          sess JSON NOT NULL,
          expire TIMESTAMP(6) NOT NULL
        )
      `);
      await pool.query(`CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire)`);
      console.log("Sessions table ready!");
      
      // Write a fix file to apply in our next step
      fs.writeFileSync('./temp/sessions-fix.js', `
// Session fix to apply in index.ts
import connectPg from "connect-pg-simple";
const pgSession = connectPg(session);
const sessionStore = new pgSession({
  pool,
  tableName: 'sessions',
  createTableIfMissing: true,
});

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "richhabits2025secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);
      `);
      
      console.log("Fix file created!");
    } catch (err) {
      console.error("Error with sessions table:", err.message);
    }
  } catch (err) {
    console.error("Database connection failed:", err.message);
  } finally {
    await pool.end();
  }
}

fixSessions();