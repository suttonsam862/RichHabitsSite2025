import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, ShoppingCart, Star, Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../hooks/use-toast";
import { ShopifyImage, getShopifyImageUrl } from "../../components/ui/robust-image";
import { Product, ProductVariant } from "../../types/shopify";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function ProductDetail() {
  const { handle } = useParams();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/shop/products/handle/${handle}`],
    enabled: !!handle
  });

  // Initialize selected options when product loads
  useEffect(() => {
    if (product?.variants?.[0] && product?.options) {
      const initialOptions: Record<string, string> = {};
      product.options.forEach((option, index) => {
        const optionKey = `option${index + 1}` as keyof ProductVariant;
        const variantValue = product.variants[0][optionKey];
        if (variantValue && typeof variantValue === 'string') {
          initialOptions[option.name] = variantValue;
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [product]);

  // Add document title when product loads
  useEffect(() => {
    if (product?.title) {
      document.title = `${product.title} | Rich Habits`;
    }
    return () => {
      document.title = 'Rich Habits';
    };
  }, [product?.title]);

  // Handle variant selection based on options
  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);

    // Find matching variant
    const matchingVariantIndex = product?.variants.findIndex(variant => {
      return product.options.every((option, index) => {
        const optionKey = `option${index + 1}` as keyof ProductVariant;
        return variant[optionKey] === newOptions[option.name];
      });
    });

    if (matchingVariantIndex !== undefined && matchingVariantIndex >= 0) {
      setSelectedVariant(matchingVariantIndex);
      
      // Update image if variant has featured image
      const variant = product?.variants[matchingVariantIndex];
      if (variant?.featured_image?.src && product?.images) {
        const imageIndex = product.images.findIndex(img => img.src === variant.featured_image?.src);
        if (imageIndex >= 0) {
          setCurrentImage(imageIndex);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link 
            href="/shop"
            className="text-red-400 hover:text-red-300"
          >
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const variants = product?.variants || [];
  const currentVariant = variants[selectedVariant] || variants[0];
  // Handle both Shopify formats: "29.99" and "$29.99"
  const priceStr = currentVariant?.price || "0";
  const price = parseFloat(priceStr.replace('$', '')) || 0;
  const compareAtPrice = currentVariant?.compare_at_price ? parseFloat(currentVariant.compare_at_price.replace('$', '')) : null;
  
  // Determine if this is a retail product (not an event)
  const isRetailProduct = !product?.tags?.includes('event') && product?.product_type !== 'Event Registration';
  
  // Check availability using correct Shopify property - fix for "Out of Stock" issue
  const isInStock = currentVariant?.available !== false && (currentVariant?.inventory_quantity === undefined || currentVariant?.inventory_quantity > 0);

  const handleAddToCart = async () => {
    if (!isRetailProduct) {
      toast({
        title: "Cannot Add to Cart",
        description: "This item cannot be added to cart",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have a valid variant selected
    let variantToAdd = currentVariant;
    
    // If no variant is selected or we need to find one based on options, find the matching variant
    if (!variantToAdd || Object.keys(selectedOptions).length > 0) {
      variantToAdd = product?.variants.find(variant => {
        return product.options.every((option, index) => {
          const optionKey = `option${index + 1}` as keyof ProductVariant;
          const selectedValue = selectedOptions[option.name];
          return !selectedValue || variant[optionKey] === selectedValue;
        });
      }) || product?.variants[0];
    }

    if (!variantToAdd) {
      toast({
        title: "Selection Required",
        description: "Please select all required options",
        variant: "destructive",
      });
      return;
    }

    // Check stock for selected variant
    const variantInStock = variantToAdd.available !== false && 
                          (variantToAdd.inventory_quantity === undefined || variantToAdd.inventory_quantity > 0);
    
    if (!variantInStock) {
      toast({
        title: "Out of Stock",
        description: "This variant is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create variant title from selected options
      const selectedOptionsText = Object.entries(selectedOptions)
        .map(([, value]) => value)
        .filter(Boolean)
        .join(' / ') || variantToAdd.title;

      await addToCart({
        shopifyProductId: product.id,
        shopifyVariantId: variantToAdd.id,
        productHandle: product.handle,
        productTitle: product.title,
        variantTitle: selectedOptionsText,
        price: parseFloat(variantToAdd.price.replace('$', '')),
        compareAtPrice: variantToAdd.compare_at_price ? parseFloat(variantToAdd.compare_at_price.replace('$', '')) : undefined,
        quantity: quantity,
        productImage: getShopifyImageUrl(product, variantToAdd),
        productType: product.product_type,
        vendor: product.vendor
      });

      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product?.title} (${selectedOptionsText}) added to cart!`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 py-4">
        <div className="container mx-auto px-6">
          <Link 
            href="/shop"
            className="inline-flex items-center text-red-400 hover:text-red-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
        </div>
      </div>

      {/* Product Detail */}
      <div className="py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <motion.div {...fadeIn} className="order-1">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <ShopifyImage 
                  product={product}
                  variant={currentVariant}
                  imageIndex={currentImage}
                  className="w-full h-full"
                />
              </div>
              
              {/* Thumbnail images - Mobile: Horizontal scroll, Desktop: Grid */}
              {product?.images && product.images.length > 1 && (
                <div className="mt-4 overflow-x-auto">
                  <div className="flex gap-2 md:gap-4 min-w-max md:min-w-0">
                    {product.images.map((_, index: number) => (
                      <button
                        key={index} 
                        onClick={() => setCurrentImage(index)}
                        className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          currentImage === index ? 'border-blue-500' : 'border-transparent hover:border-gray-600'
                        }`}
                      >
                        <ShopifyImage 
                          product={product}
                          imageIndex={index}
                          className="w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-2 space-y-4 md:space-y-6"
            >
              <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">{product?.title}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    ${price.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-gray-400 ml-2">(4.8)</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product?.body_html && (
                <div 
                  className="text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.body_html }}
                />
              )}

              {/* Product Options - Enhanced for Shopify Integration */}
              {product?.options && product.options.length > 0 && (
                <div className="space-y-4 md:space-y-6">
                  {product.options.map((option) => (
                    <div key={option.name}>
                      <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-white">{option.name}</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
                        {option.values.map((value) => (
                          <button
                            key={value}
                            onClick={() => handleOptionChange(option.name, value)}
                            className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 rounded-lg border transition-all duration-200 text-xs sm:text-sm md:text-base font-medium ${
                              selectedOptions[option.name] === value
                                ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/25'
                                : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:bg-gray-800/50'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Size options for shirts if not already present in Shopify options */}
                  {(product?.title?.toLowerCase().includes('shirt') ||
                    product?.title?.toLowerCase().includes('tee') ||
                    product?.title?.toLowerCase().includes('heavyweight')) &&
                    !product.options.some(opt => opt.name.toLowerCase().includes('size')) && (
                    <div>
                      <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-white">Size</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                          <button
                            key={size}
                            onClick={() => handleOptionChange('Size', size)}
                            className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 rounded-lg border transition-all duration-200 text-xs sm:text-sm md:text-base font-medium ${
                              selectedOptions['Size'] === size
                                ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/25'
                                : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:bg-gray-800/50'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Shipping and Care Information for Shirts/Hats */}
              {(product?.title?.toLowerCase().includes('shirt') ||
                product?.title?.toLowerCase().includes('tee') ||
                product?.title?.toLowerCase().includes('heavyweight') ||
                product?.title?.toLowerCase().includes('cap') ||
                product?.title?.toLowerCase().includes('hat')) && (
                <div className="space-y-3 bg-gray-900/50 rounded-lg p-4 md:p-6">
                  <div className="flex items-center gap-2 text-blue-300">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm md:text-base font-medium">Ships starting June 25th</span>
                  </div>
                  {(product?.title?.toLowerCase().includes('shirt') ||
                    product?.title?.toLowerCase().includes('tee') ||
                    product?.title?.toLowerCase().includes('heavyweight')) && (
                    <div className="flex items-center gap-2 text-green-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm md:text-base font-medium">Air dry recommended for best results</span>
                    </div>
                  )}
                </div>
              )}

              {/* Availability Status */}
              {currentVariant && (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isInStock ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-sm ${
                    isInStock ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isInStock 
                      ? `In Stock (${currentVariant.inventory_quantity || 'Available'})` 
                      : 'Out of Stock'
                    }
                  </span>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-700 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-800 rounded-l-lg transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 md:px-4 py-2 min-w-[50px] md:min-w-[60px] text-center text-sm md:text-base">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-800 rounded-r-lg transition-colors"
                      disabled={!isInStock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Cart - Only for retail products */}
              {isRetailProduct && (
                <div className="space-y-4">
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={!isInStock}
                    className={`w-full font-semibold py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      isInStock
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-lg'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                    whileHover={isInStock ? { scale: 1.02 } : {}}
                    whileTap={isInStock ? { scale: 0.98 } : {}}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isInStock 
                      ? `Add to Cart - $${(price * quantity).toFixed(2)}`
                      : 'Out of Stock'
                    }
                  </motion.button>
                  
                  {compareAtPrice && compareAtPrice > price && (
                    <div className="text-center">
                      <span className="text-gray-400 line-through">${compareAtPrice.toFixed(2)}</span>
                      <span className="text-red-400 ml-2">Save ${(compareAtPrice - price).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="text-xs md:text-sm text-gray-400 text-center">
                    Free shipping on orders over $75
                  </div>
                </div>
              )}

              {/* Event Registration Link - Only for event products */}
              {!isRetailProduct && (
                <div className="space-y-4">
                  <Link
                    href={`/events/${product.handle}`}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg"
                  >
                    Register for Event - ${price.toFixed(2)}
                  </Link>
                </div>
              )}

              {/* Product Features */}
              <div className="border-t border-gray-800 pt-4 md:pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                  <div className="flex justify-between sm:block">
                    <strong className="text-blue-400">Quality:</strong>
                    <p className="text-gray-400 sm:mt-1">Premium materials</p>
                  </div>
                  <div className="flex justify-between sm:block">
                    <strong className="text-purple-400">Shipping:</strong>
                    <p className="text-gray-400 sm:mt-1">
                      {(product?.title?.toLowerCase().includes('shirt') ||
                        product?.title?.toLowerCase().includes('tee') ||
                        product?.title?.toLowerCase().includes('heavyweight') || 
                        product?.title?.toLowerCase().includes('cap') ||
                        product?.title?.toLowerCase().includes('hat'))
                        ? 'Ships starting June 25th' 
                        : '2-3 business days'
                      }
                    </p>
                  </div>
                  {(product?.title?.toLowerCase().includes('shirt') ||
                    product?.title?.toLowerCase().includes('tee') ||
                    product?.title?.toLowerCase().includes('heavyweight')) && (
                    <div className="flex justify-between sm:block">
                      <strong className="text-green-400">Care:</strong>
                      <p className="text-gray-400 sm:mt-1">Air dry recommended for best results</p>
                    </div>
                  )}
                  <div className="flex justify-between sm:block">
                    <strong className="text-emerald-400">Returns:</strong>
                    <p className="text-gray-400 sm:mt-1">30-day policy</p>
                  </div>
                  <div className="flex justify-between sm:block">
                    <strong className="text-amber-400">Support:</strong>
                    <p className="text-gray-400 sm:mt-1">24/7 customer care</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}