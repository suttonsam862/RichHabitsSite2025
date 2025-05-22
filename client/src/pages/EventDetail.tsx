import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";

// Import event data (will be fetched from API in production)
const events = [
  {
    id: 1,
    title: "Birmingham Slam Camp",
    date: "June 19-21, 2025",
    location: "Clay-Chalkville Middle School, Birmingham, AL",
    price: "$249",
    fullPrice: 249,
    singleDayPrice: 149,
    shortDescription: "A high-energy wrestling camp featuring top coaches and intensive training.",
    longDescription: "Something different is happening June 19–21. A camp where lights hit harder, technique runs deeper, and the energy feels bigger than wrestling. Not just training — it's a statement. The Birmingham Slam Camp brings together elite coaches and wrestlers for three days of intensive training, featuring a unique blend of technical instruction, live wrestling, and mental preparation exercises. Each wrestler will receive personal attention from our outstanding coaching staff with a focus on developing strong fundamentals and advanced techniques. Featuring exclusive partnership with Fruit Hunters providing premium exotic fruits for optimal athlete performance and recovery throughout the camp.",
    image: "/images/DSC09354.JPG",
    additionalImages: [
      "/images/DSC09491.JPG",
      "/images/DSC09353.JPG"
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
        name: "Michael Johnson",
        title: "3x State Champion Coach",
        image: "/images/DSC09273.JPG",
        bio: "Coach Johnson has led teams to three state championships and developed over 25 individual state champions throughout his coaching career. His innovative training methods have helped wrestlers at all levels reach their full potential."
      },
      {
        name: "David Williams",
        title: "NCAA All-American",
        image: "/images/DSC09355.JPG",
        bio: "As an NCAA All-American and international competitor, Coach Williams brings elite-level insights to his coaching. He specializes in neutral position techniques and competitive strategy development."
      },
      {
        name: "Robert Smith",
        title: "Mental Performance Specialist",
        image: "/images/DSC00521--.JPG",
        bio: "With a background in sports psychology and competitive wrestling, Coach Smith focuses on the mental aspects of wrestling. His approach helps athletes develop the mindset needed for championship performance."
      }
    ],
    capacity: 200,
    ageGroup: "12-18 years",
    signature: "Exclusive partnership with Fruit Hunters",
    benefits: [
      "Personalized instruction from elite coaches",
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
    location: "Roy Martin Middle School, Las Vegas, NV",
    price: "$349",
    fullPrice: 349,
    singleDayPrice: 175,
    shortDescription: "Train with NCAA champions and Olympic athletes in this intensive camp.",
    longDescription: "The most elite wrestling camp in the country, bringing together NCAA champions and Olympic athletes to provide world-class instruction. The National Champ Camp is designed for serious wrestlers looking to compete at the highest levels, with focused training on advanced techniques, strategic development, and championship mindset training. Each day features intensive training sessions led by accomplished champions who share the techniques and strategies that took them to the highest levels of the sport. Participants receive personalized feedback, video analysis of their technique, and a customized improvement plan to implement after camp.",
    image: "/images/DSC09353.JPG",
    additionalImages: [
      "/images/DSC08631.JPG",
      "/images/DSC07386.JPG"
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
        name: "James Thompson",
        title: "Olympic Gold Medalist",
        image: "/images/DSC09488.JPG",
        bio: "Thompson's gold medal performance established him as one of the most technically precise wrestlers in the world. He specializes in teaching advanced techniques that give wrestlers a competitive edge at the highest levels."
      },
      {
        name: "Marcus Allen",
        title: "3x NCAA Champion",
        image: "/images/DSC02187--.jpg",
        bio: "With three NCAA titles to his name, Allen brings championship-level insights to his coaching. His specialty is developing strategic approaches to match preparation and execution."
      },
      {
        name: "Thomas Wilson",
        title: "World Team Coach",
        image: "/images/DSC08657--.JPG",
        bio: "Having coached multiple World and Olympic teams, Wilson has developed training systems that have produced champions at every level. His holistic approach addresses all aspects of elite wrestling development."
      }
    ],
    capacity: 200,
    ageGroup: "14-22 years",
    signature: "Focus on championship-level techniques",
    benefits: [
      "Train directly with Olympic and NCAA champion wrestlers",
      "Advanced video analysis system",
      "Professional nutrition plan and guidance",
      "Premium camp gear package",
      "Scholarship opportunity evaluation"
    ]
  },
  {
    id: 3,
    title: "Texas Recruiting Clinic",
    date: "June 12-13, 2025",
    location: "Arlington Martin High School, Arlington, TX",
    price: "$249",
    fullPrice: 249,
    singleDayPrice: null,
    shortDescription: "Designed specifically for high school wrestlers seeking collegiate opportunities.",
    longDescription: "A unique clinic designed specifically for high school wrestlers seeking collegiate opportunities. The Texas Recruiting Clinic brings together college coaches and recruiting specialists to provide comprehensive guidance on the recruiting process. Participants will receive detailed evaluations from active college coaches, participate in skill development sessions, and learn about NCAA eligibility requirements. Day one focuses on technical skill assessment while day two centers on the business of college recruiting including highlight videos, contacting coaches, and scholarship opportunities. Each wrestler leaves with a personalized recruiting plan and video highlights.",
    image: "/images/DSC08612.JPG",
    additionalImages: [
      "/images/DSC00423.JPG",
      "/images/DSC02190--.jpg"
    ],
    videoUrl: "/videos/recruiting-clinic.mp4",
    accent: "red",
    schedule: [
      { day: "Day 1", time: "9:00 AM - 4:00 PM", focus: "Skill Assessment & Development with College Coaches" },
      { day: "Day 2", time: "9:00 AM - 4:00 PM", focus: "Recruiting Process Workshop & Individual Evaluations" }
    ],
    coaches: [
      {
        name: "Brian Davis",
        title: "D1 College Coach",
        image: "/images/DSC09299.JPG",
        bio: "Coach Davis has developed multiple All-Americans and NCAA qualifiers during his tenure as a Division I coach. He has an exceptional eye for talent and understands what it takes to compete at the collegiate level."
      },
      {
        name: "Mark Wilson",
        title: "D2 College Coach",
        image: "/images/DSC07386.JPG",
        bio: "With over 15 years of coaching experience at the Division II level, Coach Wilson has guided numerous wrestlers to conference titles and national recognition. He specializes in helping wrestlers find the right collegiate fit."
      },
      {
        name: "Sarah Johnson",
        title: "Recruiting Specialist",
        image: "/images/VALENCIA_Zahid-headshot.jpg",
        bio: "Johnson has helped hundreds of athletes navigate the recruiting process and secure athletic scholarships. Her knowledge of NCAA regulations and requirements is unmatched in the wrestling community."
      }
    ],
    capacity: 150,
    ageGroup: "15-18 years",
    signature: "College coach evaluations included",
    benefits: [
      "Direct evaluation from college coaches",
      "Creation of recruiting profile and highlight video",
      "Workshop on NCAA eligibility requirements",
      "Guidance on contacting college coaches",
      "One-on-one recruiting consultation"
    ]
  },
  {
    id: 4,
    title: "Panther Train Tour",
    date: "July 23-25, 2025",
    location: "Various locations",
    price: "$99 per day",
    fullPrice: 200,
    singleDayPrice: 99,
    shortDescription: "A multi-location training tour with elite coaches.",
    longDescription: "Experience training in multiple elite facilities over three days with the innovative Panther Train Tour. This unique wrestling camp moves to a different training location each day, providing athletes with diverse environments and coaching perspectives. Specialized coaches focus on specific wrestling positions each day - neutral on day one, bottom on day two, and top position on day three. The program is designed to simulate tournament conditions and develop adaptability. Transportation between facilities is provided, and each participant receives exclusive Panther Train Tour gear. Limited to 120 wrestlers to ensure quality instruction.",
    image: "/images/DSC08615.JPG",
    additionalImages: [
      "/images/DSC09295--.JPG",
      "/images/DSC09273.JPG"
    ],
    videoUrl: "/videos/tour-highlights.mp4",
    accent: "black",
    schedule: [
      { day: "Day 1", time: "10:00 AM - 3:00 PM", focus: "Neutral Position & Takedowns - North Training Center" },
      { day: "Day 2", time: "10:00 AM - 3:00 PM", focus: "Bottom Position & Escapes - East Wrestling Academy" },
      { day: "Day 3", time: "10:00 AM - 3:00 PM", focus: "Top Position & Control - Central Athletic Complex" }
    ],
    coaches: [
      {
        name: "Cory Land",
        title: "5x National Champion",
        image: "/images/DSC09374--.JPG",
        bio: "Cory Land is a decorated wrestler with multiple national titles and international medals. His dynamic wrestling style and innovative techniques have made him a sought-after clinician across the country."
      },
      {
        name: "Garrett Funk",
        title: "NCAA Division I All-American",
        image: "/images/DSC09283--.JPG",
        bio: "Funk brings high-level collegiate experience to his coaching. His specialization in bottom position work has helped countless wrestlers improve their escapes and reversals."
      },
      {
        name: "Trever Anderson",
        title: "Elite Development Coach",
        image: "/images/DSC07337--.jpg",
        bio: "Anderson has developed a systematic approach to top position control that has been adopted by numerous successful programs. His teaching methods make complex techniques accessible to wrestlers of all levels."
      }
    ],
    capacity: 120,
    ageGroup: "13-20 years",
    signature: "Travel across multiple training facilities",
    benefits: [
      "Experience diverse training environments",
      "Learn from multiple coaching philosophies",
      "Network with wrestlers from different regions",
      "Daily transportation between locations",
      "Panther Train Tour exclusive gear"
    ]
  }
];

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
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
      <motion.div 
        className="relative h-[60vh] mb-16 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="absolute inset-0 bg-black">
          <motion.div 
            initial={{ scale: 1.1, filter: 'grayscale(100%)' }}
            animate={{ scale: 1, filter: 'grayscale(80%)' }}
            transition={{ duration: 20, ease: "easeInOut" }}
            className="absolute inset-0 opacity-60"
            style={{ 
              backgroundImage: `url(${event.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></motion.div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
        
        <div className="container mx-auto px-6 h-full flex items-center relative z-10">
          <div className="max-w-4xl">
            <motion.h1 
              className="text-4xl md:text-6xl text-white mb-6 title-font"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {event.title}
            </motion.h1>
            
            <motion.p 
              className="italic text-lg text-gray-200 mb-8 subtitle-font"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {event.signature}
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href={`/register/${event.id}`}>
                <motion.span
                  className="inline-block bg-gray-50 px-6 py-3 text-gray-900 cursor-pointer subtitle-font"
                  whileHover={{ 
                    backgroundColor: '#f9fafb',
                    x: 2
                  }}
                  transition={{ duration: 0.2 }}
                >
                  Register Now
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Subtle sky accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-200 opacity-30"></div>
      </motion.div>
      
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
                  <img
                    src={selectedImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    style={{ filter: 'grayscale(70%)' }}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className="aspect-[4/3] overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(event.image)}
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      style={{ filter: 'grayscale(70%)' }}
                    />
                  </div>
                  
                  {event.additionalImages.map((img: string, index: number) => (
                    <div 
                      key={index}
                      className="aspect-[4/3] overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img}
                        alt={`${event.title} ${index + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        style={{ filter: 'grayscale(70%)' }}
                      />
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
                      <img 
                        src={coach.image} 
                        alt={coach.name}
                        className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
                      />
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