import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";

export function DesignShowcase() {
  const [currentDesignSet, setCurrentDesignSet] = useState(0);
  
  // Design sets with gradient backgrounds instead of images
  const designSets = [
    // Set 1: Team Singlets
    [
      { 
        name: "Team Singlet Designs", 
        gradient: "linear-gradient(135deg, #0039A6, #4CB4FD)",
        description: "Customized singlets for wrestling teams with durable materials"
      },
      { 
        name: "School Branding", 
        gradient: "linear-gradient(135deg, #6B21A8, #9333EA)",
        description: "School colors and logos designed for maximum impact"
      },
      { 
        name: "Tournament Gear", 
        gradient: "linear-gradient(135deg, #991B1B, #F87171)",
        description: "Special designs for tournament and competitive events"
      }
    ],
    // Set 2: Training Apparel
    [
      { 
        name: "Training Shirts", 
        gradient: "linear-gradient(135deg, #064E3B, #34D399)",
        description: "Comfortable training shirts with moisture-wicking fabric"
      },
      { 
        name: "Practice Shorts", 
        gradient: "linear-gradient(135deg, #1E3A8A, #93C5FD)",
        description: "Durable practice shorts designed for movement"
      },
      { 
        name: "Team Warmups", 
        gradient: "linear-gradient(135deg, #3F3F46, #A1A1AA)",
        description: "Professional warmup sets for pre-competition"
      }
    ],
    // Set 3: Performance Gear
    [
      { 
        name: "Compression Gear", 
        gradient: "linear-gradient(135deg, #831843, #EC4899)",
        description: "Performance compression wear for training and recovery"
      },
      { 
        name: "Headgear Design", 
        gradient: "linear-gradient(135deg, #422006, #EAB308)",
        description: "Custom headgear with team branding and colors"
      },
      { 
        name: "Accessories", 
        gradient: "linear-gradient(135deg, #0F172A, #475569)",
        description: "Branded bags, towels, and other team accessories"
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
                  <div 
                    className="w-full h-full rounded flex flex-col items-center justify-center p-8 text-white"
                    style={{ background: design.gradient }}
                  >
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-4">{design.name}</h3>
                      <p className="text-lg">{design.description}</p>
                      <div className="mt-6 p-4 bg-white/20 rounded">
                        <span className="text-xl">Rich Habits Custom Design</span>
                      </div>
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
