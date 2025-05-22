import { motion } from "framer-motion";
import { Link } from "wouter";
import { Product } from "@/types/shopify";
import { ResponsiveImage } from "@/components/ui/responsive-image";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="product-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <Link href={`/shop/product/${product.handle}`} className="block group">
        <div className="relative overflow-hidden aspect-square bg-gray-100">
          <ResponsiveImage 
            src={product.image || '/images/product-placeholder.png'} 
            alt={product.title} 
            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
            placeholderSrc="/images/product-placeholder.png"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          
          {!product.availableForSale && (
            <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs font-medium px-2 py-1 m-2 rounded">
              Out of Stock
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-primary">
              {product.price}
            </span>
            
            {product.color && (
              <span className="text-sm text-gray-500">
                {product.color}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}