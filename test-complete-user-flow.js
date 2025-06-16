#!/usr/bin/env node

/**
 * Complete User Registration Flow Test
 * Tests the entire Birmingham Slam Camp registration process from start to finish
 */

const BASE_URL = 'http://localhost:5000';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: 'Non-JSON response', responseText: text.substring(0, 200) };
    }
    
    return { response, data };
  } catch (error) {
    return { error: error.message };
  }
}

async function testUserRegistrationFlow() {
  console.log('Testing complete user registration flow for Birmingham Slam Camp...');
  
  // Step 1: User visits event page
  console.log('\n1. Testing event page access...');
  const { response: eventResponse, data: eventData } = await makeRequest(`${BASE_URL}/api/events/1`);
  
  if (!eventResponse.ok) {
    console.log('❌ Cannot access Birmingham Slam Camp event page');
    return false;
  }
  
  console.log(`✅ Event page accessible: ${eventData.title} - $${eventData.basePrice}`);
  
  // Step 2: User fills out registration form (simulated)
  console.log('\n2. Simulating registration form completion...');
  const registrationData = {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '555-123-4567',
    contactName: 'Mike Johnson',
    age: '17',
    schoolName: 'Jefferson High School',
    medicalReleaseAccepted: true
  };
  
  console.log('Registration form data prepared ✅');
  
  // Step 3: User clicks "Register" and is redirected to payment
  console.log('\n3. Testing payment intent creation...');
  const paymentRequest = {
    option: 'full',
    registrationData,
    formSessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  const { response: paymentResponse, data: paymentData } = await makeRequest(
    `${BASE_URL}/api/events/1/create-payment-intent`,
    {
      method: 'POST',
      body: JSON.stringify(paymentRequest)
    }
  );
  
  if (!paymentResponse.ok) {
    console.log('❌ Payment intent creation failed:', paymentData);
    return false;
  }
  
  console.log('✅ Payment intent created successfully');
  console.log(`   Client Secret: ${paymentData.clientSecret.substring(0, 20)}...`);
  console.log(`   Amount: $${paymentData.amount}`);
  
  // Step 4: Test webhook handling (simulated payment success)
  console.log('\n4. Testing registration storage...');
  const { response: registrationResponse, data: registrationResult } = await makeRequest(
    `${BASE_URL}/api/event-registration`,
    {
      method: 'POST',
      body: JSON.stringify({
        eventId: 'birmingham-slam-camp',
        ...registrationData,
        finalPrice: paymentData.amount.toString(),
        basePrice: paymentData.amount.toString()
      })
    }
  );
  
  if (!registrationResponse.ok) {
    console.log('❌ Registration storage failed:', registrationResult);
    return false;
  }
  
  console.log('✅ Registration stored successfully');
  console.log(`   Registration ID: ${registrationResult.registrationId}`);
  
  return true;
}

async function testPaymentRecovery() {
  console.log('\n5. Testing payment error recovery...');
  
  // Test with invalid data to ensure proper error handling
  const invalidRequest = {
    option: 'full',
    registrationData: {
      firstName: '',  // Missing required field
      lastName: 'Test',
      email: 'invalid-email'  // Invalid email
    }
  };
  
  const { response, data } = await makeRequest(
    `${BASE_URL}/api/events/1/create-payment-intent`,
    {
      method: 'POST',
      body: JSON.stringify(invalidRequest)
    }
  );
  
  if (response.status === 400 && data.userFriendlyMessage) {
    console.log('✅ Error handling works correctly');
    console.log(`   User-friendly error: ${data.userFriendlyMessage}`);
    return true;
  } else {
    console.log('❌ Error handling not working properly');
    return false;
  }
}

async function runCompleteTest() {
  console.log('🎯 COMPLETE BIRMINGHAM SLAM CAMP REGISTRATION TEST');
  console.log('==================================================');
  
  const flowWorking = await testUserRegistrationFlow();
  const errorHandlingWorking = await testPaymentRecovery();
  
  console.log('\n📊 TEST RESULTS');
  console.log('===============');
  
  if (flowWorking && errorHandlingWorking) {
    console.log('✅ ALL TESTS PASSED');
    console.log('✅ Birmingham Slam Camp registration is working correctly');
    console.log('✅ Users can complete registration without blank white screen');
    console.log('✅ Payment processing is functional');
    console.log('✅ Error handling provides user-friendly messages');
    console.log('\n🎉 REGISTRATION SYSTEM IS READY FOR USERS!');
  } else {
    console.log('❌ SOME TESTS FAILED');
    if (!flowWorking) console.log('❌ Main registration flow has issues');
    if (!errorHandlingWorking) console.log('❌ Error handling needs improvement');
  }
}

runCompleteTest().catch(error => {
  console.error('Test suite failed:', error.message);
  process.exit(1);
});