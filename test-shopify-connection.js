#!/usr/bin/env node

/**
 * Test Shopify API Connection and Order Creation
 * Verifies the actual Shopify integration is working
 */

import fetch from 'node-fetch';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

async function testShopifyConnection() {
  console.log('Testing Shopify API Connection...');
  console.log('Store Domain:', SHOPIFY_STORE_DOMAIN ? 'Set' : 'Not set');
  console.log('Access Token:', SHOPIFY_ACCESS_TOKEN ? 'Set (length: ' + SHOPIFY_ACCESS_TOKEN.length + ')' : 'Not set');
  
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
    console.error('Missing Shopify configuration');
    return false;
  }
  
  try {
    // Test API connection by fetching shop info
    console.log('\nTesting shop API access...');
    const shopResponse = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!shopResponse.ok) {
      console.error('Shop API failed:', shopResponse.status, shopResponse.statusText);
      const errorText = await shopResponse.text();
      console.error('Error details:', errorText);
      return false;
    }
    
    const shopData = await shopResponse.json();
    console.log('Shop connected:', shopData.shop.name);
    
    // Test creating a draft order
    console.log('\nTesting draft order creation...');
    const draftOrderData = {
      draft_order: {
        line_items: [
          {
            title: "Birmingham Slam Camp Registration - TEST",
            price: "249.00",
            quantity: 1,
            custom: true
          }
        ],
        customer: {
          first_name: "Test",
          last_name: "Customer",
          email: "test@example.com"
        },
        note: "Test registration from Rich Habits system",
        note_attributes: [
          { name: "Event_Name", value: "Birmingham Slam Camp" },
          { name: "Participant_First_Name", value: "Test" },
          { name: "Participant_Last_Name", value: "Customer" },
          { name: "Medical_Waiver_Accepted", value: "Yes" },
          { name: "School_Name", value: "Test High School" }
        ],
        tags: "test,rich-habits,birmingham-slam-camp"
      }
    };
    
    const draftResponse = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftOrderData)
      }
    );
    
    if (!draftResponse.ok) {
      console.error('Draft order creation failed:', draftResponse.status, draftResponse.statusText);
      const errorText = await draftResponse.text();
      console.error('Error details:', errorText);
      return false;
    }
    
    const draftOrder = await draftResponse.json();
    console.log('Draft order created successfully!');
    console.log('Draft Order ID:', draftOrder.draft_order.id);
    console.log('Order Name:', draftOrder.draft_order.name);
    
    // Complete the draft order to make it a real order
    console.log('\nCompleting draft order...');
    const completeResponse = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/draft_orders/${draftOrder.draft_order.id}/complete.json`,
      {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draft_order: {
            payment_pending: false
          }
        })
      }
    );
    
    if (!completeResponse.ok) {
      console.error('Draft order completion failed:', completeResponse.status, completeResponse.statusText);
      const errorText = await completeResponse.text();
      console.error('Error details:', errorText);
      return false;
    }
    
    const completedOrder = await completeResponse.json();
    console.log('Order completed successfully!');
    console.log('Final Order ID:', completedOrder.draft_order.order_id);
    console.log('Order Number:', completedOrder.draft_order.name);
    console.log('Status:', completedOrder.draft_order.status);
    
    console.log('\nTest order should now appear in your Shopify admin interface');
    console.log('You can check: Orders > All orders in your Shopify dashboard');
    
    return true;
    
  } catch (error) {
    console.error('Shopify test failed:', error.message);
    return false;
  }
}

// Run the test
testShopifyConnection()
  .then(success => {
    if (success) {
      console.log('\nShopify integration is working correctly');
    } else {
      console.log('\nShopify integration needs configuration');
    }
  });