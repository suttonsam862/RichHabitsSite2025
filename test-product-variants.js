/**
 * Test script to debug product variant sizing display
 * Checks the actual Shopify product data structure
 */
import fetch from 'node-fetch';

async function testProductVariants() {
  try {
    console.log('Testing product variants and sizing data...\n');
    
    // Test the products API endpoint
    const response = await fetch('http://localhost:3000/api/products');
    const products = await response.json();
    
    console.log(`Found ${products.length} products\n`);
    
    products.forEach((product, index) => {
      console.log(`=== Product ${index + 1}: ${product.title} ===`);
      console.log(`Handle: ${product.handle}`);
      console.log(`Product Type: ${product.product_type || 'N/A'}`);
      console.log(`Variants Count: ${product.variants?.length || 0}`);
      
      if (product.variants && product.variants.length > 0) {
        console.log('\nVariants:');
        product.variants.forEach((variant, vIndex) => {
          console.log(`  Variant ${vIndex + 1}:`);
          console.log(`    ID: ${variant.id}`);
          console.log(`    Title: ${variant.title}`);
          console.log(`    Price: ${variant.price}`);
          console.log(`    Available: ${variant.available}`);
          console.log(`    Option1: ${variant.option1 || 'N/A'}`);
          console.log(`    Option2: ${variant.option2 || 'N/A'}`);
          console.log(`    Option3: ${variant.option3 || 'N/A'}`);
        });
      }
      
      if (product.options && product.options.length > 0) {
        console.log('\nProduct Options:');
        product.options.forEach((option, oIndex) => {
          console.log(`  Option ${oIndex + 1}:`);
          console.log(`    Name: ${option.name}`);
          console.log(`    Values: ${option.values.join(', ')}`);
        });
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    });
    
  } catch (error) {
    console.error('Error testing product variants:', error);
  }
}

testProductVariants();