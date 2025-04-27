import { useState } from 'react';
import { Dialog, DialogContent, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Image paths
const homewoodSinglet = "/images/DSC09354.JPG";
const jordanSinglet = "/images/DSC09491.JPG";
const homewoodWrestler = "/images/DSC09374--.JPG";
const jordanWrestler = "/images/DSC09488.JPG";
const homewoodTshirt = "/images/DSC09273.JPG";
const wrestlerAction1 = "/images/DSC00521--.JPG";
const wrestlerAction2 = "/images/DSC08657--.JPG";
const wrestlerAction3 = "/images/DSC08631.JPG";
const wrestlerAction4 = "/images/DSC08612.JPG";
const varsityMatch = "/images/DSC08615.JPG";
const winnerShot = "/images/DSC07337--.jpg";
const richHabitsCoach = "/images/DSC09299.JPG";
const richHabitsCoach2 = "/images/DSC09295--.JPG";
const wrestlerClose = "/images/DSC09353.JPG";
const femaleWrestler1 = "/images/DSC02187--.jpg";
const femaleWrestler2 = "/images/DSC02190--.jpg";
const rhShirt = "/images/DSC00423.JPG";

interface GalleryImage {
  src: string;
  alt: string;
  team?: string;
  description?: string;
}

export function TeamGallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const galleryImages: GalleryImage[] = [
    { 
      src: homewoodSinglet, 
      alt: "Homewood High School wrestler in Rich Habits singlet", 
      team: "Homewood High School", 
      description: "Custom red singlet with RH branding and Homewood logo" 
    },
    { 
      src: jordanSinglet, 
      alt: "Jordan High School wrestler in Rich Habits singlet", 
      team: "Jordan High School",
      description: "Custom black and blue singlet with lightning design and RH branding" 
    },
    { 
      src: femaleWrestler1, 
      alt: "Female wrestler in competition", 
      description: "Rich Habits custom quarter-zip worn during competition" 
    },
    { 
      src: femaleWrestler2, 
      alt: "Female wrestler in Rich Habits quarter-zip", 
      description: "Quality athletic wear designed for performance and comfort" 
    },
    { 
      src: wrestlerAction1, 
      alt: "Wrestler in action with Rich Habits singlet", 
      team: "Rich Habits team wear",
      description: "Our singlets in championship competition" 
    },
    { 
      src: homewoodWrestler, 
      alt: "Homewood wrestler in Rich Habits singlet", 
      team: "Homewood High School" 
    },
    { 
      src: homewoodTshirt, 
      alt: "Homewood Wrestling team shirt with RH logo", 
      team: "Homewood High School",
      description: "Custom team shirts with Rich Habits quality" 
    },
    { 
      src: winnerShot, 
      alt: "Winning wrestler in Rich Habits singlet", 
      team: "Jordan High School",
      description: "Championship moment in our custom gear" 
    },
    { 
      src: richHabitsCoach, 
      alt: "Coach wearing Rich Habits shirt", 
      description: "Coaches trust our premium quality apparel" 
    },
    { 
      src: wrestlerAction2, 
      alt: "Wrestling match with Rich Habits singlet", 
      description: "Performance gear for championship athletes" 
    },
    { 
      src: wrestlerAction3, 
      alt: "Wrestlers in competition", 
      description: "Our gear stands up to the toughest competition" 
    },
    { 
      src: rhShirt, 
      alt: "Rich Habits t-shirt", 
      description: "Premium team apparel with Rich Habits quality" 
    }
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Custom Team Gear in Action</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryImages.map((image, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <div 
                  className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer"
                  style={{ aspectRatio: '3/4' }}
                >
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {image.team && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-white font-medium">{image.team}</p>
                    </div>
                  )}
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl h-auto">
                <div className="relative h-full">
                  <DialogClose className="absolute right-4 top-4 z-10">
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative aspect-square md:aspect-auto">
                      <img 
                        src={image.src} 
                        alt={image.alt} 
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="text-xl font-bold mb-2">{image.team || "Rich Habits Custom Apparel"}</h3>
                      <p className="text-gray-600 mb-4">{image.description || "Premium athletic wear designed for champions."}</p>
                      <p className="text-sm text-gray-500">{image.alt}</p>
                      <div className="mt-6">
                        <a 
                          href="#custom-form" 
                          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                        >
                          Request Similar Design
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </div>
  );
}