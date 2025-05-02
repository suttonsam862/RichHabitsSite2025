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

export function FeaturedEvents() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load retail products (now using static products while shop is under construction)
  useEffect(() => {
    // Load sample retail products for demonstration purposes
    setProducts(retailProducts);
    setIsLoading(false);
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
            Upcoming Events
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
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                {/* Texas Recruiting Clinic */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative overflow-hidden bg-white shadow-lg rounded-sm p-6 h-[500px] flex flex-col"
                  style={{ 
                    border: '2px solid',
                    borderImageSlice: 1,
                    borderImageSource: 'linear-gradient(to right, #bf0a30, #ffffff, #002868)'
                  }}
                >
                  {/* Animated Edge Top Left - Red */}
                  <motion.div 
                    className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ borderColor: '#bf0a30' }}
                  />
                  
                  {/* Animated Edge Bottom Right - Blue */}
                  <motion.div 
                    className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    style={{ borderColor: '#002868' }}
                  />
                  
                  <div className="mb-4">
                    <span className="inline-block text-xs font-medium px-3 py-1 rounded-sm" 
                      style={{
                        background: 'linear-gradient(90deg, #bf0a30, #002868)',
                        color: 'white'
                      }}
                    >
                      Wrestling
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">
                    <span style={{ 
                      color: '#002868',
                      textShadow: '1px 1px 0 #bf0a30'
                    }}>
                      TEXAS RECRUITING CLINIC
                    </span>
                  </h3>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-600"><strong>Date:</strong> June 12-13, 2025</p>
                    <p className="text-sm text-gray-600"><strong>Location:</strong> Arlington Martin High School</p>
                    <p className="text-sm text-gray-600"><strong>Price:</strong> $249</p>
                  </div>
                  
                  <div className="relative mb-4 w-full h-20 overflow-hidden rounded-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10 opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent z-10 opacity-30"></div>
                    <img 
                      src="/assets/banners/texas-banner.png" 
                      alt="Texas Recruiting Clinic Banner" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-gray-700 mb-4 text-sm flex-grow">
                    A unique clinic designed specifically for high school wrestlers seeking collegiate opportunities. 
                    Features skill development with college coaches and recruiting workshops.
                  </p>
                  
                  <div className="mt-auto">
                    <Link href="/events/3" className="usa-gradient-btn inline-block py-2 px-6 text-white rounded-md font-medium transition-transform hover:scale-105">
                      Learn More
                    </Link>
                  </div>
                </motion.div>
                
                {/* Birmingham Slam Camp */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative overflow-hidden bg-white shadow-lg rounded-sm p-6 h-[500px] flex flex-col"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(255,125,0,0.05) 0%, rgba(255,77,0,0.1) 100%)',
                    border: '2px solid',
                    borderImageSlice: 1,
                    borderImageSource: 'linear-gradient(to right, #ff7d00, #ff4d00)'
                  }}
                >
                  {/* Animated Edge Top Left */}
                  <motion.div 
                    className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ borderColor: '#ff7d00' }}
                  />
                  
                  {/* Animated Edge Bottom Right */}
                  <motion.div 
                    className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    style={{ borderColor: '#ff4d00' }}
                  />
                  
                  <div className="mb-4">
                    <span className="inline-block text-xs font-medium px-3 py-1 rounded-sm bg-orange-600 text-white">
                      Wrestling
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 text-orange-600">
                    BIRMINGHAM SLAM CAMP
                  </h3>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-600"><strong>Date:</strong> June 19-21, 2025</p>
                    <p className="text-sm text-gray-600"><strong>Location:</strong> Clay Chalkville Middle School</p>
                    <p className="text-sm text-gray-600"><strong>Price:</strong> $249</p>
                  </div>
                  
                  <div className="relative mb-4 w-full h-20 overflow-hidden rounded-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10 opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent z-10 opacity-30"></div>
                    <img 
                      src="/assets/banners/birmingham-banner.png" 
                      alt="Birmingham Slam Camp Banner" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-gray-700 mb-4 text-sm flex-grow">
                    Something different is happening June 19–21. A camp where lights hit harder, technique runs deeper, 
                    and the energy feels bigger than wrestling. Not just training — it's a statement.
                  </p>
                  
                  <div className="mt-auto">
                    <Link href="/events/1" className="bg-gradient-to-r from-orange-600 to-red-600 inline-block py-2 px-6 text-white rounded-md font-medium transition-transform hover:scale-105">
                      Learn More
                    </Link>
                  </div>
                </motion.div>
                
                {/* National Champ Camp */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative overflow-hidden bg-white shadow-lg rounded-sm p-6 h-[500px] flex flex-col"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(0,30,66,0.05) 0%, rgba(30,136,229,0.1) 100%)',
                    border: '2px solid',
                    borderImageSlice: 1,
                    borderImageSource: 'linear-gradient(to right, #041e42, #1e88e5)'
                  }}
                >
                  {/* Animated Edge Top Left */}
                  <motion.div 
                    className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ borderColor: '#041e42' }}
                  />
                  
                  {/* Animated Edge Bottom Right */}
                  <motion.div 
                    className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    style={{ borderColor: '#1e88e5' }}
                  />
                  
                  <div className="mb-4">
                    <span className="inline-block text-xs font-medium px-3 py-1 rounded-sm bg-blue-800 text-white">
                      Wrestling
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 text-blue-800">
                    NATIONAL CHAMP CAMP
                  </h3>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-600"><strong>Date:</strong> June 4-7, 2025</p>
                    <p className="text-sm text-gray-600"><strong>Location:</strong> Rancho High School, Las Vegas</p>
                    <p className="text-sm text-gray-600"><strong>Price:</strong> $349</p>
                  </div>
                  
                  <div className="relative mb-4 w-full h-20 overflow-hidden rounded-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10 opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent z-10 opacity-30"></div>
                    <img 
                      src="/assets/banners/vegas-banner.png" 
                      alt="National Champ Camp Banner" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-gray-700 mb-4 text-sm flex-grow">
                    Train with NCAA champions and Olympic athletes in this intensive four-day camp.
                    Designed for competitive wrestlers looking to elevate their skills to championship level.
                  </p>
                  
                  <div className="mt-auto">
                    <Link href="/events/2" className="bg-gradient-to-r from-blue-800 to-blue-500 inline-block py-2 px-6 text-white rounded-md font-medium transition-transform hover:scale-105">
                      Learn More
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link href="/events" className="inline-block border border-primary py-3 px-8 font-medium tracking-wide hover:bg-primary hover:text-white transition-colors">
            View All Events
          </Link>
        </div>
      </Container>
    </section>
  );
}
