import { Link } from "wouter";
import { AnimatedUnderline } from "@/components/ui/animated-underline";
import { Container } from "@/components/ui/container";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Product } from "@/types/shopify";
import { apiRequest } from "@/lib/queryClient";

// Handle for the Retail Collection in your Shopify store
const RETAIL_COLLECTION_HANDLE = "retail-collection";

// Sample retail products for when API fails
const retailProducts: Product[] = [
  {
    id: "1",
    title: "Performance Track Jacket",
    handle: "performance-track-jacket",
    description: "Lightweight and breathable",
    image: "/images/wrestlers/DSC09491.JPG",
    price: "$65.00",
    availableForSale: true,
    variants: []
  },
  {
    id: "2",
    title: "Competition Singlet",
    handle: "competition-singlet",
    description: "Professional grade wrestling gear",
    image: "/images/wrestlers/DSC09374--.JPG",
    price: "$85.00",
    availableForSale: true,
    variants: []
  },
  {
    id: "3",
    title: "Training Shorts",
    handle: "training-shorts",
    description: "Durable and comfortable",
    image: "/images/wrestlers/DSC07386.JPG",
    price: "$45.00",
    availableForSale: true,
    variants: []
  },
  {
    id: "4",
    title: "Team Warmup Pullover",
    handle: "team-warmup-pullover",
    description: "Stay warm before competition",
    image: "/images/wrestlers/DSC00423.JPG",
    price: "$75.00",
    availableForSale: true,
    variants: []
  }
];

export function FeaturedCollections() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch products for retail collection
  useEffect(() => {
    async function loadRetailProducts() {
      try {
        setIsLoading(true);
        
        // Use our new endpoint to fetch products from the Retail Collection
        const response = await fetch(`/api/collections/${RETAIL_COLLECTION_HANDLE}/products`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        
        const fetchedProducts = await response.json();
        
        if (fetchedProducts && fetchedProducts.length > 0) {
          console.log(`Found ${fetchedProducts.length} products in Retail Collection`);
          setProducts(fetchedProducts);
        } else {
          // For development, use dummy data
          console.warn("No products found in the Retail Collection");
          setError("No products found in the Retail Collection");
          // Set retail products for development/demo purposes
          setProducts(retailProducts);
        }
      } catch (err) {
        console.error("Failed to fetch retail products:", err);
        setError("Failed to load products");
        
        // Set retail products for development/demo purposes
        setProducts(retailProducts);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadRetailProducts();
  }, []);
  
  // Set up carousel animation
  useEffect(() => {
    if (products.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 4000); // Change product every 4 seconds
    
    return () => clearInterval(interval);
  }, [products.length]);
  
  // Function to get visible products (current and next)
  const getVisibleProducts = () => {
    if (products.length === 0) return [];
    
    // Show 3 products at a time, starting from currentIndex
    const visibleProducts = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % products.length;
      visibleProducts.push(products[index]);
    }
    
    return visibleProducts;
  };
  
  return (
    <section className="py-20 bg-white">
      <Container>
        <h2 className="text-3xl font-serif font-semibold mb-12 group">
          <AnimatedUnderline>
            Featured Collection
          </AnimatedUnderline>
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-pulse h-96 w-full max-w-4xl bg-gray-200 rounded"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentIndex}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                {getVisibleProducts().map((product, index) => (
                  <motion.div
                    key={`${product.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="product-card bg-white relative group"
                  >
                    <Link href={`/shop/product/${product.handle}`} className="block">
                      <div className="relative overflow-hidden mb-4">
                        <img 
                          src={product.image || "https://via.placeholder.com/500x700"} 
                          alt={product.title} 
                          className="w-full h-96 object-cover transform transition-transform duration-500 group-hover:scale-105"
                        />
                        <motion.div 
                          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={false}
                          whileHover={{ opacity: 1 }}
                        >
                          <span className="text-white font-medium py-2 px-4 border-2 border-white rounded-sm">
                            View Details
                          </span>
                        </motion.div>
                      </div>
                      <h3 className="text-lg font-medium mb-1">{product.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.price}</p>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            
            {/* Carousel indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? "w-8 bg-primary" : "w-2 bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link href={`/shop?collection=${RETAIL_COLLECTION_HANDLE}`} className="inline-block border border-primary py-3 px-8 font-medium tracking-wide hover:bg-primary hover:text-white transition-colors">
            View Retail Collection
          </Link>
        </div>
      </Container>
    </section>
  );
}
