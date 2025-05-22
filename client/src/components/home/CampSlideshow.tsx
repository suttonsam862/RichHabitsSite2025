import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

// Camp data
const camps = [
  {
    id: 1,
    name: 'Birmingham Slam Camp',
    date: 'June 19-21, 2025',
    location: 'Clay-Chalkville Middle School',
    description: 'Join us for 3 days of intensive training with top wrestling coaches.',
    video: '/videos/slamcamp.mov',
    link: '/events/1',
    color: 'from-orange-600 to-red-600'
  },
  {
    id: 2,
    name: 'National Champ Camp',
    date: 'June 4-7, 2025',
    location: 'Rancho High School, Las Vegas',
    description: 'Train with national champions in the heart of Las Vegas.',
    image: '/images/events/national-champ-camp.jpg',
    link: '/events/2',
    color: 'from-blue-800 to-blue-500'
  },
  {
    id: 3,
    name: 'Texas Recruiting Clinic',
    date: 'June 12-13, 2025',
    location: 'Arlington Martin High School',
    description: 'Get noticed by college coaches at this premier recruiting event.',
    image: '/images/events/texas-recruiting-clinic.jpg',
    link: '/events/3',
    color: 'from-red-600 via-white to-blue-600'
  }
];

export function CampSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto-advance the slideshow every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % camps.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Go to previous slide
  const prevSlide = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? camps.length - 1 : prevIndex - 1
    );
  };
  
  // Go to next slide
  const nextSlide = () => {
    setCurrentIndex(prevIndex => 
      (prevIndex + 1) % camps.length
    );
  };
  
  const currentCamp = camps[currentIndex];
  
  return (
    <section className="relative overflow-hidden py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-semibold mb-8 text-center">
          Upcoming Wrestling Camps
        </h2>
        
        <div className="relative h-[500px] rounded-xl overflow-hidden shadow-2xl">
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentCamp.color} opacity-80 z-10`}></div>
          
          {/* Camp slideshow */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {/* Background: either video or image */}
              {currentCamp.video ? (
                <div className="absolute inset-0">
                  <iframe 
                    src="https://www.youtube.com/embed/sBmEPQ5CQs4?autoplay=1&mute=1&loop=1&playlist=sBmEPQ5CQs4&controls=0&showinfo=0" 
                    className="object-cover w-full h-full"
                    title={currentCamp.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    style={{ filter: 'brightness(0.7)' }}
                  ></iframe>
                </div>
              ) : (
                <div className="absolute inset-0 bg-cover bg-center">
                  <img 
                    src={currentCamp.image} 
                    alt={currentCamp.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    style={{ filter: 'brightness(0.7)' }}
                  />
                </div>
              )}
              
              {/* Content */}
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
          
          {/* Navigation arrows */}
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
          
          {/* Indicators */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 z-30">
            {camps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"
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