/**
 * Stripe product and price IDs for Rich Habits events
 * 
 * NOTE: These are LIVE mode product and price IDs
 * These must match the products created in your Stripe dashboard
 */

export const STRIPE_PRODUCTS = {
  // Birmingham Slam Camp
  'birmingham-slam-camp': {
    productId: 'prod_SEy3l8IzKbJhzR', // LIVE mode product ID
    prices: {
      full: 'price_1RKfGWBIRPjPy7BLO8cA12lB',  // $249
      single: 'price_1RKfHkBIRPjPy7BLVsV5pVNH'  // $149
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
    productId: 'prod_SEy51LmDPkEh2Q', // LIVE mode product ID
    prices: {
      full: 'price_1RKfIJBIRPjPy7BLFMFfbKpb',  // $349
      single: 'price_1RKfITBIRPjPy7BLIGST56s9'  // $175
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
    productId: 'prod_SEy5ynD8u3zRpJ', // LIVE mode product ID
    prices: {
      full: 'price_1RKfJ6BIRPjPy7BLXpYcLSPw',   // $249
      single: 'price_1RKfJHBIRPjPy7BLWmxQUHtJ'   // $149
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
    productId: 'prod_SEy6aTWOMa1cHg', // LIVE mode product ID
    prices: {
      full: 'price_1RKfJpBIRPjPy7BL4k8lrUZe',   // $200
      single: 'price_1RKfK0BIRPjPy7BLK4LPXt7M'   // $99
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