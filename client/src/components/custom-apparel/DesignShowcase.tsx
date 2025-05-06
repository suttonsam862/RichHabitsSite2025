import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";

// Import actual design mockups directly for reliable loading
// Team designs mockups
import athensMockup from "@assets/Athens Mockup.png";
import ltdsMockup from "@assets/LTDS Mockup.png"; 
import ltdsMockups from "@assets/LTDS Mockups.png";
import brooksMockup from "@assets/BrooksMockup.png";
import brooksMockupFinal from "@assets/BrooksMockupFinal.png";

// Performance gear mockups
import braggMockup from "@assets/BraggMockup.png";
import elevateMockup from "@assets/ElevateMockup5.png";
import caneNationMockup from "@assets/CaneNationMockup.png";
import northsideDesign from "@assets/Northside Takedown Mockups.png";

// Apparel mockups
import deathSquadMockup from "@assets/10pDeathSquad Mockup.png";
import planetShorts from "@assets/10thPlanet Shorts.png";
import planetCrewneck from "@assets/10th Planet Crewneck.png";
import planetSweats from "@assets/10th Planet Sweats.png";

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
    <section className="py-24 bg-[hsl(var(--muted))]">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Design Portfolio</h2>
          <p className="text-lg max-w-3xl mx-auto">
            Browse through some of our latest custom apparel designs for wrestling teams across the country.
          </p>
        </div>
        
        <div className="relative h-[500px] overflow-hidden">
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
                <div 
                  key={index} 
                  className="bg-white p-3 shadow-md flex items-center justify-center overflow-hidden h-[450px]"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    {/* Image */}
                    <img
                      src={design.image}
                      alt={design.name}
                      className="object-contain w-full h-full"
                      onError={(e) => {
                        // If image fails to load, show a styled div with design info instead
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        
                        // Find the parent container
                        const container = target.parentElement;
                        if (container) {
                          // Add a styled div with design information
                          const fallbackDiv = document.createElement('div');
                          fallbackDiv.className = 'w-full h-full rounded flex flex-col items-center justify-center p-8 text-white';
                          
                          // Generate a unique gradient based on the design name for visual variety
                          const gradients = [
                            "linear-gradient(135deg, #0039A6, #4CB4FD)",
                            "linear-gradient(135deg, #6B21A8, #9333EA)",
                            "linear-gradient(135deg, #991B1B, #F87171)",
                            "linear-gradient(135deg, #831843, #EC4899)",
                            "linear-gradient(135deg, #422006, #EAB308)",
                            "linear-gradient(135deg, #064E3B, #34D399)"
                          ];
                          fallbackDiv.style.background = gradients[index % gradients.length];
                          
                          fallbackDiv.innerHTML = `
                            <div class="text-center">
                              <h3 class="text-2xl font-bold mb-4">${design.name}</h3>
                              <p class="text-lg">${design.description}</p>
                              <div class="mt-6 p-4 bg-white/20 rounded">
                                <span class="text-xl">Rich Habits Custom Design</span>
                              </div>
                            </div>
                          `;
                          
                          container.appendChild(fallbackDiv);
                        }
                      }}
                    />
                    
                    {/* Caption overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                      <h3 className="text-lg font-bold">{design.name}</h3>
                      <p className="text-sm">{design.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex justify-center mt-6">
          {designSets.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentDesignSet(index)}
              className={`h-3 w-3 mx-1 rounded-full ${index === currentDesignSet ? 'bg-primary' : 'bg-gray-300'}`}
              aria-label={`View design set ${index + 1}`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
