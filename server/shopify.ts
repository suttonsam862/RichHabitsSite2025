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

// Function to create a checkout with a product variant using Storefront API
export async function createCheckout(variantId: string, quantity: number = 1, customAttributes?: any[]) {
  try {
    // Prepare custom attributes if provided
    const formattedAttributes = customAttributes ? 
      customAttributes.map(attr => ({ key: attr.key, value: String(attr.value) })) : [];
    
    // Create checkout mutation for Storefront API
    const mutation = `
      mutation checkoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
            subtotalPriceV2 {
              amount
              currencyCode
            }
            totalPriceV2 {
              amount
              currencyCode
            }
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lineItems: [
          {
            variantId: variantId,
            quantity: quantity
          }
        ],
        customAttributes: formattedAttributes
      }
    };

    // Call the Storefront API
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Storefront-Access-Token': SHOPIFY_API_KEY as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables: variables
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as {
      data?: {
        checkoutCreate?: {
          checkout?: {
            id: string;
            webUrl: string;
            subtotalPriceV2: { amount: string; currencyCode: string };
            totalPriceV2: { amount: string; currencyCode: string };
          };
          checkoutUserErrors?: Array<{ code: string; field: string; message: string }>;
        }
      };
      errors?: Array<{ message: string }>;
    };
    
    // Check for errors in the response
    if (data.errors && data.errors.length > 0) {
      throw new Error(`GraphQL Error: ${data.errors[0].message}`);
    }
    
    if (data.data?.checkoutCreate?.checkoutUserErrors && data.data.checkoutCreate.checkoutUserErrors.length > 0) {
      throw new Error(`Checkout Error: ${data.data.checkoutCreate.checkoutUserErrors[0].message}`);
    }
    
    if (!data.data?.checkoutCreate?.checkout) {
      throw new Error('No checkout data returned from Shopify');
    }
    
    return data.data.checkoutCreate.checkout;
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
    { key: 'Camper_First_Name', value: registrationData.firstName },
    { key: 'Camper_Last_Name', value: registrationData.lastName },
    { key: 'Contact_Name', value: registrationData.contactName },
    { key: 'Contact_Email', value: registrationData.email },
    { key: 'Contact_Phone', value: registrationData.phone || 'Not provided' },
    { key: 'T_Shirt_Size', value: registrationData.tShirtSize },
    { key: 'Grade', value: registrationData.grade },
    { key: 'School_Name', value: registrationData.schoolName },
    { key: 'Club_Name', value: registrationData.clubName || 'Not provided' },
    { key: 'Medical_Release_Accepted', value: registrationData.medicalReleaseAccepted ? 'Yes' : 'No' },
    { key: 'Registration_Type', value: registrationData.option },
  ];

  return createCheckout(productVariantId, 1, customAttributes);
}

// Types
export interface EventRegistrationData {
  firstName: string;
  lastName: string;
  contactName: string;
  email: string;
  phone?: string;
  tShirtSize: string;
  grade: string;
  schoolName: string;
  clubName?: string;
  medicalReleaseAccepted: boolean;
  option: 'full' | 'single';
}

// Maps for Shopify product and variant IDs related to events
// Note: These IDs need to be manually updated when the corresponding products are created in Shopify
// For Storefront API, variant IDs need to be in Shopify Global ID format (gid://shopify/ProductVariant/{id})
export const EVENT_PRODUCTS = {
  'birmingham-slam-camp': {
    fullCamp: {
      productId: 'gid://shopify/Product/8837251555611', // Birmingham Slam Camp - Full Camp Product ID
      variantId: 'gid://shopify/ProductVariant/47327434186011', // Birmingham Slam Camp - Full Camp Variant ID
    },
    singleDay: {
      productId: 'gid://shopify/Product/8837251588379', // Birmingham Slam Camp - Single Day Product ID
      variantId: 'gid://shopify/ProductVariant/47327434218779', // Birmingham Slam Camp - Single Day Variant ID
    }
  }
};