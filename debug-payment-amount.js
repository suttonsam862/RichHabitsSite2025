#!/usr/bin/env node

/**
 * Debug Payment Amount Calculation
 * Tests exact amount calculation to identify Stripe minimum charge issue
 */

const BASE_URL = 'http://localhost:5000';

async function testAmountCalculation() {
  console.log('Testing payment amount calculation...');
  
  const registrationData = {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '555-987-6543',
    contactName: 'Jane Smith',
    age: '16',
    schoolName: 'Birmingham High School',
    medicalReleaseAccepted: true
  };
  
  // Test different scenarios
  const testCases = [
    {
      name: 'Full registration - no discount',
      option: 'full',
      discountedAmount: null
    },
    {
      name: 'Full registration - undefined discount',
      option: 'full',
      discountedAmount: undefined
    },
    {
      name: 'Full registration - zero discount',
      option: 'full',
      discountedAmount: 0
    },
    {
      name: '1-day registration',
      option: '1day',
      discountedAmount: null
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- Testing: ${testCase.name} ---`);
    
    const requestBody = {
      option: testCase.option,
      registrationData,
      discountedAmount: testCase.discountedAmount
    };
    
    try {
      const response = await fetch(`${BASE_URL}/api/events/1/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      console.log(`Status: ${response.status}`);
      console.log('Response:', JSON.stringify(data, null, 2));
      
      if (data.amount) {
        console.log(`Amount in dollars: $${data.amount}`);
        console.log(`Amount in cents: ${data.amount * 100}`);
      }
      
    } catch (error) {
      console.log('Error:', error.message);
    }
  }
}

// Manual amount conversion test
function testStripeAmountConversion() {
  console.log('\n=== Manual Stripe Amount Conversion Test ===');
  
  const testAmounts = [249, 249.00, 124.5, 0, 0.50, 0.49];
  
  for (const amount of testAmounts) {
    const centsAmount = Math.round(amount * 100);
    console.log(`$${amount} -> ${centsAmount} cents (valid: ${centsAmount >= 50})`);
  }
}

async function runDebug() {
  testStripeAmountConversion();
  await testAmountCalculation();
}

runDebug().catch(console.error);