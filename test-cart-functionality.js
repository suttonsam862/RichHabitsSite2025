/**
 * Test Cart Functionality
 * Verifies add to cart and cart display functionality
 */

const BASE_URL = 'http://localhost:5000';

async function testCartFunctionality() {
  console.log('🛒 Testing Cart Functionality\n');

  try {
    // 1. Test products endpoint
    console.log('1. Fetching products...');
    const productsResponse = await fetch(`${BASE_URL}/api/products`);
    const products = await productsResponse.json();
    
    if (!Array.isArray(products) || products.length === 0) {
      console.log('❌ No products available for testing');
      return;
    }
    
    console.log(`✅ Found ${products.length} products`);
    const testProduct = products[0];
    console.log(`   Testing with: ${testProduct.title}`);
    console.log(`   Product ID: ${testProduct.id}`);
    console.log(`   Variants: ${testProduct.variants?.length || 0}`);

    // 2. Test cart endpoint (should start empty)
    console.log('\n2. Testing initial cart state...');
    const cartResponse = await fetch(`${BASE_URL}/api/cart`);
    const cartData = await cartResponse.json();
    console.log('   Cart response:', JSON.stringify(cartData, null, 2));

    // 3. Test add to cart endpoint
    console.log('\n3. Testing add to cart...');
    const defaultVariant = testProduct.variants?.[0];
    if (!defaultVariant) {
      console.log('❌ No variants available for testing');
      return;
    }

    const addToCartPayload = {
      shopifyProductId: testProduct.id,
      shopifyVariantId: defaultVariant.id,
      productHandle: testProduct.handle,
      productTitle: testProduct.title,
      variantTitle: defaultVariant.title || 'Default',
      price: parseFloat(defaultVariant.price?.replace('$', '') || '0'),
      quantity: 1,
      productImage: testProduct.images?.[0]?.src || '',
      productType: 'Product',
      vendor: 'Rich Habits'
    };

    console.log('   Adding item to cart:', JSON.stringify(addToCartPayload, null, 2));

    const addResponse = await fetch(`${BASE_URL}/api/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addToCartPayload)
    });

    const addResult = await addResponse.json();
    console.log('   Add to cart result:', JSON.stringify(addResult, null, 2));

    if (addResult.success) {
      console.log('✅ Item added to cart successfully');
    } else {
      console.log('❌ Failed to add item to cart');
      return;
    }

    // 4. Verify cart now contains the item
    console.log('\n4. Verifying cart contains the item...');
    const updatedCartResponse = await fetch(`${BASE_URL}/api/cart`);
    const updatedCartData = await updatedCartResponse.json();
    console.log('   Updated cart:', JSON.stringify(updatedCartData, null, 2));

    if (updatedCartData.success && updatedCartData.cartItems?.length > 0) {
      console.log('✅ Cart now contains items');
      console.log(`   Item count: ${updatedCartData.itemCount}`);
      console.log(`   Subtotal: $${updatedCartData.subtotal}`);
    } else {
      console.log('❌ Cart is still empty after adding item');
    }

    // 5. Test cart checkout creation
    console.log('\n5. Testing checkout creation...');
    const checkoutResponse = await fetch(`${BASE_URL}/api/cart/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const checkoutData = await checkoutResponse.json();
    console.log('   Checkout response:', JSON.stringify(checkoutData, null, 2));

    if (checkoutData.success && checkoutData.checkoutUrl) {
      console.log('✅ Checkout URL created successfully');
      console.log(`   Checkout URL: ${checkoutData.checkoutUrl}`);
    } else {
      console.log('❌ Failed to create checkout URL');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCartFunctionality();