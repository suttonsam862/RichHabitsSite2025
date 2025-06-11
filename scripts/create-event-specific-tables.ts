import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';
import { writeFileSync } from 'fs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const sql = neon(process.env.DATABASE_URL!);

interface EventRegistration {
  payment_intent_id: string;
  payment_amount: number;
  payment_date: string;
  customer_email?: string;
  customer_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  school_name?: string;
  club_name?: string;
  grade?: string;
  age?: string;
  experience?: string;
  t_shirt_size?: string;
  registration_type?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  weight?: string;
  registration_data?: any;
  source_table?: string;
  correlation_method: string;
}

async function createEventSpecificTables() {
  try {
    console.log('🎯 Creating event-specific registration tables...');

    // Step 1: Get all successful payment intents from Stripe
    console.log('\n🔍 Fetching all successful payment intents...');

    const allPaymentIntents = [];
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      const params: any = {
        limit: 100,
        created: {
          gte: Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60)
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

    console.log(`✅ Found ${successfulPayments.length} successful payment intents`);

    // Step 2: Group payments by event
    const eventGroups = new Map<string, any[]>();

    successfulPayments.forEach(intent => {
      const eventName = intent.metadata?.event_name || intent.metadata?.eventName || 'Unknown Event';
      if (!eventGroups.has(eventName)) {
        eventGroups.set(eventName, []);
      }
      eventGroups.get(eventName)!.push(intent);
    });

    console.log(`\n📊 Found ${eventGroups.size} different events:`);
    Array.from(eventGroups.keys()).forEach((eventName, index) => {
      console.log(`  ${index + 1}. ${eventName} (${eventGroups.get(eventName)!.length} payments)`);
    });

    // Step 3: Get all database tables that might contain registration data
    console.log('\n🗃️ Scanning database for registration data...');

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

    // Step 4: Create event-specific tables and populate them
    for (const [eventName, payments] of eventGroups) {
      const sanitizedEventName = eventName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);

      const tableName = `event_${sanitizedEventName}_registrations`;

      console.log(`\n🔧 Creating table: ${tableName}`);

      // Drop and recreate table
      await sql`DROP TABLE IF EXISTS ${sql(tableName)}`;

      await sql(`
        CREATE TABLE "${tableName}" (
          id SERIAL PRIMARY KEY,
          stripe_payment_intent_id TEXT UNIQUE NOT NULL,
          payment_amount DECIMAL(10,2) NOT NULL,
          payment_date TIMESTAMP NOT NULL,

          customer_email TEXT,
          customer_name TEXT,
          first_name TEXT,
          last_name TEXT,
          phone TEXT,

          school_name TEXT,
          club_name TEXT,
          grade TEXT,
          age TEXT,

          experience TEXT,
          weight TEXT,
          t_shirt_size TEXT,
          registration_type TEXT,

          parent_name TEXT,
          parent_email TEXT,
          parent_phone TEXT,

          source_table TEXT,
          correlation_method TEXT NOT NULL,
          registration_data JSONB,

          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      console.log(`📝 Populating ${tableName} with ${payments.length} payments...`);

      const foundRegistrations: EventRegistration[] = [];

      // Find registration data for each payment
      for (const intent of payments) {
        const paymentDate = new Date(intent.created * 1000);
        const customerEmail = intent.metadata?.email;

        let registrationFound = false;

        // Method 1: Direct payment intent ID match
        for (const [tableNameSearch, columns] of tableMap) {
          const paymentColumns = columns.filter((col: string) => 
            col.includes('stripe') || col.includes('payment') || col.includes('intent')
          );

          if (paymentColumns.length > 0) {
            for (const column of paymentColumns) {
              try {
                const directMatch = await sql(`
                  SELECT *
                  FROM "${tableNameSearch}" 
                  WHERE "${column}" = $1
                  LIMIT 1
                `, [intent.id]);

                if (directMatch.length > 0) {
                  const reg = directMatch[0];
                  foundRegistrations.push({
                    payment_intent_id: intent.id,
                    payment_amount: intent.amount / 100,
                    payment_date: paymentDate.toISOString(),
                    customer_email: reg.email || customerEmail,
                    customer_name: `${reg.first_name || reg.firstName || ''} ${reg.last_name || reg.lastName || ''}`.trim(),
                    first_name: reg.first_name || reg.firstName,
                    last_name: reg.last_name || reg.lastName,
                    phone: reg.phone,
                    school_name: reg.school_name || reg.schoolName,
                    club_name: reg.club_name || reg.clubName,
                    grade: reg.grade,
                    age: reg.age,
                    experience: reg.experience,
                    t_shirt_size: reg.t_shirt_size || reg.tShirtSize,
                    registration_type: reg.registration_type || reg.registrationType,
                    parent_name: reg.parent_name || reg.parentName,
                    parent_email: reg.parent_email || reg.parentEmail,
                    parent_phone: reg.parent_phone || reg.parentPhone,
                    weight: reg.weight,
                    registration_data: reg,
                    source_table: tableNameSearch,
                    correlation_method: 'EXACT_PAYMENT_INTENT_MATCH'
                  });

                  registrationFound = true;
                  break;
                }
              } catch (error) {
                // Continue to next column
              }
            }
            if (registrationFound) break;
          }
        }

        // Method 2: Email + date correlation
        if (!registrationFound && customerEmail) {
          for (const [tableNameSearch, columns] of tableMap) {
            const emailColumns = columns.filter((col: string) => col.includes('email'));

            if (emailColumns.length > 0) {
              try {
                const emailMatch = await sql(`
                  SELECT *
                  FROM "${tableNameSearch}" 
                  WHERE "${emailColumns[0]}" = $1
                  AND (
                    created_at::date = $2::date OR
                    updated_at::date = $2::date OR
                    payment_date::date = $2::date
                  )
                  LIMIT 1
                `, [customerEmail, paymentDate.toISOString().split('T')[0]]);

                if (emailMatch.length > 0) {
                  const reg = emailMatch[0];
                  foundRegistrations.push({
                    payment_intent_id: intent.id,
                    payment_amount: intent.amount / 100,
                    payment_date: paymentDate.toISOString(),
                    customer_email: customerEmail,
                    customer_name: `${reg.first_name || reg.firstName || ''} ${reg.last_name || reg.lastName || ''}`.trim(),
                    first_name: reg.first_name || reg.firstName,
                    last_name: reg.last_name || reg.lastName,
                    phone: reg.phone,
                    school_name: reg.school_name || reg.schoolName,
                    club_name: reg.club_name || reg.clubName,
                    grade: reg.grade,
                    age: reg.age,
                    experience: reg.experience,
                    t_shirt_size: reg.t_shirt_size || reg.tShirtSize,
                    registration_type: reg.registration_type || reg.registrationType,
                    parent_name: reg.parent_name || reg.parentName,
                    parent_email: reg.parent_email || reg.parentEmail,
                    parent_phone: reg.parent_phone || reg.parentPhone,
                    weight: reg.weight,
                    registration_data: reg,
                    source_table: tableNameSearch,
                    correlation_method: 'EMAIL_DATE_CORRELATION'
                  });

                  registrationFound = true;
                  break;
                }
              } catch (error) {
                // Continue to next table
              }
            }
          }
        }

        // Method 3: Payment only (no registration data found)
        if (!registrationFound) {
          foundRegistrations.push({
            payment_intent_id: intent.id,
            payment_amount: intent.amount / 100,
            payment_date: paymentDate.toISOString(),
            customer_email: customerEmail,
            customer_name: intent.metadata?.firstName && intent.metadata?.lastName 
              ? `${intent.metadata.firstName} ${intent.metadata.lastName}` 
              : undefined,
            first_name: intent.metadata?.firstName,
            last_name: intent.metadata?.lastName,
            registration_data: intent.metadata,
            correlation_method: 'PAYMENT_ONLY'
          });
        }
      }

      // Insert all registrations for this event
      for (const reg of foundRegistrations) {
        await sql(`
          INSERT INTO "${tableName}" (
            stripe_payment_intent_id, payment_amount, payment_date,
            customer_email, customer_name, first_name, last_name, phone,
            school_name, club_name, grade, age, experience, weight,
            t_shirt_size, registration_type, parent_name, parent_email,
            parent_phone, source_table, correlation_method, registration_data
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
          )
        `, [
          reg.payment_intent_id, reg.payment_amount, reg.payment_date,
          reg.customer_email, reg.customer_name, reg.first_name, 
          reg.last_name, reg.phone, reg.school_name, reg.club_name,
          reg.grade, reg.age, reg.experience, reg.weight,
          reg.t_shirt_size, reg.registration_type, reg.parent_name,
          reg.parent_email, reg.parent_phone, reg.source_table,
          reg.correlation_method, JSON.stringify(reg.registration_data)
        ]);
      }

      console.log(`✅ ${tableName} created with ${foundRegistrations.length} registrations`);

      // Generate summary for this event
      const exactMatches = foundRegistrations.filter(r => r.correlation_method === 'EXACT_PAYMENT_INTENT_MATCH').length;
      const emailMatches = foundRegistrations.filter(r => r.correlation_method === 'EMAIL_DATE_CORRELATION').length;
      const paymentOnly = foundRegistrations.filter(r => r.correlation_method === 'PAYMENT_ONLY').length;

      console.log(`  📊 Exact matches: ${exactMatches}`);
      console.log(`  📊 Email correlations: ${emailMatches}`);
      console.log(`  📊 Payment only: ${paymentOnly}`);
    }

    // Step 5: Generate summary report
    console.log('\n🎉 EVENT-SPECIFIC TABLES CREATION COMPLETE!');
    console.log('===========================================');

    const createdTables = [];
    for (const eventName of eventGroups.keys()) {
      const sanitizedEventName = eventName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);

      const tableName = `event_${sanitizedEventName}_registrations`;
      const count = await sql(`SELECT COUNT(*) as count FROM "${tableName}"`);

      createdTables.push({
        original_name: eventName,
        table_name: tableName,
        registration_count: count[0].count
      });
    }

    console.log('\n📋 CREATED TABLES:');
    createdTables.forEach(table => {
      console.log(`  - ${table.table_name}`);
      console.log(`    Event: ${table.original_name}`);
      console.log(`    Registrations: ${table.registration_count}`);
      console.log('');
    });

    // Export summary to CSV
    const csvContent = [
      'Event Name,Table Name,Registration Count',
      ...createdTables.map(table => 
        `"${table.original_name}","${table.table_name}",${table.registration_count}`
      )
    ].join('\n');

    writeFileSync('event-tables-summary.csv', csvContent);
    console.log('📄 Summary exported to: event-tables-summary.csv');

    console.log('\n💡 NEXT STEPS:');
    console.log('1. Review each event table for data completeness');
    console.log('2. Identify any missing registrations that need manual correlation');
    console.log('3. Use these tables for event-specific analysis and reporting');

  } catch (error) {
    console.error('❌ Error creating event-specific tables:', error);
    throw error;
  }
}

// Run the script
createEventSpecificTables()
  .then(() => {
    console.log('✅ Event-specific tables creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Event-specific tables creation failed:', error);
    process.exit(1);
  });