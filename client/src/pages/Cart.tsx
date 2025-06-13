import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';

export default function Cart() {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();

  if (state.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/shop">
            <Button size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(id);
    } else {
      await updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = async (id: string) => {
    await removeFromCart(id);
  };

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart ({state.itemCount} items)</h1>
          <Button variant="outline" onClick={handleClearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    {item.productImage && (
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    )}

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.productTitle}</h3>
                      {item.variantTitle && (
                        <p className="text-gray-600">{item.variantTitle}</p>
                      )}
                      {item.vendor && (
                        <p className="text-sm text-gray-500">{item.vendor}</p>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </p>
                            {item.compareAtPrice && parseFloat(item.compareAtPrice) > parseFloat(item.price) && (
                              <p className="text-sm text-gray-500 line-through">
                                ${(parseFloat(item.compareAtPrice) * item.quantity).toFixed(2)}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({state.itemCount} items)</span>
                  <span className="font-medium">${state.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${state.subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>

                <div className="text-center">
                  <Link href="/shop">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Shipping and taxes calculated at checkout
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}