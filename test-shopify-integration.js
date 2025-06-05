#!/usr/bin/env node

/**
 * Shopify Integration Diagnostic Script
 * Tests the complete flow from Stripe payment to Shopify order creation
 */

import fetch from 'node-fetch';
import { createShopifyDraftOrder } from './server/shopify.js';

const TEST_DATA = {
  eventId: 1,
  firstName: 'Test',
  lastName: 'User',
  contactName: 'Test Parent',
  email: 'test@example.com',
  phone: '555-123-4567',
  tShirtSize: 'M',
  grade: '9th',
  schoolName: 'Test High School',
  clubName: 'Test Wrestling Club',
  registrationType: 'full',
  day1: true,
  day2: true,
  day3: false
};

console.log('🔍 Shopify Integration Diagnostic Starting...\n');

// 1. Check environment variables
console.log('1. Checking Shopify credentials...');
const requiredEnvVars = ['SHOPIFY_ACCESS_TOKEN', 'SHOPIFY_STORE_DOMAIN', 'SHOPIFY_API_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:', missingVars.join(', '));
  process.exit(1);
} else {
  console.log('✅ All required Shopify credentials are set');
}

// 2. Test Shopify API connectivity
console.log('\n2. Testing Shopify API connectivity...');
try {
  const response = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2023-07/shop.json`,
    {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.ok) {
    const shopData = await response.json();
    console.log('✅ Shopify API connection successful');
    console.log(`   Shop: ${shopData.shop.name}`);
  } else {
    console.log('❌ Shopify API connection failed:', response.status, response.statusText);
    const errorText = await response.text();
    console.log('   Error details:', errorText);
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Network error connecting to Shopify:', error.message);
  process.exit(1);
}

// 3. Test draft order creation
console.log('\n3. Testing Shopify draft order creation...');
try {
  const testOrderParams = {
    lineItems: [{
      title: 'Test Event Registration',
      quantity: 1,
      price: 99.00
    }],
    customer: {
      firstName: TEST_DATA.firstName,
      lastName: TEST_DATA.lastName,
      email: TEST_DATA.email,
      phone: TEST_DATA.phone
    },
    note: `Test registration for diagnostic purposes`,
    attributes: [
      { key: 'First_Name', value: TEST_DATA.firstName },
      { key: 'Last_Name', value: TEST_DATA.lastName },
      { key: 'Contact_Name', value: TEST_DATA.contactName },
      { key: 'T_Shirt_Size', value: TEST_DATA.tShirtSize },
      { key: 'Grade', value: TEST_DATA.grade },
      { key: 'School', value: TEST_DATA.schoolName },
      { key: 'Club', value: TEST_DATA.clubName },
      { key: 'Registration_Type', value: TEST_DATA.registrationType },
      { key: 'Event_ID', value: TEST_DATA.eventId.toString() }
    ]
  };

  console.log('   Creating test draft order with params:', JSON.stringify(testOrderParams, null, 2));
  
  const shopifyOrder = await createShopifyDraftOrder(testOrderParams);
  
  if (shopifyOrder && shopifyOrder.id) {
    console.log('✅ Shopify order created successfully');
    console.log(`   Order ID: ${shopifyOrder.id}`);
    console.log(`   Order Number: ${shopifyOrder.order_number || shopifyOrder.name || 'N/A'}`);
    console.log(`   Customer Email: ${shopifyOrder.customer?.email || 'N/A'}`);
    console.log(`   Order Status: ${shopifyOrder.financial_status || 'N/A'}`);
  } else {
    console.log('❌ Shopify order creation failed - no order returned');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error creating Shopify test order:', error.message);
  console.log('   Full error:', error);
  process.exit(1);
}

// 4. Simulate webhook processing
console.log('\n4. Testing webhook processing flow...');
try {
  // Import the createShopifyOrderFromRegistration function
  const { createShopifyOrderFromRegistration } = await import('./server/stripe.js');
  
  const mockEvent = {
    id: 1,
    title: 'Test Event',
    date: '2024-06-01',
    location: 'Test Venue'
  };
  
  const mockRegistration = {
    ...TEST_DATA,
    stripePaymentIntentId: 'pi_test_123456789'
  };
  
  console.log('   Testing createShopifyOrderFromRegistration...');
  const webhookOrder = await createShopifyOrderFromRegistration(mockRegistration, mockEvent, 99.00);
  
  if (webhookOrder && webhookOrder.id) {
    console.log('✅ Webhook flow Shopify order creation successful');
    console.log(`   Order ID: ${webhookOrder.id}`);
  } else {
    console.log('❌ Webhook flow Shopify order creation failed');
  }
} catch (error) {
  console.log('❌ Error in webhook flow test:', error.message);
  console.log('   This indicates the issue is in the webhook processing logic');
}

console.log('\n📋 Diagnostic Summary:');
console.log('- Shopify API credentials: Verified');
console.log('- Shopify API connectivity: Working');
console.log('- Draft order creation: Tested');
console.log('- Webhook flow: Tested');

console.log('\n🔧 Next Steps:');
console.log('1. Check server logs for actual webhook processing');
console.log('2. Verify Stripe webhook endpoint is receiving events');
console.log('3. Test with a real payment to trace the full flow');
console.log('4. Check if webhook signature verification is blocking orders');