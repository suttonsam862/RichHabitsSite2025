import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useMemo } from "react";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../hooks/use-toast";
import { ShopifyImage, getShopifyImageUrl } from "../../components/ui/robust-image";
import type { Product } from "../../types/shopify";
import { ShoppingCart, Star, ArrowRight, Plus  } from "@/lib/icons";
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Always call hooks first, before any conditional logic
  const isValidProduct = product && product.title;
  
  // Calculate properties only if product is valid
  const needsShippingNotice = useMemo(() => {
    if (!isValidProduct) return false;
    return (
      product.title.toLowerCase().includes('shirt') || 
      product.title.toLowerCase().includes('tee') ||
      product.title.toLowerCase().includes('heavyweight') ||
      product.title.toLowerCase().includes('cap') ||
      product.title.toLowerCase().includes('hat')
    );
  }, [isValidProduct, product?.title]);
  
  const needsAirDryNotice = useMemo(() => {
    if (!isValidProduct) return false;
    return (
      product.title.toLowerCase().includes('shirt') || 
      product.title.toLowerCase().includes('tee') ||
      product.title.toLowerCase().includes('heavyweight')
    );
  }, [isValidProduct, product?.title]);

  // Return early after all hooks are called
  if (!isValidProduct) {
    return null;
  }

  const handleQuickAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product detail
    e.stopPropagation();

    try {
      const defaultVariant = product.variants?.[0];
      if (!defaultVariant) {
        toast({
          title: "Error",
          description: "Product has no available variants",
          variant: "destructive",
        });
        return;
      }

      await addToCart({
        shopifyProductId: product.id,
        shopifyVariantId: defaultVariant.id,
        productHandle: product.handle,
        productTitle: product.title,
        variantTitle: defaultVariant.title || 'Default',
        price: parseFloat(defaultVariant.price.replace('$', '')),
        quantity: 1,
        productImage: getShopifyImageUrl(product),
        productType: 'Product',
        vendor: 'Rich Habits'
      });

      toast({
        title: "Added to Cart",
        description: `${product.title} added to cart!`,
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
  
  // Handle both Shopify formats: "29.99" and "$29.99"
  const priceStr = product.variants?.[0]?.price || "0";
  const price = parseFloat(typeof priceStr === 'string' ? priceStr.replace('$', '') : String(priceStr).replace('$', '')) || 0;
  
  // Format price for display - show actual price or first variant price
  const displayPrice = price > 0 ? price : (product.variants?.[0] ? parseFloat(String(product.variants[0].price).replace('$', '')) : 0);
  const formattedPrice = displayPrice > 0 ? `$${displayPrice.toFixed(2)}` : 'Contact for pricing';

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-gray-500 transition-all duration-300 group hover:shadow-xl"
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="aspect-square overflow-hidden relative">
        <ShopifyImage 
          product={product}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors text-gray-100">
          {product.title}
        </h3>
        
        {product.body_html && (
          <div 
            className="text-gray-400 text-sm mb-4 line-clamp-2"
            dangerouslySetInnerHTML={{ 
              __html: product.body_html.replace(/<[^>]*>/g, '').substring(0, 100) + '...' 
            }}
          />
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {formattedPrice}
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
        

        
        {/* Product Information Messages */}
        {(needsShippingNotice || needsAirDryNotice) && (
          <div className="mb-4 space-y-2">
            {needsShippingNotice && (
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                <p className="text-blue-300 text-sm font-medium">📦 Ships starting June 25th</p>
              </div>
            )}
            {needsAirDryNotice && (
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
                <p className="text-green-300 text-sm font-medium">🌬️ Air dry recommended for best results</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleQuickAddToCart}
            className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold p-3 rounded-xl transition-all duration-300 hover:shadow-lg group"
            title="Add to Cart"
          >
            <Plus className="w-5 h-5" />
          </button>
          <Link 
            href={`/shop/${product.handle || product.id}`}
            className="flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white hover:shadow-lg cursor-pointer"
          >
            View Details
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Shop() {
  // Get only retail collection products from the sales channel
  const { data: retailProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  // Memoize product processing to prevent hook order issues
  const products = useMemo(() => {
    return Array.isArray(retailProducts) ? retailProducts : [];
  }, [retailProducts]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-gray-900 opacity-60"></div>
        <div className="container mx-auto px-6 text-center relative">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent"
            {...fadeIn}
          >
            Rich Habits Shop
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Premium wrestling gear and apparel for champions
          </motion.p>
        </div>
      </div>

      {/* Collection Section */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          {/* Collection Header - always render */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-4xl font-bold mb-4">Retail Collection</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover our premium selection of wrestling apparel and accessories, 
              designed for athletes who demand the best in quality and performance.
            </p>
          </motion.div>

          {/* Content based on loading state */}
          {isLoading && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading products...</p>
            </div>
          )}

          {!isLoading && products.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">No Products Available</h3>
              <p className="text-gray-400 mb-8">
                We're working on stocking our retail collection. Check back soon!
              </p>
              <Link 
                href="/events"
                className="inline-block bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                Explore Training Camps
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShoppingCart className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-gray-400">
                Every product is crafted with the highest quality materials for durability and performance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Shipping</h3>
              <p className="text-gray-400">
                Free shipping on orders over $75, with 2-3 business day delivery nationwide.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ArrowRight className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Returns</h3>
              <p className="text-gray-400">
                30-day return policy with hassle-free exchanges and full refunds.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-gray-900 opacity-60"></div>
        <div className="container mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">Train Like a Champion</h3>
            <p className="text-xl text-gray-300 mb-8">
              Gear up with our premium products and join our wrestling camps for the complete experience
            </p>
            <Link 
              href="/events"
              className="inline-block bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white text-lg font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              View Training Camps
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}