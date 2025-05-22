import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Using direct public paths for images
const sliderImage1 = "/image1.jpg";
const sliderImage2 = "/image2.jpg";
const sliderImage3 = "/image3.jpg";
const sliderImage4 = "/image4.jpg";

const sliderImages = [
  sliderImage1,
  sliderImage2,
  sliderImage3,
  sliderImage4
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="absolute inset-0 w-full h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div 
            className="w-full h-full bg-red-600"
            aria-label={`Rich Habits Hero ${current + 1}`}
          ></div>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40"></div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation Dots */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full ${
              current === index ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}