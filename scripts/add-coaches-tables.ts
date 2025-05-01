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
    
    // Coach data for Texas Recruiting Clinic
    const coachesData = [
      {
        name: 'Grant Leeth',
        title: 'NCAA All-American, University of Missouri',
        bio: 'Former University of Missouri standout specializing in technical wrestling and recruiting process guidance.',
        image: '/assets/VALENCIA_Zahid-headshot.jpg',
        school: 'University of Missouri',
        schoolLogo: '/assets/pittLogo.png'
      },
      {
        name: 'Josh Shields',
        title: 'NCAA All-American, Arizona State',
        bio: 'PAC-12 Champion and multiple NCAA qualifier. Expert in recruitment preparation and college transition.',
        image: '/assets/Michael_McGee_JouQS.jpg',
        school: 'Arizona State',
        schoolLogo: '/assets/ouLogo.png'
      },
      {
        name: 'Micky Phillippi',
        title: 'NCAA All-American, University of Pittsburgh',
        bio: '3x ACC Champion and NCAA All-American. Specializes in technical wrestling and preparing for college competition.',
        image: '/assets/VALENCIA_Zahid-headshot.jpg',
        school: 'University of Pittsburgh',
        schoolLogo: '/assets/brownLogo.png'
      },
      {
        name: 'Mark Hall',
        title: 'NCAA Champion, Penn State',
        bio: 'NCAA Champion and multiple-time All-American. Offers elite technical instruction and recruiting advice.',
        image: '/assets/Michael_McGee_JouQS.jpg',
        school: 'Penn State University',
        schoolLogo: '/assets/gmuLogo.png'
      },
      {
        name: 'Max Murin',
        title: 'NCAA All-American, University of Iowa',
        bio: 'Big Ten standout and NCAA All-American. Specializes in competitive mindset and recruiting process expertise.',
        image: '/assets/VALENCIA_Zahid-headshot.jpg',
        school: 'University of Iowa',
        schoolLogo: '/assets/tarletonLogo.png'
      }
    ];
    
    // Insert each coach individually after checking if they exist
    for (const coach of coachesData) {
      // Check if coach already exists
      const existingCoach = await db.execute(sql`
        SELECT id FROM coaches WHERE name = ${coach.name};
      `);
      
      // Only insert if coach doesn't exist
      if (existingCoach.rows.length === 0) {
        await db.execute(sql`
          INSERT INTO coaches (name, title, bio, image, school, school_logo)
          VALUES (${coach.name}, ${coach.title}, ${coach.bio}, ${coach.image}, ${coach.school}, ${coach.schoolLogo});
        `);
        console.log(`Added coach: ${coach.name}`);
      } else {
        console.log(`Coach ${coach.name} already exists`);
      }
    }
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
      
      // Check if relationship already exists
      const existingRelation = await db.execute(sql`
        SELECT id FROM event_coaches 
        WHERE event_id = ${texasRecruitingClinicId} AND coach_id = ${coach.id};
      `);
      
      // Only insert if relationship doesn't exist
      if (existingRelation.rows.length === 0) {
        await db.execute(sql`
          INSERT INTO event_coaches (event_id, coach_id, display_order)
          VALUES (${texasRecruitingClinicId}, ${coach.id}, ${displayOrder});
        `);
        console.log(`Added coach ${coach.name} to event ${texasRecruitingClinicId}`);
      } else {
        console.log(`Coach ${coach.name} is already connected to event ${texasRecruitingClinicId}`);
      }
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
