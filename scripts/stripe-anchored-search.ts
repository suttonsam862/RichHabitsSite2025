
import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';
import { writeFileSync } from 'fs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const sql = neon(process.env.DATABASE_URL!);

interface FoundRegistration {
  payment_intent_id: string;
  payment_amount: number;
  payment_date: string;
  event_name: string;
  customer_email?: string;
  customer_name?: string;
  registration_data?: any;
  source_table?: string;
  correlation_method: string;
}

async function stripeAnchoredSearch() {
  try {
    console.log('🎯 Starting Stripe-anchored registration search...');
    console.log('📊 This will use actual Stripe payment intents to find corresponding registrations');

    // Step 1: Get ALL successful payment intents from Stripe
    console.log('\n🔍 Fetching all successful payment intents from Stripe...');
    
    const allPaymentIntents = [];
    let hasMore = true;
    let startingAfter = null;
    
    while (hasMore) {
      const params: any = {
        limit: 100,
        created: {
          gte: Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60) // Last year
        }
      };
      
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      const batch = await stripe.paymentIntents.list(params);
      allPaymentIntents.push(...batch.data);
      
      hasMore = batch.has_more;
      if (hasMore && batch.data.length > 0) {
        startingAfter = batch.data[batch.data.length - 1].id;
      }
    }

    const successfulPayments = allPaymentIntents
      .filter(intent => intent.status === 'succeeded')
      .sort((a, b) => a.created - b.created);

    console.log(`✅ Found ${successfulPayments.length} successful payment intents in Stripe`);

    // Step 2: Get all database tables that might contain registration data
    console.log('\n🗃️ Scanning database for all possible registration tables...');
    
    const allTables = await sql`
      SELECT table_name, column_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND (
        column_name ILIKE '%email%' OR
        column_name ILIKE '%payment%' OR 
        column_name ILIKE '%stripe%' OR
        column_name ILIKE '%intent%' OR
        column_name ILIKE '%first%' OR
        column_name ILIKE '%last%' OR
        column_name ILIKE '%name%'
      )
      ORDER BY table_name, column_name
    `;

    const tableMap = new Map();
    allTables.forEach(row => {
      if (!tableMap.has(row.table_name)) {
        tableMap.set(row.table_name, []);
      }
      tableMap.get(row.table_name).push(row.column_name);
    });

    console.log(`📋 Found ${tableMap.size} tables with potential registration data:`);
    Array.from(tableMap.keys()).forEach(table => {
      console.log(`  - ${table} (${tableMap.get(table).length} relevant columns)`);
    });

    // Step 3: For each Stripe payment intent, search for corresponding registration data
    console.log('\n🔍 Searching for registration data for each payment intent...');
    
    const foundRegistrations: FoundRegistration[] = [];
    let exactMatches = 0;
    let inferredMatches = 0;

    for (const intent of successfulPayments) {
      const paymentDate = new Date(intent.created * 1000);
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      const customerEmail = intent.metadata?.email;
      
      console.log(`\n💳 Processing: ${intent.id} - $${intent.amount/100} - ${eventName} - ${paymentDate.toISOString().split('T')[0]}`);
      
      let registrationFound = false;
      
      // Method 1: Direct payment intent ID match
      for (const [tableName, columns] of tableMap) {
        const paymentColumns = columns.filter(col => 
          col.includes('stripe') || col.includes('payment') || col.includes('intent')
        );
        
        if (paymentColumns.length > 0) {
          for (const column of paymentColumns) {
            try {
              const directMatch = await sql`
                SELECT *, '${tableName}' as source_table
                FROM ${sql(tableName)} 
                WHERE ${sql(column)} = ${intent.id}
                LIMIT 1
              `;
              
              if (directMatch.length > 0) {
                foundRegistrations.push({
                  payment_intent_id: intent.id,
                  payment_amount: intent.amount / 100,
                  payment_date: paymentDate.toISOString(),
                  event_name: eventName,
                  customer_email: directMatch[0].email || customerEmail,
                  customer_name: `${directMatch[0].first_name || directMatch[0].firstName || ''} ${directMatch[0].last_name || directMatch[0].lastName || ''}`.trim(),
                  registration_data: directMatch[0],
                  source_table: tableName,
                  correlation_method: 'EXACT_PAYMENT_INTENT_MATCH'
                });
                
                console.log(`  ✅ EXACT MATCH found in ${tableName}.${column}`);
                exactMatches++;
                registrationFound = true;
                break;
              }
            } catch (error) {
              // Table might not exist or column might be wrong type
            }
          }
          if (registrationFound) break;
        }
      }
      
      // Method 2: Email + date correlation (if we have email from metadata)
      if (!registrationFound && customerEmail) {
        for (const [tableName, columns] of tableMap) {
          const emailColumns = columns.filter(col => col.includes('email'));
          
          if (emailColumns.length > 0) {
            try {
              const emailMatch = await sql`
                SELECT *, '${tableName}' as source_table
                FROM ${sql(tableName)} 
                WHERE ${sql(emailColumns[0])} = ${customerEmail}
                AND (
                  created_at::date = ${paymentDate.toISOString().split('T')[0]}::date OR
                  updated_at::date = ${paymentDate.toISOString().split('T')[0]}::date OR
                  payment_date::date = ${paymentDate.toISOString().split('T')[0]}::date
                )
                LIMIT 1
              `;
              
              if (emailMatch.length > 0) {
                foundRegistrations.push({
                  payment_intent_id: intent.id,
                  payment_amount: intent.amount / 100,
                  payment_date: paymentDate.toISOString(),
                  event_name: eventName,
                  customer_email: customerEmail,
                  customer_name: `${emailMatch[0].first_name || emailMatch[0].firstName || ''} ${emailMatch[0].last_name || emailMatch[0].lastName || ''}`.trim(),
                  registration_data: emailMatch[0],
                  source_table: tableName,
                  correlation_method: 'EMAIL_DATE_CORRELATION'
                });
                
                console.log(`  ✅ EMAIL MATCH found in ${tableName} for ${customerEmail}`);
                inferredMatches++;
                registrationFound = true;
                break;
              }
            } catch (error) {
              // Continue to next table
            }
          }
        }
      }
      
      // Method 3: If no registration found, record the orphaned payment
      if (!registrationFound) {
        foundRegistrations.push({
          payment_intent_id: intent.id,
          payment_amount: intent.amount / 100,
          payment_date: paymentDate.toISOString(),
          event_name: eventName,
          customer_email: customerEmail,
          customer_name: intent.metadata?.firstName && intent.metadata?.lastName 
            ? `${intent.metadata.firstName} ${intent.metadata.lastName}` 
            : undefined,
          registration_data: intent.metadata,
          correlation_method: 'ORPHANED_PAYMENT'
        });
        
        console.log(`  ⚠️  NO REGISTRATION DATA FOUND - Payment exists but no corresponding registration`);
      }
    }

    // Step 4: Create comprehensive results table
    console.log('\n📊 Creating comprehensive payment-registration correlation table...');
    
    await sql`DROP TABLE IF EXISTS stripe_registration_correlations`;
    await sql`
      CREATE TABLE stripe_registration_correlations (
        id SERIAL PRIMARY KEY,
        stripe_payment_intent_id TEXT NOT NULL,
        payment_amount DECIMAL(10,2) NOT NULL,
        payment_date TIMESTAMP NOT NULL,
        event_name TEXT,
        customer_email TEXT,
        customer_name TEXT,
        source_table TEXT,
        correlation_method TEXT NOT NULL,
        registration_data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Insert all correlations
    for (const reg of foundRegistrations) {
      await sql`
        INSERT INTO stripe_registration_correlations (
          stripe_payment_intent_id, payment_amount, payment_date, event_name,
          customer_email, customer_name, source_table, correlation_method, registration_data
        ) VALUES (
          ${reg.payment_intent_id}, ${reg.payment_amount}, ${reg.payment_date},
          ${reg.event_name}, ${reg.customer_email}, ${reg.customer_name},
          ${reg.source_table}, ${reg.correlation_method}, ${JSON.stringify(reg.registration_data)}
        )
      `;
    }

    // Step 5: Generate summary report
    const correlationSummary = await sql`
      SELECT 
        correlation_method,
        COUNT(*) as count,
        SUM(payment_amount) as total_amount
      FROM stripe_registration_correlations
      GROUP BY correlation_method
      ORDER BY count DESC
    `;

    const eventBreakdown = await sql`
      SELECT 
        event_name,
        COUNT(*) as registrations,
        SUM(payment_amount) as total_revenue
      FROM stripe_registration_correlations
      GROUP BY event_name
      ORDER BY registrations DESC
    `;

    // Generate CSV export
    const csvHeaders = [
      'Payment Intent ID', 'Amount', 'Date', 'Event', 'Email', 'Customer Name',
      'Source Table', 'Correlation Method', 'Registration Data (JSON)'
    ];

    const csvRows = foundRegistrations.map(reg => [
      reg.payment_intent_id,
      reg.payment_amount,
      reg.payment_date.split('T')[0],
      reg.event_name,
      reg.customer_email || '',
      reg.customer_name || '',
      reg.source_table || '',
      reg.correlation_method,
      JSON.stringify(reg.registration_data || {})
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(',')
      )
    ].join('\n');

    writeFileSync('stripe-registration-correlations.csv', csvContent);

    // Final Report
    console.log('\n🎉 STRIPE-ANCHORED SEARCH COMPLETE!');
    console.log('=====================================');
    console.log(`📊 TOTAL STRIPE PAYMENTS: ${successfulPayments.length}`);
    console.log(`🔗 TOTAL CORRELATIONS FOUND: ${foundRegistrations.length}`);
    console.log(`✅ EXACT MATCHES: ${exactMatches}`);
    console.log(`🔍 INFERRED MATCHES: ${inferredMatches}`);
    console.log(`⚠️  ORPHANED PAYMENTS: ${foundRegistrations.filter(r => r.correlation_method === 'ORPHANED_PAYMENT').length}`);
    
    console.log('\n📋 CORRELATION BREAKDOWN:');
    correlationSummary.forEach(summary => {
      console.log(`  ${summary.correlation_method}: ${summary.count} (${summary.total_amount ? '$' + summary.total_amount : 'N/A'})`);
    });

    console.log('\n🎯 EVENT BREAKDOWN:');
    eventBreakdown.forEach(event => {
      console.log(`  ${event.event_name}: ${event.registrations} registrations ($${event.total_revenue || 0})`);
    });

    console.log('\n🗃️ CREATED:');
    console.log('  - stripe_registration_correlations (database table)');
    console.log('  - stripe-registration-correlations.csv (export file)');

    console.log('\n💡 NEXT STEPS:');
    console.log('1. Review orphaned payments - these may need manual correlation');
    console.log('2. Check if inferred matches are accurate');
    console.log('3. Investigate missing registration data for orphaned payments');

  } catch (error) {
    console.error('❌ Error during Stripe-anchored search:', error);
    throw error;
  }
}

// Run the search
stripeAnchoredSearch()
  .then(() => {
    console.log('✅ Stripe-anchored search completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Stripe-anchored search failed:', error);
    process.exit(1);
  });
