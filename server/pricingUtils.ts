// STRUCTURE: Centralized pricing utility for all events
// Eliminates hardcoded pricing across multiple files

export interface EventPricing {
  full: number;
  single: number;
  '1day'?: number;
  '2day'?: number;
}

export interface PricingCalculation {
  originalAmount: number;
  finalAmount: number;
  discountAmount: number;
  appliedDiscountCode: string | null;
  numberOfDays?: number;
  selectedDates?: string[];
}

// Centralized event pricing configuration (in cents for Stripe)
export const EVENT_PRICING: Record<number, EventPricing> = {
  1: { full: 24900, single: 14900 }, // Birmingham Slam Camp - $249/$149
  2: { full: 29900, single: 17500, '1day': 11900, '2day': 23800 }, // National Champ Camp - $299/$175/$119/$238
  3: { full: 24900, single: 14900 }, // Texas Recruiting Clinic - $249/$149
  4: { full: 20000, single: 9900 }   // Panther Train Tour - $200/$99
};

export function getEventPricing(eventId: number): EventPricing | null {
  return EVENT_PRICING[eventId] || null;
}

export function calculateRegistrationAmount(
  eventId: number, 
  option: string, 
  numberOfDays?: number,
  selectedDates?: string[]
): number {
  const pricing = getEventPricing(eventId);
  if (!pricing) {
    throw new Error(`Pricing not found for event ${eventId}`);
  }

  // National Champ Camp flexible options
  if (eventId === 2 && (option === '1day' || option === '2day')) {
    const flexiblePrice = pricing[option as '1day' | '2day'];
    if (!flexiblePrice) {
      throw new Error(`Flexible pricing not available for option ${option}`);
    }
    
    // Validate numberOfDays matches option
    const expectedDays = option === '1day' ? 1 : 2;
    if (numberOfDays !== expectedDays) {
      throw new Error(`Invalid numberOfDays ${numberOfDays} for option ${option}`);
    }
    
    // Validate selectedDates count matches numberOfDays
    if (!selectedDates || selectedDates.length !== expectedDays) {
      throw new Error(`Selected dates count ${selectedDates?.length || 0} doesn't match required days ${expectedDays}`);
    }
    
    return flexiblePrice;
  }

  // Standard pricing for other events
  return option === 'single' ? pricing.single : pricing.full;
}

export function validateNationalChampCampRegistration(
  option: string,
  numberOfDays?: number,
  selectedDates?: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (option === '1day' || option === '2day') {
    const expectedDays = option === '1day' ? 1 : 2;
    
    if (!numberOfDays || numberOfDays !== expectedDays) {
      errors.push(`numberOfDays must be ${expectedDays} for ${option} option`);
    }
    
    if (!selectedDates || selectedDates.length !== expectedDays) {
      errors.push(`Must select exactly ${expectedDays} date(s) for ${option} option`);
    }
    
    // Validate selected dates are valid camp dates
    const validDates = ['June 5', 'June 6', 'June 7'];
    if (selectedDates) {
      for (const date of selectedDates) {
        if (!validDates.includes(date)) {
          errors.push(`Invalid date selected: ${date}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}