import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "../layout/Container";

// Team designs mockups
const athensMockup = "/images/custom-apparel/Athens Mockup.png";
const ltdsMockup = "/images/custom-apparel/LTDS Mockup.png"; 
const ltdsMockups = "/images/custom-apparel/LTDS Mockups.png";
const brooksMockupFinal = "/images/custom-apparel/BrooksMockupFinal.png";

// Performance gear mockups
const braggMockup = "/images/custom-apparel/BraggMockup.png";
const elevateMockup = "/images/custom-apparel/ElevateMockup5.png";
const caneNationMockup = "/images/custom-apparel/CaneNationMockup.png";
const northsideDesign = "/images/custom-apparel/Northside Takedown Mockups.png";

// Apparel mockups
const deathSquadMockup = "/images/custom-apparel/10pDeathSquad Mockup.png";
const planetShorts = "/images/custom-apparel/10thPlanet Shorts.png";
const planetCrewneck = "/images/custom-apparel/10th Planet Crewneck.png";
const planetSweats = "/images/custom-apparel/10th Planet Sweats.png";

export function DesignShowcase() {
  const [currentDesignSet, setCurrentDesignSet] = useState(0);
  
  // Design sets with actual mockup images
  const designSets = [
    // Set 1: Team Design Mockups
    [
      { 
        name: "Athens Wrestling", 
        description: "Team gear for Athens wrestling program",
        image: athensMockup
      },
      { 
        name: "Brooks Team Design", 
        description: "Custom design for Brooks wrestling team",
        image: brooksMockupFinal
      },
      { 
        name: "LTDS Apparel", 
        description: "Custom apparel for LTDS wrestling program",
        image: ltdsMockup
      }
    ],
    // Set 2: Performance Gear
    [
      { 
        name: "Bragg Wrestling", 
        description: "Custom gear for Bragg wrestling team",
        image: braggMockup
      },
      { 
        name: "Elevate Performance", 
        description: "Elevate wrestling team apparel design",
        image: elevateMockup
      },
      { 
        name: "Cane Nation", 
        description: "Cane Nation team competition gear",
        image: caneNationMockup
      }
    ],
    // Set 3: Apparel Collections
    [
      { 
        name: "10th Planet Shorts", 
        description: "Training shorts for serious wrestlers",
        image: planetShorts
      },
      { 
        name: "10th Planet Crewneck", 
        description: "Team crewneck with premium materials",
        image: planetCrewneck
      },
      { 
        name: "10th Planet Sweats", 
        description: "Team sweatpants with custom branding",
        image: planetSweats
      }
    ],
    // Set 4: Additional Designs
    [
      { 
        name: "Death Squad Custom", 
        description: "Death Squad team design package",
        image: deathSquadMockup
      },
      { 
        name: "Northside Takedown", 
        description: "Northside Takedown tournament gear",
        image: northsideDesign
      },
      { 
        name: "Multiple Design Collections", 
        description: "View multiple mockups for your team",
        image: ltdsMockups
      }
    ]
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDesignSet((prevSet) => 
        prevSet === designSets.length - 1 ? 0 : prevSet + 1
      );
    }, 4000); // Change design set every 4 seconds
    
    return () => clearInterval(interval);
  }, [designSets.length]);

  return (
    <section className="py-24 bg-gray-50 relative">
      {/* Subtle sky blue accent element */}
      <div className="absolute top-0 left-0 w-1 h-24 bg-sky-200 opacity-30"></div>
      <div className="absolute top-0 right-0 w-1 h-24 bg-sky-200 opacity-30"></div>
      
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl title-font mb-6">Our Design Portfolio</h2>
          <p className="text-lg max-w-3xl mx-auto subtitle-font">
            Browse through some of our latest custom apparel designs for wrestling teams across the country.
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDesignSet}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {designSets[currentDesignSet].map((design, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white shadow-lg overflow-hidden h-[450px]"
                >
                  <div className="w-full h-[350px] overflow-hidden">
                    <img
                      src={design.image}
                      alt={design.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        
                        // Find the parent container
                        const container = target.parentElement;
                        if (container) {
                          // Create a styled fallback div
                          const fallbackDiv = document.createElement('div');
                          fallbackDiv.className = 'w-full h-full flex flex-col items-center justify-center p-8 bg-gray-200';
                          
                          fallbackDiv.innerHTML = `
                            <div class="text-center">
                              <div class="mb-4 h-1 w-16 bg-gray-900 mx-auto"></div>
                              <h3 class="text-2xl title-font mb-4">${design.name}</h3>
                              <p class="subtitle-font">${design.description}</p>
                            </div>
                          `;
                          
                          container.appendChild(fallbackDiv);
                        }
                      }}
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-3 h-1 w-12 bg-gray-900"></div>
                    <h3 className="text-xl title-font mb-2">{design.name}</h3>
                    <p className="text-gray-600 subtitle-font">{design.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex justify-center mt-12 space-x-3">
          {designSets.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentDesignSet(index)}
              className={`h-3 w-3 mx-1 rounded-full transition-all duration-300 ${
                index === currentDesignSet ? 'bg-gray-900 w-6' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`View design set ${index + 1}`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
