declare module 'shopify-buy' {
  interface ClientConfig {
    domain: string;
    storefrontAccessToken: string;
  }

  interface Client {
    checkout: {
      create(): Promise<Checkout>;
      fetch(id: string): Promise<Checkout>;
      addLineItems(checkoutId: string, lineItems: LineItem[]): Promise<Checkout>;
      removeLineItems(checkoutId: string, lineItemIds: string[]): Promise<Checkout>;
      updateLineItems(checkoutId: string, lineItems: LineItem[]): Promise<Checkout>;
    };
  }

  interface Checkout {
    id: string;
    webUrl: string;
    lineItems: LineItem[];
    subtotalPrice: string;
    totalPrice: string;
  }

  interface LineItem {
    id?: string;
    variantId: string;
    quantity: number;
    customAttributes?: CustomAttribute[];
    variant?: {
      id: string;
      title: string;
      price: string;
      image?: {
        src: string;
      };
    };
    title?: string;
  }

  interface CustomAttribute {
    key: string;
    value: string;
  }

  export default {
    buildClient(config: ClientConfig): Client;
  };
}