import { Container } from "@/components/ui/container";
import { AnimatedUnderline } from "@/components/ui/animated-underline";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { useState, useEffect, useRef } from "react";
import { TeamGallery } from "@/components/custom-apparel/TeamGallery";
import { FeaturedTeams } from "@/components/custom-apparel/FeaturedTeams";
import { Testimonials } from "@/components/custom-apparel/Testimonials";

export default function CustomApparel() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentDesignSet, setCurrentDesignSet] = useState(0);
  
  const wrestlerImages = [
    "/images/wrestlers/DSC09491.JPG",
    "/images/wrestlers/DSC07386.JPG",
    "/images/wrestlers/DSC00423.JPG",
    "/images/wrestlers/DSC09374--.JPG"
  ];
  
  // All our design images
  const designImages = [
    "/assets/designs/athens.png",
    "/assets/designs/deathsquad.png",
    "/assets/designs/blackrashguard.png",
    "/assets/designs/bluerashguard.png",
    "/assets/designs/bragg.png",
    "/assets/designs/brooks.png",
    "/assets/designs/brooksfinal.png",
    "/assets/designs/canenation.png",
    "/assets/designs/classicrashguard.png",
    "/assets/designs/elevate.png",
    "/assets/designs/fullmockups.png",
    "/assets/designs/ltds.png",
    "/assets/designs/ltdsmockups.png",
    "/assets/designs/nickpolo.png",
    "/assets/designs/nopaws.png",
    "/assets/designs/normalchrome.png",
    "/assets/designs/northside.png"
  ];
  
  // Rotate through hero images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === wrestlerImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [wrestlerImages.length]);
  
  // Rotate through design sets every 4 seconds for the showcase section
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDesignSet((prevSet) => 
        prevSet === 2 ? 0 : prevSet + 1
      );
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Custom Team Apparel | Rich Habits</title>
        <meta name="description" content="AI-enhanced custom athletic apparel design for teams and organizations." />
      </Helmet>
      
      <div className="bg-white">
        {/* Hero Section */}
        <section className="w-full h-[70vh] bg-black flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-gray-900 to-black">
            {/* Background image slideshow */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 w-full h-full"
                style={{ 
                  backgroundImage: `url(${wrestlerImages[currentImageIndex]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              ></motion.div>
            </AnimatePresence>
            
            {/* Overlay to ensure text is readable */}
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>
          
          <Container className="relative z-10 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <h1 className="text-5xl font-serif font-bold mb-4">Custom Team Apparel</h1>
              <p className="text-xl mb-8">AI-enhanced design process tailored to your team's identity and performance needs.</p>
              <a 
                href="#contactForm"
                className="bg-white text-primary py-3 px-8 font-medium tracking-wide hover:bg-opacity-90 transition-colors inline-block"
              >
                Request a Consultation
              </a>
            </motion.div>
          </Container>
        </section>
        
        {/* Design Showcase with sliding and fading effects */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="mb-10">
              {/* Horizontal auto-scrolling carousel */}
              <div className="overflow-hidden">
                <div className="relative">
                  <div className="flex items-center justify-start h-[300px] overflow-hidden">
                    <motion.div 
                      className="flex gap-8 min-w-max"
                      animate={{ 
                        x: [0, -3500], 
                      }}
                      transition={{ 
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 60,
                        ease: "linear"
                      }}
                    >
                      {/* Design images - direct references */}
                      <div className="flex-shrink-0 h-[280px] w-[350px]">
                        <img 
                          src="/designs/athens.png" 
                          alt="Athens design" 
                          className="h-full w-full object-contain shadow-md rounded-md"
                        />
                      </div>
                      <div className="flex-shrink-0 h-[280px] w-[350px]">
                        <img 
                          src="/designs/brooksfinal.png" 
                          alt="Brooks final design" 
                          className="h-full w-full object-contain shadow-md rounded-md"
                        />
                      </div>
                      <div className="flex-shrink-0 h-[280px] w-[350px]">
                        <img 
                          src="/designs/bragg.png" 
                          alt="Bragg design" 
                          className="h-full w-full object-contain shadow-md rounded-md"
                        />
                      </div>
                      <div className="flex-shrink-0 h-[280px] w-[350px]">
                        <img 
                          src="/designs/canenation.png" 
                          alt="Cane Nation design" 
                          className="h-full w-full object-contain shadow-md rounded-md"
                        />
                      </div>
                      <div className="flex-shrink-0 h-[280px] w-[350px]">
                        <img 
                          src="/designs/elevate.png" 
                          alt="Elevate design" 
                          className="h-full w-full object-contain shadow-md rounded-md"
                        />
                      </div>
                      <div className="flex-shrink-0 h-[280px] w-[350px]">
                        <img 
                          src="/designs/ltds.png" 
                          alt="LTDS design" 
                          className="h-full w-full object-contain shadow-md rounded-md"
                        />
                      </div>
                      <div className="flex-shrink-0 h-[280px] w-[350px]">
                        <img 
                          src="/designs/classicrashguard.png" 
                          alt="Classic rashguard design" 
                          className="h-full w-full object-contain shadow-md rounded-md"
                        />
                      </div>
                      <div className="flex-shrink-0 h-[280px] w-[350px]">
                        <img 
                          src="/designs/bluerashguard.png" 
                          alt="Blue rashguard design" 
                          className="h-full w-full object-contain shadow-md rounded-md"
                        />
                      </div>
                      <div className="flex-shrink-0 h-[280px] w-[350px]">
                        <img 
                          src="/designs/blackrashguard.png" 
                          alt="Black rashguard design" 
                          className="h-full w-full object-contain shadow-md rounded-md"
                        />
                      </div>
                      <div className="flex-shrink-0 h-[280px] w-[350px]">
                        <img 
                          src="/designs/nopaws.png" 
                          alt="No Paws design" 
                          className="h-full w-full object-contain shadow-md rounded-md"
                        />
                      </div>
                      
                      {/* Duplicate first few items for seamless looping */}
                      <div className="flex-shrink-0 h-[280px] w-[350px]">
                        <img 
                          src="/designs/athens.png" 
                          alt="Athens design" 
                          className="h-full w-full object-contain shadow-md rounded-md"
                        />
                      </div>
                      <div className="flex-shrink-0 h-[280px] w-[350px]">
                        <img 
                          src="/designs/brooksfinal.png" 
                          alt="Brooks final design" 
                          className="h-full w-full object-contain shadow-md rounded-md"
                        />
                      </div>
                      <div className="flex-shrink-0 h-[280px] w-[350px]">
                        <img 
                          src="/designs/bragg.png" 
                          alt="Bragg design" 
                          className="h-full w-full object-contain shadow-md rounded-md"
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
        
        {/* Process Section */}
        <section className="py-20">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-semibold mb-4 group">
                <AnimatedUnderline>
                  Our Design Process
                </AnimatedUnderline>
              </h2>
              <p className="text-lg max-w-3xl mx-auto">We combine cutting-edge AI technology with expert craftsmanship to create custom apparel that perfectly represents your team's identity.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-medium">1</span>
                </div>
                <h3 className="text-xl font-medium mb-3">Consultation</h3>
                <p className="text-gray-700">We begin with understanding your team's needs, identity, and performance requirements through a detailed consultation.</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-medium">2</span>
                </div>
                <h3 className="text-xl font-medium mb-3">AI-Assisted Design</h3>
                <p className="text-gray-700">Our AI system generates design options based on your preferences, colors, and performance needs while our designers refine the concepts.</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-medium">3</span>
                </div>
                <h3 className="text-xl font-medium mb-3">Production & Delivery</h3>
                <p className="text-gray-700">Once designs are approved, we craft your apparel with premium materials and deliver them ready for competition.</p>
              </motion.div>
            </div>
          </Container>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-[hsl(var(--secondary))]">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-serif font-semibold mb-6 group">
                  <AnimatedUnderline>
                    Smart Design Features
                  </AnimatedUnderline>
                </h2>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="mb-6"
                >
                  <h3 className="text-xl font-medium mb-3">Material Recommendations</h3>
                  <p className="text-gray-700">Our AI analyzes your sport, climate, and usage patterns to suggest optimal fabrics that balance comfort, performance, and durability.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="mb-6"
                >
                  <h3 className="text-xl font-medium mb-3">Design Generation</h3>
                  <p className="text-gray-700">Generate multiple design concepts that align with your team's identity while staying at the forefront of athletic apparel aesthetics.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="mb-6"
                >
                  <h3 className="text-xl font-medium mb-3">Size Optimization</h3>
                  <p className="text-gray-700">Comprehensive sizing guides and recommendations to ensure every team member has properly fitted gear for optimal performance.</p>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="aspect-square bg-white p-4">
                  <img 
                    src="/designs/athens.png" 
                    alt="Athens wrestling team custom design" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="aspect-square bg-white p-4">
                  <img 
                    src="/designs/brooksfinal.png" 
                    alt="Brooks High School custom apparel" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="aspect-square bg-white p-4">
                  <img 
                    src="/designs/elevate.png" 
                    alt="Elevate wrestling singlet design" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="aspect-square bg-white p-4">
                  <img 
                    src="/designs/bragg.png" 
                    alt="Bragg Middle School apparel design" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
            </div>
          </Container>
        </section>
        
        {/* Portfolio Section */}
        <section className="py-20">
          <Container>
            <h2 className="text-3xl font-serif font-semibold mb-12 group text-center">
              <AnimatedUnderline>
                Past Custom Projects
              </AnimatedUnderline>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-full h-64 p-4 flex items-center justify-center">
                  <img 
                    src="/designs/ltds.png" 
                    alt="Learning Tree Day School" 
                    className="h-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-medium mb-2">Learning Tree Day School</h3>
                  <p className="text-gray-700 mb-4">Complete staff uniform system with color-coded options for different departments and specialized embroidery.</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-full h-64 p-4 flex items-center justify-center">
                  <img 
                    src="/designs/canenation.png" 
                    alt="Cane Nation Wrestling" 
                    className="h-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-medium mb-2">Cane Nation Wrestling</h3>
                  <p className="text-gray-700 mb-4">Performance-focused competition gear with advanced sublimation printing and coordinated accessories.</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-full h-64 p-4 flex items-center justify-center">
                  <img 
                    src="/designs/classicrashguard.png" 
                    alt="10th Planet Birmingham" 
                    className="h-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-medium mb-2">10th Planet Birmingham</h3>
                  <p className="text-gray-700 mb-4">Custom rashguards and training gear with moisture-wicking technology and distinctive team branding.</p>
                </div>
              </motion.div>
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/gallery" className="inline-block border border-primary py-3 px-8 font-medium tracking-wide hover:bg-primary hover:text-white transition-colors">
                View More Projects
              </Link>
            </div>
          </Container>
        </section>
        
        {/* Fading Design Showcase Section */}
        <section className="py-20 bg-gray-50">
          <Container>
            <h2 className="text-3xl font-serif font-semibold mb-10 group text-center">
              <AnimatedUnderline>
                Featured Design Showcase
              </AnimatedUnderline>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
              {currentDesignSet === 0 && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="relative h-full bg-white rounded-lg shadow-md p-4 overflow-hidden"
                  >
                    <img 
                      src="/designs/deathsquad.png" 
                      alt="Death Squad design" 
                      className="h-full w-full object-contain"
                    />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative h-full bg-white rounded-lg shadow-md p-4 overflow-hidden"
                  >
                    <img 
                      src="/designs/nickpolo.png" 
                      alt="Nick Polo design" 
                      className="h-full w-full object-contain"
                    />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="relative h-full bg-white rounded-lg shadow-md p-4 overflow-hidden"
                  >
                    <img 
                      src="/designs/brooks.png" 
                      alt="Brooks design" 
                      className="h-full w-full object-contain"
                    />
                  </motion.div>
                </>
              )}
              
              {currentDesignSet === 1 && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="relative h-full bg-white rounded-lg shadow-md p-4 overflow-hidden"
                  >
                    <img 
                      src="/designs/northside.png" 
                      alt="Northside design" 
                      className="h-full w-full object-contain"
                    />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative h-full bg-white rounded-lg shadow-md p-4 overflow-hidden"
                  >
                    <img 
                      src="/designs/ltdsmockups.png" 
                      alt="LTDS Mockups" 
                      className="h-full w-full object-contain"
                    />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="relative h-full bg-white rounded-lg shadow-md p-4 overflow-hidden"
                  >
                    <img 
                      src="/designs/blackrashguard.png" 
                      alt="Black Rashguard design" 
                      className="h-full w-full object-contain"
                    />
                  </motion.div>
                </>
              )}
              
              {currentDesignSet === 2 && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="relative h-full bg-white rounded-lg shadow-md p-4 overflow-hidden"
                  >
                    <img 
                      src="/designs/normalchrome.png" 
                      alt="Normal Chrome design" 
                      className="h-full w-full object-contain"
                    />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative h-full bg-white rounded-lg shadow-md p-4 overflow-hidden"
                  >
                    <img 
                      src="/designs/fullmockups.png" 
                      alt="Full Mockups design" 
                      className="h-full w-full object-contain"
                    />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="relative h-full bg-white rounded-lg shadow-md p-4 overflow-hidden"
                  >
                    <img 
                      src="/designs/bluerashguard.png" 
                      alt="Blue Rashguard design" 
                      className="h-full w-full object-contain"
                    />
                  </motion.div>
                </>
              )}
            </div>
          </Container>
        </section>
        
        {/* Contact Form Section */}
        <section id="contactForm" className="py-20 bg-[hsl(var(--secondary))]">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-serif font-semibold mb-6 text-center">Request a Consultation</h2>
              <p className="text-lg mb-8 text-center">Fill out the form below to discuss your team's custom apparel needs.</p>
              
              <form className="space-y-6 bg-white p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border border-[hsl(var(--shadow))] focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full p-3 border border-[hsl(var(--shadow))] focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization/Team Name</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border border-[hsl(var(--shadow))] focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sport/Activity</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border border-[hsl(var(--shadow))] focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Project Details</label>
                  <textarea 
                    className="w-full p-3 border border-[hsl(var(--shadow))] focus:border-primary focus:outline-none min-h-[150px]"
                    placeholder="Tell us about your team, your design ideas, timeline, and any specific requirements."
                    required
                  ></textarea>
                </div>
                
                <div className="text-center">
                  <button 
                    type="submit" 
                    className="bg-primary text-white py-3 px-8 font-medium hover:bg-opacity-90 transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
