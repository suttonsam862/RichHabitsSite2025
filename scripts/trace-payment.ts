
import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const sql = neon(process.env.DATABASE_URL!);

async function tracePayment() {
  const paymentIntentId = 'pi_1RYuLMBIRPjPy7BLeiUURPLH';
  const customerEmail = 'jason.j.jaramillo@gmail.com';
  
  try {
    console.log(`🔍 Tracing payment: ${paymentIntentId}`);
    console.log(`📧 Customer email: ${customerEmail}`);

    // 1. Get the payment intent details from Stripe
    console.log('\n1️⃣ Fetching payment intent from Stripe...');
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log(`   Status: ${paymentIntent.status}`);
    console.log(`   Amount: $${paymentIntent.amount / 100}`);
    console.log(`   Created: ${new Date(paymentIntent.created * 1000).toISOString()}`);
    console.log(`   Customer: ${paymentIntent.customer}`);
    console.log(`   Receipt Email: ${paymentIntent.receipt_email}`);
    
    console.log('\n   Metadata:');
    for (const [key, value] of Object.entries(paymentIntent.metadata)) {
      console.log(`     ${key}: ${value}`);
    }

    // 2. Check if this payment exists in our event-specific tables
    console.log('\n2️⃣ Checking event-specific registration tables...');
    
    const eventTables = [
      'event_texas_recruiting_clinic_registrations',
      'event_birmingham_slam_camp_registrations', 
      'event_national_champ_camp_registrations',
      'event_unknown_event_registrations'
    ];

    let foundInTable = null;
    let registrationRecord = null;

    for (const tableName of eventTables) {
      try {
        const records = await sql(`
          SELECT * FROM "${tableName}" 
          WHERE stripe_payment_intent_id = $1 
          OR customer_email = $2
        `, [paymentIntentId, customerEmail]);

        if (records.length > 0) {
          foundInTable = tableName;
          registrationRecord = records[0];
          console.log(`   ✅ Found in table: ${tableName}`);
          console.log(`   Record details:`, JSON.stringify(registrationRecord, null, 2));
          break;
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${tableName}: ${error}`);
      }
    }

    if (!foundInTable) {
      console.log('   ❌ Payment not found in any event-specific table');
    }

    // 3. Check the main stripe_registration_correlations table
    console.log('\n3️⃣ Checking stripe_registration_correlations table...');
    
    try {
      const correlations = await sql(`
        SELECT * FROM stripe_registration_correlations 
        WHERE stripe_payment_intent_id = $1 
        OR customer_email = $2
        ORDER BY created_at DESC
      `, [paymentIntentId, customerEmail]);

      if (correlations.length > 0) {
        console.log(`   ✅ Found ${correlations.length} correlation record(s):`);
        correlations.forEach((record, index) => {
          console.log(`   Record ${index + 1}:`, JSON.stringify(record, null, 2));
        });
      } else {
        console.log('   ❌ No correlation records found');
      }
    } catch (error) {
      console.log(`   ❌ Error checking correlations: ${error}`);
    }

    // 4. Check if a Shopify order exists for this customer
    console.log('\n4️⃣ Checking for Shopify orders...');
    
    if (process.env.SHOPIFY_ACCESS_TOKEN && process.env.SHOPIFY_STORE_DOMAIN) {
      try {
        // Search for orders by customer email
        const response = await fetch(
          `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/orders.json?email=${encodeURIComponent(customerEmail)}&limit=10`,
          {
            headers: {
              'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json() as { orders: any[] };
          console.log(`   Found ${data.orders.length} Shopify orders for this email:`);
          
          data.orders.forEach((order, index) => {
            console.log(`   Order ${index + 1}:`);
            console.log(`     ID: ${order.id}`);
            console.log(`     Name: ${order.name}`);
            console.log(`     Created: ${order.created_at}`);
            console.log(`     Total: ${order.total_price}`);
            console.log(`     Financial Status: ${order.financial_status}`);
            console.log(`     Note: ${order.note}`);
            
            if (order.note_attributes && order.note_attributes.length > 0) {
              console.log(`     Note Attributes:`);
              order.note_attributes.forEach((attr: any) => {
                console.log(`       ${attr.name}: ${attr.value}`);
              });
            }
          });

          // Check if any order matches our payment intent ID
          const matchingOrder = data.orders.find(order => 
            order.note && order.note.includes(paymentIntentId) ||
            (order.note_attributes && order.note_attributes.some((attr: any) => 
              attr.value && attr.value.includes && attr.value.includes(paymentIntentId)
            ))
          );

          if (matchingOrder) {
            console.log(`   ✅ Found matching Shopify order: ${matchingOrder.id}`);
          } else {
            console.log(`   ❌ No Shopify order found matching payment intent ${paymentIntentId}`);
          }
        } else {
          console.log(`   ❌ Error fetching Shopify orders: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking Shopify: ${error}`);
      }
    } else {
      console.log('   ⚠️ Shopify credentials not configured');
    }

    // 5. Check server logs or webhook history
    console.log('\n5️⃣ Analysis Summary:');
    console.log('=====================================');
    
    if (paymentIntent.status === 'succeeded') {
      console.log('✅ Payment was successful in Stripe');
      
      if (foundInTable) {
        console.log(`✅ Registration data captured in: ${foundInTable}`);
        
        // Check if Shopify order ID is present
        if (registrationRecord?.shopify_order_id) {
          console.log(`✅ Shopify order ID recorded: ${registrationRecord.shopify_order_id}`);
        } else {
          console.log('❌ No Shopify order ID in registration record');
          console.log('🔧 ISSUE: Shopify order creation likely failed');
        }
      } else {
        console.log('❌ Registration data NOT captured in our system');
        console.log('🔧 ISSUE: Webhook processing likely failed');
      }
    } else {
      console.log(`❌ Payment status is: ${paymentIntent.status}`);
    }

    // 6. Recommended actions
    console.log('\n6️⃣ Recommended Actions:');
    console.log('=====================================');
    
    if (!foundInTable) {
      console.log('1. Manual registration creation needed');
      console.log('2. Check webhook endpoint configuration');
      console.log('3. Verify server was running when payment occurred');
    } else if (!registrationRecord?.shopify_order_id) {
      console.log('1. Manual Shopify order creation needed');
      console.log('2. Check Shopify API credentials');
      console.log('3. Review server logs for Shopify API errors');
    }

    console.log('\n✅ Investigation complete');

  } catch (error) {
    console.error('❌ Investigation failed:', error);
    throw error;
  }
}

// Run the investigation
tracePayment()
  .then(() => {
    console.log('\n✅ Payment trace completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Payment trace failed:', error);
    process.exit(1);
  });
