import { Link } from "wouter";
import { AnimatedUnderline } from "@/components/ui/animated-underline";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";

const collections = [
  {
    id: 1,
    title: "Performance Collection",
    description: "Technical fabrics for intense training",
    image: "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    link: "/shop?collection=performance"
  },
  {
    id: 2,
    title: "Essentials Line",
    description: "Minimal design for everyday athletes",
    image: "https://images.unsplash.com/photo-1483721310020-03333e577078?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    link: "/shop?collection=essentials"
  },
  {
    id: 3,
    title: "Competition Series",
    description: "Elite gear for peak performance",
    image: "https://images.unsplash.com/photo-1616257460024-b12a0c4c8333?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    link: "/shop?collection=competition"
  }
];

export function FeaturedCollections() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <h2 className="text-3xl font-serif font-semibold mb-12 group">
          <AnimatedUnderline>
            Featured Collections
          </AnimatedUnderline>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="product-card bg-white"
            >
              <Link href={collection.link} className="block group">
                <div className="relative overflow-hidden mb-4">
                  <img 
                    src={collection.image} 
                    alt={collection.title} 
                    className="w-full h-96 object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-lg font-medium mb-1">{collection.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{collection.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/shop" className="inline-block border border-primary py-3 px-8 font-medium tracking-wide hover:bg-primary hover:text-white transition-colors">
            View All Collections
          </Link>
        </div>
      </Container>
    </section>
  );
}
