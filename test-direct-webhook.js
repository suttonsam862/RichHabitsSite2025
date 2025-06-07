#!/usr/bin/env node

/**
 * Direct Webhook Test - Bypasses signature verification
 */

import fetch from 'node-fetch';

const WEBHOOK_URL = 'http://localhost:5000/api/stripe-webhook';

// Test payload with realistic payment data
const webhookPayload = {
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: 'pi_3RWzX3BIRPjPy7BL1h1DAzb4', // Real payment intent ID from your screenshot
      amount: 24900, // $249.00
      status: 'succeeded',
      metadata: {
        eventId: '1',
        eventName: 'Birmingham Slam Camp',
        option: 'full',
        firstName: 'Test',
        lastName: 'Customer',
        contactName: 'Parent Guardian',
        email: 'test@example.com',
        phone: '555-123-4567',
        tShirtSize: 'Large',
        grade: '9th',
        schoolName: 'Test High School',
        clubName: 'Wrestling Club',
        day1: 'true',
        day2: 'true',
        day3: 'false'
      }
    }
  }
};

console.log('Testing webhook with direct payload...');
console.log('Payment ID:', webhookPayload.data.object.id);
console.log('Amount:', webhookPayload.data.object.amount / 100, 'USD');

try {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // No Stripe signature - should trigger development mode
      'User-Agent': 'Direct-Test-Script'
    },
    body: JSON.stringify(webhookPayload)
  });

  console.log(`\nWebhook response: ${response.status} ${response.statusText}`);
  
  if (response.ok) {
    const responseData = await response.json();
    console.log('✅ Webhook processed successfully');
    console.log('Response:', responseData);
  } else {
    console.log('❌ Webhook processing failed');
    const errorText = await response.text();
    console.log('Error details:', errorText);
  }
} catch (error) {
  console.log('❌ Network error:', error.message);
}