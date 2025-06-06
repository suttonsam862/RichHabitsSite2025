import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import EventFilters from "@/components/events/EventFilters";

// Event data - using working images and proper error handling
const events = [
  {
    id: 1,
    title: "Birmingham Slam Camp",
    date: "June 19-21, 2025",
    location: "Clay-Chalkville Middle School, Birmingham, AL",
    price: "$249",
    shortDescription: "A high-energy wrestling camp featuring top coaches and intensive training.",
    image: null, // Will use gradient background instead
    accent: "orange",
    signature: "Exclusive partnership with Fruit Hunters",
    gradientFrom: "from-red-600",
    gradientTo: "to-orange-500"
  },
  {
    id: 2,
    title: "National Champ Camp",
    date: "June 5-7, 2025",
    location: "Roy Martin Middle School, Las Vegas, NV",
    price: "$349",
    shortDescription: "Train with NCAA champions and Olympic athletes in this intensive camp.",
    image: "/national-champ-hero.png", // Using the working image we already have
    accent: "blue",
    signature: "Focus on championship-level techniques",
    gradientFrom: "from-blue-900",
    gradientTo: "to-blue-700"
  },
  {
    id: 3,
    title: "Texas Recruiting Clinic",
    date: "June 12-13, 2025",
    location: "Arlington Martin High School, Arlington, TX",
    price: "$249",
    shortDescription: "Designed specifically for high school wrestlers seeking collegiate opportunities.",
    image: null, // Will use gradient background instead
    accent: "red",
    signature: "College coach evaluations included",
    gradientFrom: "from-red-700",
    gradientTo: "to-red-500"
  },
  {
    id: 4,
    title: "Panther Train Tour",
    date: "June 15-17, 2025",
    location: "Multiple Locations, Alabama",
    price: "$99 per day",
    shortDescription: "A multi-location training tour with elite coaches.",
    image: null, // Will use gradient background instead
    accent: "black",
    signature: "Travel across multiple training facilities",
    gradientFrom: "from-gray-900",
    gradientTo: "to-gray-700"
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
  // Simplified state to improve performance
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  
  // Optimized filter handler
  const handleFilterChange = (filters: any) => {
    console.log("Filtering events with:", filters);
    // Simple filtering to reduce computational load
    const filtered = events.filter(event => {
      // Basic location filter
      if (filters.location !== "All Locations" && !event.location.includes(filters.location)) {
        return false;
      }
      
      // Simplified month filter
      if (filters.month !== "All Months" && !event.date.includes(filters.month.substring(0, 3))) {
        return false;
      }
      
      return true;
    });
    
    setFilteredEvents(filtered);
  };
  
  return (
    <Layout>
      <div className="min-h-screen bg-white pb-20">
      {/* Hero Section - Mobile Optimized */}
      <motion.div 
        className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] mb-12 sm:mb-20 overflow-hidden"
        variants={fadeIn}
        initial="initial"
        animate="animate"
      >
        <div className="absolute inset-0 bg-gray-900">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, ease: "easeInOut" }}
            className="absolute inset-0 opacity-50 bg-red-600"
          ></motion.div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40"></div>
        
        <div className="container mx-auto px-4 sm:px-6 h-full flex items-center relative z-10">
          <div className="max-w-3xl">
            <h1 
              className="text-4xl sm:text-5xl lg:text-7xl text-white mb-6 sm:mb-8 title-font"
            >
              Events
            </h1>
            <p 
              className="text-lg sm:text-xl text-gray-200 mb-8 sm:mb-10 subtitle-font"
            >
              Premium wrestling camps and clinics designed to elevate your skills, technique, and competitive edge.
            </p>
          </div>
        </div>
        
        {/* Subtle sky accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-200 opacity-30"></div>
      </motion.div>
      
      {/* Event Filters */}
      <div className="container mx-auto px-4 sm:px-6">
        <EventFilters 
          onFilterChange={handleFilterChange}
          totalEvents={events.length}
          filteredEvents={filteredEvents.length}
        />
      </div>
      
      {/* Events Grid - Mobile Optimized */}
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
        >
          {filteredEvents.map((event) => (
            <motion.div 
              key={event.id}
              variants={fadeIn}
              className="group bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              <Link href={`/events/${event.id}`}>
                {/* Image Section with Crash-Proof Error Handling - Mobile Optimized */}
                <div className="relative overflow-hidden h-48 sm:h-56 lg:h-60">
                  <motion.div
                    variants={imageReveal}
                    className="w-full h-full"
                  >
                    {event.image ? (
                      <div className="w-full h-full relative">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            // Prevent infinite reloading loops and browser crashes
                            const target = e.currentTarget;
                            if (!target.dataset.errorHandled) {
                              target.dataset.errorHandled = "true";
                              target.style.display = "none";
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) {
                                fallback.style.display = "flex";
                              }
                              // Track failed images to prevent retry attempts
                              setImageErrors(prev => new Set(prev).add(event.id));
                            }
                          }}
                          onLoad={(e) => {
                            // Ensure fallback is hidden when image loads successfully
                            const target = e.currentTarget;
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.style.display = "none";
                            }
                          }}
                        />
                        {/* Gradient Fallback */}
                        <div 
                          className={`w-full h-full bg-gradient-to-br ${event.gradientFrom} ${event.gradientTo} transform transition-transform duration-700 group-hover:scale-105 flex items-center justify-center absolute inset-0`}
                          style={{ display: "none" }}
                        >
                          <h3 className="text-xl font-medium text-white text-center px-4">{event.title}</h3>
                        </div>
                      </div>
                    ) : (
                      /* Pure Gradient Background for Events Without Images */
                      <div 
                        className={`w-full h-full bg-gradient-to-br ${event.gradientFrom} ${event.gradientTo} transform transition-transform duration-700 group-hover:scale-105 flex items-center justify-center`}
                      >
                        <h3 className="text-xl font-medium text-white text-center px-4">{event.title}</h3>
                      </div>
                    )}
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
                
                {/* Content Section - Only Title, Date, Location */}
                <div className="p-6">
                  <h2 className="text-2xl mb-3 title-font">{event.title}</h2>
                  <div className="mb-1">
                    <span className="text-sm text-gray-500 subtitle-font">{event.date}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 subtitle-font">{event.location}</span>
                  </div>
                  <div className="mt-5">
                    <span className="text-sm font-medium text-gray-900 border-b border-gray-900 pb-1 hover:text-sky-800 hover:border-sky-800 transition-colors inline-block subtitle-font">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Layout>
  );
}