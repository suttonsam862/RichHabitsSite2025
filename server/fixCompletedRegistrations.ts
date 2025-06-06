import { pool } from "./db";

/**
 * Updates completed registrations that have payments but are missing customer information
 * by finding and merging with corresponding customer data
 */
export async function fixCompletedRegistrationsWithMissingInfo(): Promise<{
  totalProcessed: number;
  updatedRecords: number;
  skippedRecords: number;
  errors: string[];
}> {
  const client = await pool.connect();
  
  try {
    // Results tracking
    const results = {
      totalProcessed: 0,
      updatedRecords: 0,
      skippedRecords: 0,
      errors: [] as string[]
    };
    
    // Get all completed registrations with payment IDs but missing information (using unified table)
    const incompleteRegistrations = await client.query(`
      SELECT id, first_name, last_name, email, event_id, shopify_order_id, stripe_payment_intent_id
      FROM registrations
      WHERE status = 'paid'
      AND (first_name = 'Not provided' OR last_name = 'Not provided' OR email = 'Not provided')
      AND (shopify_order_id LIKE 'pi_%' OR stripe_payment_intent_id IS NOT NULL)
    `);
    
    results.totalProcessed = incompleteRegistrations.rows.length;
    
    // Process each incomplete registration
    for (const reg of incompleteRegistrations.rows) {
      try {
        // Try to find a matching registration with customer details
        const matchingRegistrations = await client.query(`
          SELECT id, first_name, last_name, email, contact_name, phone, t_shirt_size, grade, school_name, club_name
          FROM event_registrations
          WHERE event_id = $1
          AND first_name != 'Not provided' AND last_name != 'Not provided' AND email != 'Not provided'
          ORDER BY created_at DESC
        `, [reg.event_id]);
        
        if (matchingRegistrations.rows.length > 0) {
          // Use the first match found
          const match = matchingRegistrations.rows[0];
          
          // Update the completed registration with customer details
          await client.query(`
            UPDATE completed_event_registrations
            SET 
              first_name = $1,
              last_name = $2,
              email = $3,
              contact_name = $4,
              phone = $5,
              t_shirt_size = $6,
              grade = $7,
              school_name = $8,
              club_name = $9,
              payment_verified = TRUE
            WHERE id = $10
          `, [
            match.first_name, 
            match.last_name, 
            match.email,
            match.contact_name || `${match.first_name} ${match.last_name}`,
            match.phone,
            match.t_shirt_size,
            match.grade,
            match.school_name,
            match.club_name,
            reg.id
          ]);
          
          results.updatedRecords++;
        } else {
          results.skippedRecords++;
        }
      } catch (error: any) {
        console.error(`Error processing registration ${reg.id}:`, error);
        results.errors.push(`Registration ${reg.id}: ${error.message || 'Unknown error'}`);
      }
    }
    
    return results;
  } finally {
    client.release();
  }
}