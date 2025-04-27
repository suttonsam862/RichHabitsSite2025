import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";

// Image paths
const homewoodSinglet = "/images/DSC09354.JPG";
const jordanSinglet = "/images/DSC09491.JPG";
const femaleWrestler = "/images/DSC02187--.jpg";
const winnerShot = "/images/DSC07337--.jpg";

export function CustomApparelShowcase() {
  return (
    <section className="py-16 bg-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Championship-Quality Custom Gear</h2>
            <p className="text-gray-600 mb-6">
              Our custom athletic apparel is worn by champions across Alabama and beyond. From singlets to team shirts, 
              Rich Habits delivers premium quality gear designed for performance and built to last.
            </p>
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
                  src={homewoodSinglet} 
                  alt="Homewood Wrestling singlet" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all h-48 md:h-64">
                <img 
                  src={femaleWrestler} 
                  alt="Female wrestler in Rich Habits gear" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 mt-6">
              <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all h-48 md:h-64">
                <img 
                  src={jordanSinglet} 
                  alt="Jordan High School singlet" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all h-48 md:h-64">
                <img 
                  src={winnerShot} 
                  alt="Championship moment in Rich Habits gear" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}