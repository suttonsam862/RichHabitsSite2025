/**
 * Test script for /api/event-registration endpoint
 * Tests field mapping and validation after fixes
 */

const testEventRegistration = async () => {
  console.log('🧪 Testing Event Registration Endpoint');
  console.log('=====================================');

  // Test payload with mixed frontend field names (the problematic ones)
  const testPayload = {
    eventId: 1, // Legacy ID that should map to UUID
    firstName: "John",
    lastName: "Doe", 
    email: "john.doe@test.com",
    phone: "555-123-4567",
    
    // Frontend field variations that need mapping
    tShirtSize: "L", // should map to shirtSize
    contactName: "Jane Doe", // should map to parentName
    grade: "12", // should stay as grade
    experienceLevel: "Intermediate", // should map to experience
    gender: "Male",
    
    schoolName: "Test High School",
    clubName: "Test Wrestling Club",
    registrationType: "individual",
    basePrice: 100,
    finalPrice: 100,
    medicalReleaseAccepted: true,
    termsAccepted: true
  };

  try {
    console.log('📤 Sending registration request...');
    console.log('Request payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch('http://localhost:5000/api/event-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📡 Response status:', response.status);
    console.log('📄 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.json();
    console.log('📋 Response data:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('🆔 Registration ID:', responseData.registrationId);
      
      // Test database query to verify field mapping
      console.log('\n🔍 Verifying database record...');
      await verifyDatabaseRecord(responseData.registrationId);
      
    } else {
      console.log('❌ Registration failed');
      if (responseData.details) {
        console.log('📝 Validation errors:');
        responseData.details.forEach(detail => {
          console.log(`  - ${detail.field}: ${detail.message}`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
};

const verifyDatabaseRecord = async (registrationId) => {
  try {
    // Query the database to verify the registration was created with correct field mapping
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    const result = await pool.query(
      'SELECT * FROM event_registrations WHERE id = $1',
      [registrationId]
    );

    if (result.rows.length === 0) {
      console.log('❌ No record found in database');
      return;
    }

    const record = result.rows[0];
    console.log('📊 Database record:');
    console.log('  - ID:', record.id);
    console.log('  - Event ID:', record.event_id);
    console.log('  - Name:', record.first_name, record.last_name);
    console.log('  - Email:', record.email);
    console.log('  - Phone:', record.phone);
    console.log('  - Grade:', record.grade);
    console.log('  - Shirt Size:', record.shirt_size, '(mapped from tShirtSize)');
    console.log('  - Parent Name:', record.parent_name, '(mapped from contactName)');
    console.log('  - Experience:', record.experience, '(mapped from experienceLevel)');
    console.log('  - Gender:', record.gender);
    console.log('  - School:', record.school_name);
    console.log('  - Club:', record.club_name);

    // Verify field mappings worked correctly
    const fieldMappingTests = [
      { field: 'shirt_size', expected: 'L', actual: record.shirt_size, mapping: 'tShirtSize -> shirtSize' },
      { field: 'parent_name', expected: 'Jane Doe', actual: record.parent_name, mapping: 'contactName -> parentName' },
      { field: 'experience', expected: 'Intermediate', actual: record.experience, mapping: 'experienceLevel -> experience' },
      { field: 'grade', expected: '12', actual: record.grade, mapping: 'grade -> grade (no change)' }
    ];

    console.log('\n🔍 Field Mapping Verification:');
    fieldMappingTests.forEach(test => {
      const status = test.actual === test.expected ? '✅' : '❌';
      console.log(`  ${status} ${test.mapping}: ${test.actual} (expected: ${test.expected})`);
    });

    await pool.end();

  } catch (error) {
    console.error('💥 Database verification failed:', error.message);
  }
};

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEventRegistration();
}

export { testEventRegistration };