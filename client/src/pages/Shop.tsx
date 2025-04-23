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

  return (
    <>
      <Helmet>
        <title>Shop | Rich Habits</title>
        <meta name="description" content="Shop premium athletic apparel designed for high-performing athletes." />
      </Helmet>
      
      <div className="py-16 bg-white">
        <Container>
          <div className="mb-12">
            <h1 className="text-4xl font-serif font-semibold mb-6">Shop</h1>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 border-b border-[hsl(var(--shadow))] pb-4">
              <button 
                className={`px-4 py-2 text-sm font-medium ${!activeFilter ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveFilter(null)}
              >
                All Products
              </button>
              
              {collections.map((collection: CollectionFilter) => (
                <button
                  key={collection.id}
                  className={`px-4 py-2 text-sm font-medium ${activeFilter === collection.id ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => setActiveFilter(collection.id)}
                >
                  {collection.name}
                </button>
              ))}
            </div>
          </div>
          
          {isLoading ? (
            <div className="py-12 text-center">Loading products...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">Error loading products. Please try again.</div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center">No products found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredProducts.map((product: ShopProduct, index: number) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="product-card bg-white"
                    >
                      <Link href={`/shop/product/${product.handle}`} className="block group">
                        <div className="relative overflow-hidden mb-4">
                          <img 
                            src={product.image || ''} 
                            alt={product.title} 
                            className="w-full h-80 object-cover transform transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <h3 className="text-base font-medium mb-1">{product.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{product.color}</p>
                        <p className="font-medium">{product.price}</p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </Container>
      </div>
    </>
  );
}
