import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { motion, AnimatePresence } from "framer-motion";

// School package images with direct paths
// Auburn images
const auburnMens = "/images/custom-apparel/AuburnMen_s Final.png";
const auburnWomens = "/images/custom-apparel/AuburnWomens FInal.png";
const auburnJV = "/images/custom-apparel/Auburn JV Pack Final.png";

// Berry images
const berryGearPack = "/images/custom-apparel/BerryGearpAckV2.png";
const berryGearPackV2 = "/images/custom-apparel/Berry Middle Gear Pack.png";

// Coosa images
const coosaChristianTech = "/images/custom-apparel/Coosa Christian Tech.png";
const coosaChristianLogo = "/images/custom-apparel/CoosaChristianPNG.png";

// Dora images
const doraMensFinal = "/images/custom-apparel/DoraMensFinal.png";
const doraMensSinglet = "/images/custom-apparel/DoraMen's Singlet.png";

export function SchoolPackages() {
  const [selectedSchool, setSelectedSchool] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // School packages with directly imported images
  const schoolPackages = [
    {
      name: "Auburn Wrestling",
      gradient: "linear-gradient(135deg, #E35205, #DFBD58)",
      logo: "AU",
      description: "Complete gear package for Auburn's wrestling program with custom singlets, warmups, and practice gear.",
      colors: "Orange and Navy Blue",
      images: [
        auburnMens,
        auburnWomens,
        auburnJV
      ]
    },
    {
      name: "Berry Middle School",
      gradient: "linear-gradient(135deg, #3A1B43, #8B5CF6)",
      logo: "BMS",
      description: "Youth-focused wrestling gear designed for Berry Middle School with durable, comfortable materials.",
      colors: "Purple and Silver",
      images: [
        berryGearPack,
        berryGearPackV2
      ]
    },
    {
      name: "Coosa Christian",
      gradient: "linear-gradient(135deg, #9F1239, #E11D48)",
      logo: "CC",
      description: "Faith-based themed gear for Coosa Christian's wrestling program with high-quality materials.",
      colors: "Red and White",
      images: [
        coosaChristianTech,
        coosaChristianLogo
      ]
    },
    {
      name: "Dora High School",
      gradient: "linear-gradient(135deg, #0E7490, #22D3EE)",
      logo: "DHS",
      description: "Custom team package for Dora High School featuring their traditional blue and gold colors.",
      colors: "Blue and Gold",
      images: [
        doraMensFinal,
        doraMensSinglet
      ]
    }
  ];

  // Auto-rotate through images for the selected school
  useEffect(() => {
    // Reset image index when school changes
    setCurrentImageIndex(0);
    
    // Set up image rotation interval
    const interval = setInterval(() => {
      const imageCount = schoolPackages[selectedSchool].images.length;
      setCurrentImageIndex(prevIndex => 
        prevIndex >= imageCount - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change image every 3 seconds
    
    return () => clearInterval(interval);
  }, [selectedSchool, schoolPackages]);

  return (
    <section className="py-24 bg-gray-50 relative">
      {/* Subtle sky blue accent elements */}
      <div className="absolute top-0 left-0 w-1 h-16 bg-sky-200 opacity-30"></div>
      <div className="absolute top-0 right-0 w-1 h-16 bg-sky-200 opacity-30"></div>
      
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl title-font mb-6">School Apparel Packages</h2>
          <div className="h-1 w-20 bg-gray-900 mx-auto mb-6"></div>
          <p className="text-lg max-w-3xl mx-auto subtitle-font">
            We've helped numerous schools and teams create cohesive, professional apparel packages. 
            Here are some examples of our recent work.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10">
          {/* School Selection */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 shadow-lg">
              <h3 className="text-xl title-font mb-4">Featured Schools</h3>
              <div className="mb-4 h-1 w-12 bg-gray-900"></div>
              
              <div className="space-y-3">
                {schoolPackages.map((school, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSchool(index)}
                    className={`w-full text-left p-4 transition-colors subtitle-font ${
                      selectedSchool === index
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3"
                        style={{ background: school.gradient }}
                      >
                        {school.logo}
                      </div>
                      <span className="font-medium">{school.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-8 p-5 bg-gray-50 shadow-sm">
                <h4 className="title-font mb-4">Package Features:</h4>
                <div className="mb-3 h-1 w-12 bg-gray-900"></div>
                <ul className="space-y-3 text-gray-700 subtitle-font">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gray-900 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Custom singlets/uniforms
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gray-900 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Team warmup gear
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gray-900 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Practice t-shirts &amp; shorts
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gray-900 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Headgear &amp; accessories
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gray-900 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Fan &amp; parent apparel
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* School Package Display */}
          <div className="lg:w-2/3">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSchool}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-6 shadow-lg h-full"
              >
                <div className="h-[400px] mb-6 rounded-lg overflow-hidden bg-white">
                  {/* Image Carousel for School Mockups */}
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={`${selectedSchool}-${currentImageIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <img 
                        src={schoolPackages[selectedSchool].images[currentImageIndex]} 
                        alt={`${schoolPackages[selectedSchool].name} apparel design`}
                        className="object-contain max-h-full max-w-full p-4 transition-transform duration-500 hover:scale-105"
                        style={{ filter: 'grayscale(60%)' }}
                        onError={(e) => {
                          // If image fails to load, show a styled div with school info instead
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          
                          // Find the parent container
                          const container = target.parentElement;
                          if (container) {
                            // Add a styled div with school information
                            const fallbackDiv = document.createElement('div');
                            fallbackDiv.className = 'w-full h-full flex items-center justify-center p-8 text-white text-center';
                            fallbackDiv.style.background = schoolPackages[selectedSchool].gradient;
                            
                            fallbackDiv.innerHTML = `
                              <div>
                                <h3 class="text-3xl font-bold mb-4">${schoolPackages[selectedSchool].name}</h3>
                                <p class="text-xl mb-8">${schoolPackages[selectedSchool].description}</p>
                                <div class="inline-block border-4 border-white/30 rounded-full p-8">
                                  <span class="text-4xl font-bold">${schoolPackages[selectedSchool].logo}</span>
                                </div>
                              </div>
                            `;
                            
                            container.appendChild(fallbackDiv);
                          }
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Image Navigation Dots */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {schoolPackages[selectedSchool].images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          currentImageIndex === index ? 'bg-primary' : 'bg-gray-300'
                        }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 bg-gray-50 p-5 shadow-sm">
                    <h4 className="title-font mb-3">Custom Design Process</h4>
                    <div className="mb-3 h-1 w-12 bg-gray-900"></div>
                    <p className="subtitle-font">Our team works closely with coaches and athletic directors to develop a unique identity that represents your school's spirit and traditions.</p>
                  </div>
                  
                  <div className="flex-1 bg-gray-50 p-5 shadow-sm">
                    <h4 className="title-font mb-3">Team Colors</h4>
                    <div className="mb-3 h-1 w-12 bg-gray-900"></div>
                    <p className="subtitle-font">School colors: {schoolPackages[selectedSchool].colors}. We offer volume discounts for complete team packages.</p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <a 
                    href="#contact-form" 
                    className="inline-block border border-gray-900 text-gray-900 py-3 px-8 hover:bg-gray-900 hover:text-white transition-colors subtitle-font"
                  >
                    Request School Package Info
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}
