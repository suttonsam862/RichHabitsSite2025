#!/usr/bin/env node

/**
 * Test Shopify Order Integration
 * Directly tests the createShopifyOrderFromRegistration function with Birmingham Slam Camp data
 */

import { createShopifyOrderFromRegistration } from './server/stripe.js';

async function testShopifyOrderCreation() {
  console.log('Testing Shopify order creation with Birmingham Slam Camp registration...');
  
  // Mock event data for Birmingham Slam Camp
  const event = {
    id: 1,
    slug: 'birmingham-slam-camp',
    title: 'Birmingham Slam Camp',
    basePrice: '249.00',
    startDate: new Date('2025-06-19'),
    endDate: new Date('2025-06-21'),
    location: 'Clay-Chalkville Middle School, Birmingham, AL'
  };
  
  // Mock registration data with all new form fields
  const registration = {
    eventId: 1,
    firstName: 'Test',
    lastName: 'Wrestler',
    schoolName: 'Birmingham High School',
    age: '16',
    contactName: 'Parent Guardian',
    email: 'test@example.com',
    phone: '555-123-4567',
    waiverAccepted: true,
    registrationType: 'individual',
    medicalReleaseAccepted: true,
    tShirtSize: 'L',
    grade: '11',
    clubName: 'Birmingham Wrestling Club'
  };
  
  const amount = 249.00;
  
  try {
    console.log('Registration data being sent to Shopify:');
    console.log(JSON.stringify(registration, null, 2));
    
    const shopifyOrder = await createShopifyOrderFromRegistration(registration, event, amount);
    
    if (shopifyOrder) {
      console.log('\n✅ Shopify order created successfully!');
      console.log('Order ID:', shopifyOrder.id);
      console.log('Order details:', shopifyOrder);
    } else {
      console.log('\n❌ Failed to create Shopify order');
    }
    
  } catch (error) {
    console.error('\n❌ Error testing Shopify order creation:', error.message);
  }
}

// Run the test
testShopifyOrderCreation();