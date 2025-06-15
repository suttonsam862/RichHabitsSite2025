import { useState } from "react";
import Container from "../components/layout/Container";
import { AnimatedUnderline } from "@/components/ui/animated-underline";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Helmet } from "react-helmet";

// Gallery items
const galleryItems = [
  {
    id: 1,
    title: "Performance Collection 2023",
    category: "Collection",
    image: "https://images.unsplash.com/photo-1565693413579-8a73ffa6de14?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    year: "2023"
  },
  {
    id: 2,
    title: "Metro High School Basketball Uniforms",
    category: "Custom Team Apparel",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    year: "2023"
  },
  {
    id: 3,
    title: "Essentials Collection",
    category: "Collection",
    image: "https://images.unsplash.com/photo-1483721310020-03333e577078?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    year: "2022"
  },
  {
    id: 4,
    title: "Track Team Uniforms",
    category: "Custom Team Apparel",
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    year: "2022"
  },
  {
    id: 5,
    title: "Football Practice Gear",
    category: "Custom Team Apparel",
    image: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    year: "2023"
  },
  {
    id: 6,
    title: "Competition Series",
    category: "Collection",
    image: "https://images.unsplash.com/photo-1616257460024-b12a0c4c8333?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    year: "2022"
  },
  {
    id: 7,
    title: "Soccer Kits",
    category: "Custom Team Apparel",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    year: "2022"
  },
  {
    id: 8,
    title: "Training Session Apparel",
    category: "Collection",
    image: "https://images.unsplash.com/photo-1547941126-3d5322b218b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    year: "2023"
  },
  {
    id: 9,
    title: "Team Huddle Gear",
    category: "Custom Team Apparel",
    image: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    year: "2021"
  },
  {
    id: 10,
    title: "Minimal Track Shorts",
    category: "Collection",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    year: "2023"
  },
  {
    id: 11,
    title: "Premium Workout Hoodie",
    category: "Collection",
    image: "https://images.unsplash.com/photo-1618354691249-18772bbac3a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    year: "2022"
  },
  {
    id: 12,
    title: "Tech Compression Leggings",
    category: "Collection",
    image: "https://images.unsplash.com/photo-1525171254930-643fc658b64e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    year: "2023"
  }
];

export default function Gallery() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  
  const categories = Array.from(new Set(galleryItems.map(item => item.category)));
  const years = Array.from(new Set(galleryItems.map(item => item.year))).sort((a, b) => b.localeCompare(a));
  
  const filteredItems = galleryItems.filter(item => {
    if (selectedFilter && item.category !== selectedFilter) return false;
    if (selectedYear && item.year !== selectedYear) return false;
    return true;
  });
  
  const openLightbox = (item: any) => {
    setSelectedImage(item);
  };
  
  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <Helmet>
        <title>Gallery | Rich Habits</title>
        <meta name="description" content="Explore our gallery of collections and custom projects showcasing premium athletic apparel designs." />
      </Helmet>
      
      <div className="bg-white py-16">
        <Container className="mb-12">
          <h1 className="text-4xl font-serif font-semibold mb-6">Gallery</h1>
          <p className="text-lg mb-8">A showcase of our collections and custom projects.</p>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div>
              <h3 className="text-sm font-medium mb-2">Category:</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded ${!selectedFilter ? 'bg-primary text-white' : 'bg-[hsl(var(--secondary))] hover:bg-gray-200'}`}
                  onClick={() => setSelectedFilter(null)}
                >
                  All
                </button>
                
                {categories.map(category => (
                  <button
                    key={category}
                    className={`px-3 py-1 text-sm rounded ${selectedFilter === category ? 'bg-primary text-white' : 'bg-[hsl(var(--secondary))] hover:bg-gray-200'}`}
                    onClick={() => setSelectedFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Year:</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded ${!selectedYear ? 'bg-primary text-white' : 'bg-[hsl(var(--secondary))] hover:bg-gray-200'}`}
                  onClick={() => setSelectedYear(null)}
                >
                  All
                </button>
                
                {years.map(year => (
                  <button
                    key={year}
                    className={`px-3 py-1 text-sm rounded ${selectedYear === year ? 'bg-primary text-white' : 'bg-[hsl(var(--secondary))] hover:bg-gray-200'}`}
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Container>
        
        {/* Gallery Grid */}
        <div className="bg-[hsl(var(--secondary))] py-12">
          <Container>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg">No items match your filter criteria.</p>
                <button
                  className="mt-4 px-4 py-2 bg-primary text-white hover:bg-opacity-90 transition-colors"
                  onClick={() => {
                    setSelectedFilter(null);
                    setSelectedYear(null);
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="gallery-image relative aspect-square cursor-pointer"
                    onClick={() => openLightbox(item)}
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-300 flex items-end">
                      <div className="p-4 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 w-full">
                        <h3 className="text-lg font-medium">{item.title}</h3>
                        <p className="text-sm">{item.category} | {item.year}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Container>
        </div>
      </div>
      
      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={closeLightbox}>
        <DialogContent className="sm:max-w-[800px] p-0 bg-transparent border-none shadow-none">
          {selectedImage && (
            <div className="relative bg-white">
              <img 
                src={selectedImage.image} 
                alt={selectedImage.title} 
                className="w-full max-h-[80vh] object-contain"
              />
              <div className="p-4 bg-white">
                <h3 className="text-xl font-medium">{selectedImage.title}</h3>
                <p className="text-sm text-gray-600">{selectedImage.category} | {selectedImage.year}</p>
              </div>
              <button 
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md"
                onClick={closeLightbox}
              >
                <i className="icon ion-md-close text-xl"></i>
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
