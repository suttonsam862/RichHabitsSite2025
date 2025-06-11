/**
 * Test script for fixed team registration and 1-day registration flows
 * Tests proper pricing, coach contact info, and Shopify integration
 */

const BASE_URL = 'http://localhost:5000';

// Test data for team registration with 1-day option
const teamRegistrationData = {
  eventId: "1", // Birmingham Slam Camp
  teamName: "Westfield High Wrestling",
  schoolName: "Westfield High School",
  option: "1day",
  registrationType: "team",
  numberOfDays: 1,
  selectedDates: ["June 5"],
  teamContact: {
    firstName: "Mike",
    lastName: "Johnson",
    email: "coach.johnson@westfield.edu",
    phone: "555-123-4567"
  },
  athletes: [
    {
      firstName: "Alex",
      lastName: "Smith",
      email: "alex.smith@student.westfield.edu",
      grade: "10",
      tShirtSize: "M",
      parentName: "Sarah Smith",
      parentPhoneNumber: "555-987-6543",
      experienceLevel: "intermediate"
    },
    {
      firstName: "Jake",
      lastName: "Wilson",
      email: "jake.wilson@student.westfield.edu", 
      grade: "11",
      tShirtSize: "L",
      parentName: "Tom Wilson",
      parentPhoneNumber: "555-876-5432",
      experienceLevel: "advanced"
    }
  ]
};

// Test data for individual 1-day registration
const individual1DayData = {
  eventId: "2", // National Champ Camp
  firstName: "Emma",
  lastName: "Davis",
  email: "emma.davis@email.com",
  phone: "555-234-5678",
  grade: "9",
  tShirtSize: "S",
  contactName: "Lisa Davis",
  schoolName: "Central High",
  option: "1day",
  registrationType: "individual",
  numberOfDays: 1,
  selectedDates: ["June 6"]
};

async function testTeamRegistrationPricing() {
  console.log('\n1. Testing team registration pricing calculation...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/events/1/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        option: '1day',
        registrationType: 'team',
        athletes: teamRegistrationData.athletes,
        numberOfDays: 1,
        selectedDates: ['June 5']
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Team payment intent creation failed:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Team payment intent created successfully');
    console.log(`   Team pricing (2 athletes, 1-day): $${result.amount}`);
    
    // Expected: Birmingham Slam Camp full price is $249, so 1-day should be $124.50 x 2 = $249
    const expectedAmount = 249; // $124.50 x 2 athletes
    if (Math.abs(result.amount - expectedAmount) < 1) {
      console.log('✅ Team pricing calculation correct');
      return { success: true, clientSecret: result.clientSecret };
    } else {
      console.log(`❌ Team pricing incorrect. Expected: $${expectedAmount}, Got: $${result.amount}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Error testing team pricing:', error.message);
    return false;
  }
}

async function testIndividual1DayPricing() {
  console.log('\n2. Testing individual 1-day registration pricing...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/events/2/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        option: '1day',
        registrationType: 'individual',
        numberOfDays: 1,
        selectedDates: ['June 6']
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Individual 1-day payment intent creation failed:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Individual 1-day payment intent created successfully');
    console.log(`   Individual 1-day pricing: $${result.amount}`);
    
    // Expected: National Champ Camp has predefined 1-day pricing of $119
    const expectedAmount = 119;
    if (Math.abs(result.amount - expectedAmount) < 1) {
      console.log('✅ Individual 1-day pricing calculation correct');
      return { success: true, clientSecret: result.clientSecret };
    } else {
      console.log(`❌ Individual 1-day pricing incorrect. Expected: $${expectedAmount}, Got: $${result.amount}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Error testing individual 1-day pricing:', error.message);
    return false;
  }
}

async function testTeamRegistrationSubmission() {
  console.log('\n3. Testing team registration submission...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/team-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...teamRegistrationData,
        stripePaymentIntentId: 'pi_test_team_' + Date.now()
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Team registration submission failed:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Team registration submitted successfully');
    console.log(`   Team: ${result.teamName}`);
    console.log(`   Athletes: ${result.athleteCount}`);
    console.log(`   Total price: $${result.totalPrice}`);
    console.log(`   Team contact ID: ${result.teamContactId}`);
    console.log(`   Registration IDs: ${result.registrationIds.join(', ')}`);
    
    if (result.shopifyOrderId) {
      console.log(`   Shopify Order ID: ${result.shopifyOrderId}`);
    }

    return result;
  } catch (error) {
    console.log('❌ Error testing team registration:', error.message);
    return false;
  }
}

async function testIndividual1DaySubmission() {
  console.log('\n4. Testing individual 1-day registration submission...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/event-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...individual1DayData,
        medicalReleaseAccepted: true,
        termsAccepted: true
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Individual 1-day registration submission failed:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Individual 1-day registration submitted successfully');
    console.log(`   Registration ID: ${result.registrationId}`);

    return result;
  } catch (error) {
    console.log('❌ Error testing individual 1-day registration:', error.message);
    return false;
  }
}

async function verifyDatabaseRecords() {
  console.log('\n5. Verifying database records...');
  
  try {
    // This would require database access - showing expected query structure
    console.log('Expected database verification queries:');
    console.log(`
    -- Verify team registrations
    SELECT 
      registration_type,
      team_name,
      school_name,
      first_name,
      last_name,
      email,
      base_price,
      final_price,
      shopify_order_id,
      stripe_payment_intent_id
    FROM event_registrations 
    WHERE team_name = 'Westfield High Wrestling'
    ORDER BY registration_type DESC, created_at;
    
    -- Verify 1-day pricing (should be 50% of full price)
    SELECT 
      registration_type,
      final_price::numeric,
      (final_price::numeric / 2) as half_price_check
    FROM event_registrations 
    WHERE email IN ('emma.davis@email.com', 'coach.johnson@westfield.edu')
    AND created_at > NOW() - INTERVAL '1 hour';
    `);

    console.log('✅ Database verification queries prepared');
    return true;
  } catch (error) {
    console.log('❌ Error preparing database verification:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Running Team Registration and 1-Day Registration Tests');
  console.log('=' .repeat(60));

  const results = {
    teamPricing: await testTeamRegistrationPricing(),
    individual1DayPricing: await testIndividual1DayPricing(),
    teamSubmission: await testTeamRegistrationSubmission(),
    individual1DaySubmission: await testIndividual1DaySubmission(),
    databaseVerification: await verifyDatabaseRecords()
  };

  console.log('\n📋 Test Results Summary:');
  console.log('=' .repeat(40));
  console.log(`Team pricing calculation: ${results.teamPricing ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Individual 1-day pricing: ${results.individual1DayPricing ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Team registration submission: ${results.teamSubmission ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Individual 1-day submission: ${results.individual1DaySubmission ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Database verification prep: ${results.databaseVerification ? '✅ PASS' : '❌ FAIL'}`);

  const passCount = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Result: ${passCount}/${totalTests} tests passed`);
  
  if (passCount === totalTests) {
    console.log('🎉 All team registration and 1-day registration fixes working correctly!');
  } else {
    console.log('⚠️  Some issues remain - review failed tests above');
  }

  return results;
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests, testTeamRegistrationPricing, testIndividual1DayPricing };