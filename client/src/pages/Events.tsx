
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  price: number;
  description: string;
  features: string[];
  image: string;
  slug: string;
}

// Use authentic event data from the existing codebase
const events: Event[] = [
  {
    id: 1,
    title: "Birmingham Slam Camp",
    date: "June 19-21, 2025",
    location: "Clay-Chalkville Middle School",
    price: 249,
    description: "Southern grit meets elite technique",
    features: ["NCAA Champions", "Elite Technique", "Leadership Workshops", "Custom Gear"],
    image: "/assets/SlamCampSiteBanner.png",
    slug: "birmingham-slam-camp"
  },
  {
    id: 2,
    title: "National Champ Camp",
    date: "June 5-7, 2025",
    location: "Roy Martin Middle School",
    price: 299,
    description: "Three days of elite instruction from NCAA champions",
    features: ["NCAA Champions", "Mental Coaching", "Film Study", "Championship Mindset"],
    image: "/assets/LongSitePhotovegas.png",
    slug: "national-champ-camp"
  },
  {
    id: 3,
    title: "Texas Recruiting Clinic",
    date: "June 12-13, 2025",
    location: "Arlington Martin High School",
    price: 249,
    description: "Showcase your talent in front of cameras and coaches",
    features: ["College Coaches", "Video Recording", "Recruiting Guidance", "Scholarship Info"],
    image: "/assets/RecruitingWebsiteimage4.png",
    slug: "texas-recruiting-clinic"
  },
  {
    id: 4,
    title: "Panther Train Tour",
    date: "June 15-17, 2025",
    location: "Multiple locations nationwide",
    price: 99,
    description: "Elite training brought directly to regions across the country",
    features: ["Regional Stops", "Community Focus", "Accessible Pricing", "Success Stories"],
    image: "/assets/Cory_Site_Image.png",
    slug: "panther-train-tour"
  }
];

export default function Events() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Wrestling Events</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Join elite wrestling camps and clinics designed to elevate your skills and competitive edge.
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                <span>Expert Coaching</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6" />
                <span>All Skill Levels</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                <span>Multiple Dates</span>
              </div>
            </div>
          </motion.div>
        </Container>
      </div>

      {/* Events Grid */}
      <Container className="py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-8"
        >
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Event Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/SlamCampSiteBanner.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-2">
                    ${event.price}
                  </div>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {event.title}
                </h3>
                
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {event.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link href={`/events/${event.id}`} className="flex-1">
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      size="lg"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href={`/register/${event.id}`}>
                    <Button 
                      variant="outline" 
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      size="lg"
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center bg-gradient-to-r from-red-600 to-red-700 text-white p-12 rounded-2xl"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Take Your Wrestling to the Next Level?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of wrestlers who have elevated their skills through our elite training programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4">
              Browse All Events
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600 px-8 py-4">
              Contact Us
            </Button>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}