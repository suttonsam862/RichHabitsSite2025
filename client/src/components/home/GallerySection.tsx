import { Link } from "wouter";
import { AnimatedUnderline } from "@/components/ui/animated-underline";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";

const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Basketball jerseys"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Track team uniforms"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Football practice gear"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Soccer kits"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1547941126-3d5322b218b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Training session"
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Team huddle"
  }
];

export function GallerySection() {
  return (
    <section className="py-20 bg-[hsl(var(--secondary))]">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-serif font-semibold mb-4 group">
            <AnimatedUnderline>
              Gallery
            </AnimatedUnderline>
          </h2>
          <p className="text-lg mb-12">A showcase of our collections and custom projects.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="gallery-image relative aspect-square"
            >
              <img 
                src={image.src} 
                alt={image.alt} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/gallery" className="inline-block border border-primary py-3 px-8 font-medium tracking-wide hover:bg-primary hover:text-white transition-colors">
            View Full Gallery
          </Link>
        </div>
      </Container>
    </section>
  );
}
