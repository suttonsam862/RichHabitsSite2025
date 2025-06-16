#!/usr/bin/env node

/**
 * Birmingham Slam Camp Payment Flow Test
 * Tests the complete registration flow to identify why users get blank white screen
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
      console.log(`Non-JSON response (${response.status}):`, text.substring(0, 200));
      data = { error: 'Non-JSON response', responseText: text };
    }
    
    return { response, data };
  } catch (error) {
    console.error('Request failed:', error.message);
    return { error: error.message };
  }
}

async function testServerHealth() {
  console.log('\n🏥 Testing server health...');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/api/health`);
  
  if (error) {
    console.log('❌ Server health check failed:', error);
    return false;
  }
  
  if (response.ok) {
    console.log('✅ Server is healthy');
    return true;
  } else {
    console.log('❌ Server health check failed:', data);
    return false;
  }
}

async function testBirminghamSlamCampEvent() {
  console.log('\n🎯 Testing Birmingham Slam Camp event endpoint...');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/api/events/1`);
  
  if (error) {
    console.log('❌ Event endpoint failed:', error);
    return null;
  }
  
  if (response.ok) {
    console.log('✅ Birmingham Slam Camp event found:');
    console.log(`   - Title: ${data.title}`);
    console.log(`   - Price: $${data.basePrice}`);
    console.log(`   - Date: ${data.startDate} to ${data.endDate}`);
    return data;
  } else {
    console.log('❌ Event not found:', data);
    return null;
  }
}

async function testPaymentIntentCreation() {
  console.log('\n💳 Testing payment intent creation (root cause of blank screen)...');
  
  // Simulate registration data that frontend would send
  const registrationData = {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '555-987-6543',
    contactName: 'Jane Smith',
    age: '16',
    schoolName: 'Birmingham High School',
    medicalReleaseAccepted: true
  };
  
  const requestBody = {
    option: 'full',
    registrationData,
    formSessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  // Only include discount fields if they exist (matching frontend behavior)
  
  console.log('📤 Sending payment intent request...');
  console.log('Registration data:', JSON.stringify(registrationData, null, 2));
  
  const { response, data, error } = await makeRequest(
    `${BASE_URL}/api/events/1/create-payment-intent`,
    {
      method: 'POST',
      body: JSON.stringify(requestBody)
    }
  );
  
  if (error) {
    console.log('❌ Payment intent request failed:', error);
    return null;
  }
  
  console.log(`📥 Payment intent response (${response.status}):`);
  console.log(JSON.stringify(data, null, 2));
  
  if (response.ok) {
    if (data.clientSecret && data.clientSecret !== 'free_registration') {
      console.log('✅ Payment intent created successfully!');
      console.log(`   - Client Secret: ${data.clientSecret.substring(0, 20)}...`);
      console.log(`   - Amount: $${data.amount}`);
      console.log(`   - Payment Intent ID: ${data.paymentIntentId}`);
      return data;
    } else if (data.isFreeRegistration) {
      console.log('✅ Free registration detected');
      return data;
    } else {
      console.log('❌ Invalid payment intent response - missing client secret');
      return null;
    }
  } else {
    console.log('❌ Payment intent creation failed:', data);
    console.log('   - This is likely the cause of the blank white screen');
    
    if (data.userFriendlyMessage) {
      console.log(`   - User-friendly error: ${data.userFriendlyMessage}`);
    }
    
    return null;
  }
}

async function testStripeConfiguration() {
  console.log('\n🔑 Testing Stripe configuration...');
  
  // Check if Stripe environment variables are set
  const stripeEnvVars = ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY'];
  
  for (const envVar of stripeEnvVars) {
    if (process.env[envVar]) {
      const value = process.env[envVar];
      const masked = value.substring(0, 8) + '...';
      console.log(`✅ ${envVar}: ${masked}`);
    } else {
      console.log(`❌ ${envVar}: Not set`);
    }
  }
}

async function testFrontendPaymentFlow() {
  console.log('\n🖥️ Testing frontend payment flow simulation...');
  
  // This simulates what happens when user fills out form and clicks "Register"
  const sessionData = {
    registration_firstName: 'John',
    registration_lastName: 'Smith',
    registration_email: 'john.smith@example.com',
    registration_phone: '555-987-6543',
    registration_contactName: 'Jane Smith',
    registration_age: '16',
    registration_schoolName: 'Birmingham High School',
    registration_medicalReleaseAccepted: 'true',
    registration_option: 'full'
  };
  
  console.log('📋 Session data that would be stored:');
  for (const [key, value] of Object.entries(sessionData)) {
    console.log(`   ${key}: ${value}`);
  }
  
  // Test the exact URL that frontend would redirect to
  const redirectUrl = `/stripe-checkout?eventId=1&eventName=${encodeURIComponent('Birmingham Slam Camp')}&option=full`;
  console.log(`🔗 Frontend would redirect to: ${redirectUrl}`);
  
  // This is where the StripeCheckout component would call the payment intent API
  console.log('💡 StripeCheckout component would then call /api/events/1/create-payment-intent');
}

async function runCompleteDiagnosis() {
  console.log('🔥 BIRMINGHAM SLAM CAMP PAYMENT FLOW DIAGNOSIS');
  console.log('=============================================');
  
  // Test each step of the flow
  const serverHealthy = await testServerHealth();
  if (!serverHealthy) {
    console.log('\n❌ DIAGNOSIS: Server is not running properly');
    return;
  }
  
  const event = await testBirminghamSlamCampEvent();
  if (!event) {
    console.log('\n❌ DIAGNOSIS: Birmingham Slam Camp event not accessible');
    return;
  }
  
  await testStripeConfiguration();
  
  const paymentIntent = await testPaymentIntentCreation();
  
  await testFrontendPaymentFlow();
  
  console.log('\n📊 DIAGNOSIS SUMMARY');
  console.log('===================');
  
  if (paymentIntent) {
    console.log('✅ Payment intent creation is working');
    console.log('✅ Users should be able to complete registration');
    console.log('✅ No blank white screen should occur');
  } else {
    console.log('❌ Payment intent creation is FAILING');
    console.log('❌ This is causing the blank white screen');
    console.log('❌ Users cannot proceed to payment');
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('   1. Check Stripe API key configuration');
    console.log('   2. Verify server logs for detailed error messages');
    console.log('   3. Ensure all required registration fields are provided');
    console.log('   4. Test with different registration data');
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\nTest interrupted by user');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught exception:', error.message);
  process.exit(1);
});

// Run the diagnosis
runCompleteDiagnosis().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});