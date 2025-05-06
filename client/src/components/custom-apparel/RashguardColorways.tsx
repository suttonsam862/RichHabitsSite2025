import { useState } from "react";
import { Container } from "@/components/ui/container";
import { motion, AnimatePresence } from "framer-motion";

export function RashguardColorways() {
  const [selectedColorway, setSelectedColorway] = useState(0);
  
  // Use color gradients instead of images for reliability
  const colorways = [
    {
      name: "Black Rashguard",
      gradient: "linear-gradient(135deg, #111111, #333333)",
      description: "Classic black rashguard with subtle design elements"
    },
    {
      name: "Blue Rashguard",
      gradient: "linear-gradient(135deg, #1E3A8A, #60A5FA)",
      description: "Vibrant blue rashguard for high visibility on the mat"
    },
    {
      name: "Brown Rashguard",
      gradient: "linear-gradient(135deg, #78350F, #B45309)",
      description: "Earthy brown rashguard with premium feel"
    },
    {
      name: "Purple Rashguard",
      gradient: "linear-gradient(135deg, #581C87, #A855F7)",
      description: "Rich purple rashguard with dynamic design"
    },
    {
      name: "White Rashguard",
      gradient: "linear-gradient(135deg, #D1D5DB, #F9FAFB)",
      description: "Clean white rashguard, perfect for custom graphics"
    }
  ];

  return (
    <section className="py-20 bg-[hsl(var(--muted))]">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Rashguard Colorways</h2>
          <p className="text-lg max-w-3xl mx-auto">
            Our premium rashguards are available in multiple colorways to match your team's identity.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Color Selector */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-md shadow-sm">
              <h3 className="text-xl font-semibold mb-6">Select Colorway</h3>
              
              <div className="space-y-4">
                {colorways.map((colorway, index) => (
                  <button
                    key={index}
                    className={`flex items-center w-full p-3 rounded-md transition-colors ${
                      selectedColorway === index 
                        ? 'bg-[hsl(var(--primary))] text-white' 
                        : 'bg-[hsl(var(--muted-foreground)/0.1)] hover:bg-[hsl(var(--muted-foreground)/0.2)]'
                    }`}
                    onClick={() => setSelectedColorway(index)}
                  >
                    <div 
                      className="w-8 h-8 rounded-full mr-3"
                      style={{ background: colorway.gradient }}
                    ></div>
                    <span>{colorway.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-8">
                <h4 className="font-medium mb-2">Features:</h4>
                <ul className="space-y-2 text-[hsl(var(--foreground)/0.8)]">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Moisture-wicking fabric
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Four-way stretch
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Antimicrobial treatment
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Flatlock stitching
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Custom sublimation printing
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Colorway Display */}
          <div className="lg:w-2/3">
            <div className="bg-white p-6 rounded-md shadow-sm h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedColorway}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <div 
                      className="w-full h-[400px] rounded-lg flex items-center justify-center"
                      style={{ background: colorways[selectedColorway].gradient }}
                    >
                      <div className="text-white text-center p-8">
                        <h3 className="text-3xl font-bold mb-4">{colorways[selectedColorway].name}</h3>
                        <p className="text-xl">{colorways[selectedColorway].description}</p>
                        <div className="mt-10 inline-block bg-white/20 px-6 py-3 rounded">
                          <span className="text-xl">Rich Habits Wrestling</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-lg font-medium">
                      Custom sizing and design options available for teams
                    </p>
                    <a 
                      href="#contactForm" 
                      className="inline-block mt-4 bg-primary text-white py-2 px-6 rounded-md hover:bg-opacity-90 transition-colors"
                    >
                      Request Team Pricing
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
