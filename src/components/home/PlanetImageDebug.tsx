import React from 'react';
import { Container } from "@/components/ui/container";

const PlanetImageDebug: React.FC = () => {
  // Testing different image paths - focusing on /assets/ folder paths which work
  const imagePaths = [
    {
      name: "T-Shirt",
      path1: "/assets/10th%20Planet%20Triblend.png",
      path2: "/assets/10th%20Planet%20Triblend.png?v=1",
      path3: "/assets/10th%20Planet%20Triblend.png?v=2",
      originalFilename: "10th Planet Triblend.png"
    },
    {
      name: "Crewneck",
      path1: "/assets/10th%20Planet%20Crewneck.png",
      path2: "/assets/10th%20Planet%20Crewneck.png?v=1",
      path3: "/assets/10th%20Planet%20Crewneck.png?v=2",
      originalFilename: "10th Planet Crewneck.png"
    },
    {
      name: "Sweats",
      path1: "/assets/10th%20Planet%20Sweats.png",
      path2: "/assets/10th%20Planet%20Sweats.png?v=1",
      path3: "/assets/10th%20Planet%20Sweats.png?v=2",
      originalFilename: "10th Planet Sweats.png"
    },
    {
      name: "Shorts",
      path1: "/assets/10thPlanet%20Shorts.png",
      path2: "/assets/10thPlanet%20Shorts.png?v=1",
      path3: "/assets/10thPlanet%20Shorts.png?v=2",
      originalFilename: "10thPlanet Shorts.png"
    }
  ];

  return (
    <div className="py-12 bg-white">
      <Container>
        <h2 className="text-2xl font-bold mb-8 text-center">Planet Image Debug</h2>
        
        <div className="bg-blue-50 p-4 mb-8 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium mb-2">Debugging Information</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Images with spaces in filenames need properly encoded URLs</li>
            <li>Server route is looking at: /home/runner/workspace/attached_assets/[filename]</li>
            <li>Looking for these files in attached_assets folder:</li>
            {imagePaths.map((item, index) => (
              <li key={index} className="text-sm font-mono">{item.originalFilename}</li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-8">
          {imagePaths.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{item.name} - Original filename: <span className="font-mono text-gray-600">{item.originalFilename}</span></h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Path 1: <span className="font-mono text-xs">{item.path1}</span></p>
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
                  <p className="text-sm font-medium">Path 2: <span className="font-mono text-xs">{item.path2}</span></p>
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
                  <p className="text-sm font-medium">Path 3: <span className="font-mono text-xs">{item.path3}</span></p>
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