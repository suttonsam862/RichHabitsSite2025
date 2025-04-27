import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Image paths
const homewoodSinglet = "/images/DSC09354.JPG";
const jordanSinglet = "/images/DSC09491.JPG";
const wrestlerAction1 = "/images/DSC08631.JPG";
const richHabitsCoach = "/images/DSC09299.JPG";

interface Team {
  name: string;
  description: string;
  image: string;
  testimonial?: {
    quote: string;
    author: string;
    position: string;
  };
  products: string[];
}

export function FeaturedTeams() {
  const teams: Team[] = [
    {
      name: "Homewood High School Wrestling",
      description: "Homewood Patriots Wrestling team features custom Rich Habits singlets and team apparel, showcasing our commitment to quality and performance in high school athletics.",
      image: homewoodSinglet,
      testimonial: {
        quote: "The quality of Rich Habits singlets has given our team confidence on the mat. The durability and comfort are unmatched.",
        author: "Coach Wilson",
        position: "Head Wrestling Coach, Homewood High School"
      },
      products: ["Custom Singlets", "Team Shirts", "Quarter-Zips", "Warm-up Gear"]
    },
    {
      name: "Jordan High School Wrestling",
      description: "Jordan High School's wrestling program trusts Rich Habits for their custom singlets featuring lightning design and school branding elements.",
      image: jordanSinglet,
      testimonial: {
        quote: "Our athletes love the unique designs and premium materials. Rich Habits delivers championship-quality gear.",
        author: "Coach Thompson",
        position: "Wrestling Director, Jordan High School"
      },
      products: ["Lightning Singlets", "Team Apparel", "Custom Headgear", "Coaching Gear"]
    },
    {
      name: "Alabama State Championship Teams",
      description: "Multiple teams at the Alabama High School Athletic Association state championships compete in Rich Habits custom apparel, demonstrating our leadership in wrestling gear.",
      image: wrestlerAction1,
      testimonial: {
        quote: "Rich Habits has transformed how we approach team apparel. From design to delivery, they exceed expectations.",
        author: "State Association Director",
        position: "AHSAA Wrestling"
      },
      products: ["Competition Singlets", "Performance Shirts", "Custom Team Packages"]
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Teams</h2>
          <p className="text-gray-600">Elite programs across Alabama choose Rich Habits for their custom athletic apparel. Here are some of the championship teams we're proud to outfit.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teams.map((team, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={team.image} 
                  alt={team.name} 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{team.description}</p>
                
                {team.testimonial && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md border-l-4 border-primary italic text-sm">
                    <p className="mb-2">"{team.testimonial.quote}"</p>
                    <p className="text-right text-xs font-medium not-italic">
                      — {team.testimonial.author}, {team.testimonial.position}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {team.products.map((product, idx) => (
                    <Badge key={idx} variant="outline" className="bg-gray-100">{product}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <a 
            href="#custom-form" 
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Request Team Package
          </a>
        </div>
      </div>
    </section>
  );
}