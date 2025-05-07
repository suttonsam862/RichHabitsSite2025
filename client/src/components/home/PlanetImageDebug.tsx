import React from 'react';
import { Container } from "@/components/ui/container";

const PlanetImageDebug: React.FC = () => {
  // Define the image paths
  const imagePaths = [
    {
      name: "T-Shirt",
      path1: "/assets/10th Planet Triblend.png",
      path2: "/10th Planet Triblend.png",
      path3: "/attached_assets/10th Planet Triblend.png"
    },
    {
      name: "Crewneck",
      path1: "/assets/10th Planet Crewneck.png",
      path2: "/10th Planet Crewneck.png",
      path3: "/attached_assets/10th Planet Crewneck.png"
    },
    {
      name: "Sweats",
      path1: "/assets/10th Planet Sweats.png",
      path2: "/10th Planet Sweats.png",
      path3: "/attached_assets/10th Planet Sweats.png"
    },
    {
      name: "Shorts",
      path1: "/assets/10thPlanet Shorts.png",
      path2: "/10thPlanet Shorts.png",
      path3: "/attached_assets/10thPlanet Shorts.png"
    }
  ];

  return (
    <div className="py-12 bg-white">
      <Container>
        <h2 className="text-2xl font-bold mb-8 text-center">Planet Image Debug</h2>
        
        <div className="space-y-8">
          {imagePaths.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Path 1: {item.path1}</p>
                  <div className="h-48 bg-gray-100 flex items-center justify-center border">
                    <img 
                      src={item.path1} 
                      alt={`${item.name} Option 1`} 
                      className="max-h-full"
                      onError={(e) => {
                        console.error(`Failed to load image: ${item.path1}`);
                        e.currentTarget.src = '/images/apparel-placeholder.png';
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Path 2: {item.path2}</p>
                  <div className="h-48 bg-gray-100 flex items-center justify-center border">
                    <img 
                      src={item.path2} 
                      alt={`${item.name} Option 2`} 
                      className="max-h-full"
                      onError={(e) => {
                        console.error(`Failed to load image: ${item.path2}`);
                        e.currentTarget.src = '/images/apparel-placeholder.png';
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Path 3: {item.path3}</p>
                  <div className="h-48 bg-gray-100 flex items-center justify-center border">
                    <img 
                      src={item.path3} 
                      alt={`${item.name} Option 3`} 
                      className="max-h-full"
                      onError={(e) => {
                        console.error(`Failed to load image: ${item.path3}`);
                        e.currentTarget.src = '/images/apparel-placeholder.png';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default PlanetImageDebug;