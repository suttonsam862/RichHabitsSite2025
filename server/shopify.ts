import fetch from 'node-fetch';

// Environment variables for Shopify API
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY; // This is the Admin API key
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN; // This is the Admin API access token
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN; // This is the Storefront API access token

// Log available environment variables
console.log('Shopify environment vars:', 
  'SHOPIFY_STORE_DOMAIN:', SHOPIFY_STORE_DOMAIN ? 'Set' : 'Not set',
  'SHOPIFY_API_KEY:', SHOPIFY_API_KEY ? 'Set' : 'Not set', 
  'SHOPIFY_ACCESS_TOKEN:', SHOPIFY_ACCESS_TOKEN ? 'Set' : 'Not set',
  'SHOPIFY_STOREFRONT_TOKEN:', SHOPIFY_STOREFRONT_TOKEN ? 'Set' : 'Not set'
);

// Validate required environment variables are set
if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_API_KEY || !SHOPIFY_ACCESS_TOKEN || !SHOPIFY_STOREFRONT_TOKEN) {
  console.error('Missing required Shopify environment variables');
}

// Function to fetch a product by ID using Admin API
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

// Function to list products using Admin API
export async function listProducts() {
  try {
    console.log('Fetching products from Shopify Admin API');
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/products.json?limit=10`,
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

    const data = await response.json() as { products: any[] };
    console.log(`Found ${data.products.length} products`);
    return data.products;
  } catch (error) {
    console.error('Error listing products from Shopify:', error);
    throw error;
  }
}

// Function to create a checkout with a product variant using Storefront API
export async function createCheckout(variantId: string, quantity: number = 1, customAttributes?: any[]) {
  try {
    // Prepare custom attributes if provided
    const formattedAttributes = customAttributes ? 
      customAttributes.map(attr => ({ key: attr.key, value: String(attr.value) })) : [];
    
    console.log('Creating checkout with data:', {
      variantId,
      quantity,
      customAttributes: formattedAttributes.length
    });
    
    // Create cart using the latest Shopify Storefront API
    const mutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
          }
          userErrors {
            code
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lines: [
          {
            merchandiseId: variantId,
            quantity: quantity
          }
        ],
        attributes: formattedAttributes
      }
    };
    
    console.log('Making Shopify Storefront API request with:', {
      endpoint: `https://${SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`,
      tokenPresent: SHOPIFY_STOREFRONT_TOKEN ? 'yes' : 'no'
    });

    // Call the Storefront API
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN as string,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query: mutation,
          variables: variables
        }),
      }
    );

    // Parse response
    const responseText = await response.text();
    
    // Handle non-200 responses
    if (!response.ok) {
      console.error('Shopify API response not OK:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      throw new Error(`Shopify API error: ${response.status} ${response.statusText} - ${responseText}`);
    }
    
    // Parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Checkout response received:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('Error parsing Shopify response:', parseError);
      throw new Error(`Failed to parse Shopify response: ${responseText.substring(0, 200)}...`);
    }
    
    // Check for GraphQL errors
    if (data.errors && data.errors.length > 0) {
      console.error('GraphQL errors in response:', data.errors);
      throw new Error(`GraphQL Error: ${data.errors[0].message}`);
    }
    
    // Check for cart user errors
    if (data.data?.cartCreate?.userErrors && 
        data.data.cartCreate.userErrors.length > 0) {
      console.error('Cart user errors:', data.data.cartCreate.userErrors);
      throw new Error(`Cart Error: ${data.data.cartCreate.userErrors[0].message}`);
    }
    
    // Check for missing cart data
    if (!data.data?.cartCreate?.cart) {
      console.error('No cart data in response:', data);
      throw new Error('No cart data returned from Shopify');
    }
    
    // Create checkout object with the structure our app expects
    const cart = data.data.cartCreate.cart;
    return {
      id: cart.id,
      webUrl: cart.checkoutUrl,
      subtotalPrice: cart.cost?.subtotalAmount?.amount,
      totalPrice: cart.cost?.totalAmount?.amount
    };
  } catch (error) {
    console.error('Error creating checkout in Shopify:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
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
      productId: 'gid://shopify/Product/8949406105837', // Birmingham Slam Camp Product ID
      variantId: 'gid://shopify/ProductVariant/47808555679981', // Birmingham Slam Camp Variant ID
    },
    singleDay: {
      // Using the same product for now since there's only one variant for the camp
      productId: 'gid://shopify/Product/8949406105837', // Birmingham Slam Camp Product ID 
      variantId: 'gid://shopify/ProductVariant/47808555679981', // Birmingham Slam Camp Variant ID
    }
  }
};