import { useCallback, useMemo } from 'react';
import { useCart as useCartContext } from '../contexts/CartContext';

/**
 * Optimized cart hook with memoized calculations
 */
export function useCart() {
  const cart = useCartContext();
  
  const cartSummary = useMemo(() => ({
    itemCount: cart.state.itemCount,
    subtotal: cart.state.subtotal,
    isEmpty: cart.state.items.length === 0,
    formattedSubtotal: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cart.state.subtotal)
  }), [cart.state.itemCount, cart.state.subtotal, cart.state.items.length]);
  
  const addToCart = useCallback(async (product) => {
    return cart.addToCart(product);
  }, [cart]);
  
  const removeFromCart = useCallback(async (id) => {
    return cart.removeFromCart(id);
  }, [cart]);
  
  const updateQuantity = useCallback(async (id, quantity) => {
    return cart.updateQuantity(id, quantity);
  }, [cart]);
  
  return {
    ...cart,
    cartSummary,
    addToCart,
    removeFromCart,
    updateQuantity
  };
}