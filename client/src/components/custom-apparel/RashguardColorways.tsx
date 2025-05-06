import { useState } from "react";
import { Container } from "@/components/ui/container";
import { motion, AnimatePresence } from "framer-motion";

// Import actual rashguard images directly
import blackRashguard from "@assets/BlackRashgaurdMockup.png";
import blueRashguard from "@assets/BlueRashguardMockup.png";
import brownRashguard from "@assets/BrownRashguardMockup.png";
import whiteRashguard from "@assets/WhiteRashguardMockup.png";
import purpleRashguard from "@assets/Purple Rashguard.png";
import classicRashguard from "@assets/ClassicRashguardMockup.png";

export function RashguardColorways() {
  const [selectedColorway, setSelectedColorway] = useState(0);
  
  // Rashguard colorways with actual images and matching gradients for fallbacks
  const colorways = [
    {
      name: "Black Rashguard",
      gradient: "linear-gradient(135deg, #111111, #333333)",
      description: "Classic black rashguard with subtle design elements",
      image: blackRashguard
    },
    {
      name: "Blue Rashguard",
      gradient: "linear-gradient(135deg, #1E3A8A, #60A5FA)",
      description: "Vibrant blue rashguard for high visibility on the mat",
      image: blueRashguard
    },
    {
      name: "Brown Rashguard",
      gradient: "linear-gradient(135deg, #78350F, #B45309)",
      description: "Earthy brown rashguard with premium feel",
      image: brownRashguard
    },
    {
      name: "Purple Rashguard",
      gradient: "linear-gradient(135deg, #581C87, #A855F7)",
      description: "Rich purple rashguard with dynamic design",
      image: purpleRashguard
    },
    {
      name: "White Rashguard",
      gradient: "linear-gradient(135deg, #D1D5DB, #F9FAFB)",
      description: "Clean white rashguard, perfect for custom graphics",
      image: whiteRashguard
    },
    {
      name: "Classic Rashguard",
      gradient: "linear-gradient(135deg, #065F46, #059669)",
      description: "Traditional design with premium construction",
      image: classicRashguard
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
                    <div className="w-full h-[400px] rounded-lg overflow-hidden bg-white relative">
                      {/* Display the actual rashguard image */}
                      <img 
                        src={colorways[selectedColorway].image}
                        alt={colorways[selectedColorway].name}
                        className="w-full h-full object-contain p-4"
                        onError={(e) => {
                          // If image fails to load, show a styled div with colorway info instead
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          
                          // Find the parent container
                          const container = target.parentElement;
                          if (container) {
                            // Add a styled div with colorway information
                            const fallbackDiv = document.createElement('div');
                            fallbackDiv.className = 'w-full h-full flex items-center justify-center p-8 text-white text-center';
                            fallbackDiv.style.background = colorways[selectedColorway].gradient;
                            
                            fallbackDiv.innerHTML = `
                              <div>
                                <h3 class="text-3xl font-bold mb-4">${colorways[selectedColorway].name}</h3>
                                <p class="text-xl mb-8">${colorways[selectedColorway].description}</p>
                                <div class="inline-block border-4 border-white/30 rounded-full p-8">
                                  <span class="text-xl">Rich Habits</span>
                                </div>
                              </div>
                            `;
                            
                            container.appendChild(fallbackDiv);
                          }
                        }}
                      />
                      
                      {/* Caption overlay at the bottom */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-10 pb-4 px-6 text-white">
                        <h3 className="text-xl font-bold">{colorways[selectedColorway].name}</h3>
                        <p>{colorways[selectedColorway].description}</p>
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
