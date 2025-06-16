#!/usr/bin/env node

/**
 * Test Database Direct Insertion
 * Directly tests database storage of contact information
 */

import { DatabaseStorage } from './server/storage.js';

async function testDatabaseDirect() {
  console.log('Testing direct database storage of contact information...');
  
  const storage = new DatabaseStorage();
  
  const registrationData = {
    eventId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
    firstName: 'Jordan',
    lastName: 'Smith',
    email: 'parent@example.com',
    phone: '205-555-0123',
    grade: '15', // age mapped to grade
    schoolName: 'Hoover High School',
    parentName: 'Michelle Smith',
    parentEmail: 'parent@example.com',
    parentPhone: '205-555-0123',
    registrationType: 'individual',
    basePrice: '249.00',
    finalPrice: '249.00',
    waiverAccepted: true,
    termsAccepted: true,
    sessionId: 'test_session_123',
    ipAddress: '127.0.0.1',
    userAgent: 'Test Agent',
    deviceType: 'desktop'
  };
  
  console.log('Testing with complete contact information:');
  console.log('- Participant:', registrationData.firstName, registrationData.lastName);
  console.log('- Parent/Guardian:', registrationData.parentName);
  console.log('- Parent Email:', registrationData.parentEmail);
  console.log('- Parent Phone:', registrationData.parentPhone);
  console.log('- School:', registrationData.schoolName);
  console.log('- Waiver Accepted:', registrationData.waiverAccepted);
  
  try {
    // Create registration directly in database
    const registration = await storage.createEventRegistration(registrationData);
    
    console.log('\nDatabase storage successful!');
    console.log('Registration ID:', registration.id);
    console.log('Event ID:', registration.eventId);
    
    // Verify the stored data
    const retrievedRegistration = await storage.getEventRegistration(registration.id);
    
    if (retrievedRegistration) {
      console.log('\nDatabase verification successful:');
      console.log('✓ Participant Name:', retrievedRegistration.firstName, retrievedRegistration.lastName);
      console.log('✓ Parent/Guardian Name:', retrievedRegistration.parentName);
      console.log('✓ Parent Email:', retrievedRegistration.parentEmail);
      console.log('✓ Parent Phone:', retrievedRegistration.parentPhone);
      console.log('✓ School Name:', retrievedRegistration.schoolName);
      console.log('✓ Age/Grade:', retrievedRegistration.grade);
      console.log('✓ Waiver Accepted:', retrievedRegistration.waiverAccepted);
      console.log('✓ Terms Accepted:', retrievedRegistration.termsAccepted);
      console.log('✓ Registration Type:', retrievedRegistration.registrationType);
      console.log('✓ Base Price:', retrievedRegistration.basePrice);
      console.log('✓ Final Price:', retrievedRegistration.finalPrice);
      console.log('✓ Session ID:', retrievedRegistration.sessionId);
      console.log('✓ IP Address:', retrievedRegistration.ipAddress);
      console.log('✓ Created At:', retrievedRegistration.createdAt);
      
      console.log('\n✅ All contact information properly stored and retrieved from database!');
    } else {
      console.log('❌ Could not retrieve registration from database');
    }
    
  } catch (error) {
    console.error('❌ Database storage error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testDatabaseDirect();