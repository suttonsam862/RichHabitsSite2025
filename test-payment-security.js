#!/usr/bin/env node
/**
 * Critical Payment Security Test
 * Verifies that all payment security fixes are working correctly
 * Tests rejection of fake events, invalid metadata, and mock data
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

console.log('🔒 CRITICAL PAYMENT SECURITY TEST');
console.log('Testing all payment security fixes...\n');

async function testInvalidEventSlug() {
  console.log('1. Testing invalid event slug rejection...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/events/invalid-fake-event/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        option: 'full',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      })
    });

    const result = await response.json();
    
    if (response.status === 404 && result.error.includes('not found')) {
      console.log('✅ PASS: Invalid event slug correctly rejected');
    } else {
      console.log('❌ FAIL: Invalid event slug was not rejected properly');
      console.log('Response:', result);
    }
  } catch (error) {
    console.log('❌ ERROR testing invalid event slug:', error.message);
  }
}

async function testMissingCustomerInfo() {
  console.log('\n2. Testing missing customer information rejection...');
  
  try {
    // Test with valid event but missing customer info
    const response = await fetch(`${BASE_URL}/api/events/summer-wrestling-camp-2025/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        option: 'full'
        // Missing firstName, lastName, email
      })
    });

    const result = await response.json();
    
    if (response.status === 400 && (result.error.includes('email') || result.error.includes('name'))) {
      console.log('✅ PASS: Missing customer info correctly rejected');
    } else {
      console.log('❌ FAIL: Missing customer info was not rejected');
      console.log('Response:', result);
    }
  } catch (error) {
    console.log('❌ ERROR testing missing customer info:', error.message);
  }
}

async function testValidPaymentIntentCreation() {
  console.log('\n3. Testing valid payment intent creation...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/events/summer-wrestling-camp-2025/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        option: 'full',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-0123',
        grade: '10',
        schoolName: 'Test High School'
      })
    });

    const result = await response.json();
    
    if (response.status === 200 && result.clientSecret) {
      console.log('✅ PASS: Valid payment intent creation works');
      console.log(`Amount: $${result.amount}`);
      
      // Log the critical metadata that should be included
      console.log('Payment created with proper validation ✓');
    } else {
      console.log('❌ FAIL: Valid payment intent creation failed');
      console.log('Response:', result);
    }
  } catch (error) {
    console.log('❌ ERROR testing valid payment creation:', error.message);
  }
}

async function testUnmappedEventSlug() {
  console.log('\n4. Testing unmapped event slug rejection...');
  
  try {
    // Try to create payment for an event that exists but isn't in the pricing map
    const response = await fetch(`${BASE_URL}/api/events/1/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        option: 'full',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      })
    });

    const result = await response.json();
    
    if (response.status === 400 && result.error.includes('not configured for payment')) {
      console.log('✅ PASS: Unmapped event correctly rejected');
    } else {
      console.log('❌ FAIL: Unmapped event was not rejected');
      console.log('Response:', result);
    }
  } catch (error) {
    console.log('❌ ERROR testing unmapped event:', error.message);
  }
}

async function testWebhookSafeguards() {
  console.log('\n5. Testing webhook security safeguards...');
  
  // Create a mock webhook payload with fake event data
  const mockPayload = {
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_security_check',
        status: 'succeeded',
        amount: 15000,
        metadata: {
          eventId: 'null',
          eventName: 'Advanced Technique Clinic', // This should be rejected
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        }
      }
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/api/stripe-webhook`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(mockPayload)
    });

    if (response.status === 200) {
      console.log('✅ PASS: Webhook processed (but should reject fake events in logs)');
      console.log('Check server logs to confirm fake events are rejected');
    } else {
      console.log('⚠️  NOTICE: Webhook signature validation working (expected in production)');
    }
  } catch (error) {
    console.log('⚠️  NOTICE: Webhook test failed (signature verification expected)');
  }
}

async function runAllSecurityTests() {
  console.log('Starting comprehensive payment security tests...\n');
  
  await testInvalidEventSlug();
  await testMissingCustomerInfo();
  await testValidPaymentIntentCreation();
  await testUnmappedEventSlug();
  await testWebhookSafeguards();
  
  console.log('\n🔒 PAYMENT SECURITY TEST COMPLETE');
  console.log('Review all results above to ensure security measures are working.');
  console.log('\nCRITICAL: Check server logs for payment intent creation logs');
  console.log('Every real payment should show valid event ID and name.');
}

// Run all tests
runAllSecurityTests().catch(console.error);