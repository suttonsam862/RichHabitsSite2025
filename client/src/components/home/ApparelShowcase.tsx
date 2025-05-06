import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";

export function ApparelShowcase() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Define the apparel items
  const apparelItems = [
    {
      id: 1,
      name: "10th Planet Crewneck",
      imgSrc: "/attached_assets/10th Planet Crewneck.png",
      category: "tops",
      description: "Premium crewneck sweatshirt with 10th Planet Birmingham logo"
    },
    {
      id: 2,
      name: "10th Planet Sweats",
      imgSrc: "/attached_assets/10th Planet Sweats.png",
      category: "bottoms",
      description: "Comfortable jogger sweatpants with custom 10th Planet branding"
    },
    {
      id: 3,
      name: "10th Planet T-Shirt",
      imgSrc: "/attached_assets/10th Planet Triblend.png",
      category: "tops",
      description: "Soft tri-blend t-shirt featuring the 10th Planet Birmingham logo"
    },
    {
      id: 4,
      name: "10th Planet Shorts",
      imgSrc: "/attached_assets/10thPlanet Shorts.png",
      category: "bottoms",
      description: "Training shorts with 10th Planet branding for maximum performance"
    }
  ];
  
  // Filter items based on selected category
  const filteredItems = selectedCategory === "all" 
    ? apparelItems 
    : apparelItems.filter(item => item.category === selectedCategory);
  
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Custom Team Apparel</h2>
            <p className="text-lg max-w-3xl mx-auto">
              From individual items to complete team packages, we create high-quality custom apparel for athletes and teams.
            </p>
          </div>
          
          {/* Category filter tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === "all" ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
              >
                All Items
              </button>
              <button
                onClick={() => setSelectedCategory("tops")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === "tops" ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
              >
                Tops
              </button>
              <button
                onClick={() => setSelectedCategory("bottoms")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === "bottoms" ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
              >
                Bottoms
              </button>
            </div>
          </div>
          
          {/* Apparel grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <div className="h-64 overflow-hidden relative bg-gray-100">
                  <img 
                    src={item.imgSrc} 
                    alt={item.name}
                    className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/product-placeholder.png";
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <a 
              href="/custom-apparel"
              className="inline-block bg-primary hover:bg-opacity-90 text-white font-medium py-3 px-8 rounded transition-colors"
            >
              View Custom Apparel Options
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}