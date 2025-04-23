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
    <section className="w-full h-screen bg-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        {/* Video background placeholder - you'll need to add the video file */}
        <video
          ref={videoRef}
          className="object-cover w-full h-full opacity-30"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1556906781-9a412961c28c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
        >
          {/* The video source will be added when the user uploads the wrestling highlights video */}
          <source src="/path-to-your-video.mp4" type="video/mp4" />
          {/* Fallback image in case video doesn't load */}
          <img 
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80" 
            alt="Athlete in minimal setting" 
            className="object-cover w-full h-full"
          />
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
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
