import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import EventFilters from "@/components/events/EventFilters";
// Using a simpler approach for now to ensure functionality

// Event data
const events = [
  {
    id: 1,
    title: "Birmingham Slam Camp",
    date: "June 19-21, 2025",
    location: "Clay-Chalkville Middle School, Birmingham, AL",
    price: "$249",
    shortDescription: "A high-energy wrestling camp featuring top coaches and intensive training.",
    image: "/events/event1.jpg",
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
    image: "/events/event2.jpg",
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
    image: "/events/event3.jpg",
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
    image: "/events/event4.jpg",
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
  const [filteredEvents, setFilteredEvents] = useState(events);
  
  const handleFilterChange = (filters: any) => {
    const filtered = events.filter(event => {
      // Filter by location
      if (filters.location !== "All Locations" && !event.location.includes(filters.location)) {
        return false;
      }
      
      // Filter by month (simple check if month name appears in date string)
      if (filters.month !== "All Months" && !event.date.includes(filters.month.substring(0, 3))) {
        return false;
      }
      
      // Filter by price range
      const eventPrice = parseInt(event.price.replace(/[^0-9]/g, ''));
      if (eventPrice < filters.priceRange[0] || eventPrice > filters.priceRange[1]) {
        return false;
      }
      
      return true;
    });
    
    setFilteredEvents(filtered);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      {/* Hero Section */}
      <motion.div 
        className="relative h-[70vh] mb-20 overflow-hidden"
        variants={fadeIn}
        initial="initial"
        animate="animate"
      >
        <div className="absolute inset-0 bg-gray-900">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, ease: "easeInOut" }}
            className="absolute inset-0 opacity-50"
          ></motion.div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40"></div>
        
        <div className="container mx-auto px-6 h-full flex items-center relative z-10">
          <div className="max-w-3xl">
            <h1 
              className="text-5xl md:text-7xl text-white mb-8 title-font"
            >
              Events
            </h1>
            <p 
              className="text-xl text-gray-200 mb-10 subtitle-font"
            >
              Premium wrestling camps and clinics designed to elevate your skills, technique, and competitive edge.
            </p>
          </div>
        </div>
        
        {/* Subtle sky accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-200 opacity-30"></div>
      </motion.div>
      
      {/* Event Filters */}
      <div className="container mx-auto px-6">
        <EventFilters 
          onFilterChange={handleFilterChange}
          totalEvents={events.length}
          filteredEvents={filteredEvents.length}
        />
      </div>
      
      {/* Events Grid */}
      <div className="container mx-auto px-6">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
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
                {/* Image Section */}
                <div className="relative overflow-hidden h-60">
                  <motion.div
                    variants={imageReveal}
                    className="w-full h-full"
                  >
                    <div 
                      className="w-full h-full bg-gray-100 transform transition-transform duration-700 group-hover:scale-105 flex items-center justify-center"
                    >
                      <h3 className="text-xl font-medium">{event.title}</h3>
                    </div>
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
    </div>
  );
}