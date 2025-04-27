import { useState } from 'react';
import { Dialog, DialogContent, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Import images
import homewoodSinglet from "@assets/DSC09354.JPG";
import jordanSinglet from "@assets/DSC09491.JPG";
import homewoodWrestler from "@assets/DSC09374--.JPG";
import jordanWrestler from "@assets/DSC09488.JPG";
import homewoodTshirt from "@assets/DSC09273.JPG";
import wrestlerAction1 from "@assets/DSC00521--.JPG";
import wrestlerAction2 from "@assets/DSC08657--.JPG";
import wrestlerAction3 from "@assets/DSC08631.JPG";
import wrestlerAction4 from "@assets/DSC08612.JPG";
import varsityMatch from "@assets/DSC08615.JPG";
import winnerShot from "@assets/DSC07337--.jpg";
import richHabitsCoach from "@assets/DSC09299.JPG";
import richHabitsCoach2 from "@assets/DSC09295--.JPG";
import wrestlerClose from "@assets/DSC09353.JPG";
import femaleWrestler1 from "@assets/DSC02187--.jpg";
import femaleWrestler2 from "@assets/DSC02190--.jpg";
import rhShirt from "@assets/DSC00423.JPG";

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