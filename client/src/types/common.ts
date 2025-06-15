/**
 * Common type definitions used across the application
 */

export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  price: number;
  teamPrice?: number;
  description: string;
  features: string[];
  images: string[];
  slug: string;
  savings?: number;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  price: string;
  compareAtPrice?: string;
  image: string | null;
  imageAlt?: string | null;
  availableForSale: boolean;
  vendor?: string;
  productType?: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  image: string;
}

export interface Coach {
  id: string;
  name: string;
  title: string;
  image: string;
  bio?: string;
  achievements?: string[];
}

export interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}