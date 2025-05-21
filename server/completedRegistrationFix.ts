import { pool } from "./db";

/**
 * Fixes completed registrations by matching payment IDs with registration data
 * @param dryRun If true, will only show what would be updated without making changes
 * @returns Summary of updates performed or that would be performed
 */
export async function fixCompletedRegistrationsWithMissingInfo(dryRun: boolean = false): Promise<{ 
  updatedRecords: number, 
  skippedRecords: number,
  details: Array<{ 
    id: number, 
    before: { firstName: string, lastName: string, email: string }, 
    after: { firstName: string, lastName: string, email: string } 
  }> 
}> {
  const client = await pool.connect();
  
  try {
    // Get all completed registrations with payment IDs but missing information
    const incompleteRegistrations = await client.query(`
      SELECT id, original_registration_id, first_name, last_name, email, event_id, shopify_order_id
      FROM completed_event_registrations
      WHERE (first_name = 'Not provided' OR last_name = 'Not provided' OR email = 'Not provided')
      AND (shopify_order_id LIKE 'pi_%' OR stripe_payment_intent_id IS NOT NULL)
    `);
    
    let updatedRecords = 0;
    let skippedRecords = 0;
    const details: Array<{ 
      id: number, 
      before: { firstName: string, lastName: string, email: string }, 
      after: { firstName: string, lastName: string, email: string } 
    }> = [];
    
    // Process each incomplete registration
    for (const reg of incompleteRegistrations.rows) {
      // Check if there's a matching registration in event_registrations with the same event ID
      // but with complete information
      const matchingRegistrations = await client.query(`
        SELECT id, first_name, last_name, email, contact_name
        FROM event_registrations
        WHERE event_id = $1
        AND first_name != 'Not provided' AND last_name != 'Not provided' AND email != 'Not provided'
        ORDER BY created_at DESC
      `, [reg.event_id]);
      
      if (matchingRegistrations.rows.length > 0) {
        // Use the first match found
        const match = matchingRegistrations.rows[0];
        
        // Record the changes that will be made
        details.push({
          id: reg.id,
          before: {
            firstName: reg.first_name,
            lastName: reg.last_name,
            email: reg.email
          },
          after: {
            firstName: match.first_name,
            lastName: match.last_name,
            email: match.email
          }
        });
        
        // Update the record if not in dry run mode
        if (!dryRun) {
          await client.query(`
            UPDATE completed_event_registrations
            SET 
              first_name = $1,
              last_name = $2,
              email = $3,
              contact_name = $4,
              payment_verified = TRUE
            WHERE id = $5
          `, [
            match.first_name, 
            match.last_name, 
            match.email,
            match.contact_name || `${match.first_name} ${match.last_name}`,
            reg.id
          ]);
        }
        
        updatedRecords++;
      } else {
        skippedRecords++;
      }
    }
    
    return {
      updatedRecords,
      skippedRecords,
      details
    };
  } finally {
    client.release();
  }
}