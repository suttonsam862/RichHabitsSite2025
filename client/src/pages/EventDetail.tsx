import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";

// Import event data (will be fetched from API in production)
const events = [
  {
    id: 1,
    title: "Birmingham Slam Camp",
    date: "June 19-21, 2025",
    location: "Clay-Chalkville Middle School, Alabama",
    price: "$249",
    fullPrice: 249,
    singleDayPrice: 149,
    shortDescription: "A high-energy wrestling camp featuring top coaches and intensive training.",
    longDescription: "Something different is happening June 19–21. A camp where lights hit harder, technique runs deeper, and the energy feels bigger than wrestling. Not just training — it's a statement. The Birmingham Slam Camp brings together elite coaches and wrestlers for three days of intensive training, featuring a unique blend of technical instruction, live wrestling, and mental preparation exercises. Each wrestler will receive personal attention from our outstanding coaching staff with a focus on developing strong fundamentals and advanced techniques. Featuring exclusive partnership with Fruit Hunters providing premium exotic fruits for optimal athlete performance and recovery throughout the camp.",
    image: "/event1.jpg",
    additionalImages: [
      "/gallery-1-1.jpg",
      "/gallery-1-2.jpg"
    ],
    videoUrl: "/videos/camp-highlight-1.mp4",
    accent: "orange",
    schedule: [
      { day: "Day 1", time: "9:00 AM - 4:00 PM", focus: "Technique Fundamentals & Position" },
      { day: "Day 2", time: "9:00 AM - 4:00 PM", focus: "Advanced Strategy & Live Wrestling" },
      { day: "Day 3", time: "9:00 AM - 4:00 PM", focus: "Competition Preparation & Mental Toughness" }
    ],
    coaches: [
      {
        name: "Zahid Valencia",
        title: "2x NCAA Champion, 4x All-American",
        image: "/coach-1.jpg",
        bio: "Valencia brings championship-level expertise with his impressive accolades as a 2x NCAA Champion and 4x All-American. His technical precision and competitive mindset make him one of the most sought-after clinicians in wrestling today."
      },
      {
        name: "Josh Shields",
        title: "NCAA All-American, Former ASU Captain",
        image: "/coach-2.jpg",
        bio: "As an NCAA All-American and former Arizona State captain, Shields combines elite-level technique with proven leadership skills. He specializes in developing both the physical and mental aspects of competitive wrestling."
      },
      {
        name: "Brandon Courtney",
        title: "NCAA Finalist, 3x All-American",
        image: "/coach-3.jpg",
        bio: "Courtney's experience as an NCAA Finalist and 3x All-American provides invaluable insights into championship-level preparation and execution. His coaching focuses on advanced techniques and competitive strategy."
      },
      {
        name: "Michael McGee",
        title: "NCAA All-American, Pac-12 Champion",
        image: "/coach-4.jpg",
        bio: "McGee brings his championship experience as an NCAA All-American and Pac-12 Champion to develop wrestlers at all levels. His expertise in technical wrestling and training methodology helps athletes reach their full potential."
      }
    ],
    capacity: 200,
    ageGroup: "12-18 years",
    signature: "Elite NCAA Champions & All-Americans",
    benefits: [
      "Personalized instruction from NCAA Champions",
      "Video analysis of technique",
      "Daily exotic fruit nutrition provided by Fruit Hunters",
      "Camp T-shirt and merchandise package",
      "Certificate of completion"
    ]
  },
  {
    id: 2,
    title: "National Champ Camp",
    date: "June 5-7, 2025",
    location: "Las Vegas, NV (exact location TBA)",
    price: "$349",
    fullPrice: 349,
    singleDayPrice: 175,
    shortDescription: "Train with NCAA champions and Olympic athletes in this intensive camp.",
    longDescription: "The most elite wrestling camp in the country, bringing together NCAA champions and Olympic athletes to provide world-class instruction. The National Champ Camp is designed for serious wrestlers looking to compete at the highest levels, with focused training on advanced techniques, strategic development, and championship mindset training. Each day features intensive training sessions led by accomplished champions who share the techniques and strategies that took them to the highest levels of the sport. Participants receive personalized feedback, video analysis of their technique, and a customized improvement plan to implement after camp.",
    image: "/event2.jpg",
    additionalImages: [
      "/gallery-2-1.jpg",
      "/gallery-2-2.jpg"
    ],
    videoUrl: "/videos/camp-highlight-2.mp4",
    accent: "blue",
    schedule: [
      { day: "Day 1", time: "9:00 AM - 4:30 PM", focus: "Advanced Techniques & Position Control" },
      { day: "Day 2", time: "9:00 AM - 4:30 PM", focus: "Strategic Development & Competition Simulation" },
      { day: "Day 3", time: "9:00 AM - 4:30 PM", focus: "Championship Mindset & Elite Performance" }
    ],
    coaches: [
      {
        name: "Jason Nolf",
        title: "3x NCAA Champion, World Team Member",
        image: "/coach-4.jpg",
        bio: "Nolf's dominance as a 3x NCAA Champion and World Team Member makes him one of the most accomplished clinicians in wrestling. His technical expertise and competitive experience provide invaluable insights for elite-level development."
      },
      {
        name: "Mark Hall",
        title: "NCAA Champion, Junior World Champion",
        image: "/coach-5.jpg",
        bio: "Hall brings championship experience at both collegiate and international levels as an NCAA Champion and Junior World Champion. His coaching focuses on developing the technical precision and mental toughness needed for elite competition."
      },
      {
        name: "Vincenzo Joseph",
        title: "2x NCAA Champion",
        image: "/coach-6.jpg",
        bio: "Joseph's success as a 2x NCAA Champion demonstrates his mastery of high-level wrestling techniques and competition strategy. He specializes in developing wrestlers for championship-level performance and mental preparation."
      }
    ],
    capacity: 200,
    ageGroup: "14-22 years",
    signature: "Elite NCAA Champions & World Team Members",
    benefits: [
      "Train directly with NCAA Champions and World Team members",
      "Advanced video analysis system",
      "Professional nutrition plan and guidance",
      "Premium camp gear package",
      "Scholarship opportunity evaluation"
    ]
  },
  {
    id: 3,
    title: "Texas Recruiting Clinic",
    date: "June 12, 2025",
    location: "Arlington Martin High School, Texas",
    price: "$249",
    fullPrice: 249,
    singleDayPrice: null,
    shortDescription: "Designed specifically for high school wrestlers seeking collegiate opportunities.",
    longDescription: "A unique clinic designed specifically for high school wrestlers seeking collegiate opportunities. The Texas Recruiting Clinic brings together multiple NCAA stars for spotlight matches and breakout training groups, providing comprehensive guidance on the recruiting process. Participants will receive detailed evaluations from active college coaches, participate in skill development sessions, and learn about NCAA eligibility requirements. The focus is on recruiting exposure and high-level matches that showcase athlete abilities in a competitive environment. Each wrestler leaves with enhanced visibility and a personalized recruiting plan.",
    image: "/event3.jpg",
    additionalImages: [
      "/gallery-3-1.jpg",
      "/gallery-3-2.jpg"
    ],
    videoUrl: "/videos/recruiting-clinic.mp4",
    accent: "red",
    schedule: [
      { day: "Day 1", time: "9:00 AM - 4:00 PM", focus: "NCAA Star Spotlight Matches & Breakout Training Groups" }
    ],
    coaches: [
      {
        name: "Multiple NCAA Stars",
        title: "Elite College Athletes",
        image: "/coach-7.jpg",
        bio: "A rotating roster of current and former NCAA champions and All-Americans who will lead spotlight matches and provide technical instruction. Names to be announced closer to the event date."
      },
      {
        name: "College Recruiting Panel",
        title: "D1 & D2 Coaches",
        image: "/coach-8.jpg",
        bio: "Active college coaches from Division I and Division II programs who understand the recruiting process and what it takes to compete at the collegiate level. They provide evaluations and recruiting guidance."
      },
      {
        name: "Recruiting Specialists",
        title: "NCAA Compliance Experts",
        image: "/coach-9.jpg",
        bio: "Specialists who help athletes navigate the complex NCAA recruiting process, including eligibility requirements, scholarship opportunities, and communication strategies with college coaches."
      }
    ],
    capacity: 150,
    ageGroup: "15-18 years",
    signature: "Recruiting exposure with NCAA stars",
    benefits: [
      "Spotlight matches with NCAA stars",
      "Direct evaluation from college coaches",
      "Enhanced recruiting visibility and exposure",
      "Workshop on NCAA eligibility requirements",
      "One-on-one recruiting consultation"
    ]
  },
  {
    id: 4,
    title: "Panther Train Tour Camp",
    date: "July (TBA), 2025",
    location: "Chicago, IL (exact location TBA)",
    price: "$99 per day",
    fullPrice: 200,
    singleDayPrice: 99,
    shortDescription: "D1 technique and mindset training with Northwestern wrestlers and coaches.",
    longDescription: "Experience elite-level training with Northwestern University wrestlers and coaches in this unique camp focused on D1 technique and championship mindset development. The Panther Train Tour Camp brings together the proven training methodologies of a top Division I program with the expertise of RTC (Regional Training Center) and Panther Train staff. Participants will learn the systematic approaches and mental preparation strategies that have made Northwestern a consistent force in collegiate wrestling. This intensive training experience emphasizes both technical excellence and the competitive mindset required for success at the highest levels.",
    image: "/event4.jpg",
    additionalImages: [
      "/gallery-4-1.jpg",
      "/gallery-4-2.jpg"
    ],
    videoUrl: "/videos/tour-highlights.mp4",
    accent: "black",
    schedule: [
      { day: "Day 1", time: "TBA", focus: "D1 Technical Training & Position Work" },
      { day: "Day 2", time: "TBA", focus: "Championship Mindset & Competition Preparation" },
      { day: "Day 3", time: "TBA", focus: "Elite Performance Systems & Mental Toughness" }
    ],
    coaches: [
      {
        name: "Northwestern Wrestlers",
        title: "D1 Collegiate Athletes",
        image: "/coach-10.jpg",
        bio: "Current Northwestern University wrestlers who bring active D1 competition experience and cutting-edge technique to their instruction. They provide insights into the daily training and competitive mindset of elite collegiate wrestling."
      },
      {
        name: "Northwestern Coaches",
        title: "D1 Coaching Staff",
        image: "/coach-11.jpg",
        bio: "Members of the Northwestern University coaching staff who have developed successful systems for training championship-level wrestlers. Their expertise in technique and program development provides invaluable guidance for serious competitors."
      },
      {
        name: "RTC/Panther Train Staff",
        title: "Elite Training Specialists",
        image: "/coach-12.jpg",
        bio: "Experienced coaches from the Regional Training Center and Panther Train organization who specialize in developing elite-level wrestling skills and competitive mindset. They bring proven methodologies for athletic development."
      }
    ],
    capacity: 120,
    ageGroup: "13-20 years",
    signature: "D1 Northwestern training experience",
    benefits: [
      "Train with active D1 wrestlers and coaches",
      "Learn Northwestern's proven training systems",
      "Develop championship-level mindset",
      "Experience elite collegiate training environment",
      "Panther Train Tour exclusive gear"
    ]
  }
];

// Simplified animation variants for better performance
const fadeIn = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id ? parseInt(params.id, 10) : 0;
  
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  
  useEffect(() => {
    // Simulate API call to get event details
    const fetchEvent = () => {
      setIsLoading(true);
      
      // Find event by ID
      const foundEvent = events.find(e => e.id === eventId);
      
      setTimeout(() => {
        if (foundEvent) {
          setEvent(foundEvent);
          setSelectedImage(foundEvent.image);
        }
        setIsLoading(false);
      }, 300);
    };
    
    fetchEvent();
  }, [eventId]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-16">
        <h1 
          className="text-3xl mb-4"
          style={{ fontFamily: "'Bodoni FLF', serif" }}
        >
          Event Not Found
        </h1>
        <p 
          className="text-gray-600 mb-8"
          style={{ fontFamily: "'Didact Gothic', sans-serif" }}
        >
          The event you are looking for does not exist.
        </p>
        <Link href="/events">
          <motion.span
            className="inline-block border border-gray-900 px-6 py-3 text-gray-900 cursor-pointer"
            whileHover={{ 
              backgroundColor: '#1f2937', 
              color: '#ffffff'
            }}
            transition={{ duration: 0.2 }}
            style={{ fontFamily: "'Sanchez', serif" }}
          >
            Back to Events
          </motion.span>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      {/* Hero Section */}
      <div 
        className="relative h-[60vh] mb-16 overflow-hidden"
      >
        <div className="absolute inset-0 bg-black">
          <div 
            className="absolute inset-0 opacity-60 bg-red-600"
          ></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
        
        <div className="container mx-auto px-6 h-full flex items-center relative z-10">
          <div className="max-w-4xl">
            <h1 
              className="text-4xl md:text-6xl text-white mb-6 title-font"
            >
              {event.title}
            </h1>
            
            <p 
              className="italic text-lg text-gray-200 mb-8 subtitle-font"
            >
              {event.signature}
            </p>
            
            <div
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href={`/register/${event.id}`}>
                <span
                  className="inline-block bg-gray-50 px-6 py-3 text-gray-900 cursor-pointer subtitle-font hover:bg-gray-100"
                >
                  Register Now
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Subtle sky accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-200 opacity-30"></div>
      </div>
      
      {/* Event Details */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content - 2/3 width */}
          <motion.div 
            className="lg:col-span-2"
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <div className="mb-12">
              <h2 
                className="text-3xl mb-6 title-font"
              >
                About This Event
              </h2>
              <p 
                className="text-gray-700 leading-relaxed mb-8 subtitle-font"
              >
                {event.longDescription}
              </p>
              
              {/* Image Gallery */}
              <div className="mt-12 mb-16">
                <div className="aspect-video w-full overflow-hidden mb-4">
                  <div
                    className="w-full h-full bg-red-600"
                    aria-label={event.title}
                  ></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className="aspect-[4/3] overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(event.image)}
                  >
                    <div
                      className="w-full h-full bg-red-600 hover:scale-105 transition-transform duration-500"
                      aria-label={event.title}
                    ></div>
                  </div>
                  
                  {event.additionalImages.map((img: string, index: number) => (
                    <div 
                      key={index}
                      className="aspect-[4/3] overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                    >
                      <div
                        className="w-full h-full bg-red-600 hover:scale-105 transition-transform duration-500"
                        aria-label={`${event.title} ${index + 2}`}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Event Video */}
              {event.videoUrl && (
                <div className="mb-16">
                  <h3 className="text-2xl mb-6 title-font">Event Highlights</h3>
                  <div className="aspect-video w-full overflow-hidden">
                    <video 
                      controls
                      className="w-full h-full object-cover"
                      poster={event.image}
                    >
                      <source src={event.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}
              
              {/* Schedule */}
              <h2 
                className="text-3xl mb-6 title-font"
              >
                Schedule
              </h2>
              <div className="mb-12 grid grid-cols-1 gap-6">
                {event.schedule.map((item: any, index: number) => (
                  <motion.div 
                    key={index}
                    className="border border-gray-200 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <h3 
                      className="text-xl mb-2 title-font"
                    >
                      {item.day}
                    </h3>
                    <p 
                      className="text-gray-500 mb-2 subtitle-font"
                    >
                      {item.time}
                    </p>
                    <p 
                      className="text-gray-700 subtitle-font"
                    >
                      <span className="font-medium">Focus:</span> {item.focus}
                    </p>
                  </motion.div>
                ))}
              </div>
              
              {/* Coaches */}
              <h2 
                className="text-3xl mb-6 title-font"
              >
                Coaches
              </h2>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {event.coaches.map((coach: any, index: number) => (
                  <motion.div 
                    key={index}
                    className="p-6 border border-gray-200 text-center"
                    variants={fadeIn}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                      <div
                        className="w-full h-full bg-red-600 hover:opacity-80 transition-all duration-300"
                        aria-label={coach.name}
                      ></div>
                    </div>
                    <h3 
                      className="text-xl mb-1 title-font"
                    >
                      {coach.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 subtitle-font">{coach.title}</p>
                    <p className="text-gray-700 text-sm text-center subtitle-font">{coach.bio}</p>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Benefits */}
              <h2 
                className="text-3xl mb-6"
                style={{ fontFamily: "'Bodoni FLF', serif" }}
              >
                What's Included
              </h2>
              <ul className="list-none mb-12">
                {event.benefits.map((benefit: string, index: number) => (
                  <motion.li 
                    key={index}
                    className="mb-4 pl-6 relative"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                  >
                    <span className="absolute left-0 top-2 w-2 h-2 bg-sky-200"></span>
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
          
          {/* Sidebar - 1/3 width */}
          <motion.div 
            className="lg:col-span-1"
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <div className="sticky top-28">
              <div className="border border-gray-200 p-8 mb-8">
                <h3 
                  className="text-2xl mb-6"
                  style={{ fontFamily: "'Bodoni FLF', serif" }}
                >
                  Event Details
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <p 
                      className="font-medium mb-1"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Date
                    </p>
                    <p 
                      className="text-gray-700"
                      style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                    >
                      {event.date}
                    </p>
                  </div>
                  
                  <div>
                    <p 
                      className="font-medium mb-1"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Location
                    </p>
                    <p 
                      className="text-gray-700"
                      style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                    >
                      {event.location}
                    </p>
                  </div>
                  
                  <div>
                    <p 
                      className="font-medium mb-1"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Price
                    </p>
                    <p 
                      className="text-gray-700"
                      style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                    >
                      {event.price}
                      {event.singleDayPrice && (
                        <span className="block text-sm text-gray-500 mt-1">
                          Single day: ${event.singleDayPrice}
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p 
                      className="font-medium mb-1"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Capacity
                    </p>
                    <p 
                      className="text-gray-700"
                      style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                    >
                      Limited to {event.capacity} wrestlers
                    </p>
                  </div>
                  
                  <div>
                    <p 
                      className="font-medium mb-1"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Age Group
                    </p>
                    <p 
                      className="text-gray-700"
                      style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                    >
                      {event.ageGroup}
                    </p>
                  </div>
                </div>
                
                <Link href={`/register/${event.id}`}>
                  <motion.span
                    className="w-full block text-center bg-gray-900 px-6 py-4 text-white cursor-pointer"
                    whileHover={{ 
                      backgroundColor: '#111827',
                      y: -2
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ fontFamily: "'Sanchez', serif" }}
                  >
                    Register Now
                  </motion.span>
                </Link>
              </div>
              
              <div className="border border-gray-200 p-8">
                <h3 
                  className="text-xl mb-6"
                  style={{ fontFamily: "'Bodoni FLF', serif" }}
                >
                  Questions?
                </h3>
                <p 
                  className="text-gray-700 mb-6"
                  style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                >
                  Contact us for more information about this event.
                </p>
                <Link href="/contact">
                  <motion.span
                    className="inline-block border border-gray-900 px-6 py-3 text-gray-900 cursor-pointer"
                    whileHover={{ 
                      backgroundColor: '#f3f4f6'
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ fontFamily: "'Sanchez', serif" }}
                  >
                    Contact Us
                  </motion.span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}