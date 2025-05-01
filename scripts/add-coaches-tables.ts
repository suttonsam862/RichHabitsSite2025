import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Migration script to add coaches and event_coaches tables
 */
async function addCoachesTables() {
  console.log("Starting migration: Adding coaches tables");
  
  try {
    // Create coaches table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS coaches (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        bio TEXT NOT NULL,
        image TEXT NOT NULL,
        school TEXT,
        school_logo TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Created coaches table");
    
    // Create event_coaches junction table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS event_coaches (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        coach_id INTEGER NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(event_id, coach_id)
      );
    `);
    console.log("Created event_coaches table");
    
    // Add the Texas Recruiting Clinic coaches
    const texasRecruitingClinicId = 3;
    
    // Insert each coach
    await db.execute(sql`
      INSERT INTO coaches (name, title, bio, image, school, school_logo)
      VALUES
        ('Grant Leeth', 'NCAA All-American, University of Missouri', 'Former University of Missouri standout specializing in technical wrestling and recruiting process guidance.', '/assets/VALENCIA_Zahid-headshot.jpg', 'University of Missouri', '/assets/pittLogo.png'),
        ('Josh Shields', 'NCAA All-American, Arizona State', 'PAC-12 Champion and multiple NCAA qualifier. Expert in recruitment preparation and college transition.', '/assets/Michael_McGee_JouQS.jpg', 'Arizona State', '/assets/ouLogo.png'),
        ('Micky Phillippi', 'NCAA All-American, University of Pittsburgh', '3x ACC Champion and NCAA All-American. Specializes in technical wrestling and preparing for college competition.', '/assets/VALENCIA_Zahid-headshot.jpg', 'University of Pittsburgh', '/assets/brownLogo.png'),
        ('Mark Hall', 'NCAA Champion, Penn State', 'NCAA Champion and multiple-time All-American. Offers elite technical instruction and recruiting advice.', '/assets/Michael_McGee_JouQS.jpg', 'Penn State University', '/assets/gmuLogo.png'),
        ('Max Murin', 'NCAA All-American, University of Iowa', 'Big Ten standout and NCAA All-American. Specializes in competitive mindset and recruiting process expertise.', '/assets/VALENCIA_Zahid-headshot.jpg', 'University of Iowa', '/assets/tarletonLogo.png')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log("Added Texas Recruiting Clinic coaches to database");
    
    // Get the IDs of the coaches we just created
    const coachIds = await db.execute(sql`
      SELECT id, name FROM coaches 
      WHERE name IN ('Grant Leeth', 'Josh Shields', 'Micky Phillippi', 'Mark Hall', 'Max Murin');
    `);
    console.log("Retrieved coach IDs:", coachIds.rows);
    
    // Connect coaches to event
    for (const coach of coachIds.rows) {
      const displayOrder = coachIds.rows.indexOf(coach);
      // Insert into junction table
      await db.execute(sql`
        INSERT INTO event_coaches (event_id, coach_id, display_order)
        VALUES (${texasRecruitingClinicId}, ${coach.id}, ${displayOrder})
        ON CONFLICT (event_id, coach_id) DO NOTHING;
      `);
    }
    console.log("Connected coaches to Texas Recruiting Clinic event");
    
    console.log("Migration complete: Added coaches tables and data");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run the migration
addCoachesTables()
  .then(() => {
    console.log("Coaches tables migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Coaches tables migration failed:", error);
    process.exit(1);
  });
