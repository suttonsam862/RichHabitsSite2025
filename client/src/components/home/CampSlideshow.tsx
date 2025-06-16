import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

interface Camp {
  name: string;
  date: string;
  location: string;
  description: string;
  image: string;
  color: string;
  link: string;
}

const camps: Camp[] = [
  {
    name: "Birmingham Slam Camp",
    date: "June 19-21, 2025",
    location: "Birmingham, AL",
    description: "Elite wrestling techniques and training with top-tier coaches.",
    image: "/assets/events/birmingham-camp.jpg",
    color: "from-red-600 to-orange-600",
    link: "/events/1"
  },
  {
    name: "Panther Train Tour",
    date: "July 23-25, 2025", 
    location: "Multiple Locations",
    description: "Intensive training tour focusing on championship-level techniques.",
    image: "/assets/events/panther-train.jpg",
    color: "from-blue-600 to-purple-600",
    link: "/events/4"
  }
];

export default function CampSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % camps.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % camps.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + camps.length) % camps.length);
  };

  const currentCamp = camps[currentIndex];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-semibold mb-8 text-center text-white">
          Upcoming Wrestling Camps
        </h2>
        
        <div className="relative h-[500px] rounded-xl overflow-hidden shadow-2xl">
          <div className={`absolute inset-0 bg-gradient-to-r ${currentCamp.color} opacity-80 z-10`} />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-cover bg-center">
                <img 
                  src={currentCamp.image} 
                  alt={currentCamp.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  style={{ filter: 'brightness(0.7)' }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (img.dataset.fallbackAttempted !== 'true') {
                      img.dataset.fallbackAttempted = 'true';
                      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    }
                  }}
                />
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center text-white max-w-3xl px-6">
                  <motion.h3 
                    className="text-4xl md:text-5xl font-bold mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentCamp.name}
                  </motion.h3>
                  
                  <motion.div 
                    className="text-xl md:text-2xl mb-6 font-semibold"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="mr-4">{currentCamp.date}</span>
                    <span>{currentCamp.location}</span>
                  </motion.div>
                  
                  <motion.p 
                    className="text-lg mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {currentCamp.description}
                  </motion.p>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link href={currentCamp.link} className="inline-block bg-white text-gray-900 font-medium py-3 px-8 rounded-md hover:bg-gray-100 transition-colors">
                      Learn More
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
            {camps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}