import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Using direct asset references to avoid Vite parsing issues with jpg files
  const wrestlerImages = [
    '/assets/DSC09491.JPG',
    '/assets/DSC07386.JPG',
    '/assets/DSC00423.JPG',
    '/assets/DSC09374--.JPG'
  ];
  
  // Rotate through images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === wrestlerImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-gray-900 to-black">
        {/* Background image slideshow */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full"
            style={{ 
              backgroundImage: `url(${wrestlerImages[currentImageIndex]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></motion.div>
        </AnimatePresence>
        
        {/* Overlay to ensure text is readable */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 z-10 text-white"
      >
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight font-serif">Performance Elevated</h1>
          <p className="text-xl md:text-2xl mb-8 font-light">Minimal design. Maximum impact. For athletes who demand more.</p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/shop" className="bg-white text-primary py-3 px-8 font-medium tracking-wide hover:bg-opacity-90 transition-colors inline-block">
              Shop Collection
            </Link>
            <Link href="/custom-apparel" className="border border-white text-white py-3 px-8 font-medium tracking-wide hover:bg-white hover:bg-opacity-10 transition-colors inline-block">
              Custom Team Gear
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
