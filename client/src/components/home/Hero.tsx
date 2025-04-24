import { Link } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // When the component mounts, play the video
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay failed:", error);
      });
    }
  }, []);

  return (
    <section className="w-full h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-gray-900 to-black">
        {/* Since your video file is not available, we'll use a dynamic background effect */}
        <div className="absolute inset-0 w-full h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')]"></div>
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
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
      
      {/* Prominent Custom Orders Button */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: 0.8, 
          duration: 0.7,
          type: "spring",
          stiffness: 100
        }}
        className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-70 animate-pulse"></div>
          
          <Link href="/custom-apparel">
            <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 text-white py-5 px-12 rounded-xl shadow-xl font-bold text-2xl tracking-wide hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center space-x-3 border border-amber-400/30">
              <span>CREATE CUSTOM APPAREL</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        </div>
        
        {/* Subtle hint text */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="text-center text-white/60 text-sm mt-4 font-light"
        >
          Design your team's custom athletic gear
        </motion.p>
      </motion.div>
    </section>
  );
}
