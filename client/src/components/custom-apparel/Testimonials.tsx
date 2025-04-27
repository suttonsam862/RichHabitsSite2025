import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

// Import coaching staff images
import coachImage from "@assets/DSC09299.JPG";
import coachImage2 from "@assets/DSC09295--.JPG";

interface Testimonial {
  quote: string;
  author: string;
  position: string;
  image?: string;
}

export function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      quote: "The quality of Rich Habits apparel is exceptional. From custom singlets to team shirts, everything exceeds expectations. Our athletes love the comfort and durability during intense competition.",
      author: "Coach Michael Wilson",
      position: "Head Wrestling Coach, Homewood High School",
      image: coachImage
    },
    {
      quote: "Working with Rich Habits has transformed our team's identity. The custom designs perfectly represent our program's values, and the quality stands up to the toughest competitions.",
      author: "Coach James Thompson",
      position: "Wrestling Director, Jordan High School",
      image: coachImage2
    },
    {
      quote: "As a coach with decades of experience, I've never worked with a more responsive and quality-focused apparel company. Rich Habits understands the needs of wrestlers and delivers gear that performs.",
      author: "Coach Robert Davis",
      position: "Wrestling Director, AHSAA State Championships"
    },
    {
      quote: "The custom singlets from Rich Habits have become a source of pride for our team. The attention to detail in the designs and the quality of materials are unmatched in the industry.",
      author: "Sarah Johnson",
      position: "Athletic Director, Montgomery High School"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Coaches Say</h2>
          <p className="text-gray-600">Don't just take our word for it. Hear from the coaches and athletic directors who trust Rich Habits for their team's apparel needs.</p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 p-2">
                <div className="h-full">
                  <Card className="h-full flex flex-col">
                    <CardContent className="p-6 flex-grow flex flex-col">
                      <div className="mb-4 text-primary">
                        <Quote size={32} />
                      </div>
                      <p className="italic text-gray-700 mb-6 flex-grow">{testimonial.quote}</p>
                      <div className="flex items-center mt-auto">
                        {testimonial.image ? (
                          <div className="w-12 h-12 mr-4 overflow-hidden rounded-full">
                            <img 
                              src={testimonial.image} 
                              alt={testimonial.author} 
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 mr-4 bg-primary text-white rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold">{testimonial.author[0]}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{testimonial.author}</p>
                          <p className="text-sm text-gray-600">{testimonial.position}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8">
            <CarouselPrevious className="relative mr-2 inline-block" />
            <CarouselNext className="relative ml-2 inline-block" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}