
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface SearchResult {
  searchName: string;
  found: boolean;
  matches: any[];
  similarMatches: any[];
  paymentIntents: any[];
  connectionMethod?: string;
}

async function searchMultipleRegistrations() {
  try {
    console.log('🔍 Searching for multiple registrations...');
    
    // Test database connectivity
    console.log('🔗 Testing database connection...');
    const connectionTest = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');

    const searchNames = [
      'Austin Jacks',
      'Brayden Wilson', 
      'Colton Pearson',
      'Cash Harrison',
      'Xavier Harris',
      'Colton Lancaster',
      'Able Pillton',
      'Bentley Haney',
      'Brady Coggin',
      'Evan Smith',
      'George Hayes',
      'Cole Amaro',
      'Anthony Watts',
      'Daniel Estrada',
      'Renzo Watts'
    ];

    // Get all available tables with registration data
    const allTables = await sql`
      SELECT table_name, column_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND (
        column_name ILIKE '%name%' OR
        column_name ILIKE '%email%' OR
        column_name ILIKE '%stripe%' OR
        column_name ILIKE '%payment%'
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

    console.log(`📋 Found ${tableMap.size} tables with potential registration data`);

    const results: SearchResult[] = [];

    for (const fullName of searchNames) {
      console.log(`\n🔍 Searching for: ${fullName}`);
      
      const [firstName, lastName] = fullName.split(' ');
      const result: SearchResult = {
        searchName: fullName,
        found: false,
        matches: [],
        similarMatches: [],
        paymentIntents: []
      };

      // Method 1: Direct name search across all tables
      for (const [tableName, columns] of tableMap) {
        const nameColumns = columns.filter(col => 
          col.toLowerCase().includes('name') || 
          col.toLowerCase().includes('customer')
        );

        for (const column of nameColumns) {
          try {
            // Search for full name
            const fullNameResults = await sql`
              SELECT *, '${tableName}' as source_table, '${column}' as search_column
              FROM ${sql(tableName)} 
              WHERE LOWER(${sql(column)}) LIKE ${`%${fullName.toLowerCase()}%`}
              LIMIT 5
            `;

            if (fullNameResults.length > 0) {
              result.matches.push(...fullNameResults);
              result.found = true;
              result.connectionMethod = `DIRECT_FULL_NAME_MATCH in ${tableName}.${column}`;
            }

            // Search for first name + last name separately
            if (firstName && lastName) {
              const separateNameResults = await sql`
                SELECT *, '${tableName}' as source_table, '${column}' as search_column
                FROM ${sql(tableName)} 
                WHERE (
                  LOWER(${sql(column)}) LIKE ${`%${firstName.toLowerCase()}%`} AND
                  LOWER(${sql(column)}) LIKE ${`%${lastName.toLowerCase()}%`}
                )
                LIMIT 5
              `;

              if (separateNameResults.length > 0) {
                result.matches.push(...separateNameResults);
                result.found = true;
                if (!result.connectionMethod) {
                  result.connectionMethod = `SEPARATE_NAME_MATCH in ${tableName}.${column}`;
                }
              }
            }
          } catch (error) {
            // Continue to next column
          }
        }
      }

      // Method 2: Search by individual first and last name in separate columns
      for (const [tableName, columns] of tableMap) {
        const firstNameCols = columns.filter(col => 
          col.toLowerCase().includes('first') && col.toLowerCase().includes('name')
        );
        const lastNameCols = columns.filter(col => 
          col.toLowerCase().includes('last') && col.toLowerCase().includes('name')
        );

        if (firstNameCols.length > 0 && lastNameCols.length > 0 && firstName && lastName) {
          for (const firstCol of firstNameCols) {
            for (const lastCol of lastNameCols) {
              try {
                const nameColumnResults = await sql`
                  SELECT *, '${tableName}' as source_table
                  FROM ${sql(tableName)} 
                  WHERE LOWER(${sql(firstCol)}) LIKE ${`%${firstName.toLowerCase()}%`}
                  AND LOWER(${sql(lastCol)}) LIKE ${`%${lastName.toLowerCase()}%`}
                  LIMIT 5
                `;

                if (nameColumnResults.length > 0) {
                  result.matches.push(...nameColumnResults);
                  result.found = true;
                  if (!result.connectionMethod) {
                    result.connectionMethod = `FIRST_LAST_COLUMN_MATCH in ${tableName}`;
                  }
                }
              } catch (error) {
                // Continue to next combination
              }
            }
          }
        }
      }

      // Method 3: Search for similar names (phonetic matches, common misspellings)
      if (!result.found && lastName) {
        const similarLastNames = generateSimilarNames(lastName);
        
        for (const similarName of similarLastNames) {
          for (const [tableName, columns] of tableMap) {
            const nameColumns = columns.filter(col => 
              col.toLowerCase().includes('name') || 
              col.toLowerCase().includes('customer')
            );

            for (const column of nameColumns) {
              try {
                const similarResults = await sql`
                  SELECT *, '${tableName}' as source_table, '${column}' as search_column
                  FROM ${sql(tableName)} 
                  WHERE LOWER(${sql(column)}) LIKE ${`%${similarName.toLowerCase()}%`}
                  LIMIT 3
                `;

                if (similarResults.length > 0) {
                  result.similarMatches.push(...similarResults);
                  if (!result.connectionMethod) {
                    result.connectionMethod = `SIMILAR_NAME_MATCH (${lastName} → ${similarName}) in ${tableName}.${column}`;
                  }
                }
              } catch (error) {
                // Continue
              }
            }
          }
        }
      }

      // Method 4: Search for payment intents with this name in metadata
      try {
        const paymentIntentResults = await sql`
          SELECT *
          FROM stripe_registration_correlations 
          WHERE LOWER(customer_name) LIKE ${`%${fullName.toLowerCase()}%`}
          OR LOWER(customer_name) LIKE ${`%${firstName?.toLowerCase() || ''}%`}
          OR LOWER(customer_name) LIKE ${`%${lastName?.toLowerCase() || ''}%`}
          LIMIT 5
        `;

        if (paymentIntentResults.length > 0) {
          result.paymentIntents.push(...paymentIntentResults);
          if (!result.connectionMethod) {
            result.connectionMethod = 'PAYMENT_INTENT_METADATA_MATCH';
          }
        }
      } catch (error) {
        // Table might not exist
      }

      // Method 5: Check event-specific tables
      const eventTables = Array.from(tableMap.keys()).filter(name => 
        name.includes('birmingham') || 
        name.includes('registration') ||
        name.includes('event')
      );

      for (const tableName of eventTables) {
        try {
          const eventResults = await sql`
            SELECT *
            FROM ${sql(tableName)} 
            WHERE LOWER(customer_name) LIKE ${`%${fullName.toLowerCase()}%`}
            OR LOWER(first_name) LIKE ${`%${firstName?.toLowerCase() || ''}%`}
            OR LOWER(last_name) LIKE ${`%${lastName?.toLowerCase() || ''}%`}
            LIMIT 3
          `;

          if (eventResults.length > 0) {
            result.matches.push(...eventResults.map(r => ({...r, source_table: tableName})));
            result.found = true;
            if (!result.connectionMethod) {
              result.connectionMethod = `EVENT_TABLE_MATCH in ${tableName}`;
            }
          }
        } catch (error) {
          // Continue
        }
      }

      results.push(result);
    }

    // Display results
    console.log('\n📊 COMPREHENSIVE SEARCH RESULTS:');
    console.log('='.repeat(80));

    for (const result of results) {
      console.log(`\n👤 ${result.searchName.toUpperCase()}`);
      console.log('-'.repeat(50));
      
      if (result.found) {
        console.log(`✅ FOUND - Status: REGISTERED`);
        console.log(`🔗 Connection Method: ${result.connectionMethod}`);
        console.log(`📊 Direct Matches: ${result.matches.length}`);
        
        // Show first match details
        if (result.matches.length > 0) {
          const match = result.matches[0];
          console.log(`📋 Sample Match Details:`);
          console.log(`   Source: ${match.source_table || 'Unknown'}`);
          console.log(`   Email: ${match.email || match.customer_email || 'N/A'}`);
          console.log(`   Phone: ${match.phone || 'N/A'}`);
          console.log(`   Event: ${match.event_name || match.event_slug || 'N/A'}`);
          console.log(`   Payment Intent: ${match.stripe_payment_intent_id || 'N/A'}`);
          console.log(`   Registration Date: ${match.created_at || match.payment_date || 'N/A'}`);
        }
      } else if (result.similarMatches.length > 0) {
        console.log(`⚠️  SIMILAR MATCHES FOUND - Status: POSSIBLE`);
        console.log(`🔗 Connection Method: ${result.connectionMethod}`);
        console.log(`📊 Similar Matches: ${result.similarMatches.length}`);
        
        result.similarMatches.forEach((match, index) => {
          console.log(`   ${index + 1}. ${match.customer_name || match.first_name + ' ' + match.last_name || 'Name N/A'}`);
          console.log(`      Source: ${match.source_table}`);
          console.log(`      Email: ${match.email || match.customer_email || 'N/A'}`);
        });
      } else if (result.paymentIntents.length > 0) {
        console.log(`💳 PAYMENT INTENT FOUND - Status: PAID (NO REGISTRATION DATA)`);
        console.log(`🔗 Connection Method: ${result.connectionMethod}`);
        console.log(`📊 Payment Records: ${result.paymentIntents.length}`);
        
        result.paymentIntents.forEach((payment, index) => {
          console.log(`   ${index + 1}. Payment: $${payment.payment_amount || 'N/A'}`);
          console.log(`      Date: ${payment.payment_date || 'N/A'}`);
          console.log(`      Event: ${payment.event_name || 'N/A'}`);
        });
      } else {
        console.log(`❌ NOT FOUND - Status: NOT IN DATABASE`);
        console.log(`📊 No matches found in any table`);
      }

      // Check for parent/guardian relationships
      if (result.found || result.similarMatches.length > 0) {
        console.log(`\n🔍 Additional Analysis:`);
        
        // Check if this might be a parent name
        const allMatches = [...result.matches, ...result.similarMatches];
        const parentMatches = allMatches.filter(m => 
          m.parent_name || m.contact_name || m.guardian_name
        );
        
        if (parentMatches.length > 0) {
          console.log(`   👨‍👩‍👧‍👦 Possible Parent/Guardian relationships found: ${parentMatches.length}`);
        }

        // Check for team registrations
        const teamMatches = allMatches.filter(m => 
          m.registration_type === 'team' || m.team_name
        );
        
        if (teamMatches.length > 0) {
          console.log(`   👥 Team registration connections: ${teamMatches.length}`);
        }
      }
    }

    // Summary statistics
    const foundCount = results.filter(r => r.found).length;
    const similarCount = results.filter(r => !r.found && r.similarMatches.length > 0).length;
    const paymentOnlyCount = results.filter(r => !r.found && r.similarMatches.length === 0 && r.paymentIntents.length > 0).length;
    const notFoundCount = results.filter(r => !r.found && r.similarMatches.length === 0 && r.paymentIntents.length === 0).length;

    console.log(`\n📈 SUMMARY STATISTICS:`);
    console.log(`=`.repeat(50));
    console.log(`✅ Confirmed Registered: ${foundCount}/${searchNames.length}`);
    console.log(`⚠️  Similar/Possible Matches: ${similarCount}/${searchNames.length}`);
    console.log(`💳 Payment Only (No Registration): ${paymentOnlyCount}/${searchNames.length}`);
    console.log(`❌ Not Found: ${notFoundCount}/${searchNames.length}`);

    console.log('\n🎯 SEARCH COMPLETE');

  } catch (error) {
    console.error('❌ Error during search:', error);
    throw error;
  }
}

function generateSimilarNames(name: string): string[] {
  const similar = [];
  
  // Common spelling variations
  const variations: Record<string, string[]> = {
    'jacks': ['jack', 'jackson', 'jacques'],
    'wilson': ['willson', 'wilson'],
    'pearson': ['pierson', 'peterson'],
    'harrison': ['harris', 'harrison'],
    'harris': ['harrison', 'harris'],
    'lancaster': ['lanchester'],
    'pillton': ['pilton', 'pillon'],
    'haney': ['hainey', 'honey'],
    'coggin': ['coggins', 'cogin'],
    'smith': ['smyth'],
    'hayes': ['hays', 'haze'],
    'amaro': ['amarro'],
    'watts': ['watt', 'watts'],
    'estrada': ['estrade']
  };

  const lowerName = name.toLowerCase();
  
  // Add exact variations
  if (variations[lowerName]) {
    similar.push(...variations[lowerName]);
  }

  // Add phonetic similarities (first letter + similar sounds)
  const firstLetter = lowerName[0];
  Object.keys(variations).forEach(key => {
    if (key[0] === firstLetter && key !== lowerName) {
      similar.push(key);
    }
  });

  return similar;
}

// Run the search
searchMultipleRegistrations()
  .then(() => {
    console.log('✅ Multiple registration search completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Search failed:', error);
    process.exit(1);
  });
