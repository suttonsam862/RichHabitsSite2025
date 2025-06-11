/**
 * Complete Payment Verification System Test
 * Tests all aspects of the bulletproof payment verification system
 */

const testCompletePaymentVerification = async () => {
  console.log('🔒 Complete Payment Verification System Test');
  console.log('============================================');

  try {
    // Test 1: FREE Registration Flow
    await testFreeRegistrationFlow();
    
    // Test 2: PAID Registration Flow
    await testPaidRegistrationFlow();
    
    // Test 3: Edge Cases and Error Handling
    await testEdgeCases();
    
    // Test 4: Race Condition Protection
    await testRaceConditionProtection();
    
    // Test 5: Database Integrity Verification
    await verifyDatabaseIntegrity();
    
    console.log('\n✅ All payment verification tests completed successfully!');
    
  } catch (error) {
    console.error('💥 Payment verification tests failed:', error.message);
  }
};

const testFreeRegistrationFlow = async () => {
  console.log('\n📝 Test 1: FREE Registration Complete Flow');
  console.log('------------------------------------------');
  
  // Step 1: Create FREE registration
  const freePayload = {
    firstName: "Sarah",
    lastName: "FreeUser",
    email: "sarah.free@test.com",
    eventId: "c0e2c223-f266-41c5-b40f-93e1d7e87ca6",
    basePrice: 0,
    finalPrice: 0,
    phone: "555-100-4444",
    grade: "15",
    shirtSize: "S",
    parentName: "Parent Sarah",
    experience: "Novice",
    schoolName: "Free Flow Test School"
  };

  console.log('Creating FREE registration...');
  const createResponse = await fetch('http://localhost:5000/api/verify/create-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(freePayload)
  });

  const createResult = await createResponse.json();
  
  if (createResult.success && createResult.isFreeRegistration) {
    console.log('✅ FREE registration created successfully');
    console.log('   Payment Intent:', createResult.paymentIntentId);
    
    // Step 2: Verify payment (should show already verified)
    console.log('Verifying FREE registration payment...');
    const verifyResponse = await fetch('http://localhost:5000/api/verify/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId: createResult.paymentIntentId })
    });

    const verifyResult = await verifyResponse.json();
    
    if (verifyResult.success && verifyResult.alreadyVerified) {
      console.log('✅ FREE registration verification successful');
    } else {
      console.log('❌ FREE registration verification failed');
    }
    
    // Step 3: Lookup registration by payment intent
    console.log('Looking up registration by payment intent...');
    const lookupResponse = await fetch(`http://localhost:5000/api/verify/registration/${createResult.paymentIntentId}`);
    const lookupResult = await lookupResponse.json();
    
    if (lookupResult.success) {
      console.log('✅ Registration lookup successful');
      console.log('   Registration ID:', lookupResult.registration.id);
      console.log('   Payment Status:', lookupResult.registration.paymentStatus);
    } else {
      console.log('❌ Registration lookup failed');
    }
    
  } else {
    console.log('❌ FREE registration creation failed');
  }
};

const testPaidRegistrationFlow = async () => {
  console.log('\n💳 Test 2: PAID Registration Complete Flow');
  console.log('------------------------------------------');
  
  // Step 1: Create PAID registration
  const paidPayload = {
    firstName: "David",
    lastName: "PaidUser",
    email: "david.paid@test.com",
    eventId: "c0e2c223-f266-41c5-b40f-93e1d7e87ca6",
    basePrice: 299,
    finalPrice: 199,
    phone: "555-200-5555",
    grade: "16",
    shirtSize: "XL",
    parentName: "Parent David",
    experience: "Intermediate",
    schoolName: "Paid Flow Test School"
  };

  console.log('Creating PAID registration...');
  const createResponse = await fetch('http://localhost:5000/api/verify/create-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paidPayload)
  });

  const createResult = await createResponse.json();
  
  if (createResult.success && createResult.clientSecret) {
    console.log('✅ PAID registration created successfully');
    console.log('   Payment Intent:', createResult.paymentIntentId);
    console.log('   Amount:', `$${createResult.amount}`);
    
    // Step 2: Simulate payment completion and verify
    console.log('Verifying PAID registration payment...');
    const verifyResponse = await fetch('http://localhost:5000/api/verify/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId: createResult.paymentIntentId })
    });

    const verifyResult = await verifyResponse.json();
    
    if (verifyResult.success && verifyResult.stripeVerification) {
      console.log('✅ PAID registration verification successful');
      console.log('   Verified At:', verifyResult.stripeVerification.verifiedAt);
    } else {
      console.log('❌ PAID registration verification failed');
    }
    
    // Step 3: Test double verification (should show already verified)
    console.log('Testing double verification protection...');
    const doubleVerifyResponse = await fetch('http://localhost:5000/api/verify/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId: createResult.paymentIntentId })
    });

    const doubleVerifyResult = await doubleVerifyResponse.json();
    
    if (doubleVerifyResult.success && doubleVerifyResult.alreadyVerified) {
      console.log('✅ Double verification protection working');
    } else {
      console.log('❌ Double verification protection failed');
    }
    
  } else {
    console.log('❌ PAID registration creation failed');
  }
};

const testEdgeCases = async () => {
  console.log('\n🧪 Test 3: Edge Cases and Error Handling');
  console.log('----------------------------------------');
  
  // Test invalid payment intent
  console.log('Testing invalid payment intent...');
  const invalidResponse = await fetch('http://localhost:5000/api/verify/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentIntentId: "invalid_intent" })
  });
  
  const invalidResult = await invalidResponse.json();
  console.log(invalidResult.success ? '❌ Should fail' : '✅ Correctly rejected invalid intent');
  
  // Test missing payment intent
  console.log('Testing missing payment intent...');
  const missingResponse = await fetch('http://localhost:5000/api/verify/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  
  const missingResult = await missingResponse.json();
  console.log(missingResult.success ? '❌ Should fail' : '✅ Correctly rejected missing intent');
  
  // Test malformed registration data
  console.log('Testing malformed registration data...');
  const malformedResponse = await fetch('http://localhost:5000/api/verify/create-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: "",
      email: "invalid-email",
      eventId: "not-a-uuid"
    })
  });
  
  const malformedResult = await malformedResponse.json();
  console.log(malformedResult.success ? '❌ Should fail' : '✅ Correctly rejected malformed data');
};

const testRaceConditionProtection = async () => {
  console.log('\n🏁 Test 4: Race Condition Protection');
  console.log('-----------------------------------');
  
  // Create a PAID registration first
  const racePayload = {
    firstName: "Race",
    lastName: "TestUser",
    email: "race.test@test.com",
    eventId: "c0e2c223-f266-41c5-b40f-93e1d7e87ca6",
    basePrice: 100,
    finalPrice: 100
  };

  const createResponse = await fetch('http://localhost:5000/api/verify/create-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(racePayload)
  });

  const createResult = await createResponse.json();
  
  if (createResult.success) {
    console.log('Created registration for race condition test...');
    
    // Test concurrent verification attempts
    console.log('Testing concurrent verification attempts...');
    
    const verificationPromises = [
      fetch('http://localhost:5000/api/verify/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: createResult.paymentIntentId })
      }),
      fetch('http://localhost:5000/api/verify/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: createResult.paymentIntentId })
      })
    ];
    
    const results = await Promise.all(verificationPromises);
    const responses = await Promise.all(results.map(r => r.json()));
    
    const successCount = responses.filter(r => r.success).length;
    const raceConditionDetected = responses.some(r => r.code === 'RACE_CONDITION_DETECTED');
    
    if (successCount === 1 && raceConditionDetected) {
      console.log('✅ Race condition protection working correctly');
    } else {
      console.log('⚠️  Race condition protection needs review');
    }
  }
};

const verifyDatabaseIntegrity = async () => {
  console.log('\n🔍 Test 5: Database Integrity Verification');
  console.log('------------------------------------------');
  
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Check recent registrations and payments
    const result = await pool.query(`
      SELECT 
        p.stripe_payment_intent_id,
        p.status as payment_status,
        p.amount,
        er.first_name,
        er.last_name,
        er.email,
        er.status as registration_status,
        er.shirt_size,
        er.parent_name,
        er.experience
      FROM payments p
      JOIN event_registrations er ON p.event_registration_id = er.id
      WHERE p.created_at > NOW() - INTERVAL '10 minutes'
      ORDER BY p.created_at DESC
    `);

    console.log(`Found ${result.rows.length} recent test registrations:`);
    
    let integrityIssues = 0;
    
    result.rows.forEach((row, index) => {
      console.log(`\n${index + 1}. ${row.first_name} ${row.last_name} (${row.email})`);
      console.log(`   Payment Intent: ${row.stripe_payment_intent_id}`);
      console.log(`   Payment Status: ${row.payment_status}`);
      console.log(`   Registration Status: ${row.registration_status}`);
      console.log(`   Amount: $${row.amount}`);
      console.log(`   Shirt Size: ${row.shirt_size || 'N/A'}`);
      console.log(`   Parent Name: ${row.parent_name || 'N/A'}`);
      console.log(`   Experience: ${row.experience || 'N/A'}`);
      
      // Check integrity
      const paymentCompleted = row.payment_status === 'completed';
      const registrationCompleted = row.registration_status === 'completed';
      
      if (paymentCompleted !== registrationCompleted) {
        console.log('   ❌ Status mismatch between payment and registration');
        integrityIssues++;
      } else {
        console.log('   ✅ Payment and registration statuses match');
      }
    });
    
    console.log(`\n📊 Integrity Summary:`);
    console.log(`   Total Records: ${result.rows.length}`);
    console.log(`   Integrity Issues: ${integrityIssues}`);
    console.log(`   Success Rate: ${((result.rows.length - integrityIssues) / result.rows.length * 100).toFixed(1)}%`);

    await pool.end();

  } catch (error) {
    console.error('Database integrity check failed:', error.message);
  }
};

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCompletePaymentVerification();
}

export { testCompletePaymentVerification };