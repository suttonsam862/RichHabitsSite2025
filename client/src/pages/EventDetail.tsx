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
    longDescription: "The Birmingham Slam Wrestling Camp represents the pinnacle of wrestling instruction in Alabama and the Southeast region. Located at Clay-Chalkville Middle School in Birmingham, this three-day intensive wrestling camp brings together some of the most accomplished wrestlers in NCAA history. Our camp attracts wrestlers from across Alabama, Tennessee, Georgia, Mississippi, and Florida seeking elite-level training from proven champions. Zahid Valencia, a two-time NCAA Champion and four-time All-American, leads our world-class instruction team alongside NCAA All-American Josh Shields, NCAA Finalist Brandon Courtney, and Pac-12 Champion Michael McGee. This Birmingham wrestling camp focuses on technical excellence, competition strategy, and mental preparation using proven methodologies from championship programs. Athletes receive individualized attention in small group settings, video analysis of their technique, and comprehensive training in all aspects of competitive wrestling. The camp serves wrestlers of all skill levels, from youth competitors to high school athletes preparing for collegiate wrestling. Birmingham's central location makes this the premier wrestling camp destination for Southeast wrestlers seeking championship-level instruction.",
    image: "/event1.jpg",
    additionalImages: [
      "/gallery-1-1.jpg",
      "/gallery-1-2.jpg"
    ],
    videoUrl: "/videos/camp-highlight-1.mp4",
    accent: "orange",
    coaches: [
      {
        name: "Zahid Valencia",
        title: "2x NCAA Champion, 4x All-American",
        image: "/coach-1.jpg",
        bio: "Zahid Valencia stands as one of the most accomplished wrestlers in Arizona State University history and contemporary American wrestling. As a two-time NCAA Champion at 174 pounds (2017, 2019) and four-time All-American, Valencia dominated the collegiate wrestling scene with his exceptional technique and competitive drive. His wrestling career includes multiple Pac-12 Conference titles and a reputation for technical mastery that extends beyond college wrestling into international competition. Valencia's coaching methodology focuses on positional wrestling, scrambling techniques, and the mental preparation required for championship performance. His experience competing at the highest levels of wrestling, combined with his natural teaching ability, makes him an invaluable resource for wrestlers seeking to elevate their technical skills and competitive mindset. Valencia specializes in teaching advanced takedown sequences, defensive positioning, and the strategic thinking necessary for success in high-stakes competition."
      },
      {
        name: "Josh Shields",
        title: "NCAA All-American, Former ASU Captain",
        image: "/coach-2.jpg",
        bio: "Josh Shields exemplifies the combination of athletic excellence and leadership that defines elite collegiate wrestling. As an NCAA All-American and former captain of the Arizona State University wrestling team, Shields brings both technical expertise and proven leadership experience to his coaching. His collegiate career was marked by consistent high-level performance and the respect of teammates and coaches alike. Shields' coaching approach emphasizes the development of complete wrestlers who excel in all phases of the sport - technique, conditioning, and mental preparation. His experience as a team captain provides unique insights into the leadership qualities and team dynamics essential for success in wrestling programs. Shields specializes in teaching fundamental techniques with precision, helping wrestlers build a solid foundation that supports advanced skill development. His instruction covers neutral position control, effective shot setups, and the defensive awareness necessary for competing against elite-level opponents."
      },
      {
        name: "Brandon Courtney",
        title: "NCAA Finalist, 3x All-American",
        image: "/coach-3.jpg",
        bio: "Brandon Courtney's wrestling credentials speak to a career defined by excellence and consistency at the highest levels of collegiate competition. As an NCAA Finalist and three-time All-American, Courtney demonstrated the technical skill, mental toughness, and competitive consistency that characterize championship-level wrestlers. His path to the NCAA finals showcases the systematic approach to training and competition that he now shares with developing wrestlers. Courtney's coaching focuses on the strategic elements of wrestling that separate good wrestlers from great ones - timing, positioning, and the ability to execute techniques under pressure. His experience competing in high-stakes matches provides invaluable insights into preparation, match strategy, and the mental approach required for success in tournament wrestling. Courtney specializes in teaching advanced positioning concepts, scrambling techniques, and the tactical decision-making that enables wrestlers to perform at their best when it matters most."
      },
      {
        name: "Michael McGee",
        title: "NCAA All-American, Pac-12 Champion",
        image: "/coach-4.jpg",
        bio: "Michael McGee brings a wealth of championship experience and technical knowledge to his role as a wrestling instructor. As an NCAA All-American and Pac-12 Conference Champion, McGee competed successfully at the highest levels of collegiate wrestling, demonstrating the technical precision and competitive mindset that define elite athletes. His championship experience in the highly competitive Pac-12 Conference showcases his ability to perform against top-tier competition throughout his collegiate career. McGee's coaching methodology emphasizes the systematic development of wrestling skills, from fundamental techniques to advanced competition strategies. His approach to instruction focuses on helping wrestlers understand not just how to execute techniques, but when and why to use them in competitive situations. McGee specializes in teaching position-specific techniques, transition wrestling, and the tactical awareness necessary for success in modern wrestling. His experience as both competitor and coach provides a comprehensive understanding of what it takes to develop wrestlers who can compete successfully at any level."
      }
    ],
    capacity: 200,
    ageGroup: "8-18 years",
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
    longDescription: "The National Champ Wrestling Camp in Las Vegas represents the ultimate destination for serious wrestlers seeking championship-level instruction from proven NCAA champions and World Team members. This elite Las Vegas wrestling camp attracts competitors from across Nevada, California, Arizona, Utah, and Colorado who are committed to reaching the highest levels of the sport. Located in Las Vegas with the exact venue to be announced, this intensive three-day camp provides unparalleled access to some of the most accomplished wrestlers in American history. Jason Nolf, a three-time NCAA Champion and World Team member, leads our exceptional instruction team alongside NCAA Champion Mark Hall and two-time NCAA Champion Vincenzo Joseph. This Las Vegas wrestling camp focuses on advanced technical development, competition strategy, and the mental preparation necessary for elite-level success. The camp curriculum emphasizes systematic skill development, tactical awareness, and the competitive mindset that separates championship wrestlers from the field. Participants receive individualized instruction, comprehensive video analysis, and detailed feedback from wrestlers who have competed successfully at the highest levels of international competition. The National Champ Camp serves dedicated wrestlers aged 8-18 who are serious about pursuing excellence in wrestling, whether at the youth, high school, or preparing for collegiate levels.",
    image: "/event2.jpg",
    additionalImages: [
      "/gallery-2-1.jpg",
      "/gallery-2-2.jpg"
    ],
    videoUrl: "/videos/camp-highlight-2.mp4",
    accent: "blue",
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
    ageGroup: "8-18 years",
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
    longDescription: "The Texas Recruiting Clinic at Arlington Martin High School represents the premier recruiting opportunity for high school wrestlers in Texas and surrounding states. This specialized Arlington wrestling clinic attracts serious competitors from across Texas, Oklahoma, Louisiana, Arkansas, and New Mexico who are committed to pursuing collegiate wrestling opportunities. The clinic brings together multiple NCAA stars for spotlight matches and breakout training groups, providing unparalleled recruiting exposure and comprehensive guidance on the college wrestling recruitment process. High school wrestlers receive detailed evaluations from active Division I and Division II college coaches, participate in skill development sessions led by current NCAA athletes, and learn essential information about NCAA eligibility requirements and the college recruiting timeline. The Texas Recruiting Clinic focuses specifically on creating recruiting exposure through high-level competitive matches that showcase athlete abilities in front of college coaches and recruiters. Each participant leaves with enhanced visibility in the college wrestling community, direct feedback from college coaches, and a personalized recruiting plan tailored to their abilities and collegiate wrestling goals. This Arlington wrestling recruiting clinic serves as a crucial stepping stone for high school wrestlers serious about competing at the collegiate level.",
    image: "/event3.jpg",
    additionalImages: [
      "/gallery-3-1.jpg",
      "/gallery-3-2.jpg"
    ],
    videoUrl: "/videos/recruiting-clinic.mp4",
    accent: "red",
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
    longDescription: "The Panther Train Tour wrestling camp in Chicago provides an exclusive opportunity for serious wrestlers to experience authentic Division I training methodologies with Northwestern University wrestlers and coaches. This elite Chicago wrestling camp attracts dedicated competitors from throughout Illinois, Wisconsin, Indiana, Michigan, and Iowa who are committed to training at the highest collegiate level. The Panther Train Tour combines the proven training systems of Northwestern University's wrestling program with the expertise of accomplished Regional Training Center (RTC) coaches and Panther Train staff. Participants gain invaluable insight into the systematic approaches, technical precision, and mental preparation strategies that have established Northwestern as a consistent force in Big Ten Conference wrestling competition. This intensive Chicago wrestling experience emphasizes both advanced technical development and the championship mindset required for success at elite levels of competition. Wrestlers receive instruction in position-specific techniques, advanced conditioning protocols, and the tactical decision-making that separates good wrestlers from championship-level competitors. The camp provides authentic access to Division I training culture, allowing participants to understand the daily commitment, technical standards, and competitive intensity that define successful collegiate wrestling programs.",
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-[60vh] mb-16 overflow-hidden"
      >
        {/* Video Background for Panther Train Tour */}
        {event.id === 4 && (
          <>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/panther-train-tour.webm" type="video/webm" />
            </video>
            
            {/* Video overlay with border effect */}
            <div className="absolute inset-0">
              {/* Top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
              {/* Bottom border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
              {/* Left border */}
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-transparent via-white to-transparent opacity-30"></div>
              {/* Right border */}
              <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-transparent via-white to-transparent opacity-30"></div>
            </div>
          </>
        )}
        
        {/* Fallback background for other events */}
        {event.id !== 4 && (
          <div className="absolute inset-0 bg-black">
            <div 
              className="absolute inset-0 opacity-60 bg-red-600"
            ></div>
          </div>
        )}
        
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
              {/* Event Overview Section */}
              <div className="mb-12">
                <h2 className="text-3xl mb-6 title-font">About This Event</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl mb-3 title-font text-red-600">Event Highlights</h3>
                    <p className="text-gray-700 leading-relaxed subtitle-font mb-4">
                      Join elite wrestlers and coaches for an intensive training experience designed to elevate your skills to championship level.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl mb-3 title-font text-red-600">Who Should Attend</h3>
                    <p className="text-gray-700 leading-relaxed subtitle-font mb-4">
                      Perfect for serious athletes looking to improve technique, mental toughness, and competitive performance.
                    </p>
                  </div>
                </div>
              </div>



              {/* Texas RC Video Elements - positioned as stickers/corner elements */}
              {event.id === 3 && (
                <>
                  {/* Newspaper video as random sticker element */}
                  <div className="relative mb-16">
                    <div className="absolute -top-8 -right-4 lg:right-8 z-20 transform rotate-12">
                      <div className="relative w-48 h-32 overflow-hidden rounded-lg shadow-lg border-4 border-white">
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        >
                          <source src="/texas-rc-main.webm" type="video/webm" />
                        </video>
                        
                        {/* Sticker-style border effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                      </div>
                      
                      {/* Sticker shadow */}
                      <div className="absolute inset-0 bg-black/20 transform translate-x-1 translate-y-1 -z-10 rounded-lg"></div>
                    </div>
                  </div>

                  {/* Loop video as small corner square */}
                  <div className="fixed bottom-6 right-6 z-30 lg:bottom-8 lg:right-8">
                    <div className="relative w-24 h-24 lg:w-32 lg:h-32 overflow-hidden rounded-xl shadow-xl border-2 border-white/50">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      >
                        <source src="/texas-rc-loop.webm" type="video/webm" />
                      </video>
                      
                      {/* Subtle overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                    </div>
                  </div>
                </>
              )}

              {/* Schedule Preview */}
              <div className="mb-12">
                <h3 className="text-2xl mb-6 title-font">Daily Schedule Overview</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-600 pl-6 py-2">
                    <h4 className="font-bold subtitle-font">Morning Sessions</h4>
                    <p className="text-gray-600 subtitle-font">Technique development, drill work, and fundamentals</p>
                  </div>
                  <div className="border-l-4 border-red-600 pl-6 py-2">
                    <h4 className="font-bold subtitle-font">Afternoon Training</h4>
                    <p className="text-gray-600 subtitle-font">Live wrestling, situation training, and conditioning</p>
                  </div>
                  <div className="border-l-4 border-red-600 pl-6 py-2">
                    <h4 className="font-bold subtitle-font">Evening Sessions</h4>
                    <p className="text-gray-600 subtitle-font">Mental preparation, video review, and Q&A</p>
                  </div>
                </div>
              </div>
              
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
              
              {/* Training Excellence */}
              <h2 
                className="text-3xl mb-6 title-font"
              >
                Training Excellence
              </h2>
              <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 p-6">
                  <h3 className="text-xl mb-2 title-font">Elite Instruction</h3>
                  <p className="text-gray-700 subtitle-font">Learn from proven champions who have competed at the highest levels of wrestling.</p>
                </div>
                <div className="border border-gray-200 p-6">
                  <h3 className="text-xl mb-2 title-font">Personalized Development</h3>
                  <p className="text-gray-700 subtitle-font">Receive individual attention and customized feedback to accelerate your progress.</p>
                </div>
                <div className="border border-gray-200 p-6">
                  <h3 className="text-xl mb-2 title-font">Competition Preparation</h3>
                  <p className="text-gray-700 subtitle-font">Master the mental and physical preparation needed for championship performance.</p>
                </div>
                <div className="border border-gray-200 p-6">
                  <h3 className="text-xl mb-2 title-font">Technical Mastery</h3>
                  <p className="text-gray-700 subtitle-font">Perfect advanced techniques with step-by-step instruction from elite athletes.</p>
                </div>
              </div>
              
              {/* Elite D1 Coaches */}
              <div className="mb-12">
                <h2 className="text-3xl mb-6 title-font">Elite D1 Coaching Staff</h2>
                <p className="text-gray-700 mb-8 subtitle-font">Learn from current Division I coaches who are actively developing championship-level wrestlers at the highest level of collegiate competition.</p>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {/* Max Murin - George Mason */}
                  <motion.div 
                    className="p-6 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                    variants={fadeIn}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-green-600">
                      <div className="w-full h-full bg-green-600 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">MM</span>
                      </div>
                    </div>
                    <h3 className="text-xl mb-1 title-font text-center">Max Murin</h3>
                    <p className="text-sm text-green-600 mb-2 subtitle-font text-center font-medium">George Mason University</p>
                    <p className="text-xs text-gray-500 mb-3 subtitle-font text-center">Head Coach</p>
                    <p className="text-gray-700 text-sm subtitle-font">Former Iowa standout and NCAA finalist. Known for developing technical wrestlers with championship-level conditioning and mental toughness.</p>
                  </motion.div>

                  {/* Josh Shields - Brown */}
                  <motion.div 
                    className="p-6 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                    variants={fadeIn}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-amber-800">
                      <div className="w-full h-full bg-amber-800 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">JS</span>
                      </div>
                    </div>
                    <h3 className="text-xl mb-1 title-font text-center">Josh Shields</h3>
                    <p className="text-sm text-amber-800 mb-2 subtitle-font text-center font-medium">Brown University</p>
                    <p className="text-xs text-gray-500 mb-3 subtitle-font text-center">Head Coach</p>
                    <p className="text-gray-700 text-sm subtitle-font">Ivy League champion and respected tactician. Specializes in position-specific training and developing wrestlers for elite academic-athletic balance.</p>
                  </motion.div>

                  {/* Mark Hall - Oklahoma */}
                  <motion.div 
                    className="p-6 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                    variants={fadeIn}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-red-600">
                      <div className="w-full h-full bg-red-600 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">MH</span>
                      </div>
                    </div>
                    <h3 className="text-xl mb-1 title-font text-center">Mark Hall</h3>
                    <p className="text-sm text-red-600 mb-2 subtitle-font text-center font-medium">University of Oklahoma</p>
                    <p className="text-xs text-gray-500 mb-3 subtitle-font text-center">Assistant Coach</p>
                    <p className="text-gray-700 text-sm subtitle-font">3x NCAA Champion from Penn State. Elite-level competitor who brings championship experience and advanced technique instruction to developing wrestlers.</p>
                  </motion.div>

                  {/* Grant Leeth - Tarleton State */}
                  <motion.div 
                    className="p-6 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                    variants={fadeIn}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-purple-600">
                      <div className="w-full h-full bg-purple-600 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">GL</span>
                      </div>
                    </div>
                    <h3 className="text-xl mb-1 title-font text-center">Grant Leeth</h3>
                    <p className="text-sm text-purple-600 mb-2 subtitle-font text-center font-medium">Tarleton State University</p>
                    <p className="text-xs text-gray-500 mb-3 subtitle-font text-center">Head Coach</p>
                    <p className="text-gray-700 text-sm subtitle-font">Experienced D1 program builder with expertise in developing complete wrestlers. Known for innovative training methods and recruiting elite talent.</p>
                  </motion.div>

                  {/* Micky Phillippi - Pitt */}
                  <motion.div 
                    className="p-6 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                    variants={fadeIn}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-blue-600">
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">MP</span>
                      </div>
                    </div>
                    <h3 className="text-xl mb-1 title-font text-center">Micky Phillippi</h3>
                    <p className="text-sm text-blue-600 mb-2 subtitle-font text-center font-medium">University of Pittsburgh</p>
                    <p className="text-xs text-gray-500 mb-3 subtitle-font text-center">Assistant Coach</p>
                    <p className="text-gray-700 text-sm subtitle-font">Former ACC standout with extensive coaching experience. Focuses on technical development and mental preparation for high-level competition.</p>
                  </motion.div>
                </motion.div>

                {/* Coaching Credentials Section */}
                <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg mb-4 title-font">Collective Coaching Excellence</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm subtitle-font">
                    <div>
                      <span className="font-bold text-red-600">✓</span> Multiple NCAA Champions & Finalists
                    </div>
                    <div>
                      <span className="font-bold text-red-600">✓</span> Current D1 Program Leadership
                    </div>
                    <div>
                      <span className="font-bold text-red-600">✓</span> Elite Competition Experience
                    </div>
                  </div>
                </div>
              </div>
              
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