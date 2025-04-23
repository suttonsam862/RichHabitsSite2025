// Product interfaces
export interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
  productType?: string;
  image: string | null;
  imageAlt?: string | null;
  images?: ProductImage[];
  price: string;
  currencyCode?: string;
  color?: string;
  availableForSale: boolean;
  variants: ProductVariant[];
  options?: ProductOption[];
  collection?: string;
}

export interface ProductImage {
  url: string;
  altText?: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  currencyCode?: string;
  availableForSale: boolean;
  options?: Record<string, string>;
}

export interface ProductOption {
  name: string;
  values: string[];
}

// Collection interfaces
export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image: string | null;
  imageAlt?: string | null;
}

// Checkout interfaces
export interface Checkout {
  id: string;
  webUrl: string;
  lineItems?: CheckoutLineItem[];
  subtotalPrice?: string;
  totalPrice?: string;
}

export interface CheckoutLineItem {
  id: string;
  title: string;
  variant: ProductVariant;
  quantity: number;
}

// Customer interfaces
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  orders?: Order[];
}

export interface Order {
  id: string;
  orderNumber: string;
  processedAt: string;
  statusUrl: string;
  totalPrice: string;
  lineItems: OrderLineItem[];
}

export interface OrderLineItem {
  title: string;
  quantity: number;
  variant: {
    title: string;
    price: string;
  };
}

// Event Registration interfaces
export interface EventRegistration {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  age?: string;
  experience?: string;
  paymentSuccess: boolean;
  checkoutUrl?: string;
}

// Custom Apparel interfaces
export interface CustomApparelInquiry {
  name: string;
  email: string;
  organizationName: string;
  sport: string;
  details: string;
  phone?: string;
}

// Contact Form interfaces
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}
