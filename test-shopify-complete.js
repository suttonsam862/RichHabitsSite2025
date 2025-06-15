/**
 * Complete Shopify and Registration Testing
 * Tests event registration routes and retail shop Shopify integration
 */

import fetch from 'node-fetch';

function getShopifyUrl() {
  const url = process.env.SHOPIFY_STORE_URL;
  return url?.startsWith('http') ? url : `https://${url}`;
}

async function testShopifyConnection() {
  console.log('Testing Shopify API Connection...');
  
  const shopifyUrl = getShopifyUrl();
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  
  if (!shopifyUrl || !accessToken) {
    console.log('❌ Missing Shopify credentials');
    return false;
  }
  
  try {
    const response = await fetch(`${shopifyUrl}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Shopify Connected: ${data.shop?.name || 'Rich Habits Store'}`);
      return true;
    } else {
      console.log(`❌ Shopify API Error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Shopify Connection Failed: ${error.message}`);
    return false;
  }
}

async function testRetailProducts() {
  console.log('\nTesting Rich Habits Products...');
  
  const shopifyUrl = getShopifyUrl();
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  
  try {
    const response = await fetch(`${shopifyUrl}/admin/api/2024-01/products.json?limit=10`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const products = data.products || [];
      console.log(`✅ Products Retrieved: ${products.length} total products`);
      
      // Find Rich Habits specific products
      const teeProduct = products.find(p => p.title?.toLowerCase().includes('heavyweight') && p.title?.toLowerCase().includes('tee'));
      const capProduct = products.find(p => p.title?.toLowerCase().includes('cap'));
      
      if (teeProduct) {
        console.log(`✅ Found: ${teeProduct.title} - $${teeProduct.variants?.[0]?.price || 'N/A'}`);
      }
      if (capProduct) {
        console.log(`✅ Found: ${capProduct.title} - $${capProduct.variants?.[0]?.price || 'N/A'}`);
      }
      
      return { teeProduct, capProduct, allProducts: products };
    } else {
      console.log(`❌ Products API Error: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Products Test Failed: ${error.message}`);
    return null;
  }
}

async function testEventRegistrationOrder() {
  console.log('\nTesting Event Registration Order Creation...');
  
  const shopifyUrl = getShopifyUrl();
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  
  const registrationOrder = {
    order: {
      email: 'test.wrestler@example.com',
      fulfillment_status: null,
      financial_status: 'paid',
      line_items: [
        {
          title: 'Birmingham Slam Camp Registration',
          quantity: 1,
          price: '249.00',
          custom: true,
          sku: 'REG-BSC-001'
        }
      ],
      customer: {
        first_name: 'John',
        last_name: 'Wrestler',
        email: 'test.wrestler@example.com'
      },
      billing_address: {
        first_name: 'John',
        last_name: 'Wrestler',
        address1: '123 Wrestling Lane',
        city: 'Birmingham',
        province: 'AL',
        country: 'US',
        zip: '35203'
      },
      note: 'Event Registration: Birmingham Slam Camp\nAge: 16\nWeight: 155 lbs\nExperience: Intermediate',
      tags: 'event-registration,birmingham-slam-camp,test-order'
    }
  };
  
  try {
    const response = await fetch(`${shopifyUrl}/admin/api/2024-01/orders.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationOrder)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Event Registration Order Created: #${data.order?.order_number || data.order?.id}`);
      console.log(`   Customer: ${data.order?.customer?.first_name} ${data.order?.customer?.last_name}`);
      console.log(`   Total: $${data.order?.total_price || '249.00'}`);
      return data.order;
    } else {
      const errorData = await response.text();
      console.log(`❌ Registration Order Failed: ${response.status} - ${errorData}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Registration Order Test Failed: ${error.message}`);
    return null;
  }
}

async function testRetailOrder(products) {
  console.log('\nTesting Retail Order Creation...');
  
  if (!products || (!products.teeProduct && !products.capProduct)) {
    console.log('❌ No products available for retail order test');
    return null;
  }
  
  const shopifyUrl = getShopifyUrl();
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  
  const lineItems = [];
  
  if (products.teeProduct) {
    lineItems.push({
      variant_id: products.teeProduct.variants?.[0]?.id,
      quantity: 1,
      title: products.teeProduct.title,
      price: products.teeProduct.variants?.[0]?.price || '45.00'
    });
  }
  
  if (products.capProduct) {
    lineItems.push({
      variant_id: products.capProduct.variants?.[0]?.id,
      quantity: 1,
      title: products.capProduct.title,
      price: products.capProduct.variants?.[0]?.price || '25.00'
    });
  }
  
  const retailOrder = {
    order: {
      email: 'test.customer@example.com',
      fulfillment_status: null,
      financial_status: 'paid',
      line_items: lineItems,
      customer: {
        first_name: 'Test',
        last_name: 'Customer',
        email: 'test.customer@example.com'
      },
      billing_address: {
        first_name: 'Test',
        last_name: 'Customer',
        address1: '456 Shopping St',
        city: 'Test City',
        province: 'TX',
        country: 'US',
        zip: '75201'
      },
      note: 'Retail Purchase: Rich Habits Merchandise',
      tags: 'retail-purchase,test-order'
    }
  };
  
  try {
    const response = await fetch(`${shopifyUrl}/admin/api/2024-01/orders.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(retailOrder)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Retail Order Created: #${data.order?.order_number || data.order?.id}`);
      console.log(`   Items: ${data.order?.line_items?.length || lineItems.length} products`);
      console.log(`   Total: $${data.order?.total_price || 'N/A'}`);
      return data.order;
    } else {
      const errorData = await response.text();
      console.log(`❌ Retail Order Failed: ${response.status} - ${errorData}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Retail Order Test Failed: ${error.message}`);
    return null;
  }
}

async function testStripePayment() {
  console.log('\nTesting Stripe Payment Intent...');
  
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey) {
    console.log('❌ Missing Stripe secret key');
    return null;
  }
  
  try {
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'amount=24900&currency=usd&metadata[type]=event-registration&metadata[event]=birmingham-slam-camp&metadata[customer_email]=test.wrestler@example.com'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Payment Intent Created: ${data.id}`);
      console.log(`   Amount: $${(data.amount / 100).toFixed(2)}`);
      console.log(`   Status: ${data.status}`);
      return data;
    } else {
      const errorData = await response.text();
      console.log(`❌ Payment Intent Failed: ${response.status} - ${errorData}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Stripe Test Failed: ${error.message}`);
    return null;
  }
}

async function runCompleteTest() {
  console.log('🚀 Testing Event Registration and Retail Shop Integration\n');
  console.log('=' .repeat(60));
  
  // Test Shopify connection
  const isConnected = await testShopifyConnection();
  
  if (!isConnected) {
    console.log('\n❌ Cannot proceed without Shopify connection');
    return;
  }
  
  // Test products
  const products = await testRetailProducts();
  
  // Test Stripe payment
  const paymentIntent = await testStripePayment();
  
  // Test event registration order
  const registrationOrder = await testEventRegistrationOrder();
  
  // Test retail order
  const retailOrder = await testRetailOrder(products);
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Integration Test Results:');
  console.log(`Shopify Connection: ${isConnected ? '✅ Working' : '❌ Failed'}`);
  console.log(`Product Retrieval: ${products ? '✅ Working' : '❌ Failed'}`);
  console.log(`Stripe Payments: ${paymentIntent ? '✅ Working' : '❌ Failed'}`);
  console.log(`Event Registration: ${registrationOrder ? '✅ Working' : '❌ Failed'}`);
  console.log(`Retail Orders: ${retailOrder ? '✅ Working' : '❌ Failed'}`);
  
  console.log('\n🎯 Manual Testing Instructions:');
  console.log('1. Visit each event page (/events/1, /events/2, /events/3, /events/4)');
  console.log('2. Click "Register Now" and complete the registration form');
  console.log('3. Use Stripe test card: 4242 4242 4242 4242');
  console.log('4. Visit shop page (/shop) and add items to cart');
  console.log('5. Complete checkout process');
  console.log('6. Verify orders appear in Shopify admin');
  
  if (registrationOrder || retailOrder) {
    console.log('\n⚠️  Test Cleanup:');
    if (registrationOrder) {
      console.log(`   Delete test registration order #${registrationOrder.order_number || registrationOrder.id}`);
    }
    if (retailOrder) {
      console.log(`   Delete test retail order #${retailOrder.order_number || retailOrder.id}`);
    }
    console.log('   Remove test orders from Shopify admin panel');
  }
}

runCompleteTest().catch(console.error);