// Comprehensive Shopify type definitions with bulletproof image support

export interface ShopifyImage {
  src?: string;
  url?: string;
  originalSrc?: string;
  alt?: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  available: boolean;
  inventory_quantity?: number;
  compare_at_price?: string;
  // Support both featured_image and image properties
  featured_image?: ShopifyImage | null;
  image?: ShopifyImage;
  option1?: string;
  option2?: string;
  option3?: string;
  weight?: number;
  sku?: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  body_html?: string;
  description?: string;
  images: ShopifyImage[];
  variants: ProductVariant[];
  options?: ProductOption[];
  product_type?: string;
  tags?: string[];
  vendor?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  status?: string;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description?: string;
  image?: ShopifyImage;
  products?: Product[];
}

// Cart item with robust image handling
export interface CartItem {
  shopifyProductId: string;
  shopifyVariantId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  productImage: string; // Always resolved to a valid URL or placeholder
  productType?: string;
  vendor?: string;
}

// Shopify API response types
export interface ShopifyProductResponse {
  product: Product;
}

export interface ShopifyProductsResponse {
  products: Product[];
}

export interface ShopifyCollectionResponse {
  collection: Collection;
}

export interface ShopifyCollectionsResponse {
  collections: Collection[];
}