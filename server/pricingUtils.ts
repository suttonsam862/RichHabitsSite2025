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

  // Handle 1-day registrations - should be 50% of full price for all events
  if (option === '1day' || option === 'single') {
    // For National Champ Camp, use predefined 1-day pricing if available
    if (eventId === 2 && pricing['1day']) {
      return pricing['1day'];
    }
    // For other events, calculate 50% of full price
    return Math.round(pricing.full * 0.5);
  }

  // Handle 2-day registrations for National Champ Camp
  if (eventId === 2 && option === '2day') {
    const flexiblePrice = pricing['2day'];
    if (!flexiblePrice) {
      throw new Error(`2-day pricing not available for event ${eventId}`);
    }
    
    // Validate numberOfDays matches option
    if (numberOfDays !== 2) {
      throw new Error(`Invalid numberOfDays ${numberOfDays} for 2-day option`);
    }
    
    // Validate selectedDates count matches numberOfDays
    if (!selectedDates || selectedDates.length !== 2) {
      throw new Error(`Selected dates count ${selectedDates?.length || 0} doesn't match required days 2`);
    }
    
    return flexiblePrice;
  }

  // Standard full pricing
  return pricing.full;
}

export function calculateTeamPrice(eventId: number, athleteCount: number, option: string = 'full'): number {
  const individualPrice = calculateRegistrationAmount(eventId, option);
  // Team pricing: full individual price per athlete
  return individualPrice * athleteCount;
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