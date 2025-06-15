import React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "../layout/Container";
interface Event {
  id: string;
  title: string;
  shortDescription: string;
  location: string;
  date: string;
  primaryColor: string;
  secondaryColor: string;
  longDescription: string;
  image: string;
  details: string[];
}

export function EventDetails() {
  const [selectedEvent, setSelectedEvent] = useState(0);
  
  const events: Event[] = [
    {
      id: "birmingham-slam",
      title: "Birmingham Slam Camp",
      shortDescription: "Southern grit meets elite technique",
      location: "Clay-Chalkville Middle School",
      date: "June 19-21, 2025",
      primaryColor: "#FF6B00", // Fiery orange
      secondaryColor: "#FFA500", // Gold
      longDescription: 
        "The Birmingham Slam Camp is where Southern grit meets elite technique. Hosted at Clay-Chalkville Middle School, this multi-day clinic features NCAA stars, high-intensity sessions, and real talks on leadership and toughness. Athletes train in a professional environment with custom gear, branded check-in, and family-friendly access. The camp combines technical training with mental preparation, creating a comprehensive development experience for wrestlers serious about advancing their skills.",
      image: "/images/events/birmingham-slam.jpg",
      details: [
        "NCAA champion instructors and elite coaches",
        "Specialized technique sessions for all skill levels",
        "Leadership and mental toughness workshops",
        "Custom Rich Habits camp gear included",
        "Professional training environment",
        "Limited to 200 participants to ensure quality instruction"
      ]
    },
    {
      id: "texas-recruiting",
      title: "Texas Recruiting Clinic",
      shortDescription: "Showcase your talent in front of cameras and coaches",
      location: "Arlington Martin High School",
      date: "June 12-13, 2025",
      primaryColor: "#B22234", // Red
      secondaryColor: "#3C3B6E", // Navy blue
      longDescription: 
        "The Texas Recruiting Clinic at Arlington Martin High School is a spotlight event where wrestlers showcase their talent in front of cameras and college coaches. This one-day intensive combines skill development with visibility opportunities that can change an athlete's trajectory. Participants receive professional feedback, get filmed during live sessions, and learn directly from college coaches about what they're looking for in recruits. The clinic creates a unique bridge between high school wrestling and collegiate opportunities.",
      image: "/images/events/texas-recruiting.jpg",
      details: [
        "College coaches in attendance for direct scouting",
        "Professional video recording of matches and drills",
        "Personalized feedback from NCAA athletes",
        "Recruiting workshop with tips for college applications",
        "Networking opportunities with coaches and scouts",
        "Limited to 150 participants for maximum exposure"
      ]
    },
    {
      id: "national-champ",
      title: "National Champ Camp",
      shortDescription: "Three days of elite instruction from NCAA champions",
      location: "Roy Martin Middle School",
      date: "June 5-7, 2025",
      primaryColor: "#041e42", // Penn State navy
      secondaryColor: "#1e88e5", // Ice blue
      longDescription: 
        "The National Champ Camp at Roy Martin Middle School delivers three days of instruction from NCAA champions in a high-level environment with media coverage, mental coaching, and signature Rich Habits style. This premier event brings together the nation's top wrestlers and coaches for an immersive experience that goes beyond technique. Participants train in state-of-the-art facilities, receive personalized coaching, and build connections that last long after the camp ends. The camp's championship mindset philosophy helps athletes break through mental barriers and reach new levels.",
      image: "/images/events/national-champ.jpg",
      details: [
        "Training sessions led by NCAA champions",
        "Advanced technique development for competitive edge",
        "Mental performance coaching from sports psychologists",
        "Film review and strategy sessions",
        "Nutrition and recovery workshops",
        "Limited to 200 participants with selective application process"
      ]
    },
    {
      id: "panther-train",
      title: "Panther Train Tour",
      shortDescription: "Elite training brought directly to regions across the country",
      location: "Multiple locations nationwide",
      date: "June 15-17, 2025",
      primaryColor: "#6a0dad", // Deep purple
      secondaryColor: "#ffd700", // Gold
      longDescription: 
        "The nationwide Panther Train Tour (formerly the Cory Land Tour) brings elite training directly to regions across the country, mimicking mini camps with live sessions, merchandise drops, and stories from athletes who've made it. This innovative approach makes high-level instruction accessible to wrestlers in diverse communities. Each stop features intensive training, motivation from successful athletes, and the signature Rich Habits approach to development. The tour creates a nationwide community of wrestlers connected through shared experiences and training philosophy.",
      image: "/images/events/panther-train.jpg",
      details: [
        "Regional stops throughout the country",
        "Training with collegiate and Olympic athletes",
        "Technique sessions tailored to regional wrestling styles",
        "Success stories and Q&A with accomplished wrestlers",
        "Exclusive Rich Habits merchandise available at each stop",
        "Affordable single-day registration options"
      ]
    }
  ];
  
  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Rich Habits Wrestling Events</h2>
            <p className="text-lg max-w-3xl mx-auto">
              Our events offer a national experience built for serious athletes ready to train, grow, and stand out.
              More than training—they're transformation.
            </p>
          </div>
          
          {/* Event tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {events.map((event, index) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(index)}
                className={`px-5 py-3 rounded-lg transition-all font-medium ${index === selectedEvent 
                  ? `text-white`
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                style={index === selectedEvent ? {backgroundColor: event.primaryColor} : {}}
              >
                {event.title}
              </button>
            ))}
          </div>
          
          {/* Selected event details */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedEvent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
            >
              {/* Left side - Details */}
              <div>
                <h3 
                  className="text-3xl font-bold mb-2"
                  style={{color: events[selectedEvent].primaryColor}}
                >
                  {events[selectedEvent].title}
                </h3>
                <p className="text-xl mb-4 font-medium">{events[selectedEvent].shortDescription}</p>
                
                <div className="flex items-center mb-6 text-gray-700">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{events[selectedEvent].location}</span>
                  
                  <svg className="h-5 w-5 ml-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{events[selectedEvent].date}</span>
                </div>
                
                <div 
                  className="p-6 rounded-lg mb-8 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${events[selectedEvent].primaryColor}, ${events[selectedEvent].secondaryColor})`
                  }}
                >
                  <p className="leading-relaxed">
                    {events[selectedEvent].longDescription}
                  </p>
                </div>
                
                <h4 className="text-xl font-semibold mb-4">Event Highlights:</h4>
                <ul className="space-y-3 mb-8">
                  {events[selectedEvent].details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-primary mt-1 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                
                <a 
                  href="/events" 
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded hover:bg-opacity-90 transition-colors font-medium"
                >
                  Register for This Event
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
              
              {/* Right side - Image */}
              <div 
                className="rounded-lg overflow-hidden shadow-lg bg-gray-100 aspect-[4/3] flex items-center justify-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url(${events[selectedEvent].image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '500px'
                }}
              >
                <div className="text-center p-8 bg-black bg-opacity-50 rounded-lg">
                  <h3 className="text-white text-3xl font-bold mb-3">
                    {events[selectedEvent].title}
                  </h3>
                  <p className="text-white text-lg">
                    {events[selectedEvent].date}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}