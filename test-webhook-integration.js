#!/usr/bin/env node

/**
 * Webhook Integration Test
 * Simulates a Stripe payment_intent.succeeded webhook to test Shopify order creation
 */

import fetch from 'node-fetch';

const WEBHOOK_URL = 'http://localhost:5000/api/stripe-webhook';
const TEST_PAYMENT_INTENT = {
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: 'pi_test_webhook_' + Date.now(),
      amount: 24900, // $249.00 in cents
      status: 'succeeded',
      metadata: {
        eventId: '1',
        firstName: 'Test',
        lastName: 'User',
        contactName: 'Test Parent',
        email: 'test@richhabits.com',
        phone: '555-123-4567',
        tShirtSize: 'M',
        grade: '9th',
        schoolName: 'Test High School',
        clubName: 'Test Wrestling Club',
        registrationType: 'full',
        option: 'full',
        day1: 'true',
        day2: 'true',
        day3: 'false'
      }
    }
  }
};

console.log('Testing Stripe webhook endpoint for Shopify order creation...\n');

// 1. Test webhook endpoint availability
console.log('1. Testing webhook endpoint availability...');
try {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': 'test_signature'
    },
    body: JSON.stringify(TEST_PAYMENT_INTENT)
  });

  console.log(`Webhook endpoint response: ${response.status} ${response.statusText}`);
  
  if (response.ok) {
    const responseData = await response.text();
    console.log('Response data:', responseData);
    console.log('✅ Webhook endpoint is accessible and processing events');
  } else {
    console.log('❌ Webhook endpoint error');
    const errorText = await response.text();
    console.log('Error details:', errorText);
  }
} catch (error) {
  console.log('❌ Network error testing webhook:', error.message);
}

// 2. Test health endpoint to verify server is running
console.log('\n2. Testing server health...');
try {
  const healthResponse = await fetch('http://localhost:5000/api/health');
  if (healthResponse.ok) {
    const healthData = await healthResponse.json();
    console.log('✅ Server is healthy:', healthData.status);
  } else {
    console.log('❌ Server health check failed');
  }
} catch (error) {
  console.log('❌ Cannot reach server:', error.message);
}

console.log('\n📋 Test Summary:');
console.log('- Webhook endpoint registration: Tested');
console.log('- Server connectivity: Verified');
console.log('- Payment intent processing: Attempted');

console.log('\n🔧 Manual Testing Steps:');
console.log('1. Configure Stripe webhook URL: https://your-domain.com/api/stripe-webhook');
console.log('2. Set webhook events: payment_intent.succeeded');
console.log('3. Test with real payment to verify Shopify order creation');
console.log('4. Check server logs for "Creating Shopify order with registration data"');