import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { fetchProducts } from "@/lib/shopify";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Product } from "@/types/shopify";

// Define ShopProduct interface that extends Product with collection
interface ShopProduct extends Product {
  collection?: string;
}

export default function Shop() {
  const [location] = useLocation();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Get query params from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const collection = params.get("collection");
    const category = params.get("category");
    
    if (collection) setActiveFilter(collection);
    if (category) setActiveCategory(category);
  }, [location]);
  
  // Fetch products from Shopify
  const { data: products, isLoading, error } = useQuery<ShopProduct[]>({
    queryKey: ['/api/products', activeFilter, activeCategory],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Static products for development
  const staticProducts: ShopProduct[] = [
    {
      id: "prod_1",
      title: "Performance Training Tee",
      handle: "performance-training-tee",
      color: "Black",
      price: "$45.00",
      image: "https://images.unsplash.com/photo-1565693413579-8a73ffa6de14?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      collection: "performance",
      availableForSale: true,
      variants: []
    },
    {
      id: "prod_2",
      title: "Minimal Track Shorts",
      handle: "minimal-track-shorts",
      color: "Slate Gray",
      price: "$38.00",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      collection: "essentials",
      availableForSale: true,
      variants: []
    },
    {
      id: "prod_3",
      title: "Premium Workout Hoodie",
      handle: "premium-workout-hoodie",
      color: "Deep Navy",
      price: "$75.00",
      image: "https://images.unsplash.com/photo-1618354691249-18772bbac3a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      collection: "competition",
      availableForSale: true,
      variants: []
    },
    {
      id: "prod_4",
      title: "Tech Compression Leggings",
      handle: "tech-compression-leggings",
      color: "Black",
      price: "$65.00",
      image: "https://images.unsplash.com/photo-1525171254930-643fc658b64e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      collection: "performance",
      availableForSale: true,
      variants: []
    },
    {
      id: "prod_5",
      title: "Athletic Performance Jacket",
      handle: "athletic-performance-jacket",
      color: "Gray",
      price: "$120.00",
      image: "https://images.unsplash.com/photo-1519931861629-54ee7ee2ec4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      collection: "essentials",
      availableForSale: true,
      variants: []
    },
    {
      id: "prod_6",
      title: "Training Sweatpants",
      handle: "training-sweatpants",
      color: "Black",
      price: "$65.00",
      image: "https://images.unsplash.com/photo-1552902881-3a2dd2c0eeab?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      collection: "essentials",
      availableForSale: true,
      variants: []
    },
    {
      id: "prod_7",
      title: "Performance Tank Top",
      handle: "performance-tank-top",
      color: "White",
      price: "$35.00",
      image: "https://images.unsplash.com/photo-1571945227444-5887ab0a0e4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      collection: "competition",
      availableForSale: true,
      variants: []
    },
    {
      id: "prod_8",
      title: "Competition Running Shorts",
      handle: "competition-running-shorts",
      color: "Blue",
      price: "$48.00",
      image: "https://images.unsplash.com/photo-1616063304943-7ee1456ff8e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      collection: "competition",
      availableForSale: true,
      variants: []
    }
  ];

  // Use static products if data is loading or there was an error
  const displayProducts = products || staticProducts;
  
  // Filter products based on activeFilter and activeCategory
  const filteredProducts = displayProducts.filter((product: ShopProduct) => {
    if (activeFilter && product.collection !== activeFilter) return false;
    // Add category filtering when implemented
    return true;
  });

  // Define collection type
  interface CollectionFilter {
    id: string;
    name: string;
  }
  
  // Available collections for filter
  const collections: CollectionFilter[] = [
    { id: "performance", name: "Performance Collection" },
    { id: "essentials", name: "Essentials Line" },
    { id: "competition", name: "Competition Series" }
  ];

  // Create structured data for product list
  const productListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": Array.isArray(filteredProducts) ? filteredProducts.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product?.title || "Athletic Apparel",
        "description": product?.description || "Premium athletic apparel from Rich Habits",
        "image": product?.image || "",
        "url": `/product/${product?.handle || product?.id || ""}`,
        "brand": {
          "@type": "Brand",
          "name": "Rich Habits"
        },
        "offers": {
          "@type": "Offer",
          "price": product?.price ? product.price.replace('$', '') : "0",
          "priceCurrency": "USD",
          "availability": product?.availableForSale ? 
            "https://schema.org/InStock" : 
            "https://schema.org/OutOfStock"
        }
      }
    })) : []
  };

  return (
    <>
      <Helmet>
        <title>Shop | Rich Habits</title>
        <meta name="description" content="Shop premium athletic apparel designed for high-performing athletes." />
        <meta name="keywords" content="wrestling gear, athletic apparel, performance clothing, custom team uniforms" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Shop | Rich Habits" />
        <meta property="og:description" content="Shop premium athletic apparel designed for high-performing athletes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rich-habits.com/shop" />
        <meta property="og:image" content="https://rich-habits.com/shop-featured.jpg" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shop | Rich Habits" />
        <meta name="twitter:description" content="Shop premium athletic apparel designed for high-performing athletes." />
        <meta name="twitter:image" content="https://rich-habits.com/shop-twitter.jpg" />
        
        {/* Structured data JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(productListSchema)}
        </script>
      </Helmet>
      
      <div className="min-h-[80vh] flex items-center justify-center bg-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl font-serif font-semibold mb-8">Shop Coming Soon</h1>
              
              <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
              
              <p className="text-xl text-gray-600 mb-10">
                Our online shop is currently under construction. 
                We're working hard to bring you premium athletic apparel designed 
                for high-performing athletes.
              </p>
              
              <div className="flex justify-center space-x-6 mb-12">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">High Performance</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Premium Quality</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Athlete Focused</span>
                </div>
              </div>
              
              <div className="bg-gray-100 p-6 rounded-lg">
                <h2 className="text-xl font-medium mb-4">Need Custom Team Apparel?</h2>
                <p className="text-gray-600 mb-6">
                  While our shop is being built, we're still taking orders for custom team apparel. 
                  Get in touch with us to discuss your requirements.
                </p>
                <Link href="/custom-apparel" className="inline-block bg-primary text-white px-8 py-3 rounded hover:bg-primary/90 transition">
                  Custom Apparel Inquiries
                </Link>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>
    </>
  );
}
