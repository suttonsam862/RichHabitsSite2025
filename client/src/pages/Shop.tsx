import React from "react";
import { motion } from "framer-motion";

// Sample product data
const products = [
  {
    id: 1,
    name: "Performance Track Jacket",
    category: "Outerwear",
    price: "$85",
    image: "/images/wrestlers/DSC09491.JPG"
  },
  {
    id: 2,
    name: "Competition Singlet",
    category: "Competition Gear",
    price: "$65",
    image: "/images/wrestlers/DSC09374--.JPG"
  },
  {
    id: 3,
    name: "Training Shorts",
    category: "Training Gear",
    price: "$45",
    image: "/images/wrestlers/DSC07386.JPG"
  },
  {
    id: 4,
    name: "Team Warmup Pullover",
    category: "Outerwear",
    price: "$75",
    image: "/images/wrestlers/DSC00423.JPG"
  }
];

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.5,
      delay: 0.1 * index
    }
  })
};

export default function Shop() {
  const categories = ["All", "Competition Gear", "Training Gear", "Outerwear"];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container mx-auto px-6">
        {/* Shop Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h1 
            className="text-4xl md:text-5xl mb-6" 
            style={{ fontFamily: "'Playfair Display FC', serif" }}
          >
            Collection
          </h1>
          <p 
            className="text-gray-600 text-lg mb-10"
            style={{ fontFamily: "'Didact Gothic', sans-serif" }}
          >
            Premium athletic apparel for high-performing athletes who demand quality in every detail.
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                className={`px-6 py-2 ${
                  index === 0 
                    ? "bg-gray-900 text-white" 
                    : "bg-transparent text-gray-800 border border-gray-300"
                }`}
                whileHover={{ 
                  backgroundColor: index === 0 ? "#1f2937" : "#f3f4f6",
                  scale: 1.02
                }}
                style={{ fontFamily: "'Sanchez', serif" }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              custom={index}
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="group hover-lift"
            >
              <div className="aspect-[3/4] mb-4 overflow-hidden bg-gray-100 relative">
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${product.image})` }}
                ></div>
                <div className="absolute bottom-0 left-0 w-full p-4 bg-white bg-opacity-90 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button 
                    className="w-full py-3 bg-gray-900 text-white text-sm"
                    style={{ fontFamily: "'Sanchez', serif" }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
              <div>
                <p 
                  className="text-gray-500 text-sm mb-1"
                  style={{ fontFamily: "'Arial', sans-serif" }}
                >
                  {product.category}
                </p>
                <h3 
                  className="text-lg mb-1"
                  style={{ fontFamily: "'Bodoni FLF', serif" }}
                >
                  {product.name}
                </h3>
                <p 
                  className="text-gray-800"
                  style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                >
                  {product.price}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Coming Soon Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-24 p-16 bg-gray-100 text-center"
        >
          <h2 
            className="text-2xl md:text-3xl mb-4"
            style={{ fontFamily: "'Bodoni FLF', serif" }}
          >
            New Collection Coming Soon
          </h2>
          <p 
            className="text-gray-600 max-w-2xl mx-auto mb-8"
            style={{ fontFamily: "'Didact Gothic', sans-serif" }}
          >
            Our complete collection is currently under development and will be available for purchase soon. Sign up for our newsletter to be notified when new items are released.
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-grow px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900"
              style={{ fontFamily: "'Arial', sans-serif" }}
            />
            <button
              className="bg-gray-900 text-white px-8 py-3 hover:bg-gray-800 transition-colors"
              style={{ fontFamily: "'Sanchez', serif" }}
            >
              Notify Me
            </button>
          </div>
        </motion.div>
        
        {/* Subtle sky accent line */}
        <div className="mt-24 h-px w-full bg-sky-200 opacity-30"></div>
      </div>
    </div>
  );
}