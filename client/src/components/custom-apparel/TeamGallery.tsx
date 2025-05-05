import { Dialog, DialogContent, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Design image paths - using actual designs instead of wrestler photos
const design1 = "/designs/athens.png";
const design2 = "/designs/brooksfinal.png";
const design3 = "/designs/bragg.png";
const design4 = "/designs/canenation.png";
const design5 = "/designs/elevate.png";
const design6 = "/designs/ltds.png";
const design7 = "/designs/classicrashguard.png";
const design8 = "/designs/bluerashguard.png";
const design9 = "/designs/blackrashguard.png";
const design10 = "/designs/nopaws.png";
const design11 = "/designs/deathsquad.png";
const design12 = "/designs/nickpolo.png";

interface GalleryImage {
  src: string;
  alt: string;
  team?: string;
  description?: string;
}

export function TeamGallery() {
  // State not needed with Dialog component

  const galleryImages: GalleryImage[] = [
    { 
      src: design1, 
      alt: "Athens Wrestling Team Design", 
      team: "Athens Wrestling", 
      description: "Custom singlet design with Athens school colors and branding" 
    },
    { 
      src: design2, 
      alt: "Brooks High School Wrestling Design", 
      team: "Brooks High School",
      description: "Custom singlet with Brooks branding and Rich Habits quality" 
    },
    { 
      src: design3, 
      alt: "Bragg Wrestling Club Design", 
      team: "Bragg Wrestling Club",
      description: "Elite design for championship performance" 
    },
    { 
      src: design4, 
      alt: "Cane Nation Wrestling Design", 
      team: "Cane Nation Wrestling",
      description: "Bold team branding with premium materials" 
    },
    { 
      src: design5, 
      alt: "Elevate Wrestling Design", 
      team: "Elevate Wrestling Academy",
      description: "Performance-focused design for competitive athletes" 
    },
    { 
      src: design6, 
      alt: "LTDS Team Apparel Design", 
      team: "LTDS Wrestling",
      description: "Team design with custom branding elements" 
    },
    { 
      src: design7, 
      alt: "Classic Rashguard Design", 
      team: "10th Planet Birmingham",
      description: "Classic rashguard design with technical performance features" 
    },
    { 
      src: design8, 
      alt: "Blue Rashguard Design", 
      team: "Competition Training Gear",
      description: "High-performance training apparel in team colors" 
    },
    { 
      src: design9, 
      alt: "Black Rashguard Design", 
      team: "Rich Habits Premium Line",
      description: "Premium competition-ready apparel with custom detailing" 
    },
    { 
      src: design10, 
      alt: "No Paws Ranburne Design", 
      team: "Ranburne Wrestling",
      description: "Custom team design with mascot branding" 
    },
    { 
      src: design11, 
      alt: "Death Squad Design", 
      team: "Death Squad Wrestling Club",
      description: "Bold custom design for elite athletes" 
    },
    { 
      src: design12, 
      alt: "Nick Polo Design", 
      team: "Collegiate Style Gear",
      description: "Clean, professional design for wrestling programs" 
    }
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Custom Design Portfolio</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryImages.map((image, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <div 
                  className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer bg-white flex items-center justify-center p-4"
                  style={{ aspectRatio: '3/4' }}
                >
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="h-full object-contain hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/designs/bragg.png';
                    }}
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
                    <div className="relative aspect-square md:aspect-auto bg-white flex items-center justify-center p-4 rounded-md">
                      <img 
                        src={image.src} 
                        alt={image.alt} 
                        className="h-full object-contain rounded-md"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/designs/bragg.png';
                        }}
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