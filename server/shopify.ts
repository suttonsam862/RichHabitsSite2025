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

// Function to list all collections using Admin API
export async function listCollections() {
  try {
    console.log('Fetching collections from Shopify Admin API');
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/custom_collections.json`,
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

    const data = await response.json() as { custom_collections: any[] };
    console.log(`Found ${data.custom_collections.length} collections`);
    return data.custom_collections;
  } catch (error) {
    console.error('Error listing collections from Shopify:', error);
    throw error;
  }
}

// Function to get products in a collection by collection ID
export async function getProductsByCollectionId(collectionId: string) {
  try {
    console.log(`Fetching products for collection ID ${collectionId} from Shopify Admin API`);
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/products.json?collection_id=${collectionId}`,
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
    console.log(`Found ${data.products.length} products in collection ${collectionId}`);
    return data.products;
  } catch (error) {
    console.error(`Error fetching products for collection ${collectionId}:`, error);
    throw error;
  }
}

// Function to get a collection by handle using Admin API
export async function getCollectionByHandle(handle: string) {
  try {
    console.log(`Fetching collection with handle "${handle}" from Shopify Admin API`);
    
    // First, list all collections to find the one with matching handle
    const collections = await listCollections();
    const collection = collections.find(col => col.handle === handle);
    
    if (!collection) {
      console.error(`Collection with handle "${handle}" not found`);
      return null;
    }
    
    console.log(`Found collection with ID ${collection.id}`);
    
    // Next, fetch products in this collection
    const products = await getProductsByCollectionId(collection.id);
    
    // Return both the collection and its products
    return {
      collection,
      products
    };
  } catch (error) {
    console.error(`Error fetching collection "${handle}" from Shopify:`, error);
    throw error;
  }
}

// Function to create a checkout with a product variant
// This uses the Storefront API's cart functionality (recommended by Shopify)
export async function createCheckout(variantId: string, quantity: number = 1, customAttributes?: any[]) {
  try {
    // Prepare custom attributes if provided
    const formattedAttributes = customAttributes ? 
      customAttributes.map(attr => ({ key: attr.key, value: String(attr.value) })) : [];
    
    console.log('Creating Storefront API checkout with data:', {
      variantId,
      quantity,
      customAttributes: formattedAttributes.length
    });
    
    console.log('Custom attributes for Storefront API:', JSON.stringify(formattedAttributes, null, 2));
    
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
        attributes: formattedAttributes,
        buyerIdentity: {
          // This ensures the checkout is associated with our custom domain
          // instead of the default myshopify.com domain
          countryCode: "US"
        }
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
          'Accept': 'application/json',
          // Add origin header to ensure custom domain checkout
          'Origin': 'https://rich-habits.com'
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
    
    // Make sure the URL uses the rich-habits.com domain instead of myshopify.com
    let checkoutUrl = cart.checkoutUrl;
    if (checkoutUrl.includes('myshopify.com')) {
      const url = new URL(checkoutUrl);
      checkoutUrl = checkoutUrl.replace(url.hostname, 'rich-habits.com');
    }
    
    return {
      id: cart.id,
      webUrl: checkoutUrl,
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

// Create a branded checkout page using the Admin API - more customization options
export async function createCustomCheckout(variantId: string, quantity: number = 1, customer: any, customAttributes?: any[]) {
  try {
    // Extract the numeric ID from the gid format
    const numericVariantId = variantId.split('/').pop();
    if (!numericVariantId) {
      throw new Error(`Invalid variant ID format: ${variantId}`);
    }
    
    console.log(`Creating custom checkout for variant ID: ${numericVariantId}`);
    
    // Prepare custom attributes if provided
    const formattedAttributes = customAttributes ? 
      customAttributes.map(attr => ({ key: attr.key, value: String(attr.value) })) : [];
    
    // Create draft order with the Admin API
    console.log('Creating draft order with custom attributes:', JSON.stringify(formattedAttributes, null, 2));
    
    const lineItemProperties = formattedAttributes.map(attr => ({
      name: attr.key,
      value: attr.value
    }));
    
    console.log('Formatted line item properties:', JSON.stringify(lineItemProperties, null, 2));
    
    const draftOrderData = {
      draft_order: {
        line_items: [
          {
            variant_id: parseInt(numericVariantId),
            quantity: quantity,
            properties: lineItemProperties
          }
        ],
        customer: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          email: customer.email,
          phone: customer.phone || ''
        },
        use_customer_default_address: false,
        tags: ["Online Registration", "Rich Habits Event"],
        note_attributes: formattedAttributes.map(attr => ({
          name: attr.key,
          value: attr.value
        })),
        applied_discount: {
          description: "Event Registration",
          value_type: "fixed_amount", 
          value: "0.00",
          amount: "0.00",
          title: "Event Registration"
        }
      }
    };
    
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN as string,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(draftOrderData)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error creating draft order:', errorText);
      throw new Error(`Failed to create draft order: ${response.status} ${response.statusText}`);
    }
    
    const draftOrderResponse = await response.json() as {
      draft_order: {
        id: number;
        subtotal_price: string;
        total_price: string;
      }
    };
    
    // Create an invoice for the draft order
    const invoiceResponse = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/draft_orders/${draftOrderResponse.draft_order.id}/send_invoice.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN as string,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          draft_order_invoice: {
            to: customer.email,
            from: "noreply@rich-habits.com",
            subject: "Complete your Rich Habits event registration",
            custom_message: `Thank you for registering for our event! Please complete your payment to confirm your spot.`
          }
        })
      }
    );
    
    if (!invoiceResponse.ok) {
      const errorText = await invoiceResponse.text();
      console.error('Error sending invoice:', errorText);
      throw new Error(`Failed to send invoice: ${invoiceResponse.status} ${invoiceResponse.statusText}`);
    }
    
    const invoiceData = await invoiceResponse.json() as {
      draft_order_invoice: {
        invoice_url: string;
      }
    };
    
    // Return the invoice URL which leads to the custom checkout page
    return {
      id: draftOrderResponse.draft_order.id.toString(),
      webUrl: invoiceData.draft_order_invoice.invoice_url,
      subtotalPrice: draftOrderResponse.draft_order.subtotal_price,
      totalPrice: draftOrderResponse.draft_order.total_price
    };
  } catch (error) {
    console.error('Error creating custom checkout:', error);
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
  registrationData: EventRegistrationData,
  applyDiscount: boolean = false
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
  
  // For Cory Land Tour, add the selected days to custom attributes
  if (eventId === '4') {
    const selectedDays = [];
    if (registrationData.day1) selectedDays.push('Day 1 - Birmingham');
    if (registrationData.day2) selectedDays.push('Day 2 - Huntsville');
    if (registrationData.day3) selectedDays.push('Day 3 - Montgomery');
    
    // Add selected days as a custom attribute
    if (selectedDays.length > 0) {
      customAttributes.push({ 
        key: 'Selected_Days', 
        value: selectedDays.join(', ') 
      });
    }
    
    // Add individual day selections for clarity
    customAttributes.push({ key: 'Day_1_Birmingham', value: registrationData.day1 ? 'Yes' : 'No' });
    customAttributes.push({ key: 'Day_2_Huntsville', value: registrationData.day2 ? 'Yes' : 'No' });
    customAttributes.push({ key: 'Day_3_Montgomery', value: registrationData.day3 ? 'Yes' : 'No' });
  }

  // Try to use the more customized Admin API checkout first
  try {
    const customer = {
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: registrationData.email,
      phone: registrationData.phone || ''
    };
    
    console.log('Attempting to create custom checkout with Admin API...');
    const checkout = await createCustomCheckout(productVariantId, 1, customer, customAttributes);
    
    // If universal discount should be applied, we'll append the discount code to the checkout URL
    if (applyDiscount && checkout && checkout.webUrl && process.env.UNIVERSAL_DISCOUNT_CODE) {
      console.log('Applying universal discount code to checkout URL');
      const discountCode = process.env.UNIVERSAL_DISCOUNT_CODE;
      // Append the discount code parameter to the checkout URL
      const separator = checkout.webUrl.includes('?') ? '&' : '?';
      checkout.webUrl = `${checkout.webUrl}${separator}discount=${discountCode}`;
    }
    
    return checkout;
  } catch (error) {
    console.warn('Admin API checkout creation failed, falling back to Storefront API', error);
    // Fall back to the regular Storefront API checkout if Admin API fails
    const checkout = await createCheckout(productVariantId, 1, customAttributes);
    
    // If universal discount should be applied, we'll append the discount code to the checkout URL
    if (applyDiscount && checkout && checkout.webUrl && process.env.UNIVERSAL_DISCOUNT_CODE) {
      console.log('Applying universal discount code to checkout URL');
      const discountCode = process.env.UNIVERSAL_DISCOUNT_CODE;
      // Append the discount code parameter to the checkout URL
      const separator = checkout.webUrl.includes('?') ? '&' : '?';
      checkout.webUrl = `${checkout.webUrl}${separator}discount=${discountCode}`;
    }
    
    return checkout;
  }
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
  applyUniversalDiscount?: boolean;
  day1?: boolean;
  day2?: boolean;
  day3?: boolean;
}

// Maps for Shopify product and variant IDs related to events
// Note: These IDs need to be manually updated when the corresponding products are created in Shopify
// For Storefront API, variant IDs need to be in Shopify Global ID format (gid://shopify/ProductVariant/{id})
export const EVENT_PRODUCTS = {
  'cory-land-tour': {
    fullCamp: {
      productId: 'gid://shopify/Product/8949406105837', // Using Birmingham Slam Camp Product ID temporarily
      variantId: 'gid://shopify/ProductVariant/47808555679981', // Using Birmingham Slam Camp Variant ID temporarily
    },
    singleDay: {
      productId: 'gid://shopify/Product/8949406105837', 
      variantId: 'gid://shopify/ProductVariant/47808555679981',
    }
  },
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
  },
  'texas-recruiting-clinic': {
    fullCamp: {
      // Using the same product/variant as Birmingham Slam Camp since they have the same price
      productId: 'gid://shopify/Product/8949406105837', // Same as Birmingham Slam Camp Product ID
      variantId: 'gid://shopify/ProductVariant/47808555679981', // Same as Birmingham Slam Camp Variant ID
    },
    singleDay: {
      // Using the same product/variant as Birmingham Slam Camp since they have the same price
      productId: 'gid://shopify/Product/8949406105837', // Same as Birmingham Slam Camp Product ID
      variantId: 'gid://shopify/ProductVariant/47808555679981', // Same as Birmingham Slam Camp Variant ID
    }
  }
};