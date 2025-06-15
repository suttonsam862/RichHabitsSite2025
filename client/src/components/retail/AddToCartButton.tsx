import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
interface AddToCartButtonProps {
  product: {
    shopifyProductId: string;
    shopifyVariantId: string;
    productHandle: string;
    productTitle: string;
    variantTitle?: string;
    price: number;
    compareAtPrice?: number;
    productImage?: string;
    productType?: string;
    vendor?: string;
  };
  quantity?: number;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({ 
  product, 
  quantity = 1, 
  size = 'default', 
  variant = 'default',
  className = '',
  children 
}: AddToCartButtonProps) {
  const { addToCart, state } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      
      await addToCart({
        ...product,
        quantity,
      });
      
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      
      toast({
        title: "Added to cart",
        description: `${product.productTitle} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const buttonIcon = justAdded ? (
    <Check className="w-4 h-4" />
  ) : (
    <ShoppingCart className="w-4 h-4" />
  );

  const buttonText = children || (
    <>
      {buttonIcon}
      {justAdded ? 'Added!' : 'Add to Cart'}
    </>
  );

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding || state.isLoading}
      size={size}
      variant={variant}
      className={`${className} ${justAdded ? 'bg-green-600 hover:bg-green-700' : ''}`}
    >
      {isAdding ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Adding...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}

// Compact version for product cards
export function AddToCartButtonCompact({ product, quantity = 1, className = '' }: Omit<AddToCartButtonProps, 'children'>) {
  return (
    <AddToCartButton
      product={product}
      quantity={quantity}
      size="sm"
      variant="outline"
      className={`${className} aspect-square p-2`}
    >
      <Plus className="w-4 h-4" />
    </AddToCartButton>
  );
}