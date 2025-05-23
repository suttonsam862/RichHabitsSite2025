import { Product, Collection, ProductVariant } from "@/types/shopify";
import { apiRequest } from "./queryClient";

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || "rich-habits.myshopify.com";
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const SHOPIFY_API_VERSION = "2023-07"; // Update to latest version as needed

// Generic function to fetch from Shopify Storefront API
async function fetchFromStorefrontAPI(query: string, variables: Record<string, any> = {}) {
  try {
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching from Shopify:", error);
    throw error;
  }
}

// Fetch all products
export async function fetchProducts(collectionId?: string): Promise<Product[]> {
  try {
    // Check if we have an actual Shopify connection, if not use static products
    if (!SHOPIFY_STOREFRONT_TOKEN) {
      // This is the fallback path for development when no token is present
      const response = await apiRequest("GET", "/api/products", collectionId ? { collection: collectionId } : undefined);
      return await response.json();
    }

    // Define the GraphQL query
    const query = `
      query Products($collectionId: ID) {
        products(first: 20, ${collectionId ? 'query: "collection_id:$collectionId"' : ''}) {
          edges {
            node {
              id
              title
              handle
              description
              productType
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await fetchFromStorefrontAPI(query, { collectionId });
    
    // Transform the data to match our Product interface
    return data.products.edges.map((edge: any) => {
      const product = edge.node;
      const image = product.images.edges[0]?.node;
      const variant = product.variants.edges[0]?.node;
      
      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description,
        productType: product.productType,
        image: image ? image.url : null,
        imageAlt: image ? image.altText : null,
        price: variant ? `$${parseFloat(variant.price.amount).toFixed(2)}` : "",
        currencyCode: variant ? variant.price.currencyCode : "USD",
        availableForSale: variant ? variant.availableForSale : false,
        variants: product.variants.edges.map((variantEdge: any) => ({
          id: variantEdge.node.id,
          title: variantEdge.node.title,
          price: `$${parseFloat(variantEdge.node.price.amount).toFixed(2)}`,
          currencyCode: variantEdge.node.price.currencyCode,
          availableForSale: variantEdge.node.availableForSale
        }))
      };
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Fetch featured products
export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    // Check if we have an actual Shopify connection, if not use static products
    if (!SHOPIFY_STOREFRONT_TOKEN) {
      const response = await apiRequest("GET", "/api/products/featured");
      return await response.json();
    }

    const query = `
      query FeaturedProducts {
        products(first: 4, query: "tag:featured") {
          edges {
            node {
              id
              title
              handle
              description
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await fetchFromStorefrontAPI(query);
    
    return data.products.edges.map((edge: any) => {
      const product = edge.node;
      const image = product.images.edges[0]?.node;
      const variant = product.variants.edges[0]?.node;
      
      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description,
        image: image ? image.url : null,
        imageAlt: image ? image.altText : null,
        price: variant ? `$${parseFloat(variant.price.amount).toFixed(2)}` : "",
        currencyCode: variant ? variant.price.currencyCode : "USD",
        availableForSale: variant ? variant.availableForSale : false,
        variants: product.variants.edges.map((variantEdge: any) => ({
          id: variantEdge.node.id,
          title: variantEdge.node.title,
          price: `$${parseFloat(variantEdge.node.price.amount).toFixed(2)}`,
          currencyCode: variantEdge.node.price.currencyCode,
          availableForSale: variantEdge.node.availableForSale
        }))
      };
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    throw error;
  }
}

// Fetch product by handle
export async function fetchProductByHandle(handle: string): Promise<Product | null> {
  try {
    // Check if we have an actual Shopify connection, if not use static products
    if (!SHOPIFY_STOREFRONT_TOKEN) {
      const response = await apiRequest("GET", `/api/products/${handle}`);
      return await response.json();
    }

    const query = `
      query ProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          handle
          description
          productType
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    `;

    const data = await fetchFromStorefrontAPI(query, { handle });
    
    if (!data.productByHandle) {
      return null;
    }
    
    const product = data.productByHandle;
    const images = product.images.edges.map((edge: any) => ({
      url: edge.node.url,
      altText: edge.node.altText
    }));
    const variants = product.variants.edges.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      price: `$${parseFloat(edge.node.price.amount).toFixed(2)}`,
      currencyCode: edge.node.price.currencyCode,
      availableForSale: edge.node.availableForSale,
      options: edge.node.selectedOptions.reduce((acc: Record<string, string>, opt: {name: string, value: string}) => {
        acc[opt.name] = opt.value;
        return acc;
      }, {})
    }));
    
    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      productType: product.productType,
      image: images[0]?.url || null,
      imageAlt: images[0]?.altText || null,
      images,
      price: variants[0] ? variants[0].price : "",
      currencyCode: variants[0] ? variants[0].currencyCode : "USD",
      availableForSale: variants[0] ? variants[0].availableForSale : false,
      variants,
      options: product.options.map((option: any) => ({
        name: option.name,
        values: option.values
      }))
    };
  } catch (error) {
    console.error("Error fetching product by handle:", error);
    throw error;
  }
}

// Fetch collections
export async function fetchCollections(): Promise<Collection[]> {
  try {
    // Check if we have an actual Shopify connection, if not use static collections
    if (!SHOPIFY_STOREFRONT_TOKEN) {
      const response = await apiRequest("GET", "/api/collections");
      return await response.json();
    }

    const query = `
      query Collections {
        collections(first: 10) {
          edges {
            node {
              id
              title
              handle
              description
              image {
                url
                altText
              }
            }
          }
        }
      }
    `;

    const data = await fetchFromStorefrontAPI(query);
    
    return data.collections.edges.map((edge: any) => {
      const collection = edge.node;
      return {
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
        description: collection.description,
        image: collection.image ? collection.image.url : null,
        imageAlt: collection.image ? collection.image.altText : null
      };
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    throw error;
  }
}

// Create checkout
export async function createCheckout(variantId: string, quantity: number = 1) {
  try {
    if (!SHOPIFY_STOREFRONT_TOKEN) {
      // This would redirect to a mock checkout in development
      return { webUrl: `/checkout/${variantId}?quantity=${quantity}` };
    }

    const query = `
      mutation CheckoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
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
            variantId,
            quantity
          }
        ]
      }
    };

    const data = await fetchFromStorefrontAPI(query, variables);
    
    if (data.checkoutCreate.checkoutUserErrors.length > 0) {
      throw new Error(data.checkoutCreate.checkoutUserErrors[0].message);
    }
    
    return {
      id: data.checkoutCreate.checkout.id,
      webUrl: data.checkoutCreate.checkout.webUrl
    };
  } catch (error) {
    console.error("Error creating checkout:", error);
    throw error;
  }
}

// Register for event (integrates with Shopify products)
export async function registerForEvent(eventId: string, formData: Record<string, any>) {
  try {
    const response = await apiRequest("POST", `/api/events/${eventId}/register`, formData);
    return await response.json();
  } catch (error) {
    console.error("Error registering for event:", error);
    throw error;
  }
}

// Submit custom apparel inquiry
export async function submitCustomApparelInquiry(formData: Record<string, any>) {
  try {
    const response = await apiRequest("POST", "/api/custom-apparel/inquiry", formData);
    return await response.json();
  } catch (error) {
    console.error("Error submitting custom apparel inquiry:", error);
    throw error;
  }
}

// Submit contact form
export async function submitContactForm(formData: Record<string, any>) {
  try {
    const response = await apiRequest("POST", "/api/contact", formData);
    return await response.json();
  } catch (error) {
    console.error("Error submitting contact form:", error);
    throw error;
  }
}

// Subscribe to newsletter
export async function subscribeToNewsletter(email: string) {
  try {
    const response = await apiRequest("POST", "/api/newsletter/subscribe", { email });
    return await response.json();
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    throw error;
  }
}
