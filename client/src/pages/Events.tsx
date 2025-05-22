import React, { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

// Event data
const events = [
  {
    id: 1,
    title: "Birmingham Slam Camp",
    date: "June 19-21, 2025",
    location: "Clay-Chalkville Middle School, Birmingham, AL",
    price: "$249",
    shortDescription: "A high-energy wrestling camp featuring top coaches and intensive training.",
    image: "/images/wrestlers/DSC09491.JPG",
    accent: "orange",
    signature: "Exclusive partnership with Fruit Hunters"
  },
  {
    id: 2,
    title: "National Champ Camp",
    date: "June 5-7, 2025",
    location: "Roy Martin Middle School, Las Vegas, NV",
    price: "$349",
    shortDescription: "Train with NCAA champions and Olympic athletes in this intensive camp.",
    image: "/images/wrestlers/DSC09374--.JPG",
    accent: "blue",
    signature: "Focus on championship-level techniques"
  },
  {
    id: 3,
    title: "Texas Recruiting Clinic",
    date: "June 12-13, 2025",
    location: "Arlington Martin High School, Arlington, TX",
    price: "$249",
    shortDescription: "Designed specifically for high school wrestlers seeking collegiate opportunities.",
    image: "/images/wrestlers/DSC00423.JPG",
    accent: "red",
    signature: "College coach evaluations included"
  },
  {
    id: 4,
    title: "Panther Train Tour",
    date: "July 23-25, 2025",
    location: "Various locations",
    price: "$99 per day",
    shortDescription: "A multi-location training tour with elite coaches.",
    image: "/images/wrestlers/DSC08615.JPG",
    accent: "black",
    signature: "Travel across multiple training facilities"
  }
];

// Animation variants
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.8 } }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const imageReveal = {
  initial: { scale: 1.2, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      duration: 1.2,
      ease: [0.25, 1, 0.5, 1]
    } 
  }
};

export default function Events() {
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      {/* Hero Section */}
      <motion.div 
        className="relative h-[70vh] mb-20 overflow-hidden"
        variants={fadeIn}
        initial="initial"
        animate="animate"
      >
        <div className="absolute inset-0 bg-black">
          <div 
            className="absolute inset-0 opacity-50"
            style={{ 
              backgroundImage: `url(${events[0].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'grayscale(80%)'
            }}
          ></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-6 h-full flex items-center relative z-10">
          <div className="max-w-3xl">
            <h1 
              className="text-5xl md:text-7xl text-white mb-8"
              style={{ fontFamily: "'Playfair Display FC', serif" }}
            >
              Events
            </h1>
            <p 
              className="text-xl text-gray-200 mb-10"
              style={{ fontFamily: "'Didact Gothic', sans-serif" }}
            >
              Premium wrestling camps and clinics designed to elevate your skills, technique, and competitive edge.
            </p>
          </div>
        </div>
        
        {/* Subtle sky accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-200 opacity-30"></div>
      </motion.div>
      
      {/* Events Grid */}
      <div className="container mx-auto px-6">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-20"
        >
          {events.map((event, index) => (
            <motion.div 
              key={event.id}
              variants={fadeIn}
              className="group"
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              <div 
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Image Section */}
                <div className="relative overflow-hidden">
                  <motion.div
                    variants={imageReveal}
                    className="aspect-[4/3] w-full h-full"
                  >
                    <div 
                      className="w-full h-full bg-cover bg-center transform transition-transform duration-700 group-hover:scale-105"
                      style={{ 
                        backgroundImage: `url(${event.image})`,
                        filter: 'grayscale(90%)'
                      }}
                    ></div>
                  </motion.div>
                  
                  {/* Hover effect */}
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full h-1 bg-sky-200 opacity-0 group-hover:opacity-70 transition-opacity duration-500"
                    animate={{ 
                      width: hoveredEvent === event.id ? '100%' : '0%',
                      opacity: hoveredEvent === event.id ? 0.7 : 0
                    }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
                
                {/* Content Section */}
                <div className="flex flex-col justify-center">
                  <div className="mb-2">
                    <span 
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "'Arial', sans-serif" }}
                    >
                      {event.date}
                    </span>
                  </div>
                  
                  <h2 
                    className="text-3xl md:text-4xl mb-4"
                    style={{ fontFamily: "'Bodoni FLF', serif" }}
                  >
                    {event.title}
                  </h2>
                  
                  <p
                    className="italic mb-6 text-gray-600"
                    style={{ fontFamily: "'Symphony', cursive" }}
                  >
                    {event.signature}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <p 
                      className="text-gray-600"
                      style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                    >
                      <span className="font-medium">Location:</span> {event.location}
                    </p>
                    <p 
                      className="text-gray-600"
                      style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                    >
                      <span className="font-medium">Price:</span> {event.price}
                    </p>
                  </div>
                  
                  <p 
                    className="text-gray-700 mb-8"
                    style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                  >
                    {event.shortDescription}
                  </p>
                  
                  <div className="flex space-x-4">
                    <Link href={`/events/${event.id}`}>
                      <motion.span
                        className="inline-block border border-gray-900 px-6 py-3 text-gray-900 cursor-pointer"
                        whileHover={{ 
                          backgroundColor: '#1f2937', 
                          color: '#ffffff',
                          x: 2
                        }}
                        transition={{ duration: 0.2 }}
                        style={{ fontFamily: "'Sanchez', serif" }}
                      >
                        View Details
                      </motion.span>
                    </Link>
                    
                    <Link href={`/register/${event.id}`}>
                      <motion.span
                        className="inline-block bg-gray-900 border border-gray-900 px-6 py-3 text-white cursor-pointer"
                        whileHover={{ 
                          backgroundColor: '#111827',
                          x: 2
                        }}
                        transition={{ duration: 0.2 }}
                        style={{ fontFamily: "'Sanchez', serif" }}
                      >
                        Register Now
                      </motion.span>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Divider except for the last item */}
              {index < events.length - 1 && (
                <div className="w-full h-px bg-gray-200 my-20"></div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}