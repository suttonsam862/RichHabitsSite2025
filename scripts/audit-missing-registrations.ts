
import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const sql = neon(process.env.DATABASE_URL!);

async function auditMissingRegistrations() {
  try {
    console.log('🔍 Comprehensive Registration Audit Starting...');

    // Step 1: Get ALL successful payment intents from Stripe (wider date range)
    console.log('\n📊 Fetching ALL successful payment intents from Stripe...');
    
    const allPaymentIntents = [];
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      const params: any = {
        limit: 100,
        created: {
          gte: Math.floor(Date.now() / 1000) - (18 * 30 * 24 * 60 * 60) // 18 months back
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

    console.log(`✅ Found ${successfulPayments.length} total successful payments`);

    // Step 2: Analyze event distribution
    const eventAnalysis = new Map();
    
    successfulPayments.forEach(intent => {
      const eventName = intent.metadata?.event_name || 
                       intent.metadata?.eventName || 
                       intent.metadata?.event_slug ||
                       intent.metadata?.name ||
                       'Unknown Event';
      
      if (!eventAnalysis.has(eventName)) {
        eventAnalysis.set(eventName, []);
      }
      eventAnalysis.get(eventName)!.push({
        id: intent.id,
        amount: intent.amount / 100,
        created: new Date(intent.created * 1000).toISOString(),
        email: intent.metadata?.email || intent.receipt_email,
        metadata: intent.metadata
      });
    });

    console.log('\n📋 COMPLETE EVENT BREAKDOWN:');
    for (const [eventName, payments] of eventAnalysis) {
      console.log(`\n🎯 ${eventName}: ${payments.length} payments`);
      
      // Show first few payments for verification
      payments.slice(0, 3).forEach((payment: any) => {
        console.log(`  - ${payment.created}: $${payment.amount} (${payment.email || 'no email'})`);
      });
      
      if (payments.length > 3) {
        console.log(`  ... and ${payments.length - 3} more`);
      }
    }

    // Step 3: Check what's in current event-specific tables
    console.log('\n🗃️ Current Event-Specific Tables:');
    
    const currentTables = [
      'event_texas_recruiting_clinic_registrations',
      'event_birmingham_slam_camp_registrations', 
      'event_national_champ_camp_registrations',
      'event_unknown_event_registrations'
    ];

    for (const tableName of currentTables) {
      try {
        const count = await sql(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const sample = await sql(`SELECT stripe_payment_intent_id, customer_email, payment_amount FROM "${tableName}" LIMIT 3`);
        
        console.log(`\n📊 ${tableName}: ${count[0].count} records`);
        sample.forEach(record => {
          console.log(`  - ${record.stripe_payment_intent_id}: $${record.payment_amount} (${record.customer_email || 'no email'})`);
        });
      } catch (error) {
        console.log(`❌ Table ${tableName} not found or error: ${error}`);
      }
    }

    // Step 4: Find missing payment intents
    console.log('\n🔍 Finding Missing Payment Intents...');
    
    const allCurrentPaymentIntents = new Set();
    
    for (const tableName of currentTables) {
      try {
        const records = await sql(`SELECT stripe_payment_intent_id FROM "${tableName}"`);
        records.forEach(record => {
          allCurrentPaymentIntents.add(record.stripe_payment_intent_id);
        });
      } catch (error) {
        // Table might not exist
      }
    }

    const missingPayments = successfulPayments.filter(intent => 
      !allCurrentPaymentIntents.has(intent.id)
    );

    console.log(`\n❌ MISSING PAYMENTS: ${missingPayments.length}`);
    
    if (missingPayments.length > 0) {
      console.log('\n🚨 Missing Payment Details:');
      missingPayments.forEach(intent => {
        const eventName = intent.metadata?.event_name || 
                         intent.metadata?.eventName || 
                         intent.metadata?.event_slug ||
                         'Unknown';
        console.log(`  - ${intent.id}: $${intent.amount/100} | Event: ${eventName} | Email: ${intent.metadata?.email || intent.receipt_email || 'none'} | Date: ${new Date(intent.created * 1000).toISOString()}`);
      });
    }

    // Step 5: Check all database tables for registration data
    console.log('\n🗄️ Scanning ALL database tables for registration patterns...');
    
    const allTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log(`\nFound ${allTables.length} tables in database:`);
    allTables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // Step 6: Search for National Champ Camp specifically
    console.log('\n🎯 Searching for National Champ Camp registrations...');
    
    const nationalChampSearchTerms = [
      'national',
      'champ', 
      'championship',
      'vegas',
      'las vegas'
    ];

    for (const tableName of allTables.map(t => t.table_name)) {
      if (tableName.includes('registration') || tableName.includes('event') || tableName.includes('customer')) {
        try {
          const columns = await sql(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1
          `, [tableName]);

          const textColumns = columns
            .map(c => c.column_name)
            .filter(col => 
              col.includes('event') || 
              col.includes('name') || 
              col.includes('slug') || 
              col.includes('title')
            );

          if (textColumns.length > 0) {
            for (const searchTerm of nationalChampSearchTerms) {
              for (const column of textColumns) {
                try {
                  const results = await sql(`
                    SELECT COUNT(*) as count 
                    FROM "${tableName}" 
                    WHERE LOWER("${column}") LIKE $1
                  `, [`%${searchTerm}%`]);

                  if (results[0].count > 0) {
                    console.log(`🎯 Found ${results[0].count} potential National Champ Camp records in ${tableName}.${column} (searching: ${searchTerm})`);
                    
                    // Get sample records
                    const samples = await sql(`
                      SELECT * 
                      FROM "${tableName}" 
                      WHERE LOWER("${column}") LIKE $1 
                      LIMIT 3
                    `, [`%${searchTerm}%`]);
                    
                    samples.forEach(sample => {
                      console.log(`    Sample: ${JSON.stringify(sample, null, 2)}`);
                    });
                  }
                } catch (e) {
                  // Column query failed, continue
                }
              }
            }
          }
        } catch (e) {
          // Table query failed, continue
        }
      }
    }

    // Step 7: Generate comprehensive report
    console.log('\n📊 COMPREHENSIVE AUDIT SUMMARY');
    console.log('=====================================');
    console.log(`Total Stripe Payments: ${successfulPayments.length}`);
    console.log(`Currently Captured: ${successfulPayments.length - missingPayments.length}`);
    console.log(`Missing Payments: ${missingPayments.length}`);
    console.log(`Capture Rate: ${(((successfulPayments.length - missingPayments.length) / successfulPayments.length) * 100).toFixed(1)}%`);

    // Export missing payments for manual review
    if (missingPayments.length > 0) {
      const csvContent = [
        'Payment Intent ID,Amount,Date,Event Name,Email,All Metadata',
        ...missingPayments.map(intent => {
          const eventName = intent.metadata?.event_name || intent.metadata?.eventName || intent.metadata?.event_slug || 'Unknown';
          const email = intent.metadata?.email || intent.receipt_email || '';
          const allMetadata = JSON.stringify(intent.metadata || {}).replace(/"/g, '""');
          return `"${intent.id}","${intent.amount/100}","${new Date(intent.created * 1000).toISOString()}","${eventName}","${email}","${allMetadata}"`;
        })
      ].join('\n');

      const fs = require('fs');
      fs.writeFileSync('missing-payments-audit.csv', csvContent);
      console.log('\n📄 Missing payments exported to: missing-payments-audit.csv');
    }

  } catch (error) {
    console.error('❌ Audit failed:', error);
    throw error;
  }
}

// Run the audit
auditMissingRegistrations()
  .then(() => {
    console.log('✅ Registration audit completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Registration audit failed:', error);
    process.exit(1);
  });
