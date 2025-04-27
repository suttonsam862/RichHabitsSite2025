import { Link } from "wouter";
import { AnimatedUnderline } from "@/components/ui/animated-underline";
import { Container } from "@/components/ui/container";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Define the design mockup images for the carousel
const designImages = [
  "/images/custom-apparel/BrooksMockupFinal.png",
  "/images/custom-apparel/CaneNationMockup.png",
  "/images/custom-apparel/NormalChromeMockup1.png",
  "/images/custom-apparel/NickPoloMockupFinal.png",
  "/images/custom-apparel/ElevateMockup5.png",
  "/images/custom-apparel/BraggMockup.png",
  "/images/custom-apparel/Athens Mockup.png",
  "/images/custom-apparel/10pDeathSquad Mockup.png",
  "/images/custom-apparel/BlueRashguardMockup.png",
  "/images/custom-apparel/BlackRashgaurdMockup.png",
  "/images/custom-apparel/ClassicRashguardMockup.png",
  "/images/custom-apparel/NoPawsRanburneMockup.png"
];

export function CustomClothingService() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Auto-advance the carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % designImages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  return (
    <section className="py-20 bg-[hsl(var(--secondary))]">
      <Container>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-serif font-semibold mb-4 group">
              <AnimatedUnderline>
                Custom Team Apparel
              </AnimatedUnderline>
            </h2>
            <p className="text-lg mb-12">AI-enhanced design process for teams and organizations.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-3">Smart Design Process</h3>
                <p className="text-gray-700">Our AI-powered design system helps create custom apparel that perfectly represents your team's identity while optimizing for performance.</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-3">Premium Materials</h3>
                <p className="text-gray-700">Fabric suggestions based on activity type, climate conditions, and performance needs with sustainable options.</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-3">From Concept to Competition</h3>
                <p className="text-gray-700">Full-service approach from initial consultation to final delivery with comprehensive measurement guides.</p>
              </div>
              
              <Link href="/custom-apparel" className="inline-block bg-primary text-white py-3 px-8 font-medium tracking-wide hover:bg-opacity-90 transition-colors">
                Request Custom Design
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative h-[500px] bg-white p-1"
            >
              {/* This would be where a 3D model could be embedded in the future */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentImageIndex}
                    src={designImages[currentImageIndex]} 
                    alt={`Custom apparel design ${currentImageIndex + 1}`} 
                    className="object-contain w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
                
                {/* Controls */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                  {designImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 transition-all duration-300 ${
                        index === currentImageIndex ? "w-6 bg-primary" : "w-2 bg-gray-300"
                      } rounded-full`}
                      aria-label={`Go to design ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Caption */}
                <div className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                  <p className="text-sm font-medium">
                    Custom Design Gallery {currentImageIndex + 1}/{designImages.length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
