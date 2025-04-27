import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from "../shared/schema";
import ws from "ws";

// Configure WebSocket constructor for Neon serverless
neonConfig.webSocketConstructor = ws;

// This script initializes the database with our schema and seeds it with initial data
async function main() {
  console.log('Initializing database...');

  // Connect to the database
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });

  console.log('Ensuring tables exist...');

  // Create tables via direct SQL if they don't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      shopify_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      handle TEXT NOT NULL UNIQUE,
      description TEXT,
      product_type TEXT,
      image TEXT,
      price TEXT,
      collection TEXT,
      color TEXT,
      data JSONB,
      featured BOOLEAN DEFAULT FALSE,
      available_for_sale BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS collections (
      id SERIAL PRIMARY KEY,
      shopify_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      handle TEXT NOT NULL UNIQUE,
      description TEXT,
      image TEXT,
      data JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      price TEXT NOT NULL,
      shopify_product_id TEXT,
      image TEXT,
      max_participants INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS event_registrations (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      t_shirt_size TEXT,
      grade TEXT,
      school_name TEXT,
      club_name TEXT,
      medical_release_accepted BOOLEAN DEFAULT FALSE,
      registration_type TEXT,
      shopify_order_id TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS custom_apparel_inquiries (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      organization_name TEXT NOT NULL,
      sport TEXT NOT NULL,
      details TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contact_submissions (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS collaborations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      logo_src TEXT,
      website TEXT NOT NULL,
      description TEXT NOT NULL,
      is_coming_soon BOOLEAN DEFAULT FALSE,
      display_order INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Checking if seed data needs to be added...');

  // Check if we need to seed the collaborations table
  const collaborationsResult = await pool.query('SELECT COUNT(*) FROM collaborations');
  if (parseInt(collaborationsResult.rows[0].count) === 0) {
    console.log('Seeding collaborations table...');
    await pool.query(`
      INSERT INTO collaborations (name, logo_src, website, description, is_coming_soon, display_order, active)
      VALUES 
      ('Fruit Hunters', '/images/fruit-hunters-logo.png', 'https://fruithunters.com/', 'America''s premier exotic fruit company partnering with Rich Habits to provide optimal nutrition for our wrestlers and athletes. Featuring exotic fruits like Jackfruit, Black Sapote, Durian, Papaya, Star Fruit, and Cocoa. Exclusive fruit packs available at all Birmingham Slam Camp events.', FALSE, 1, TRUE),
      ('Future Partner', NULL, 'https://example.com', 'A future collaboration we''re excited to announce soon. Stay tuned for more information about this partnership.', TRUE, 2, TRUE),
      ('Coming Soon', NULL, 'https://example.org', 'Another exciting partnership in the works. Check back for updates on this collaboration.', TRUE, 3, TRUE);
    `);
  }

  // Check if we need to seed the events table
  const eventsResult = await pool.query('SELECT COUNT(*) FROM events');
  if (parseInt(eventsResult.rows[0].count) === 0) {
    console.log('Seeding events table...');
    await pool.query(`
      INSERT INTO events (title, category, date, time, location, description, price, image, max_participants)
      VALUES 
      ('Birmingham Slam Camp', 'camp', 'June 19-21, 2025', '9:00 AM - 4:00 PM', 'Clay-Chalkville Middle School, Birmingham, AL', 'Join us for three days of intensive wrestling training with world-class coaches. Open to wrestlers of all skill levels from grades 6-12.', '$249 full camp / $149 single day', '/images/birmingham-slam-camp.jpg', 200),
      ('National Champ Camp', 'camp', 'June 4-7, 2025', '9:00 AM - 4:00 PM', 'Rancho High School, Las Vegas, NV', 'Elite wrestling camp featuring national champions and Olympic-level coaches. Four days of comprehensive training, technique sessions, and live matches.', '$349 full camp / $175 per day', '/images/national-champ-camp.jpg', 200),
      ('Texas Recruiting Clinic', 'clinic', 'June 12-13, 2025', '9:00 AM - 4:00 PM', 'Arlington Martin High School, Arlington, TX', 'Two-day intensive clinic with college coaches in attendance for recruiting opportunities. Featuring guest clinicians Micky Phillippi, Mark Hall, Josh Shields, Grant Leeth, and Max Murin.', '$249', '/images/texas-recruiting-clinic.jpg', 150);
    `);
  }

  console.log('Database initialization complete!');
  await pool.end();
}

main().catch((err) => {
  console.error('Error initializing database:', err);
  process.exit(1);
});