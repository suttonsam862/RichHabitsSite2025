#!/usr/bin/env tsx

/**
 * Migration Script: Completed Event Registrations to Unified Registrations
 * 
 * This script migrates data from the legacy `completed_event_registrations` table
 * to the new unified `registrations` table structure.
 * 
 * Usage: npm run migrate:registrations
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, isNull } from 'drizzle-orm';
import { 
  completedEventRegistrations, 
  registrations, 
  events 
} from '../shared/schema.js';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

interface MigrationSummary {
  totalLegacyRecords: number;
  migrated: number;
  skipped: number;
  errors: number;
  errorDetails: Array<{ id: number; error: string }>;
}

async function migrateCompletedRegistrations(): Promise<MigrationSummary> {
  const summary: MigrationSummary = {
    totalLegacyRecords: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
    errorDetails: []
  };

  try {
    console.log('🔄 Starting migration from completed_event_registrations to registrations...\n');

    // Fetch all completed registrations
    const legacyRegistrations = await db
      .select()
      .from(completedEventRegistrations)
      .orderBy(completedEventRegistrations.createdAt);

    summary.totalLegacyRecords = legacyRegistrations.length;
    console.log(`📊 Found ${summary.totalLegacyRecords} legacy registration records\n`);

    if (summary.totalLegacyRecords === 0) {
      console.log('✅ No legacy records to migrate');
      return summary;
    }

    // Process each legacy registration
    for (const legacy of legacyRegistrations) {
      try {
        console.log(`Processing registration ID: ${legacy.id}`);

        // Check if already migrated (by stripe_payment_intent_id or email+event combination)
        const existingRegistration = await db
          .select()
          .from(registrations)
          .where(
            legacy.stripePaymentIntentId 
              ? eq(registrations.stripePaymentIntentId, legacy.stripePaymentIntentId)
              : and(
                  eq(registrations.email, legacy.email),
                  eq(registrations.eventSlug, legacy.eventSlug || ''),
                  eq(registrations.firstName, legacy.firstName),
                  eq(registrations.lastName, legacy.lastName)
                )
          )
          .limit(1);

        if (existingRegistration.length > 0) {
          console.log(`  ⏭️  Already migrated (found existing registration ID: ${existingRegistration[0].id})`);
          summary.skipped++;
          continue;
        }

        // Get event details for proper eventId
        let eventId: number | null = null;
        if (legacy.eventSlug) {
          const event = await db
            .select()
            .from(events)
            .where(eq(events.slug, legacy.eventSlug))
            .limit(1);
          
          if (event.length > 0) {
            eventId = event[0].id;
          }
        }

        // Prepare registration data
        const registrationData = {
          eventSlug: legacy.eventSlug || '',
          eventId: eventId,
          firstName: legacy.firstName,
          lastName: legacy.lastName,
          email: legacy.email,
          phone: legacy.phone,
          dateOfBirth: legacy.dateOfBirth,
          emergencyContactName: legacy.emergencyContactName,
          emergencyContactPhone: legacy.emergencyContactPhone,
          medicalConditions: legacy.medicalConditions,
          parentFirstName: legacy.parentFirstName,
          parentLastName: legacy.parentLastName,
          parentEmail: legacy.parentEmail,
          parentPhone: legacy.parentPhone,
          registrationType: legacy.registrationType || 'individual',
          teamName: legacy.teamName,
          schoolName: legacy.schoolName,
          coachName: legacy.coachName,
          coachEmail: legacy.coachEmail,
          
          // Payment information
          basePrice: legacy.basePrice || 0,
          finalPrice: legacy.finalPrice || legacy.basePrice || 0,
          stripePaymentIntentId: legacy.stripePaymentIntentId,
          
          // Status and verification
          status: 'completed' as const,
          paymentVerified: true,
          emailVerified: true,
          termsAccepted: legacy.termsAccepted || true,
          
          // Form session
          formSessionId: legacy.formSessionId || `migrated-${legacy.id}`,
          
          // Timestamps
          completedAt: legacy.createdAt, // Use original creation time as completion time
          createdAt: legacy.createdAt,
          updatedAt: new Date()
        };

        // Insert into registrations table
        const newRegistration = await db
          .insert(registrations)
          .values(registrationData)
          .returning({ id: registrations.id });

        console.log(`  ✅ Migrated to new registration ID: ${newRegistration[0].id}`);
        summary.migrated++;

      } catch (error) {
        console.error(`  ❌ Error migrating registration ID ${legacy.id}:`, error);
        summary.errors++;
        summary.errorDetails.push({
          id: legacy.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

  } catch (error) {
    console.error('❌ Fatal migration error:', error);
    throw error;
  }

  return summary;
}

async function createMigrationBackup(): Promise<void> {
  try {
    console.log('📋 Creating backup of completed_event_registrations...');
    
    // Create backup table with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupTableName = `completed_event_registrations_backup_${timestamp}`;
    
    await sql`
      CREATE TABLE ${sql(backupTableName)} AS 
      SELECT *, NOW() as backup_created_at 
      FROM completed_event_registrations
    `;
    
    console.log(`✅ Backup created: ${backupTableName}\n`);
  } catch (error) {
    console.warn('⚠️  Failed to create backup:', error);
    console.log('Continuing with migration...\n');
  }
}

async function printMigrationSummary(summary: MigrationSummary): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total legacy records found: ${summary.totalLegacyRecords}`);
  console.log(`Successfully migrated: ${summary.migrated}`);
  console.log(`Skipped (already migrated): ${summary.skipped}`);
  console.log(`Errors encountered: ${summary.errors}`);
  
  if (summary.errorDetails.length > 0) {
    console.log('\n❌ ERROR DETAILS:');
    summary.errorDetails.forEach(({ id, error }) => {
      console.log(`  Registration ID ${id}: ${error}`);
    });
  }
  
  const successRate = summary.totalLegacyRecords > 0 
    ? ((summary.migrated + summary.skipped) / summary.totalLegacyRecords * 100).toFixed(1)
    : '100';
    
  console.log(`\n✅ Success rate: ${successRate}%`);
  console.log('='.repeat(60));
  
  if (summary.errors === 0) {
    console.log('🎉 Migration completed successfully!');
  } else {
    console.log('⚠️  Migration completed with some errors. Please review the error details above.');
  }
}

// Main execution
async function main() {
  try {
    // Create backup before migration
    await createMigrationBackup();
    
    // Run migration
    const summary = await migrateCompletedRegistrations();
    
    // Print summary
    await printMigrationSummary(summary);
    
    // Close database connection
    await sql.end();
    
    // Exit with appropriate code
    process.exit(summary.errors > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await sql.end();
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { migrateCompletedRegistrations, MigrationSummary };