import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { motion, AnimatePresence } from "framer-motion";

// Image paths for featured items
const homewoodSinglet = "/images/DSC09354.JPG";
const jordanSinglet = "/images/DSC09491.JPG";
const femaleWrestler = "/images/DSC02187--.jpg";
const winnerShot = "/images/DSC07337--.jpg";
const singletOne = homewoodSinglet;
const singletTwo = jordanSinglet;
const championMoment = winnerShot;

// 10th Planet apparel images - using only /assets/ paths with URL-encoded spaces
// Adding cache-busting query parameters to prevent browser caching issues
const planetTShirt = "/assets/10th%20Planet%20Triblend.png?v=fix1";
const planetCrewneck = "/assets/10th%20Planet%20Crewneck.png?v=fix1";
const planetSweats = "/assets/10th%20Planet%20Sweats.png?v=fix1";
const planetShorts = "/assets/10thPlanet%20Shorts.png?v=fix1";

export function CustomApparelShowcase() {
  const [showPlanetCollection, setShowPlanetCollection] = useState(false);
  
  return (
    <section className="py-16 bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Championship-Quality Custom Gear</h2>
          <p className="text-lg max-w-3xl mx-auto text-gray-600">
            Our custom athletic apparel is worn by champions across Alabama and beyond. 
            From team packages to individual items, Rich Habits delivers quality that performs.
          </p>
          
          <div className="flex justify-center mt-8 space-x-4">
            <button 
              onClick={() => setShowPlanetCollection(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${!showPlanetCollection ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Featured Teams
            </button>
            <button 
              onClick={() => setShowPlanetCollection(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${showPlanetCollection ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              10th Planet Collection
            </button>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {showPlanetCollection ? (
            <motion.div
              key="planet-collection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-[#111] rounded-lg shadow-xl overflow-hidden p-6 mb-8">
                <div className="flex items-center justify-center mb-6">
                  <img 
                    src={planetTShirt} 
                    alt="10th Planet Birmingham Logo" 
                    className="h-32 object-contain"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (img.dataset.fallbackAttempted !== 'true') {
                        img.dataset.fallbackAttempted = 'true';
                        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFwcGFyZWw8L3RleHQ+PC9zdmc+';
                      }
                    }}
                  />
                </div>
                <h3 className="text-white text-2xl font-bold text-center mb-2">10th Planet Birmingham</h3>
                <p className="text-gray-300 text-center mb-8">
                  Custom apparel collection for the elite 10th Planet Jiu-Jitsu academy in Birmingham.
                </p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden group">
                  <div className="bg-[#f9f9f9] p-4 h-64 flex items-center justify-center">
                    <img 
                      src={planetTShirt} 
                      alt="10th Planet T-Shirt" 
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/apparel-placeholder.png';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold">Tri-blend T-Shirt</h4>
                    <p className="text-sm text-gray-600">Soft, comfortable t-shirt with premium 10th Planet branding</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg overflow-hidden group">
                  <div className="bg-[#f9f9f9] p-4 h-64 flex items-center justify-center">
                    <img 
                      src={planetCrewneck} 
                      alt="10th Planet Crewneck" 
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/apparel-placeholder.png';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold">Crewneck Sweatshirt</h4>
                    <p className="text-sm text-gray-600">Premium cotton-blend crewneck for training or casual wear</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg overflow-hidden group">
                  <div className="bg-[#f9f9f9] p-4 h-64 flex items-center justify-center">
                    <img 
                      src={planetSweats} 
                      alt="10th Planet Sweatpants" 
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/apparel-placeholder.png';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold">Jogger Sweatpants</h4>
                    <p className="text-sm text-gray-600">Comfortable training joggers with elastic cuffs and custom branding</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg overflow-hidden group">
                  <div className="bg-[#f9f9f9] p-4 h-64 flex items-center justify-center">
                    <img 
                      src={planetShorts} 
                      alt="10th Planet Shorts" 
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/apparel-placeholder.png';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold">Training Shorts</h4>
                    <p className="text-sm text-gray-600">Quick-dry training shorts perfect for grappling sessions</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-12">
                <Link 
                  href="/custom-apparel" 
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
                >
                  Explore Custom Packages
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="featured-teams"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              <div>
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <p className="font-medium">Custom designs that showcase your team's identity</p>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <p className="font-medium">Premium materials that stand up to intense competition</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <p className="font-medium">Trusted by championship programs across Alabama</p>
                  </div>
                </div>
                <Link 
                  href="/custom-apparel" 
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  View Our Custom Work
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all h-48 md:h-64">
                    <img 
                      src={singletOne} 
                      alt="Wrestling singlet design" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/apparel-placeholder.png';
                      }}
                    />
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all h-48 md:h-64">
                    <img 
                      src={femaleWrestler} 
                      alt="Female wrestler in Rich Habits gear" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/apparel-placeholder.png';
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-4 mt-6">
                  <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all h-48 md:h-64">
                    <img 
                      src={singletTwo} 
                      alt="Team singlet design" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/apparel-placeholder.png';
                      }}
                    />
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all h-48 md:h-64">
                    <img 
                      src={championMoment} 
                      alt="Championship moment in Rich Habits gear" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/apparel-placeholder.png';
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}