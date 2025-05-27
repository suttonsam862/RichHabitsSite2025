// Bulletproof Payment Intent Validation System
// Comprehensive validation before any Stripe API calls

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  contactName: string;
  eventId: number;
  registrationType: 'full' | 'single';
  amount?: number;
}

export class PaymentValidator {
  // Comprehensive registration data validation
  static validateRegistrationData(data: any): ValidationResult {
    const errors: string[] = [];
    const sanitizedData: any = {};

    // Required field validation
    const requiredFields = [
      { field: 'firstName', message: 'First name is required' },
      { field: 'lastName', message: 'Last name is required' },
      { field: 'email', message: 'Email address is required' },
      { field: 'contactName', message: 'Parent/Guardian name is required' },
      { field: 'eventId', message: 'Event selection is required' }
    ];

    for (const { field, message } of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(message);
      } else {
        sanitizedData[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
      }
    }

    // Email format validation
    if (data.email && typeof data.email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.push('Please enter a valid email address');
      } else {
        sanitizedData.email = data.email.trim().toLowerCase();
      }
    }

    // Event ID validation
    if (data.eventId) {
      const eventId = parseInt(data.eventId);
      if (isNaN(eventId) || eventId <= 0) {
        errors.push('Invalid event selection');
      } else {
        sanitizedData.eventId = eventId;
      }
    }

    // Registration type validation
    if (data.registrationType) {
      if (!['full', 'single'].includes(data.registrationType)) {
        errors.push('Invalid registration type');
      } else {
        sanitizedData.registrationType = data.registrationType;
      }
    } else {
      sanitizedData.registrationType = 'full'; // Default
    }

    // Phone validation (optional but format check if provided)
    if (data.phone && typeof data.phone === 'string' && data.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = data.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        errors.push('Please enter a valid phone number');
      } else {
        sanitizedData.phone = data.phone.trim();
      }
    }

    // Name validation (no special characters except hyphens, apostrophes, spaces)
    const nameFields = ['firstName', 'lastName', 'contactName'];
    nameFields.forEach(field => {
      if (data[field] && typeof data[field] === 'string') {
        const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
        if (!nameRegex.test(data[field].trim())) {
          errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} contains invalid characters`);
        } else if (data[field].trim().length < 2) {
          errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} must be at least 2 characters`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined
    };
  }

  // Validate payment amount
  static validatePaymentAmount(eventId: number, registrationType: string): ValidationResult {
    const errors: string[] = [];
    
    // Event pricing validation
    const eventPricing: Record<number, { full: number; single: number }> = {
      1: { full: 24900, single: 14900 }, // Birmingham Slam Camp
      2: { full: 29900, single: 17500 }, // National Champ Camp
      3: { full: 24900, single: 14900 }, // Texas Recruiting Clinic
      4: { full: 20000, single: 9900 }   // Panther Train Tour
    };

    if (!eventPricing[eventId]) {
      errors.push('Invalid event selected');
      return { isValid: false, errors };
    }

    if (!['full', 'single'].includes(registrationType)) {
      errors.push('Invalid registration type');
      return { isValid: false, errors };
    }

    const amount = eventPricing[eventId][registrationType as 'full' | 'single'];

    return {
      isValid: true,
      errors: [],
      sanitizedData: { amount, eventId, registrationType }
    };
  }

  // Session validation
  static validateSession(sessionId: string): ValidationResult {
    const errors: string[] = [];

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10) {
      errors.push('Invalid session - please refresh the page');
    }

    // Check session format
    if (sessionId && !sessionId.startsWith('session_')) {
      errors.push('Invalid session format - please refresh the page');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Complete validation before payment intent creation
  static validateCompletePaymentRequest(data: any, sessionId: string): ValidationResult {
    const registrationValidation = this.validateRegistrationData(data.registrationData || data);
    const sessionValidation = this.validateSession(sessionId);
    
    let amountValidation = { isValid: true, errors: [] as string[] };
    if (registrationValidation.isValid && registrationValidation.sanitizedData) {
      amountValidation = this.validatePaymentAmount(
        registrationValidation.sanitizedData.eventId,
        registrationValidation.sanitizedData.registrationType
      );
    }

    const allErrors = [
      ...registrationValidation.errors,
      ...sessionValidation.errors,
      ...amountValidation.errors
    ];

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      sanitizedData: registrationValidation.isValid && amountValidation.isValid ? {
        ...registrationValidation.sanitizedData,
        ...amountValidation.sanitizedData
      } : undefined
    };
  }

  // Sanitize request data to prevent injection attacks
  static sanitizeRequest(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return {};
    }

    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        sanitized[key] = value.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof value === 'number') {
        sanitized[key] = value;
      } else if (typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.filter(item => typeof item === 'string' || typeof item === 'number');
      }
    }

    return sanitized;
  }
}