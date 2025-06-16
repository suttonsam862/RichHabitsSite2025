#!/usr/bin/env node

/**
 * Test Complete Webhook to Shopify Flow
 * Simulates a real Stripe payment_intent.succeeded webhook to create Shopify orders
 */

import fetch from 'node-fetch';
import crypto from 'crypto';

const WEBHOOK_URL = 'http://localhost:5000/api/stripe-webhook';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';

async function testWebhookToShopifyFlow() {
  console.log('Testing complete webhook to Shopify order creation flow...');
  
  // Real payment intent data structure with Birmingham Slam Camp registration
  const webhookPayload = {
    id: 'evt_test_webhook_' + Date.now(),
    object: 'event',
    api_version: '2020-08-27',
    created: Math.floor(Date.now() / 1000),
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_' + Date.now(),
        object: 'payment_intent',
        amount: 24900, // $249.00 in cents
        currency: 'usd',
        status: 'succeeded',
        metadata: {
          eventId: '1',
          eventSlug: 'birmingham-slam-camp',
          eventTitle: 'Birmingham Slam Camp',
          customerEmail: 'parent@example.com',
          participantFirstName: 'Jordan',
          participantLastName: 'Smith',
          schoolName: 'Hoover High School',
          age: '15',
          contactName: 'Michelle Smith',
          phone: '205-555-0199',
          waiverAccepted: 'true',
          registrationType: 'individual',
          createShopifyOrder: 'true'
        }
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_test_' + Date.now(),
      idempotency_key: null
    }
  };
  
  const payloadString = JSON.stringify(webhookPayload);
  
  // Create webhook signature
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = timestamp + '.' + payloadString;
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(signedPayload, 'utf8')
    .digest('hex');
  
  const stripeSignature = `t=${timestamp},v1=${signature}`;
  
  console.log('Sending webhook with registration data:');
  console.log('Participant:', webhookPayload.data.object.metadata.participantFirstName, webhookPayload.data.object.metadata.participantLastName);
  console.log('School:', webhookPayload.data.object.metadata.schoolName);
  console.log('Contact:', webhookPayload.data.object.metadata.contactName);
  console.log('Waiver Accepted:', webhookPayload.data.object.metadata.waiverAccepted);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripeSignature
      },
      body: Buffer.from(payloadString)
    });
    
    const responseText = await response.text();
    
    if (response.ok) {
      console.log('Webhook processed successfully!');
      console.log('Response:', responseText);
      
      try {
        const responseData = JSON.parse(responseText);
        if (responseData.shopifyOrderId) {
          console.log('Shopify Order Created:', responseData.shopifyOrderId);
          console.log('Check your Shopify admin for the new order');
        }
      } catch (e) {
        // Response might not be JSON
      }
    } else {
      console.error('Webhook failed:', response.status, response.statusText);
      console.error('Response:', responseText);
    }
    
  } catch (error) {
    console.error('Error testing webhook:', error.message);
  }
}

// Test the complete flow
testWebhookToShopifyFlow();