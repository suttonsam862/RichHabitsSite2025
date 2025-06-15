import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import shopifyClient from '@/lib/shopifyClient';

export default function EmbeddedCart() {
  const [location, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<any>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState('0.00');
  const [total, setTotal] = useState('0.00');
  const [checkoutUrl, setCheckoutUrl] = useState('');

  // Process query parameters to see if we came from Shopify's add to cart redirect
  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Check if there's an existing cart in localStorage
        const storedCartId = localStorage.getItem('shopify_cart_id');
        
        if (storedCartId) {
          try {
            const existingCart = await shopifyClient.checkout.fetch(storedCartId);
            if (existingCart && existingCart.id) {
              setCart(existingCart);
              setLineItems(existingCart.lineItems);
              setSubtotal(existingCart.subtotalPrice);
              setTotal(existingCart.totalPrice);
              setCheckoutUrl(existingCart.webUrl);
              setLoading(false);
              return;
            }
          } catch (error) {

            // Continue to create a new cart if the existing one can't be fetched
          }
        }

        // Create a new cart if there isn't one stored or if fetching failed
        const newCart = await shopifyClient.checkout.create();
        if (newCart && newCart.id) {
          localStorage.setItem('shopify_cart_id', newCart.id);
          setCart(newCart);
          setLineItems(newCart.lineItems);
          setSubtotal(newCart.subtotalPrice);
          setTotal(newCart.totalPrice);
          setCheckoutUrl(newCart.webUrl);
          
          // Check if we need to add an item to the cart
          const params = new URLSearchParams(window.location.search);
          const variantId = params.get('variantId');
          
          if (variantId) {
            // Add the item to the cart
            const updatedCart = await shopifyClient.checkout.addLineItems(newCart.id, [
              {
                variantId,
                quantity: 1
              }
            ]);
            
            setCart(updatedCart);
            setLineItems(updatedCart.lineItems);
            setSubtotal(updatedCart.subtotalPrice);
            setTotal(updatedCart.totalPrice);
            setCheckoutUrl(updatedCart.webUrl);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing cart:', error);
        setError('Failed to initialize shopping cart. Please try again.');
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Handle checkout
  const handleCheckout = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    navigate('/events');
  };

  // Handle removing an item from the cart
  const handleRemoveItem = async (lineItemId: string) => {
    if (!cart || !cart.id) return;

    setLoading(true);
    
    try {
      const updatedCart = await shopifyClient.checkout.removeLineItems(cart.id, [lineItemId]);
      
      setCart(updatedCart);
      setLineItems(updatedCart.lineItems);
      setSubtotal(updatedCart.subtotalPrice);
      setTotal(updatedCart.totalPrice);
      setCheckoutUrl(updatedCart.webUrl);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError('Failed to remove item from cart. Please try again.');
    }
    
    setLoading(false);
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <Helmet>
          <title>Cart Error | Rich Habits</title>
        </Helmet>
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-4">Cart Error</h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleContinueShopping}
              className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90"
            >
              Return to Events
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <Helmet>
          <title>Loading Cart | Rich Habits</title>
        </Helmet>
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Loading Your Cart</h1>
          <p className="mb-6 text-gray-600">
            Please wait while we prepare your cart...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col p-4 bg-gray-50">
      <Helmet>
        <title>Your Cart | Rich Habits</title>
      </Helmet>
      
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Cart</h1>
        
        {lineItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-gray-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="mb-6 text-gray-600">
              You haven't added any items to your cart yet.
            </p>
            <button
              onClick={handleContinueShopping}
              className="py-2 px-4 bg-primary text-white rounded hover:bg-primary/90"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="font-semibold text-lg">Cart Items</h2>
                </div>
                
                <div className="divide-y">
                  {lineItems.map((item: any) => (
                    <div key={item.id} className="p-4 flex items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                        {item.variant.image ? (
                          <img src={item.variant.image.src} alt={item.title} className="max-h-full max-w-full" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{item.title}</h3>
                        {item.variant.title !== 'Default Title' && (
                          <p className="text-sm text-gray-500">{item.variant.title}</p>
                        )}
                        
                        {item.customAttributes && item.customAttributes.length > 0 && (
                          <div className="mt-1">
                            {item.customAttributes.map((attr: any, index: number) => {
                              // Skip internal attributes
                              if (attr.key.startsWith('_')) return null;
                              
                              return (
                                <div key={index} className="text-xs text-gray-500">
                                  <span className="font-medium">{attr.key.replace(/_/g, ' ')}: </span>
                                  {attr.value}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium text-gray-800">${parseFloat(item.variant.price).toFixed(2)}</div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-sm text-red-500 hover:text-red-700 mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${parseFloat(subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-800 font-semibold">Total</span>
                    <span className="font-bold">${parseFloat(total).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Proceed to Checkout
                  </button>
                  
                  <button
                    onClick={handleContinueShopping}
                    className="w-full py-3 px-4 bg-gray-200 text-gray-800 font-medium rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}