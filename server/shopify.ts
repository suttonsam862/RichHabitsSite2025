import fetch from 'node-fetch';

// Environment variables for Shopify API
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Validate required environment variables are set
if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_API_KEY || !SHOPIFY_ACCESS_TOKEN) {
  console.error('Missing required Shopify environment variables');
}

// Function to fetch a product by ID
export async function getProductById(productId: string) {
  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/products/${productId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN as string,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { product: any };
    return data.product;
  } catch (error) {
    console.error('Error fetching product from Shopify:', error);
    throw error;
  }
}

// Function to create a checkout with a product variant
export async function createCheckout(variantId: string, quantity: number = 1, customAttributes?: any[]) {
  try {
    const checkoutData = {
      checkout: {
        line_items: [
          {
            variant_id: variantId,
            quantity: quantity,
          },
        ],
        ...(customAttributes && { custom_attributes: customAttributes }),
      },
    };

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/checkouts.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { checkout: any };
    return data.checkout;
  } catch (error) {
    console.error('Error creating checkout in Shopify:', error);
    throw error;
  }
}

// Function to create a checkout from an event registration
export async function createEventRegistrationCheckout(
  eventId: string,
  productVariantId: string,
  registrationData: EventRegistrationData
) {
  const customAttributes = [
    { key: 'Event_ID', value: eventId },
    { key: 'Attendee_Name', value: registrationData.name },
    { key: 'Attendee_Email', value: registrationData.email },
    { key: 'Attendee_Phone', value: registrationData.phone || 'Not provided' },
    { key: 'Attendee_Age_Group', value: registrationData.ageGroup },
    { key: 'Attendee_Experience', value: registrationData.experience || 'Not provided' },
    { key: 'Registration_Type', value: registrationData.option },
  ];

  return createCheckout(productVariantId, 1, customAttributes);
}

// Types
export interface EventRegistrationData {
  name: string;
  email: string;
  phone?: string;
  ageGroup: string;
  experience?: string;
  option: 'full' | 'single';
}

// Maps for Shopify product and variant IDs related to events
export const EVENT_PRODUCTS = {
  'birmingham-slam-camp': {
    fullCamp: {
      productId: 'REPLACE_WITH_ACTUAL_PRODUCT_ID', // Placeholder - will be replaced with real ID
      variantId: 'REPLACE_WITH_ACTUAL_VARIANT_ID', // Placeholder - will be replaced with real ID
    },
    singleDay: {
      productId: 'REPLACE_WITH_ACTUAL_PRODUCT_ID', // Placeholder - will be replaced with real ID
      variantId: 'REPLACE_WITH_ACTUAL_VARIANT_ID', // Placeholder - will be replaced with real ID
    }
  }
};