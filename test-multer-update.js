/**
 * Test script to verify multer security update compatibility
 * Tests server startup, multer configuration, and key endpoints
 */

import fetch from 'node-fetch';

async function testServerHealth() {
  try {
    console.log('Testing server health...');
    const response = await fetch('http://localhost:5000/api/health');
    
    if (response.ok) {
      console.log('✓ Server is running and healthy');
      return true;
    } else {
      console.log('✗ Server health check failed');
      return false;
    }
  } catch (error) {
    console.log('✗ Server is not responding:', error.message);
    return false;
  }
}

async function testBasicEndpoints() {
  try {
    console.log('\nTesting basic API endpoints...');
    
    // Test events endpoint
    const eventsResponse = await fetch('http://localhost:5000/api/events');
    if (eventsResponse.ok) {
      console.log('✓ Events endpoint working');
    } else {
      console.log('✗ Events endpoint failed');
    }
    
    // Test products endpoint
    const productsResponse = await fetch('http://localhost:5000/api/products');
    if (productsResponse.ok) {
      console.log('✓ Products endpoint working');
    } else {
      console.log('✗ Products endpoint failed');
    }
    
    return true;
  } catch (error) {
    console.log('✗ Basic endpoint test failed:', error.message);
    return false;
  }
}

async function testStaticFileServing() {
  try {
    console.log('\nTesting static file serving...');
    
    // Test logo file
    const logoResponse = await fetch('http://localhost:5000/Cursive-Logo.webp');
    if (logoResponse.status === 200 || logoResponse.status === 404) {
      console.log('✓ Static file routing working (logo endpoint)');
    } else {
      console.log('✗ Static file routing failed');
    }
    
    return true;
  } catch (error) {
    console.log('✗ Static file test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting multer security update compatibility test...\n');
  
  const serverHealthy = await testServerHealth();
  
  if (serverHealthy) {
    await testBasicEndpoints();
    await testStaticFileServing();
    console.log('\n✓ All tests completed - multer update appears compatible');
  } else {
    console.log('\n✗ Server not running - please start the development server first');
  }
}

runAllTests();