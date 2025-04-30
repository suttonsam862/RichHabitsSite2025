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
    
    // CRITICAL FIX: The URL needs to use rich-habits-2022.myshopify.com for the checkout to work
    // Do NOT convert to rich-habits.com as this causes 404 errors
    let checkoutUrl = cart.checkoutUrl;
    
    // Log the original URL for debugging
    console.log('Original Storefront API checkout URL:', checkoutUrl);
    
    // We need to ensure the URL is using the myshopify.com domain, not the custom domain
    if (checkoutUrl.includes('rich-habits.com')) {
      checkoutUrl = checkoutUrl.replace('rich-habits.com', 'rich-habits-2022.myshopify.com');
      console.log('Replaced rich-habits.com with myshopify domain:', checkoutUrl);
    }
    
    // Ensure it has HTTPS
    if (checkoutUrl.startsWith('http://')) {
      checkoutUrl = 'https://' + checkoutUrl.substring(7);
      console.log('Ensured HTTPS protocol:', checkoutUrl);
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
export async function createCustomCheckout(
  variantId: string, 
  quantity: number = 1, 
  customer: any, 
  customAttributes?: any[], 
  customPrice?: number
) {
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
    
    // Extract registration title and event information
    let registrationTitle = '';
    let eventName = '';
    let eventId = '';
    let registrationType = 'full';
    
    const titleAttribute = formattedAttributes.find(attr => attr.key === 'Registration_Title');
    if (titleAttribute) {
      registrationTitle = titleAttribute.value;
    }
    
    const eventAttribute = formattedAttributes.find(attr => attr.key === 'Event_Name');
    if (eventAttribute) {
      eventName = eventAttribute.value;
    }
    
    const eventIdAttribute = formattedAttributes.find(attr => attr.key === 'Event_ID');
    if (eventIdAttribute) {
      eventId = eventIdAttribute.value;
    }
    
    const registrationTypeAttribute = formattedAttributes.find(attr => attr.key === 'Registration_Type');
    if (registrationTypeAttribute) {
      registrationType = registrationTypeAttribute.value;
    }
    
    // Create descriptive notes for the order
    const orderNote = registrationTitle || 
      `${customer.firstName} ${customer.lastName} - ${eventName || 'Event'} Registration`;
    
    // Check if custom price should be used
    let priceOverride = null;
    if (customPrice) {
      console.log(`Using custom price override: $${customPrice}`);
      priceOverride = customPrice;
    } else if (eventId) {
      // Get the shopify key and product details based on the event ID
      let shopifyKey = '';
      switch (eventId) {
        case '1':
          shopifyKey = 'birmingham-slam-camp';
          break;
        case '2':
          shopifyKey = 'national-champ-camp';
          break;
        case '3':
          shopifyKey = 'texas-recruiting-clinic';
          break;
        case '4':
          shopifyKey = 'cory-land-tour';
          break;
      }
      
      if (shopifyKey) {
        const optionKey = registrationType === 'full' ? 'fullCamp' : 'singleDay';
        
        try {
          const eventProduct = EVENT_PRODUCTS[shopifyKey as keyof typeof EVENT_PRODUCTS];
          if (eventProduct) {
            const variantDetails = eventProduct[optionKey as keyof typeof eventProduct];
            if (variantDetails && variantDetails.price) {
              priceOverride = variantDetails.price;
              console.log(`Using price from event mapping: $${priceOverride} for ${eventName} (${registrationType})`);
            }
          }
        } catch (err) {
          console.warn('Error getting price from event mapping:', err);
        }
      }
    }
    
    // Build the draft order data
    const lineItem: any = {
      variant_id: parseInt(numericVariantId),
      quantity: quantity,
      properties: lineItemProperties
    };
    
    // Add price override if available
    if (priceOverride !== null) {
      lineItem.price = priceOverride.toFixed(2);
    }
    
    const draftOrderData = {
      draft_order: {
        line_items: [lineItem],
        customer: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          email: customer.email,
          phone: customer.phone || ''
        },
        note: orderNote, // Add descriptive note
        use_customer_default_address: false,
        tags: `Online Registration, Rich Habits Event, ${eventName}`,
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
      
      // Try to parse the error response for a more detailed error message
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error details:', JSON.stringify(errorJson, null, 2));
        if (errorJson.errors) {
          throw new Error(`Failed to create draft order: ${JSON.stringify(errorJson.errors)}`);
        }
      } catch (parseError) {
        // If we can't parse the error, just use the original error text
        console.error('Could not parse error details:', parseError);
      }
      
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
            subject: `Complete your ${eventName} registration with Rich Habits`,
            custom_message: `Thank you for registering ${registrationTitle ? registrationTitle : ''}! Please complete your payment to confirm your spot for ${eventName}.`
          }
        })
      }
    );
    
    if (!invoiceResponse.ok) {
      const errorText = await invoiceResponse.text();
      console.error('Error sending invoice:', errorText);
      
      // Try to parse the error response for a more detailed error message
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed invoice error details:', JSON.stringify(errorJson, null, 2));
        if (errorJson.errors) {
          throw new Error(`Failed to send invoice: ${JSON.stringify(errorJson.errors)}`);
        }
      } catch (parseError) {
        // If we can't parse the error, just use the original error text
        console.error('Could not parse invoice error details:', parseError);
      }
      
      throw new Error(`Failed to send invoice: ${invoiceResponse.status} ${invoiceResponse.statusText}`);
    }
    
    const invoiceData = await invoiceResponse.json() as {
      draft_order_invoice: {
        invoice_url: string;
      }
    };
    
    // Return the invoice URL which leads to the custom checkout page
    let checkoutUrl = invoiceData.draft_order_invoice.invoice_url;
    
    // Ensure the URL is properly formatted
    if (checkoutUrl) {
      // Log the original URL for debugging
      console.log('Original checkout URL:', checkoutUrl);
      
      // CRITICAL FIX: Ensure we're using the rich-habits-2022.myshopify.com domain
      // and not rich-habits.com to avoid 404 errors
      if (checkoutUrl.includes('rich-habits.com')) {
        checkoutUrl = checkoutUrl.replace('rich-habits.com', 'rich-habits-2022.myshopify.com');
        console.log('Replaced rich-habits.com with myshopify domain:', checkoutUrl);
      }
      
      // Ensure the URL starts with https:// for security
      if (!checkoutUrl.startsWith('https://')) {
        if (checkoutUrl.startsWith('http://')) {
          checkoutUrl = 'https://' + checkoutUrl.substring(7);
        } else {
          checkoutUrl = 'https://' + checkoutUrl;
        }
      }
      
      // Add domain if URL might be a relative path
      if (checkoutUrl.startsWith('/')) {
        checkoutUrl = `https://${SHOPIFY_STORE_DOMAIN}${checkoutUrl}`;
      }
      
      console.log('Formatted checkout URL:', checkoutUrl);
    }
    
    return {
      id: draftOrderResponse.draft_order.id.toString(),
      webUrl: checkoutUrl,
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

// COMPLETE REWRITE: This function uses a direct "Add to Cart" URL that works more reliably
// This approach bypasses the need for the Checkout API which has been problematic
export async function createEventRegistrationCheckout(
  eventId: string,
  productVariantId: string,
  registrationData: EventRegistrationData,
  applyDiscount: boolean = false
) {
  // Get the event name and Shopify product key based on the event ID
  let eventName = '';
  let shopifyKey = '';
  
  switch (eventId) {
    case '1':
      eventName = 'Birmingham Slam Camp';
      shopifyKey = 'birmingham-slam-camp';
      break;
    case '2':
      eventName = 'National Champ Camp';
      shopifyKey = 'national-champ-camp';
      break;
    case '3':
      eventName = 'Texas Recruiting Clinic';
      shopifyKey = 'texas-recruiting-clinic';
      break;
    case '4':
      eventName = 'Cory Land Tour';
      shopifyKey = 'cory-land-tour';
      break;
    default:
      eventName = 'Wrestling Event';
      shopifyKey = 'birmingham-slam-camp'; // Default fallback
  }
  
  // Get the registration option (full camp or single day)
  const option = registrationData.option || 'full';
  const optionKey = option === 'full' ? 'fullCamp' : 'singleDay';
  
  // Get the product variant ID and price from our mapping
  const eventProduct = EVENT_PRODUCTS[shopifyKey as keyof typeof EVENT_PRODUCTS];
  const variantDetails = eventProduct[optionKey as keyof typeof eventProduct];
  
  // Override the provided product variant ID with the one from our mapping if available
  if (variantDetails && variantDetails.variantId) {
    productVariantId = variantDetails.variantId;
    console.log(`Using product variant ID from mapping: ${productVariantId}`);
  }
  
  // Get the proper price for this event/option combination
  const price = variantDetails?.price;
  if (price) {
    console.log(`Using price for ${eventName} (${option}): $${price}`);
  }

  // Create a more descriptive title for the checkout, including camper name and event
  const checkoutTitle = `${registrationData.firstName} ${registrationData.lastName} - ${eventName} Registration`;
  
  // Format the custom attributes as note attributes for the cart
  const customAttributes = [
    { key: 'Event_ID', value: eventId },
    { key: 'Event_Name', value: eventName },
    { key: 'Registration_Title', value: checkoutTitle },
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
    if (registrationData.day1) selectedDays.push('Day 1 - Athens High School (July 23)');
    if (registrationData.day2) selectedDays.push('Day 2 - Ironclad Wrestling Club (July 24)');
    if (registrationData.day3) selectedDays.push('Day 3 - South AL Location (July 25)');
    
    // Add selected days as a custom attribute
    if (selectedDays.length > 0) {
      customAttributes.push({ 
        key: 'Selected_Days', 
        value: selectedDays.join(', ') 
      });
    }
    
    // Add individual day selections for clarity
    customAttributes.push({ key: 'Day_1_Athens', value: registrationData.day1 ? 'Yes' : 'No' });
    customAttributes.push({ key: 'Day_2_Ironclad', value: registrationData.day2 ? 'Yes' : 'No' });
    customAttributes.push({ key: 'Day_3_SouthAL', value: registrationData.day3 ? 'Yes' : 'No' });
  }

  try {
    console.log('Creating direct add-to-cart URL with variant ID:', productVariantId);
    
    // Extract the simple ID from the Storefront API global ID
    let simpleVariantId = productVariantId;
    if (productVariantId.includes('/')) {
      simpleVariantId = productVariantId.split('/').pop() || '';
    }
    
    // Verify we have a valid numeric variant ID
    if (!simpleVariantId || isNaN(parseInt(simpleVariantId))) {
      console.error('Invalid variant ID format:', productVariantId);
      throw new Error('Invalid variant ID format. Expected numeric ID.');
    }
    
    // Build the custom properties object for the cart URL
    const noteAttributesArray = customAttributes.map(attr => 
      `attributes[${encodeURIComponent(attr.key)}]=${encodeURIComponent(String(attr.value))}`
    );
    
    // Create a cart URL that adds the item and redirects back to our embedded cart page
    // instead of to Shopify's cart page which would result in a 404
    let cartUrl = `https://rich-habits-2022.myshopify.com/cart/add?id=${simpleVariantId}&quantity=1&return_to=https://rich-habits.com/embedded-cart`;
    
    // Add all custom properties as encoded URL parameters
    if (noteAttributesArray.length > 0) {
      cartUrl += '&' + noteAttributesArray.join('&');
    }
    
    // Add discount code if applicable
    if (applyDiscount && process.env.UNIVERSAL_DISCOUNT_CODE) {
      cartUrl += `&discount=${encodeURIComponent(process.env.UNIVERSAL_DISCOUNT_CODE)}`;
    }
    
    console.log('Created direct cart URL:', cartUrl);
    
    // Return the cart URL in the same format as our checkout object for compatibility
    return {
      id: `cart-${Date.now()}`, // Generate a unique ID
      webUrl: cartUrl,
      subtotalPrice: price ? price.toString() : '0.00',
      totalPrice: price ? price.toString() : '0.00'
    };
  } catch (error) {
    console.error('Error creating cart URL:', error);
    throw new Error(`Failed to create direct cart URL: ${error instanceof Error ? error.message : String(error)}`);
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
  // Cory Land Tour - ID 4 - $200 full camp / $99 per day
  'cory-land-tour': {
    fullCamp: {
      productId: 'gid://shopify/Product/8949406105837',
      variantId: 'gid://shopify/ProductVariant/47808555679981',
      price: 200.00  // All days for $200
    },
    singleDay: {
      productId: 'gid://shopify/Product/8949406105837', 
      variantId: 'gid://shopify/ProductVariant/47808555679981',
      price: 99.00  // $99 per day
    }
  },
  // Birmingham Slam Camp - ID 1 - $249 full camp / $149 single day
  'birmingham-slam-camp': {
    fullCamp: {
      productId: 'gid://shopify/Product/8949406105837',
      variantId: 'gid://shopify/ProductVariant/47808555679981',
      price: 249.00  // Full camp for $249
    },
    singleDay: {
      productId: 'gid://shopify/Product/8949406105837',
      variantId: 'gid://shopify/ProductVariant/47808555679981',
      price: 149.00  // Single day for $149
    }
  },
  // National Champ Camp - ID 2 - $349 full camp / $175 per day
  'national-champ-camp': {
    fullCamp: {
      productId: 'gid://shopify/Product/8949406105837',
      variantId: 'gid://shopify/ProductVariant/47808555679981',
      price: 349.00  // Full camp for $349
    },
    singleDay: {
      productId: 'gid://shopify/Product/8949406105837',
      variantId: 'gid://shopify/ProductVariant/47808555679981',
      price: 175.00  // Single day for $175
    }
  },
  // Texas Recruiting Clinic - ID 3 - $249 full camp / $149 single day
  'texas-recruiting-clinic': {
    fullCamp: {
      productId: 'gid://shopify/Product/8949406105837',
      variantId: 'gid://shopify/ProductVariant/47808555679981',
      price: 249.00  // Full clinic for $249
    },
    singleDay: {
      productId: 'gid://shopify/Product/8949406105837',
      variantId: 'gid://shopify/ProductVariant/47808555679981',
      price: 149.00  // Single day for $149
    }
  }
};