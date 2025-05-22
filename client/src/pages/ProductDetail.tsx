import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { fetchProductByHandle } from '@/lib/shopify';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { AnimatedUnderline } from '@/components/ui/animated-underline';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/types/shopify';

export default function ProductDetail() {
  const [location] = useLocation();
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  
  // Extract product handle from URL
  const productHandle = location.split('/').pop() || '';
  
  // Fetch product data
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productHandle}`],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Set initial selected options based on first variant
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedOptions(product.variants[0].options || {});
    }
  }, [product]);
  
  // Find matching variant based on selected options
  useEffect(() => {
    if (product?.variants) {
      const matchingVariantIndex = product.variants.findIndex(variant => {
        if (!variant.options) return false;
        
        // Check if all selected options match this variant
        return Object.entries(selectedOptions).every(
          ([key, value]) => variant.options?.[key] === value
        );
      });
      
      if (matchingVariantIndex !== -1) {
        setSelectedVariant(matchingVariantIndex);
      }
    }
  }, [selectedOptions, product]);
  
  // Handle option selection
  const handleOptionChange = (optionName: string, optionValue: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: optionValue
    }));
  };
  
  // Create structured data for product
  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": product.image || "",
    "description": product.description || "",
    "brand": {
      "@type": "Brand",
      "name": "Rich Habits"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://rich-habits.com${location}`,
      "priceCurrency": "USD",
      "price": product.price?.replace('$', '') || "0",
      "availability": product.availableForSale ? 
        "https://schema.org/InStock" : 
        "https://schema.org/OutOfStock"
    }
  } : null;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-primary"></div>
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    );
  }
  
  // Error state
  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <h2 className="text-2xl font-medium text-gray-800 mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-8">We couldn't find the product you're looking for.</p>
        <Button asChild>
          <a href="/shop">Return to Shop</a>
        </Button>
      </div>
    );
  }
  
  const currentVariant = product.variants[selectedVariant];
  
  return (
    <>
      <Helmet>
        <title>{product.title} | Rich Habits</title>
        <meta name="description" content={product.description || "Premium athletic apparel from Rich Habits."} />
        <meta name="keywords" content="wrestling gear, athletic apparel, performance clothing, custom team uniforms" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={`${product.title} | Rich Habits`} />
        <meta property="og:description" content={product.description || "Premium athletic apparel from Rich Habits."} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://rich-habits.com${location}`} />
        <meta property="og:image" content={product.image || ""} />
        <meta property="product:price:amount" content={product.price?.replace('$', '') || "0"} />
        <meta property="product:price:currency" content="USD" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.title} | Rich Habits`} />
        <meta name="twitter:description" content={product.description || "Premium athletic apparel from Rich Habits."} />
        <meta name="twitter:image" content={product.image || ""} />
        
        {/* Structured data JSON-LD */}
        {productSchema && (
          <script type="application/ld+json">
            {JSON.stringify(productSchema)}
          </script>
        )}
      </Helmet>
      
      <div className="bg-white">
        <Container className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="sticky top-24"
              >
                <div className="bg-gray-50 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={product.image || "/images/product-placeholder.png"} 
                    alt={product.title} 
                    className="w-full h-auto object-cover"
                    style={{ aspectRatio: "1/1" }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/product-placeholder.png';
                    }}
                  />
                </div>
                
                {/* Additional product images */}
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {product.images.map((image, idx) => (
                      <div 
                        key={idx} 
                        className="bg-gray-50 rounded-md overflow-hidden cursor-pointer"
                      >
                        <img 
                          src={image.url || "/images/product-placeholder.png"} 
                          alt={image.altText || product.title} 
                          className="w-full h-auto object-cover"
                          style={{ aspectRatio: "1/1" }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-sm text-gray-500 mb-2">
                <a href="/shop" className="hover:text-primary">Shop</a> / 
                <a href={`/shop?collection=${product.collection || ""}`} className="ml-1 hover:text-primary">{product.collection || "Collection"}</a>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-2">{product.title}</h1>
              
              <div className="text-2xl font-medium text-primary mb-6">
                {currentVariant?.price || product.price}
              </div>
              
              <div className="prose prose-slate mb-8" dangerouslySetInnerHTML={{ __html: product.description || "" }} />
              
              <Separator className="my-6" />
              
              {/* Product Options */}
              {product.options && product.options.map((option) => (
                <div key={option.name} className="mb-6">
                  <h3 className="text-sm font-medium mb-3">{option.name}</h3>
                  <div className="flex flex-wrap gap-3">
                    {option.values.map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`px-4 py-2 border rounded-md ${
                          selectedOptions[option.name] === value
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handleOptionChange(option.name, value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Quantity</h3>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="w-10 h-10 border border-gray-300 rounded-l-md flex items-center justify-center"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                  <div className="w-16 h-10 border-t border-b border-gray-300 flex items-center justify-center text-gray-700">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    className="w-10 h-10 border border-gray-300 rounded-r-md flex items-center justify-center"
                    onClick={() => setQuantity(prev => prev + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Add to Cart Button */}
              <Button
                className="w-full py-6 text-lg mt-4"
                disabled={!product.availableForSale}
              >
                {product.availableForSale ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              {/* Additional Product Info */}
              <div className="mt-10">
                <div className="border-t border-gray-200 pt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Shipping & Returns</h3>
                    <p className="text-gray-600">Free shipping on all orders over $150. 30-day return policy.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Materials & Care</h3>
                    <p className="text-gray-600">Premium performance fabrics engineered for athletes. Machine wash cold, tumble dry low.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Related Products Section would go here */}
        </Container>
      </div>
    </>
  );
}