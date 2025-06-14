import { Container } from "@/components/ui/container";
import { AnimatedUnderline } from "@/components/ui/animated-underline";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Collaboration } from "@shared/schema";
import { GiPineapple } from "react-icons/gi";

interface CollaborationProps {
  name: string;
  logoSrc?: string;
  website: string;
  description: string;
  isComingSoon?: boolean;
}

// Function to fetch collaborations from the API
async function fetchCollaborations() {
  const response = await apiRequest("GET", "/api/collaborations");
  const data = await response.json();
  return data as Collaboration[];
}

// Fruit data for the Fruit Hunters collaboration - using placeholder SVGs for production safety
const fruitData = [
  { name: "Jackfruit", imageSrc: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI0ZGQjE0NCIvPjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkpGPC90ZXh0Pjwvc3ZnPg==" },
  { name: "Black Sapote", imageSrc: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzQzNDA0QyIvPjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CUzwvdGV4dD48L3N2Zz4=" },
  { name: "Durian", imageSrc: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI0Y1RjVEQyIvPjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkQ8L3RleHQ+PC9zdmc+" },
  { name: "Papaya", imageSrc: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI0ZGOTUwMCIvPjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QPC90ZXh0Pjwvc3ZnPg==" },
  { name: "Star Fruit", imageSrc: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI0ZGRUQwMCIvPjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNGPC90ZXh0Pjwvc3ZnPg==" },
  { name: "Cocoa", imageSrc: "/images/fruits/cocoa.png" }
];

const FruitGallery = () => {
  return (
    <div className="mt-4 mb-6">
      <img 
        src="/images/fruits/fruit-gallery.png" 
        alt="Exotic fruits from Fruit Hunters" 
        className="w-full rounded-lg shadow-md"
        onError={(e) => {
  const img = e.target as HTMLImageElement;
  if (img.dataset.fallbackAttempted !== 'true') {
    img.dataset.fallbackAttempted = 'true';
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
}} {
        const img = e.target as HTMLImageElement;
        if (img.dataset.fallbackAttempted !== 'true') {
          img.dataset.fallbackAttempted = 'true';
          img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
        }
      }}}
      />
    </div>
  );
};

const CollaborationCard: React.FC<CollaborationProps> = ({ 
  name, 
  logoSrc, 
  website, 
  description,
  isComingSoon = false
}) => {
  const isFruitHunters = name === 'Fruit Hunters';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white p-6 shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow relative overflow-visible"
    >
      <div className="flex flex-col items-center mb-6">
        {/* Glowing neon fruit icon for Fruit Hunters */}
        {isFruitHunters && (
          <div className="absolute -top-10 -right-10 rotate-12 neon-fruit-icon z-10">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 10, scale: 1.1 }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut" 
              }}
              className="relative"
            >
              {/* Base icon */}
              <GiPineapple size={65} className="text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
              
              {/* Outer glow */}
              <div className="absolute top-0 left-0 right-0 bottom-0 opacity-60 animate-pulse">
                <GiPineapple size={65} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
              </div>
              
              {/* Inner glow */}
              <div className="absolute top-0 left-0 right-0 bottom-0 opacity-80">
                <GiPineapple size={65} className="text-yellow-200 filter blur-[1px]" />
              </div>
              
              {/* Highlight */}
              <div className="absolute -top-1 -left-1 opacity-40 animate-pulse" 
                  style={{ animationDuration: '1.5s' }}>
                <GiPineapple size={67} className="text-white filter blur-[2px]" />
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Special case for Fruit Hunters logo */}
        {isFruitHunters ? (
          <div className="h-24 flex items-center justify-center mb-4">
            <img 
              src="/images/fruit-hunters-logo-black.svg"
              alt="Fruit Hunters Logo" 
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
  const img = e.target as HTMLImageElement;
  if (img.dataset.fallbackAttempted !== 'true') {
    img.dataset.fallbackAttempted = 'true';
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
}} {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMyMjIiLz48dGV4dCB4PSI2MCIgeT0iMjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZydWl0IEh1bnRlcnM8L3RleHQ+PC9zdmc+';
              }}
            />
          </div>
        ) : logoSrc ? (
          <div className="h-24 flex items-center justify-center mb-4">
            <img 
              src={logoSrc} 
              alt={name} 
              className="max-h-full max-w-full object-contain" 
              onError={(e) => {
  const img = e.target as HTMLImageElement;
  if (img.dataset.fallbackAttempted !== 'true') {
    img.dataset.fallbackAttempted = 'true';
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
}} {
        const img = e.target as HTMLImageElement;
        if (img.dataset.fallbackAttempted !== 'true') {
          img.dataset.fallbackAttempted = 'true';
          img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
        }
      }}}
            />
          </div>
        ) : (
          <div className="h-24 w-full flex items-center justify-center mb-4 bg-gray-100 rounded-md">
            <span className="text-gray-400 text-xl font-medium">Coming Soon</span>
          </div>
        )}
        <h4 className="text-xl font-bold text-center">{name}</h4>
      </div>
      
      <p className="text-gray-700 text-center mb-3">
        {isFruitHunters 
          ? "America's premier exotic fruit company partnering with Rich Habits to provide optimal nutrition for our wrestlers and athletes. Exclusive fruit packs available at all Birmingham Slam Camp events."
          : description
        }
      </p>
      
      {isFruitHunters && <FruitGallery />}
      
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
  // Fetch collaborations data from the API
  const { data: apiCollaborations, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/collaborations'],
    queryFn: fetchCollaborations
  });

  // Fallback collaborations data to use if API fails or while loading
  const fallbackCollaborations: CollaborationProps[] = [
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

  // Map API data to component props when available
  const displayCollaborations = apiCollaborations?.map(collab => ({
    name: collab.name,
    logoSrc: collab.logoSrc || undefined,
    website: collab.website,
    description: collab.description,
    isComingSoon: collab.isComingSoon || false
  })) || fallbackCollaborations;

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
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">
            <p>There was an error loading our collaborations. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayCollaborations.map((collaboration, index) => (
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
        )}
      </Container>
    </section>
  );
}