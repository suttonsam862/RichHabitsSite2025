/**
 * Test script for /api/team-registration endpoint
 * Tests field mapping, validation, and team batch registration
 */

const testTeamRegistration = async () => {
  console.log('🧪 Testing Team Registration Endpoint');
  console.log('====================================');

  // Test payload simulating frontend team registration data
  const teamPayload = {
    eventId: 1, // Legacy ID that should map to UUID
    teamName: "Elite Wrestling Warriors",
    teamPrice: 75, // Per athlete price
    
    // Optional coach info
    coachInfo: {
      firstName: "Coach",
      lastName: "Johnson",
      email: "coach.johnson@school.edu",
      phone: "555-100-2000"
    },
    
    // Array of athletes with frontend field names that need mapping
    athletes: [
      {
        firstName: "Michael",
        lastName: "Thompson",
        email: "michael.t@email.com",
        age: "17", // should map to grade
        shirtSize: "XL", // should map to shirt_size
        parentName: "Sarah Thompson", // should map to parent_name
        parentPhoneNumber: "555-200-3001", // should map to phone
        experienceLevel: "Advanced", // should map to experience
        gender: "Male",
        schoolName: "Central High School",
        clubName: "Elite Wrestling Club"
      },
      {
        firstName: "Emma",
        lastName: "Rodriguez",
        email: "emma.r@email.com",
        grade: "16", // should stay as grade
        tShirtSize: "M", // variant spelling, should map to shirt_size
        contactName: "Carlos Rodriguez", // variant spelling, should map to parent_name
        parentPhoneNumber: "555-200-3002",
        experienceLevel: "Intermediate",
        gender: "Female",
        schoolName: "Central High School",
        clubName: "Elite Wrestling Club"
      }
    ],
    
    // Optional team-level fields
    totalAmount: 150, // 2 athletes × $75
    discountedAmount: 150
  };

  try {
    console.log('📤 Sending team registration request...');
    console.log('Request payload:', JSON.stringify(teamPayload, null, 2));
    
    const response = await fetch('http://localhost:5000/api/team-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamPayload)
    });

    console.log('📡 Response status:', response.status);
    const responseData = await response.json();
    console.log('📋 Response data:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('✅ Team registration successful!');
      console.log('👥 Team Name:', responseData.teamName);
      console.log('🔢 Athletes Registered:', responseData.athleteCount);
      console.log('🆔 Registration IDs:', responseData.registrationIds);
      
      // Verify database records with field mapping
      console.log('\n🔍 Verifying database records...');
      await verifyTeamRegistrationRecords(responseData.registrationIds);
      
    } else {
      console.log('❌ Team registration failed');
      if (responseData.details) {
        console.log('📝 Validation errors:');
        responseData.details.forEach(detail => {
          console.log(`  - ${detail.field}: ${detail.message}`);
        });
      }
      if (responseData.failedAthletes) {
        console.log('👥 Failed athletes:');
        responseData.failedAthletes.forEach(failed => {
          console.log(`  - Athlete ${failed.index} (${failed.name}): ${failed.error}`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
};

const verifyTeamRegistrationRecords = async (registrationIds) => {
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Query the latest 2 team registrations
    const result = await pool.query(
      `SELECT 
        id, 
        event_id,
        first_name,
        last_name,
        email,
        phone,
        grade,
        shirt_size,
        parent_name,
        experience,
        gender,
        school_name,
        club_name,
        registration_type,
        team_name,
        base_price,
        final_price,
        created_at
      FROM event_registrations 
      WHERE registration_type = 'team'
      ORDER BY created_at DESC 
      LIMIT 2`
    );

    if (result.rows.length === 0) {
      console.log('❌ No team registration records found in database');
      return;
    }

    console.log('📊 Database Records:');
    result.rows.forEach((record, index) => {
      console.log(`\n--- Athlete ${index + 1} ---`);
      console.log('  ID:', record.id);
      console.log('  Event ID:', record.event_id);
      console.log('  Name:', record.first_name, record.last_name);
      console.log('  Email:', record.email);
      console.log('  Phone:', record.phone, '(mapped from parentPhoneNumber)');
      console.log('  Grade:', record.grade, '(mapped from age/grade)');
      console.log('  Shirt Size:', record.shirt_size, '(mapped from shirtSize/tShirtSize)');
      console.log('  Parent Name:', record.parent_name, '(mapped from parentName/contactName)');
      console.log('  Experience:', record.experience, '(mapped from experienceLevel)');
      console.log('  Gender:', record.gender);
      console.log('  School:', record.school_name);
      console.log('  Club:', record.club_name);
      console.log('  Registration Type:', record.registration_type);
      console.log('  Team Name:', record.team_name);
      console.log('  Price:', record.base_price);
    });

    // Verify field mappings worked correctly
    const fieldMappingTests = [
      { 
        description: 'Athlete 1: shirtSize -> shirt_size', 
        expected: 'XL', 
        actual: result.rows[1]?.shirt_size 
      },
      { 
        description: 'Athlete 1: parentName -> parent_name', 
        expected: 'Sarah Thompson', 
        actual: result.rows[1]?.parent_name 
      },
      { 
        description: 'Athlete 1: experienceLevel -> experience', 
        expected: 'Advanced', 
        actual: result.rows[1]?.experience 
      },
      { 
        description: 'Athlete 2: tShirtSize -> shirt_size', 
        expected: 'M', 
        actual: result.rows[0]?.shirt_size 
      },
      { 
        description: 'Athlete 2: contactName -> parent_name', 
        expected: 'Carlos Rodriguez', 
        actual: result.rows[0]?.parent_name 
      },
      { 
        description: 'Athlete 2: experienceLevel -> experience', 
        expected: 'Intermediate', 
        actual: result.rows[0]?.experience 
      }
    ];

    console.log('\n🔍 Field Mapping Verification:');
    fieldMappingTests.forEach(test => {
      const status = test.actual === test.expected ? '✅' : '❌';
      console.log(`  ${status} ${test.description}: ${test.actual} (expected: ${test.expected})`);
    });

    // Verify both athletes are linked to same team
    const teamNames = [...new Set(result.rows.map(r => r.team_name))];
    if (teamNames.length === 1) {
      console.log('\n✅ Team linkage verified: All athletes linked to team "' + teamNames[0] + '"');
    } else {
      console.log('\n❌ Team linkage failed: Athletes have different team names:', teamNames);
    }

    await pool.end();

  } catch (error) {
    console.error('💥 Database verification failed:', error.message);
  }
};

// Export for potential use in other scripts
export { testTeamRegistration };

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testTeamRegistration();
}