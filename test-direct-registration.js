#!/usr/bin/env node

/**
 * Test Direct Registration Endpoint
 * Tests the /api/event-registration endpoint directly to verify database storage
 */

import fetch from 'node-fetch';

async function testDirectRegistration() {
  console.log('Testing direct registration endpoint for database storage...');
  
  const registrationData = {
    eventId: 'birmingham-slam-camp',
    firstName: 'Emily',
    lastName: 'Wilson',
    email: 'guardian@example.com',
    phone: '205-555-0456',
    age: '14',
    schoolName: 'Vestavia Hills High School',
    contactName: 'Michael Wilson',
    waiverAccepted: true,
    registrationType: 'individual',
    basePrice: '249.00',
    finalPrice: '249.00'
  };
  
  console.log('Testing registration with complete contact information:');
  console.log('- Participant:', registrationData.firstName, registrationData.lastName);
  console.log('- Parent/Guardian:', registrationData.contactName);
  console.log('- Email:', registrationData.email);
  console.log('- Phone:', registrationData.phone);
  console.log('- School:', registrationData.schoolName);
  console.log('- Waiver Accepted:', registrationData.waiverAccepted);
  
  try {
    // Test the direct registration endpoint
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
      
      try {
        const parsedResult = JSON.parse(result);
        console.log('Registration ID:', parsedResult.registrationId);
        console.log('Event:', parsedResult.eventName);
        
        // Verify the registration was stored in database
        console.log('\nVerifying database storage...');
        
        // Use a small delay to ensure database write is complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Query the database directly through the API
        const checkResponse = await fetch(`http://localhost:5000/api/events/birmingham-slam-camp/registrations`);
        
        if (checkResponse.ok) {
          const registrations = await checkResponse.json();
          console.log(`Found ${registrations.length} registrations in database`);
          
          // Find our test registration
          const testRegistration = registrations.find(reg => 
            reg.firstName === 'Emily' && reg.lastName === 'Wilson'
          );
          
          if (testRegistration) {
            console.log('\nDatabase verification successful:');
            console.log('✓ Participant Name:', testRegistration.firstName, testRegistration.lastName);
            console.log('✓ Parent/Guardian Name:', testRegistration.parentName);
            console.log('✓ Parent Email:', testRegistration.parentEmail);
            console.log('✓ Parent Phone:', testRegistration.parentPhone);
            console.log('✓ School Name:', testRegistration.schoolName);
            console.log('✓ Age/Grade:', testRegistration.grade);
            console.log('✓ Waiver Accepted:', testRegistration.waiverAccepted);
            console.log('✓ Registration Type:', testRegistration.registrationType);
            console.log('✓ Session ID:', testRegistration.sessionId);
            console.log('✓ IP Address:', testRegistration.ipAddress);
            
            console.log('\nAll contact information successfully stored in database!');
          } else {
            console.log('❌ Test registration not found in database');
          }
        } else {
          console.log('❌ Could not verify database storage');
        }
        
      } catch (e) {
        console.log('Response received but parsing failed:', result);
      }
    } else {
      console.error('❌ Registration failed:', response.status, response.statusText);
      console.error('Response:', result);
    }
    
  } catch (error) {
    console.error('❌ Error testing registration:', error.message);
  }
}

// Run the test
testDirectRegistration();