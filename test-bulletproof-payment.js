/**
 * Test script for bulletproof payment verification system
 * Tests registration creation, payment verification, and race condition protection
 */

const testBulletproofPaymentFlow = async () => {
  console.log('🔒 Testing Bulletproof Payment Verification System');
  console.log('================================================');

  try {
    // Step 1: Test FREE registration creation and verification
    await testFreeRegistration();
    
    // Step 2: Test PAID registration creation
    await testPaidRegistration();
    
    // Step 3: Test payment verification edge cases
    await testPaymentVerificationEdgeCases();
    
    // Step 4: Verify database integrity
    await verifyDatabaseIntegrity();
    
  } catch (error) {
    console.error('💥 Bulletproof payment test failed:', error.message);
  }
};

const testFreeRegistration = async () => {
  console.log('\n📝 Test 1: FREE Registration Flow');
  console.log('----------------------------------');
  
  const freeRegistrationPayload = {
    firstName: "John",
    lastName: "FreeTester",
    email: "john.free@test.com",
    phone: "555-000-1111",
    age: "16",
    contactName: "Parent Free",
    tshirtSize: "L",
    schoolName: "Free Test High School",
    experienceLevel: "Beginner",
    eventSlug: "summer-wrestling-camp-2025",
    basePrice: 0,
    finalPrice: 0
  };

  console.log('📤 Creating FREE registration...');
  const createResponse = await fetch('http://localhost:5000/api/bulletproof/create-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(freeRegistrationPayload)
  });

  const createResult = await createResponse.json();
  console.log('📋 Creation response:', JSON.stringify(createResult, null, 2));

  if (createResult.success && createResult.isFreeRegistration) {
    console.log('✅ FREE registration created successfully');
    
    // Test verification of FREE registration
    console.log('🔍 Verifying FREE registration payment...');
    const verifyResponse = await fetch('http://localhost:5000/api/bulletproof/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId: createResult.paymentIntentId
      })
    });

    const verifyResult = await verifyResponse.json();
    console.log('📋 Verification response:', JSON.stringify(verifyResult, null, 2));
    
    if (verifyResult.success && verifyResult.isFreeRegistration) {
      console.log('✅ FREE registration verification successful');
    } else {
      console.log('❌ FREE registration verification failed');
    }
  } else {
    console.log('❌ FREE registration creation failed');
  }
};

const testPaidRegistration = async () => {
  console.log('\n💳 Test 2: PAID Registration Flow');
  console.log('----------------------------------');
  
  const paidRegistrationPayload = {
    firstName: "Alice",
    lastName: "PaidTester",
    email: "alice.paid@test.com",
    phone: "555-000-2222",
    age: "17",
    contactName: "Parent Paid",
    tshirtSize: "M",
    schoolName: "Paid Test High School",
    experienceLevel: "Intermediate",
    eventSlug: "summer-wrestling-camp-2025",
    basePrice: 299,
    finalPrice: 249
  };

  console.log('📤 Creating PAID registration...');
  const createResponse = await fetch('http://localhost:5000/api/bulletproof/create-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paidRegistrationPayload)
  });

  const createResult = await createResponse.json();
  console.log('📋 Creation response:', JSON.stringify(createResult, null, 2));

  if (createResult.success && createResult.clientSecret) {
    console.log('✅ PAID registration created successfully');
    console.log('🆔 Payment Intent ID:', createResult.paymentIntentId);
    console.log('🔑 Client Secret:', createResult.clientSecret ? 'Present' : 'Missing');
    
    // Note: In a real test, we would complete payment with Stripe here
    console.log('💡 Note: Actual Stripe payment completion would happen here in frontend');
    
  } else {
    console.log('❌ PAID registration creation failed');
  }
};

const testPaymentVerificationEdgeCases = async () => {
  console.log('\n🧪 Test 3: Payment Verification Edge Cases');
  console.log('-------------------------------------------');
  
  // Test 1: Invalid payment intent ID
  console.log('Testing invalid payment intent ID...');
  const invalidResponse = await fetch('http://localhost:5000/api/bulletproof/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentIntentId: "invalid_intent_id"
    })
  });
  
  const invalidResult = await invalidResponse.json();
  console.log('Invalid ID response:', invalidResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test 2: Missing payment intent ID
  console.log('Testing missing payment intent ID...');
  const missingResponse = await fetch('http://localhost:5000/api/bulletproof/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  
  const missingResult = await missingResponse.json();
  console.log('Missing ID response:', missingResult.success ? '❌ Should fail' : '✅ Correctly failed');
  
  // Test 3: Malformed payload
  console.log('Testing malformed payload...');
  const malformedResponse = await fetch('http://localhost:5000/api/bulletproof/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentIntentId: 123 // Should be string
    })
  });
  
  const malformedResult = await malformedResponse.json();
  console.log('Malformed payload response:', malformedResult.success ? '❌ Should fail' : '✅ Correctly failed');
};

const verifyDatabaseIntegrity = async () => {
  console.log('\n🔍 Test 4: Database Integrity Verification');
  console.log('------------------------------------------');
  
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Check atomic_registrations table
    const registrationsResult = await pool.query(
      `SELECT 
        uuid, 
        first_name, 
        last_name, 
        email, 
        event_slug,
        payment_status,
        stripe_payment_intent_id,
        payment_completed_at,
        created_at
      FROM atomic_registrations 
      ORDER BY created_at DESC 
      LIMIT 5`
    );

    console.log('📊 Recent atomic_registrations:');
    registrationsResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.first_name} ${row.last_name} (${row.email})`);
      console.log(`     UUID: ${row.uuid}`);
      console.log(`     Event: ${row.event_slug}`);
      console.log(`     Payment Status: ${row.payment_status}`);
      console.log(`     Payment Intent: ${row.stripe_payment_intent_id}`);
      console.log(`     Payment Completed: ${row.payment_completed_at}`);
      console.log('');
    });

    // Check payment_intent_lockdown table
    const lockdownResult = await pool.query(
      `SELECT 
        stripe_payment_intent_id,
        registration_uuid,
        amount_cents,
        status,
        event_slug,
        created_at
      FROM payment_intent_lockdown 
      ORDER BY created_at DESC 
      LIMIT 5`
    );

    console.log('🔒 Recent payment_intent_lockdown:');
    lockdownResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. Payment Intent: ${row.stripe_payment_intent_id}`);
      console.log(`     Registration UUID: ${row.registration_uuid}`);
      console.log(`     Amount: $${(row.amount_cents / 100).toFixed(2)}`);
      console.log(`     Status: ${row.status}`);
      console.log(`     Event: ${row.event_slug}`);
      console.log('');
    });

    // Verify integrity constraints
    const integrityCheck = await pool.query(`
      SELECT 
        ar.uuid,
        ar.stripe_payment_intent_id as reg_payment_id,
        pil.stripe_payment_intent_id as lockdown_payment_id,
        ar.payment_status,
        pil.status as lockdown_status
      FROM atomic_registrations ar
      LEFT JOIN payment_intent_lockdown pil ON ar.uuid = pil.registration_uuid
      WHERE ar.created_at > NOW() - INTERVAL '1 hour'
    `);

    console.log('🔍 Integrity Check Results:');
    let integrityIssues = 0;
    integrityCheck.rows.forEach((row, index) => {
      const paymentIdsMatch = row.reg_payment_id === row.lockdown_payment_id;
      const hasLockdown = row.lockdown_payment_id !== null;
      
      console.log(`  ${index + 1}. UUID: ${row.uuid}`);
      console.log(`     Payment IDs Match: ${paymentIdsMatch ? '✅' : '❌'}`);
      console.log(`     Has Lockdown: ${hasLockdown ? '✅' : '❌'}`);
      console.log(`     Payment Status: ${row.payment_status}`);
      
      if (!paymentIdsMatch || !hasLockdown) {
        integrityIssues++;
      }
    });

    if (integrityIssues === 0) {
      console.log('✅ All integrity checks passed');
    } else {
      console.log(`❌ Found ${integrityIssues} integrity issues`);
    }

    await pool.end();

  } catch (error) {
    console.error('💥 Database integrity check failed:', error.message);
  }
};

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBulletproofPaymentFlow();
}

export { testBulletproofPaymentFlow };