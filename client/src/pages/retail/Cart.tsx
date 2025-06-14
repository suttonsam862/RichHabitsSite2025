import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with proper key handling
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
                             import.meta.env.STRIPE_PUBLISHABLE_KEY || 
                             'pk_live_51RK25mBIRPjPy7BLnnfk9W4NLtkhEARrXCYY7yn2lAryA1jBPSkK7pU9ILCf1sJL0YVbrdd1mTcsYTot04uuIVav00HVWDloOE';

console.log('Stripe key available:', !!stripePublishableKey, stripePublishableKey.substring(0, 10) + '...');

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface CheckoutFormProps {
  totalAmount: number;
  cartItems: any[];
}

function CheckoutForm({ totalAmount, cartItems }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { clearCart } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Payment System Unavailable",
        description: "Payment processing is temporarily unavailable. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent on the server
      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          customerInfo
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: customerInfo.email,
            phone: customerInfo.phone || undefined,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: "Your order has been placed successfully. You'll receive a confirmation email shortly.",
        });

        // Clear the cart after successful payment
        await clearCart();

        // Redirect to success page or home
        window.location.href = '/shop?success=true';
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={customerInfo.firstName}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
            required
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={customerInfo.lastName}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
            required
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={customerInfo.email}
          onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
          required
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={customerInfo.phone}
          onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div>
        <Label>Card Information *</Label>
        <div className="mt-2 p-3 border border-gray-700 rounded-md bg-gray-800">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Pay ${totalAmount.toFixed(2)}
          </div>
        )}
      </Button>
    </form>
  );
}

export default function Cart() {
  const { state, updateQuantity, removeFromCart } = useCart();
  const { toast } = useToast();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
      return;
    }
    
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/shop"
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              ← Back to Shop
            </Link>
            <h1 className="text-2xl font-bold flex items-center">
              <ShoppingBag className="w-6 h-6 mr-2" />
              Shopping Cart
            </h1>
          </div>
        </div>
      </div>

      <div className="py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          {state.items.length === 0 ? (
            <motion.div {...fadeIn} className="text-center py-16">
              <ShoppingBag className="w-24 h-24 mx-auto text-gray-600 mb-6" />
              <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-gray-400 mb-8">Add some items to get started!</p>
              <Link href="/shop">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
                  Continue Shopping
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <motion.div {...stagger} className="lg:col-span-2">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Cart Items ({state.itemCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {state.items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        {...fadeIn}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productTitle}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                if (img.dataset.fallbackAttempted !== 'true') {
                                  img.dataset.fallbackAttempted = 'true';
                                  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <ShoppingBag className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">
                            {item.productTitle}
                          </h3>
                          {item.variantTitle && (
                            <p className="text-sm text-gray-400">
                              {item.variantTitle}
                            </p>
                          )}
                          {(item.selectedSize || item.selectedColor) && (
                            <p className="text-sm text-gray-400">
                              {[item.selectedSize, item.selectedColor].filter(Boolean).join(' • ')}
                            </p>
                          )}
                          <p className="text-red-400 font-semibold">
                            ${parseFloat(item.price).toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="border-gray-600 text-white hover:bg-gray-700"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center text-white">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="border-gray-600 text-white hover:bg-gray-700"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Checkout Sidebar */}
              <motion.div {...fadeIn} className="lg:col-span-1">
                <Card className="bg-gray-900 border-gray-800 sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-white">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-white">
                      <span>Subtotal</span>
                      <span>${state.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between text-xl font-bold text-white">
                      <span>Total</span>
                      <span>${state.subtotal.toFixed(2)}</span>
                    </div>

                    <div className="mt-8">
                      {stripePromise ? (
                        <Elements stripe={stripePromise}>
                          <CheckoutForm
                            totalAmount={state.subtotal}
                            cartItems={state.items}
                          />
                        </Elements>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400 mb-4">Payment processing is temporarily unavailable</p>
                          <p className="text-sm text-gray-500">Please try again later or contact support</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}