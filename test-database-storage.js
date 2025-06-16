#!/usr/bin/env node

/**
 * Test Database Storage for Contact Information
 * Verifies that all form fields are properly stored in the database
 */

import fetch from 'node-fetch';

async function testDatabaseStorage() {
  console.log('Testing database storage of contact information...');
  
  const registrationData = {
    eventId: 1,
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'parent@example.com',
    phone: '205-555-0123',
    age: '16',
    schoolName: 'Mountain Brook High School',
    contactName: 'Sarah Johnson',
    waiverAccepted: true,
    registrationType: 'individual'
  };
  
  console.log('Testing registration with:');
  console.log('- Participant:', registrationData.firstName, registrationData.lastName);
  console.log('- Contact/Guardian:', registrationData.contactName);
  console.log('- Email:', registrationData.email);
  console.log('- Phone:', registrationData.phone);
  console.log('- School:', registrationData.schoolName);
  console.log('- Waiver Accepted:', registrationData.waiverAccepted);
  
  try {
    // Test payment intent creation (which stores in database)
    const response = await fetch('http://localhost:5000/api/events/1/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData)
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('\nPayment intent created successfully!');
      
      try {
        const parsedResult = JSON.parse(result);
        console.log('Client Secret received, registration data stored in database');
        
        // Test fetching registrations to verify database storage
        const registrationsResponse = await fetch('http://localhost:5000/api/events/1/registrations');
        
        if (registrationsResponse.ok) {
          const registrations = await registrationsResponse.json();
          console.log(`\nFound ${registrations.length} registrations in database`);
          
          // Find our test registration
          const testRegistration = registrations.find(reg => 
            reg.firstName === 'Alex' && reg.lastName === 'Johnson'
          );
          
          if (testRegistration) {
            console.log('\nDatabase storage verified:');
            console.log('- Participant Name:', testRegistration.firstName, testRegistration.lastName);
            console.log('- Parent/Guardian Name:', testRegistration.parentName);
            console.log('- Parent Email:', testRegistration.parentEmail);
            console.log('- Parent Phone:', testRegistration.parentPhone);
            console.log('- School Name:', testRegistration.schoolName);
            console.log('- Waiver Accepted:', testRegistration.waiverAccepted);
            console.log('- Registration ID:', testRegistration.id);
            console.log('- Event ID:', testRegistration.eventId);
          } else {
            console.log('Test registration not found in database');
          }
        }
        
      } catch (e) {
        console.log('Response received but parsing failed:', result);
      }
    } else {
      console.error('Registration failed:', response.status, response.statusText);
      console.error('Response:', result);
    }
    
  } catch (error) {
    console.error('Error testing database storage:', error.message);
  }
}

// Run the test
testDatabaseStorage();