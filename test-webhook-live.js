#!/usr/bin/env node

/**
 * Live Webhook Test Script
 * Tests webhook processing with real payment intent data structure
 */

import fetch from 'node-fetch';

const WEBHOOK_URL = 'http://localhost:5000/api/stripe-webhook';

// Simulate a real payment_intent.succeeded event with metadata
const webhookPayload = {
  id: 'evt_test_webhook',
  object: 'event',
  api_version: '2025-04-30.basil',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'pi_test_webhook_123',
      object: 'payment_intent',
      amount: 24900, // $249.00
      amount_capturable: 0,
      amount_received: 24900,
      application: null,
      application_fee_amount: null,
      automatic_payment_methods: {
        enabled: true
      },
      canceled_at: null,
      cancellation_reason: null,
      capture_method: 'automatic',
      charges: {
        object: 'list',
        data: [],
        has_more: false,
        total_count: 0,
        url: '/v1/charges?payment_intent=pi_test_webhook_123'
      },
      client_secret: 'pi_test_webhook_123_secret',
      confirmation_method: 'automatic',
      created: Math.floor(Date.now() / 1000),
      currency: 'usd',
      customer: null,
      description: null,
      invoice: null,
      last_payment_error: null,
      latest_charge: null,
      livemode: false,
      metadata: {
        eventId: '1',
        eventName: 'Birmingham Slam Camp',
        option: 'full',
        firstName: 'John',
        lastName: 'Doe',
        contactName: 'Jane Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        tShirtSize: 'Medium',
        grade: '8th',
        schoolName: 'Test High School',
        clubName: 'Wrestling Club',
        day1: 'true',
        day2: 'true',
        day3: 'false'
      },
      next_action: null,
      on_behalf_of: null,
      payment_method: null,
      payment_method_options: {},
      payment_method_types: ['card'],
      processing: null,
      receipt_email: null,
      review: null,
      setup_future_usage: null,
      shipping: null,
      source: null,
      statement_descriptor: null,
      statement_descriptor_suffix: null,
      status: 'succeeded',
      transfer_data: null,
      transfer_group: null
    }
  },
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: 'req_test_webhook',
    idempotency_key: null
  },
  type: 'payment_intent.succeeded'
};

console.log('Testing webhook with live payment structure...');
console.log('Payment Intent ID:', webhookPayload.data.object.id);
console.log('Amount:', webhookPayload.data.object.amount / 100, 'USD');
console.log('Event ID:', webhookPayload.data.object.metadata.eventId);
console.log('Customer:', webhookPayload.data.object.metadata.firstName, webhookPayload.data.object.metadata.lastName);

try {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Skip signature verification for testing by not including Stripe-Signature header
      'User-Agent': 'Test-Webhook-Script'
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

console.log('\n📋 Expected Actions:');
console.log('1. Database record created in event_registrations table');
console.log('2. Completed registration record created');
console.log('3. Shopify order created with registration details');
console.log('4. Confirmation email sent to customer');