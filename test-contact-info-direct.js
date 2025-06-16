#!/usr/bin/env node

/**
 * Test Contact Information in Shopify Orders - Direct API Test
 * Tests the Shopify order creation endpoint with comprehensive contact data
 */

import fetch from 'node-fetch';

async function testContactInfoViaAPI() {
  console.log('Testing contact information inclusion via API...');
  
  const registrationData = {
    eventId: 'birmingham-slam-camp',
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
  
  console.log('Testing with contact information:');
  console.log('- Participant:', registrationData.firstName, registrationData.lastName);
  console.log('- Contact/Guardian:', registrationData.contactName);
  console.log('- Email:', registrationData.email);
  console.log('- Phone:', registrationData.phone);
  console.log('- School:', registrationData.schoolName);
  
  try {
    // Test the registration endpoint
    const response = await fetch('http://localhost:5000/api/event-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData)
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('\nRegistration successful!');
      console.log('Response:', result);
      
      try {
        const parsedResult = JSON.parse(result);
        if (parsedResult.shopifyOrderId) {
          console.log('\nShopify Order Created:', parsedResult.shopifyOrderId);
          console.log('This order should include all contact information:');
          console.log('- Customer: Michelle Smith (parent/guardian)');
          console.log('- Email: michelle.smith@example.com');
          console.log('- Phone: 205-555-0199');
          console.log('- Participant: Jordan Smith (in order attributes)');
          console.log('- School: Hoover High School (in order attributes)');
        }
      } catch (e) {
        // Response might not be JSON
      }
    } else {
      console.error('Registration failed:', response.status, response.statusText);
      console.error('Response:', result);
    }
    
  } catch (error) {
    console.error('Error testing registration:', error.message);
  }
}

// Run the test
testContactInfoViaAPI();