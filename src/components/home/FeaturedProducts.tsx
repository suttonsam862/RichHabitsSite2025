import { Link } from "wouter";
import { AnimatedUnderline } from "@/components/ui/animated-underline";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedProducts } from "@/lib/shopify";
import { Product } from "@/types/shopify";

// Define type for the static products
interface StaticProduct {
  id: string;
  title: string;
  handle: string;
  color?: string;
  price: string;
  image: string | null;
  imageAlt?: string | null;
  availableForSale: boolean;
  variants: any[];
}

const staticProducts: StaticProduct[] = [
  {
    id: "prod_1",
    title: "Performance Training Tee",
    handle: "performance-training-tee",
    color: "Black",
    price: "$45.00",
    image: "https://images.unsplash.com/photo-1565693413579-8a73ffa6de14?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    imageAlt: "Performance Training Tee",
    availableForSale: true,
    variants: []
  },
  {
    id: "prod_2",
    title: "Minimal Track Shorts",
    handle: "minimal-track-shorts",
    color: "Slate Gray",
    price: "$38.00",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    imageAlt: "Minimal Track Shorts",
    availableForSale: true,
    variants: []
  },
  {
    id: "prod_3",
    title: "Premium Workout Hoodie",
    handle: "premium-workout-hoodie",
    color: "Deep Navy",
    price: "$75.00",
    image: "https://images.unsplash.com/photo-1618354691249-18772bbac3a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    imageAlt: "Premium Workout Hoodie",
    availableForSale: true,
    variants: []
  },
  {
    id: "prod_4",
    title: "Tech Compression Leggings",
    handle: "tech-compression-leggings",
    color: "Black",
    price: "$65.00",
    image: "https://images.unsplash.com/photo-1525171254930-643fc658b64e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    imageAlt: "Tech Compression Leggings",
    availableForSale: true,
    variants: []
  }
];

export function FeaturedProducts() {
  const { data: shopifyProducts, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products/featured'],
    staleTime: 60 * 1000, // 1 minute
  });

  // Use static products if data is loading or there was an error
  const products: (Product | StaticProduct)[] = shopifyProducts || staticProducts;

  return (
    <section className="py-20 bg-white">
      <Container>
        <h2 className="text-3xl font-serif font-semibold mb-12 group">
          <AnimatedUnderline>
            Featured Products
          </AnimatedUnderline>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: Product | StaticProduct, index: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="product-card bg-white"
            >
              <Link href={`/shop/product/${product.handle}`} className="block group">
                <div className="relative overflow-hidden mb-4 bg-gray-100">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-80 object-cover transform transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/product-placeholder.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400 text-sm">Image not available</span>
                    </div>
                  )}
                </div>
                <h3 className="text-base font-medium mb-1">{product.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.color}</p>
                <p className="font-medium">{product.price}</p>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/shop" className="inline-block bg-primary text-white py-3 px-8 font-medium tracking-wide hover:bg-opacity-90 transition-colors">
            Shop All Products
          </Link>
        </div>
      </Container>
    </section>
  );
}
