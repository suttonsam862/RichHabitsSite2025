#!/usr/bin/env node

/**
 * Test Contact Information in Shopify Orders
 * Directly tests the createShopifyOrderFromRegistration function with comprehensive contact data
 */

import { createShopifyOrderFromRegistration } from './server/shopify.ts';

async function testContactInfoInShopifyOrder() {
  console.log('Testing contact information inclusion in Shopify orders...');
  
  // Comprehensive registration data with all contact information
  const registrationData = {
    eventId: '1',
    eventSlug: 'birmingham-slam-camp',
    eventTitle: 'Birmingham Slam Camp',
    
    // Participant information
    firstName: 'Jordan',
    lastName: 'Smith',
    age: '15',
    schoolName: 'Hoover High School',
    grade: '10th',
    tShirtSize: 'Medium',
    
    // Contact/Parent Guardian information
    contactName: 'Michelle Smith',
    email: 'michelle.smith@example.com',
    phone: '205-555-0199',
    
    // Registration details
    registrationType: 'individual',
    basePrice: '249.00',
    finalPrice: '249.00',
    waiverAccepted: true,
    medicalReleaseAccepted: true
  };
  
  console.log('Registration data includes:');
  console.log('- Participant:', registrationData.firstName, registrationData.lastName);
  console.log('- Contact/Guardian:', registrationData.contactName);
  console.log('- Email:', registrationData.email);
  console.log('- Phone:', registrationData.phone);
  console.log('- School:', registrationData.schoolName);
  console.log('- Medical waiver accepted:', registrationData.waiverAccepted);
  
  try {
    const shopifyOrderId = await createShopifyOrderFromRegistration(
      registrationData,
      registrationData.email,
      registrationData.eventTitle
    );
    
    if (shopifyOrderId) {
      console.log('\nShopify order created successfully!');
      console.log('Order ID:', shopifyOrderId);
      console.log('\nThis order should include:');
      console.log('- Customer Name: Michelle Smith (contact/guardian)');
      console.log('- Customer Email: michelle.smith@example.com');
      console.log('- Customer Phone: 205-555-0199');
      console.log('- Participant Name: Jordan Smith (in order attributes)');
      console.log('- School Name: Hoover High School (in order attributes)');
      console.log('- Medical Waiver Status: Yes (in order attributes)');
      console.log('\nCheck your Shopify admin to verify all contact information is included');
    } else {
      console.error('Failed to create Shopify order');
    }
    
  } catch (error) {
    console.error('Error creating Shopify order:', error.message);
  }
}

// Run the test
testContactInfoInShopifyOrder();