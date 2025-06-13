import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface CartItem {
  id: string;
  sessionId: string;
  userId?: string;
  shopifyProductId: string;
  shopifyVariantId: string;
  productHandle: string;
  productTitle: string;
  variantTitle?: string;
  price: string;
  compareAtPrice?: string;
  quantity: number;
  productImage?: string;
  productType?: string;
  vendor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
}

type CartAction =
  | { type: 'SET_CART'; payload: { items: CartItem[]; subtotal: number; itemCount: number } }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: CartState = {
  items: [],
  subtotal: 0,
  itemCount: 0,
  isLoading: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items,
        subtotal: action.payload.subtotal,
        itemCount: action.payload.itemCount,
        isLoading: false,
      };
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.shopifyProductId === action.payload.shopifyProductId &&
                item.shopifyVariantId === action.payload.shopifyVariantId
      );
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
        
        const newSubtotal = updatedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          ...state,
          items: updatedItems,
          subtotal: newSubtotal,
          itemCount: newItemCount,
        };
      } else {
        const newItems = [...state.items, action.payload];
        const newSubtotal = newItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          ...state,
          items: newItems,
          subtotal: newSubtotal,
          itemCount: newItemCount,
        };
      }
    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      const newSubtotal = updatedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: updatedItems,
        subtotal: newSubtotal,
        itemCount: newItemCount,
      };
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      const filteredSubtotal = filteredItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      const filteredItemCount = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: filteredItems,
        subtotal: filteredSubtotal,
        itemCount: filteredItemCount,
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        subtotal: 0,
        itemCount: 0,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addToCart: (product: {
    shopifyProductId: string;
    shopifyVariantId: string;
    productHandle: string;
    productTitle: string;
    variantTitle?: string;
    price: number;
    compareAtPrice?: number;
    quantity?: number;
    productImage?: string;
    productType?: string;
    vendor?: string;
  }) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const queryClient = useQueryClient();

  // Fetch cart data
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['/api/cart'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update state when cart data changes
  useEffect(() => {
    if (cartData && (cartData as any).success) {
      const data = cartData as any;
      dispatch({
        type: 'SET_CART',
        payload: {
          items: data.cartItems || [],
          subtotal: parseFloat(data.subtotal || '0'),
          itemCount: data.itemCount || 0,
        },
      });
    }
  }, [cartData]);

  // Update loading state
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, [isLoading]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (product: any) => {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.cartItem) {
        dispatch({ type: 'ADD_ITEM', payload: data.cartItem });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const response = await fetch(`/api/cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      dispatch({ type: 'UPDATE_ITEM', payload: variables });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cart/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: (data, id) => {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      dispatch({ type: 'CLEAR_CART' });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const addToCart = async (product: any) => {
    await addToCartMutation.mutateAsync(product);
  };

  const updateQuantity = async (id: string, quantity: number) => {
    await updateQuantityMutation.mutateAsync({ id, quantity });
  };

  const removeFromCart = async (id: string) => {
    await removeFromCartMutation.mutateAsync(id);
  };

  const clearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}