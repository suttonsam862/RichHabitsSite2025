import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, ShoppingCart, Star, Minus, Plus } from "lucide-react";
import { useState } from "react";

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

  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/shop/products/handle/${handle}`],
    enabled: !!handle
  });

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
          <Link href="/shop">
            <a className="text-red-400 hover:text-red-300">← Back to Shop</a>
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

  const handleAddToCart = () => {
    // Add to cart functionality - for now just show alert
    alert(`Added ${quantity} x ${product?.title} to cart!`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 py-4">
        <div className="container mx-auto px-6">
          <Link href="/shop">
            <a className="inline-flex items-center text-red-400 hover:text-red-300 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </a>
          </Link>
        </div>
      </div>

      {/* Product Detail */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Images */}
            <motion.div {...fadeIn}>
              <div className="aspect-square bg-gray-900 rounded-2xl overflow-hidden">
                {product?.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0].src} 
                    alt={product?.title || 'Product'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <ShoppingCart className="w-24 h-24" />
                  </div>
                )}
              </div>
              
              {/* Thumbnail images */}
              {product?.images && product.images.length > 1 && (
                <div className="flex gap-4 mt-4">
                  {product.images.slice(1, 5).map((image: any, index: number) => (
                    <div key={index} className="w-20 h-20 bg-gray-900 rounded-lg overflow-hidden">
                      <img 
                        src={image.src} 
                        alt={`${product?.title || 'Product'} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl font-bold mb-4">{product?.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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

              {/* Variants */}
              {variants && variants.length > 1 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Options</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {variants.map((variant: any, index: number) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(index)}
                        className={`p-3 rounded-lg border transition-colors ${
                          selectedVariant === index
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        {variant.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-700 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-800 rounded-l-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-800 rounded-r-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-4">
                <motion.button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart - ${(price * quantity).toFixed(2)}
                </motion.button>
                
                <div className="text-sm text-gray-400 text-center">
                  Free shipping on orders over $75
                </div>
              </div>

              {/* Product Features */}
              <div className="border-t border-gray-800 pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-blue-400">Quality:</strong>
                    <p className="text-gray-400">Premium materials</p>
                  </div>
                  <div>
                    <strong className="text-purple-400">Shipping:</strong>
                    <p className="text-gray-400">2-3 business days</p>
                  </div>
                  <div>
                    <strong className="text-emerald-400">Returns:</strong>
                    <p className="text-gray-400">30-day policy</p>
                  </div>
                  <div>
                    <strong className="text-amber-400">Support:</strong>
                    <p className="text-gray-400">24/7 customer care</p>
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