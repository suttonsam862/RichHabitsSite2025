import { Container } from "@/components/ui/container";
import { AnimatedUnderline } from "@/components/ui/animated-underline";
import { motion } from "framer-motion";

interface CollaborationProps {
  name: string;
  logoSrc?: string;
  website: string;
  description: string;
  isComingSoon?: boolean;
}

const CollaborationCard: React.FC<CollaborationProps> = ({ 
  name, 
  logoSrc, 
  website, 
  description,
  isComingSoon = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white p-6 shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow"
    >
      <div className="flex flex-col items-center mb-6">
        {logoSrc ? (
          <div className="h-24 flex items-center justify-center mb-4">
            <img src={logoSrc} alt={name} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <div className="h-24 w-full flex items-center justify-center mb-4 bg-gray-100 rounded-md">
            <span className="text-gray-400 text-xl font-medium">Coming Soon</span>
          </div>
        )}
        <h4 className="text-xl font-bold text-center">{name}</h4>
      </div>
      
      <p className="text-gray-700 text-center mb-6">{description}</p>
      
      {!isComingSoon ? (
        <div className="text-center">
          <a 
            href={website} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block bg-[hsl(var(--primary))] text-white py-2 px-6 rounded-md font-medium hover:bg-opacity-90 transition-colors"
          >
            Visit Website
          </a>
        </div>
      ) : (
        <div className="text-center">
          <span className="inline-block bg-gray-100 text-gray-500 py-2 px-6 rounded-md font-medium cursor-not-allowed">
            Coming Soon
          </span>
        </div>
      )}
    </motion.div>
  );
};

export function Collaborations() {
  const collaborations: CollaborationProps[] = [
    {
      name: "Fruit Hunters",
      logoSrc: "/images/fruit-hunters-logo.png", 
      website: "https://fruithunters.com/",
      description: "America's premier exotic fruit company partnering with Rich Habits to provide optimal nutrition for our wrestlers and athletes. Exclusive fruit packs available at all Birmingham Slam Camp events."
    },
    {
      name: "Partner 2",
      isComingSoon: true,
      website: "#",
      description: "A future collaboration we're excited to announce soon. Stay tuned for more information about this partnership."
    },
    {
      name: "Partner 3",
      isComingSoon: true,
      website: "#",
      description: "Another exciting partnership in the works. Check back for updates on this collaboration."
    }
  ];

  return (
    <section className="py-20 bg-[hsl(var(--background))]">
      <Container>
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-serif font-semibold mb-4 group">
              <AnimatedUnderline>
                Our Collaborations
              </AnimatedUnderline>
            </h2>
            <p className="text-lg">Partners who help us deliver exceptional experiences and products.</p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collaborations.map((collaboration, index) => (
            <CollaborationCard
              key={index}
              name={collaboration.name}
              logoSrc={collaboration.logoSrc}
              website={collaboration.website}
              description={collaboration.description}
              isComingSoon={collaboration.isComingSoon}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}