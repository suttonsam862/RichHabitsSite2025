#!/usr/bin/env node

/**
 * Complete Webhook Flow Verification
 * Tests the full Stripe payment_intent.succeeded to Shopify order creation flow
 */

import crypto from 'crypto';
import fetch from 'node-fetch';

const WEBHOOK_URL = 'http://localhost:5000/api/stripe-webhook';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Real payment intent data structure
const MOCK_PAYMENT_EVENT = {
  id: 'evt_test_' + Date.now(),
  object: 'event',
  api_version: '2024-06-20',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'pi_test_verification_' + Date.now(),
      object: 'payment_intent',
      amount: 24900,
      amount_capturable: 0,
      amount_details: {
        tip: {}
      },
      amount_received: 24900,
      application: null,
      application_fee_amount: null,
      automatic_payment_methods: null,
      canceled_at: null,
      cancellation_reason: null,
      capture_method: 'automatic',
      charges: {
        object: 'list',
        data: [],
        has_more: false,
        total_count: 1,
        url: '/v1/charges?payment_intent=pi_test_verification'
      },
      client_secret: 'pi_test_verification_secret',
      confirmation_method: 'automatic',
      created: Math.floor(Date.now() / 1000),
      currency: 'usd',
      customer: null,
      description: 'Event Registration Payment',
      invoice: null,
      last_payment_error: null,
      latest_charge: null,
      livemode: false,
      metadata: {
        eventId: '1',
        firstName: 'John',
        lastName: 'Smith',
        contactName: 'Jane Smith',
        email: 'john.smith@example.com',
        phone: '555-987-6543',
        tShirtSize: 'L',
        grade: '11th',
        schoolName: 'Central High School',
        clubName: 'Warriors Wrestling',
        registrationType: 'full',
        option: 'full',
        day1: 'true',
        day2: 'true',
        day3: 'false'
      },
      next_action: null,
      on_behalf_of: null,
      payment_method: null,
      payment_method_configuration_details: null,
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
    id: 'req_test_' + Date.now(),
    idempotency_key: null
  },
  type: 'payment_intent.succeeded'
};

console.log('Verifying complete Stripe to Shopify webhook flow...\n');

// 1. Verify webhook secret is available
console.log('1. Checking webhook secret configuration...');
if (!WEBHOOK_SECRET) {
  console.log('❌ STRIPE_WEBHOOK_SECRET not found in environment');
  process.exit(1);
} else {
  console.log('✅ Webhook secret configured:', WEBHOOK_SECRET.substring(0, 12) + '...');
}

// 2. Create proper Stripe webhook signature
console.log('\n2. Creating authentic Stripe webhook signature...');
const payload = JSON.stringify(MOCK_PAYMENT_EVENT);
const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${payload}`;

const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(signedPayload, 'utf8')
  .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;
console.log('✅ Generated valid Stripe signature');

// 3. Send webhook to endpoint
console.log('\n3. Sending webhook to endpoint...');
try {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': stripeSignature,
      'User-Agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)'
    },
    body: payload
  });

  console.log(`Webhook response: ${response.status} ${response.statusText}`);
  
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
  console.log('❌ Network error sending webhook:', error.message);
}

// 4. Verify logs show Shopify order creation
console.log('\n4. Expected log sequence:');
console.log('   - Payment succeeded: pi_test_verification_...');
console.log('   - Using registration data from payment intent metadata');
console.log('   - Creating Shopify order with registration data: {complete form data}');
console.log('   - Successfully created Shopify order: {order_id}');

console.log('\n📋 Verification Complete');
console.log('Monitor server logs for the expected sequence above.');
console.log('If successful, check Shopify admin for the new order with note_attributes containing:');
console.log('- First_Name: John');
console.log('- Last_Name: Smith');
console.log('- Contact_Name: Jane Smith');
console.log('- T_Shirt_Size: L');
console.log('- Grade: 11th');
console.log('- School: Central High School');
console.log('- Club: Warriors Wrestling');
console.log('- Registration_Type: full');