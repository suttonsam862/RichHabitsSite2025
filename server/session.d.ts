declare module 'express-session' {
  interface SessionData {
    cart?: Array<{
      id: string;
      sessionId: string;
      shopifyProductId: string;
      shopifyVariantId: string;
      productHandle: string;
      productTitle: string;
      variantTitle: string;
      price: string;
      quantity: number;
      productImage?: string;
      productType?: string;
      vendor?: string;
      createdAt: string;
      updatedAt: string;
    }>;
  }
}

export {};