import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Image paths with baseUrl for production reliability
const baseUrl = window.location.origin;
const homewoodSinglet = `${baseUrl}/designs/brooksfinal.png`;
const mortimerJordanSinglet = `${baseUrl}/designs/bragg.png`;
const clayChalkvilleSinglet = `${baseUrl}/designs/athens.png`;

interface Team {
  name: string;
  description: string;
  image: string;
  products: string[];
}

export function FeaturedTeams() {
  const teams: Team[] = [
    {
      name: "Homewood High School Wrestling",
      description: "Homewood Patriots Wrestling team features custom Rich Habits singlets and team apparel, showcasing our commitment to quality and performance in high school athletics.",
      image: homewoodSinglet,
      products: ["Custom Singlets", "Team Shirts", "Quarter-Zips", "Warm-up Gear"]
    },
    {
      name: "Mortimer Jordan High School Wrestling",
      description: "Mortimer Jordan High School's wrestling program trusts Rich Habits for their custom singlets featuring lightning design and school branding elements.",
      image: mortimerJordanSinglet,
      products: ["Lightning Singlets", "Team Apparel", "Custom Headgear", "Coaching Gear"]
    },
    {
      name: "Clay-Chalkville Wrestling",
      description: "Clay-Chalkville's wrestling program features high-quality Rich Habits custom apparel, demonstrating our commitment to performance and team identity in the competitive arena.",
      image: clayChalkvilleSinglet,
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
              <div className="relative h-64 overflow-hidden bg-white flex items-center justify-center p-4">
                <img 
                  src={team.image} 
                  alt={team.name} 
                  className="h-full object-contain transform hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `${baseUrl}/designs/bragg.png`;
                  }}
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{team.description}</p>
                
                {/* Coach testimonials removed as requested */}

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