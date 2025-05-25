import crypto from 'crypto';
import { db } from './storage';
import { atomicRegistrations, paymentIntentLockdown, criticalErrorLog } from '../shared/bulletproof-schema';
import { eq, and } from 'drizzle-orm';

// COMPREHENSIVE DATA INTEGRITY SYSTEM
export class DataIntegritySystem {
  
  // VALIDATE COMPLETE REGISTRATION DATA CORRELATION
  async validateRegistrationIntegrity(registrationData: any): Promise<{
    isValid: boolean;
    missingFields: string[];
    correlationIssues: string[];
    validationScore: number;
  }> {
    const missingFields: string[] = [];
    const correlationIssues: string[] = [];
    
    // REQUIRED FIELD VALIDATION - ALL MUST BE PRESENT AND VALID
    const requiredFields = [
      { field: 'firstName', value: registrationData.firstName, name: 'First Name' },
      { field: 'lastName', value: registrationData.lastName, name: 'Last Name' },
      { field: 'email', value: registrationData.email, name: 'Email Address' },
      { field: 'contactName', value: registrationData.contactName, name: 'Parent/Guardian Name' },
      { field: 'phone', value: registrationData.phone, name: 'Phone Number' },
      { field: 'age', value: registrationData.age, name: 'Age' },
      { field: 'grade', value: registrationData.grade, name: 'Grade' },
      { field: 'gender', value: registrationData.gender, name: 'Gender' },
      { field: 'tshirtSize', value: registrationData.tshirtSize, name: 'T-Shirt Size' },
      { field: 'schoolName', value: registrationData.schoolName, name: 'School Name' },
      { field: 'experienceLevel', value: registrationData.experienceLevel, name: 'Experience Level' },
      { field: 'eventSlug', value: registrationData.eventSlug, name: 'Event Selection' },
    ];
    
    // Check each required field
    requiredFields.forEach(({ field, value, name }) => {
      if (!value || value === '' || value === null || value === undefined) {
        missingFields.push(name);
      }
      
      // Additional validation for specific fields
      if (field === 'email' && value && !this.isValidEmail(value)) {
        correlationIssues.push(`Invalid email format: ${value}`);
      }
      
      if (field === 'age' && value && (value < 5 || value > 25)) {
        correlationIssues.push(`Age must be between 5-25, got: ${value}`);
      }
      
      if (field === 'phone' && value && !this.isValidPhone(value)) {
        correlationIssues.push(`Invalid phone format: ${value}`);
      }
    });
    
    // Calculate validation score (0-100)
    const totalFields = requiredFields.length;
    const validFields = totalFields - missingFields.length;
    const validationScore = Math.round((validFields / totalFields) * 100);
    
    return {
      isValid: missingFields.length === 0 && correlationIssues.length === 0,
      missingFields,
      correlationIssues,
      validationScore
    };
  }
  
  // ENSURE PROPER DATA CORRELATION DURING REGISTRATION
  async createCorrelatedRegistration(registrationData: any, paymentIntentId: string): Promise<{
    success: boolean;
    registrationUuid?: string;
    correlationHash: string;
    integrityVerified: boolean;
  }> {
    try {
      // STEP 1: Validate all data integrity
      const validation = await this.validateRegistrationIntegrity(registrationData);
      
      if (!validation.isValid) {
        throw new Error(`Registration data incomplete: ${validation.missingFields.join(', ')}`);
      }
      
      // STEP 2: Generate correlation hash to ensure data stays connected
      const correlationHash = this.generateCorrelationHash({
        email: registrationData.email,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        paymentIntentId,
        eventSlug: registrationData.eventSlug,
        timestamp: new Date().toISOString()
      });
      
      // STEP 3: Create registration with locked correlation
      const registrationUuid = crypto.randomUUID();
      
      // All data must be inserted in a single atomic transaction
      const result = await db.transaction(async (tx) => {
        // Insert complete registration data
        const [registration] = await tx
          .insert(atomicRegistrations)
          .values({
            uuid: registrationUuid,
            stripePaymentIntentId: paymentIntentId,
            ...registrationData,
            dataChecksum: correlationHash,
            createdAt: new Date(),
          })
          .returning();
        
        // Lock payment intent to this specific registration
        await tx
          .insert(paymentIntentLockdown)
          .values({
            stripePaymentIntentId: paymentIntentId,
            registrationUuid: registrationUuid,
            amountCents: registrationData.eventPrice,
            currency: 'usd',
            eventSlug: registrationData.eventSlug,
            status: 'created',
            clientSecretHash: correlationHash,
            createdFromIp: registrationData.ipAddress || '127.0.0.1',
            userAgent: registrationData.userAgent || 'unknown',
          });
        
        return registration;
      });
      
      // STEP 4: Verify correlation integrity immediately
      const integrityVerified = await this.verifyRegistrationCorrelation(registrationUuid);
      
      return {
        success: true,
        registrationUuid,
        correlationHash,
        integrityVerified
      };
      
    } catch (error: any) {
      // Log any correlation failures for investigation
      await this.logIntegrityError({
        errorCode: 'CORRELATION_FAILURE',
        severity: 'CRITICAL',
        errorMessage: error.message,
        registrationData: registrationData,
        paymentIntentId
      });
      
      throw error;
    }
  }
  
  // VERIFY REGISTRATION CORRELATION INTEGRITY
  async verifyRegistrationCorrelation(registrationUuid: string): Promise<boolean> {
    try {
      // Get registration with payment lockdown
      const registration = await db
        .select()
        .from(atomicRegistrations)
        .where(eq(atomicRegistrations.uuid, registrationUuid))
        .limit(1);
      
      if (!registration.length) {
        return false;
      }
      
      const reg = registration[0];
      
      // Verify payment intent is properly locked
      const lockdown = await db
        .select()
        .from(paymentIntentLockdown)
        .where(eq(paymentIntentLockdown.registrationUuid, registrationUuid))
        .limit(1);
      
      if (!lockdown.length) {
        await this.logIntegrityError({
          errorCode: 'MISSING_PAYMENT_LOCKDOWN',
          severity: 'CRITICAL',
          errorMessage: `Registration ${registrationUuid} missing payment lockdown`,
          registrationUuid
        });
        return false;
      }
      
      // Verify payment intent IDs match
      if (reg.stripePaymentIntentId !== lockdown[0].stripePaymentIntentId) {
        await this.logIntegrityError({
          errorCode: 'PAYMENT_CORRELATION_MISMATCH',
          severity: 'CRITICAL',
          errorMessage: `Payment intent mismatch for registration ${registrationUuid}`,
          registrationUuid,
          systemState: {
            registration_payment_id: reg.stripePaymentIntentId,
            lockdown_payment_id: lockdown[0].stripePaymentIntentId
          }
        });
        return false;
      }
      
      // Verify data checksum integrity
      const expectedHash = this.generateCorrelationHash({
        email: reg.email,
        firstName: reg.firstName,
        lastName: reg.lastName,
        paymentIntentId: reg.stripePaymentIntentId,
        eventSlug: reg.eventSlug,
        timestamp: reg.createdAt.toISOString()
      });
      
      if (reg.dataChecksum !== expectedHash) {
        await this.logIntegrityError({
          errorCode: 'DATA_CORRUPTION_DETECTED',
          severity: 'CRITICAL',
          errorMessage: `Data corruption detected for registration ${registrationUuid}`,
          registrationUuid,
          systemState: {
            stored_checksum: reg.dataChecksum,
            expected_checksum: expectedHash
          }
        });
        return false;
      }
      
      return true;
      
    } catch (error: any) {
      await this.logIntegrityError({
        errorCode: 'CORRELATION_VERIFICATION_FAILED',
        severity: 'HIGH',
        errorMessage: error.message,
        registrationUuid
      });
      return false;
    }
  }
  
  // AUDIT ALL EXISTING REGISTRATIONS FOR CORRELATION ISSUES
  async auditAllRegistrationCorrelations(): Promise<{
    totalRegistrations: number;
    validCorrelations: number;
    corruptedData: any[];
    integrityScore: number;
  }> {
    try {
      const allRegistrations = await db.select().from(atomicRegistrations);
      const corruptedData: any[] = [];
      let validCorrelations = 0;
      
      for (const reg of allRegistrations) {
        const isValid = await this.verifyRegistrationCorrelation(reg.uuid);
        if (isValid) {
          validCorrelations++;
        } else {
          corruptedData.push({
            uuid: reg.uuid,
            email: reg.email,
            name: `${reg.firstName} ${reg.lastName}`,
            paymentIntent: reg.stripePaymentIntentId,
            eventSlug: reg.eventSlug
          });
        }
      }
      
      const integrityScore = Math.round((validCorrelations / allRegistrations.length) * 100);
      
      return {
        totalRegistrations: allRegistrations.length,
        validCorrelations,
        corruptedData,
        integrityScore
      };
      
    } catch (error: any) {
      await this.logIntegrityError({
        errorCode: 'AUDIT_FAILED',
        severity: 'HIGH',
        errorMessage: error.message
      });
      
      throw error;
    }
  }
  
  // HELPER METHODS
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    return phoneRegex.test(phone);
  }
  
  private generateCorrelationHash(data: any): string {
    const correlationString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(correlationString).digest('hex');
  }
  
  private async logIntegrityError(errorData: {
    errorCode: string;
    severity: string;
    errorMessage: string;
    registrationUuid?: string;
    registrationData?: any;
    paymentIntentId?: string;
    systemState?: any;
  }) {
    try {
      await db.insert(criticalErrorLog).values({
        errorCode: errorData.errorCode,
        severity: errorData.severity,
        registrationUuid: errorData.registrationUuid,
        stripePaymentIntentId: errorData.paymentIntentId,
        errorMessage: errorData.errorMessage,
        requestData: errorData.registrationData ? JSON.stringify(errorData.registrationData) : null,
        systemState: errorData.systemState ? JSON.stringify(errorData.systemState) : null,
        createdAt: new Date()
      });
    } catch (dbError) {
      console.error('Failed to log integrity error:', dbError);
      console.error('Original error:', errorData);
    }
  }
}

// Export singleton instance
export const dataIntegritySystem = new DataIntegritySystem();