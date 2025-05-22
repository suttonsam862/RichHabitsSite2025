import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Testimonial = {
  id: number;
  name: string;
  role: string;
  quote: string;
  image: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Coach Michael Stevens",
    role: "Head Wrestling Coach, Auburn University",
    quote: "The custom team gear from Rich Habits has elevated our program's image. The quality and attention to detail is unmatched in the industry.",
    image: "/attached_assets/DSC09283.JPG"
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "Athletic Director, Clay-Chalkville Middle School",
    quote: "The School Package program transformed our school's athletic identity. The ordering process was seamless and the designs exceeded our expectations.",
    image: "/attached_assets/DSC09295.JPG"
  },
  {
    id: 3,
    name: "James Rodriguez",
    role: "2023 National Champion Wrestler",
    quote: "Rich Habits apparel gives me the confidence to perform at my best. The fabrics are comfortable yet durable, perfect for both training and competition.",
    image: "/attached_assets/DSC08657.JPG"
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const prev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };
  
  const next = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  return (
    <div className="relative w-full bg-gray-50 py-24">
      {/* Subtle side accents */}
      <div className="absolute top-0 left-0 w-1 h-24 bg-sky-200 opacity-30"></div>
      <div className="absolute top-0 right-0 w-1 h-24 bg-sky-200 opacity-30"></div>
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl mb-16 text-center title-font">
            What Our Community Says
          </h2>
          
          <div className="max-w-5xl mx-auto">
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col md:flex-row items-center gap-10"
                >
                  <div className="w-full md:w-1/3 aspect-square overflow-hidden">
                    <img 
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover"
                      style={{ filter: 'grayscale(70%)' }}
                    />
                  </div>
                  
                  <div className="w-full md:w-2/3">
                    <div className="font-serif italic text-2xl mb-8 leading-relaxed subtitle-font">
                      "{testimonials[currentIndex].quote}"
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-lg title-font">
                        {testimonials[currentIndex].name}
                      </h3>
                      <p className="text-gray-600 subtitle-font">
                        {testimonials[currentIndex].role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {/* Navigation controls */}
              <div className="flex justify-center mt-10 space-x-8">
                <button
                  onClick={prev}
                  className="p-2 border border-gray-400 hover:border-gray-900 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <button
                  onClick={next}
                  className="p-2 border border-gray-400 hover:border-gray-900 transition-colors"
                  aria-label="Next testimonial"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}