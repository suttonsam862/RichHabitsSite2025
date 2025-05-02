/**
 * Stripe product and price IDs for Rich Habits events
 */

export const STRIPE_PRODUCTS = {
  // Birmingham Slam Camp
  'birmingham-slam-camp': {
    productId: 'prod_SEqbbDngN3Fixc',
    prices: {
      full: 'price_1RKMuSPfRB1dByPWAqP7LqNo',  // $249
      single: 'price_1RKMuSPfRB1dByPWQiI3Qlap'  // $149
    },
    metadata: {
      eventId: '1',
      name: 'Birmingham Slam Camp',
      location: 'Clay-Chalkville Middle School',
      dates: 'June 19-21, 2025'
    }
  },
  
  // National Champ Camp
  'national-champ-camp': {
    productId: 'prod_SEqb6jBiw4W2ar',
    prices: {
      full: 'price_1RKMuTPfRB1dByPWc2LK2UQg',  // $349
      single: 'price_1RKMuTPfRB1dByPW6hfUgSEx'  // $175
    },
    metadata: {
      eventId: '2',
      name: 'National Champ Camp',
      location: 'Rancho High School, Las Vegas',
      dates: 'June 4-7, 2025'
    }
  },
  
  // Texas Recruiting Clinic
  'texas-recruiting-clinic': {
    productId: 'prod_SEqbAMG7YXOTzG',
    prices: {
      full: 'price_1RKMuTPfRB1dByPWvx07lTkq',   // $249
      single: 'price_1RKMuUPfRB1dByPWa28a2r0K'   // $149
    },
    metadata: {
      eventId: '3',
      name: 'Texas Recruiting Clinic',
      location: 'Arlington Martin High School, TX',
      dates: 'June 12-13, 2025'
    }
  },
  
  // Cory Land Tour
  'cory-land-tour': {
    productId: 'prod_SEqbUeTpfPnvlE',
    prices: {
      full: 'price_1RKMuUPfRB1dByPWwj2qVxeS',   // $200
      single: 'price_1RKMuUPfRB1dByPWURiShzGS'   // $99
    },
    metadata: {
      eventId: '4',
      name: 'Cory Land Tour',
      location: 'Multiple Locations Across Alabama',
      dates: 'July 23-25, 2025'
    }
  }
};

// Helper function to get Stripe price ID by event ID and option
export function getStripePriceId(eventId: number | string, option: 'full' | 'single'): string | null {
  const eventIdStr = eventId.toString();
  
  // Find the event by eventId in metadata
  const event = Object.values(STRIPE_PRODUCTS).find(
    product => product.metadata.eventId === eventIdStr
  );
  
  if (!event) {
    return null;
  }
  
  return event.prices[option] || null;
}

// Helper function to get Stripe product ID by event ID
export function getStripeProductId(eventId: number | string): string | null {
  const eventIdStr = eventId.toString();
  
  // Find the event by eventId in metadata
  const event = Object.values(STRIPE_PRODUCTS).find(
    product => product.metadata.eventId === eventIdStr
  );
  
  return event ? event.productId : null;
}