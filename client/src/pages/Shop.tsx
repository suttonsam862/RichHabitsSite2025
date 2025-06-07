import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function Shop() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-700 py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-4"
            {...fadeIn}
          >
            Rich Habits Shop
          </motion.h1>
          <motion.p 
            className="text-xl text-red-100 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Premium wrestling gear and apparel for champions
          </motion.p>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="py-32">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gray-900 rounded-3xl p-16 border border-red-600/20">
              <motion.h2 
                className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Coming Soon
              </motion.h2>
              
              <motion.p 
                className="text-2xl text-gray-300 mb-12 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                We're building something special. Our premium collection of wrestling gear, 
                team apparel, and training equipment will be available soon.
              </motion.p>

              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <div className="grid md:grid-cols-3 gap-8 text-left">
                  <div className="bg-black/50 rounded-2xl p-6 border border-red-600/10">
                    <h3 className="text-red-400 font-bold text-lg mb-3">Competition Gear</h3>
                    <p className="text-gray-400">Professional rashguards, singlets, and competition equipment</p>
                  </div>
                  <div className="bg-black/50 rounded-2xl p-6 border border-red-600/10">
                    <h3 className="text-red-400 font-bold text-lg mb-3">Team Apparel</h3>
                    <p className="text-gray-400">Custom team packages, polos, and training gear</p>
                  </div>
                  <div className="bg-black/50 rounded-2xl p-6 border border-red-600/10">
                    <h3 className="text-red-400 font-bold text-lg mb-3">Accessories</h3>
                    <p className="text-gray-400">Premium bags, water bottles, and training accessories</p>
                  </div>
                </div>

                <motion.p 
                  className="text-lg text-red-300 mt-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  Stay tuned for the launch of our complete wrestling gear collection
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gradient-to-r from-red-900/20 to-black">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <h3 className="text-3xl font-bold mb-6">Ready to Train Like a Champion?</h3>
            <p className="text-xl text-gray-300 mb-8">
              While you wait for our shop, check out our premium wrestling camps and training programs
            </p>
            <motion.a 
              href="/events"
              className="inline-block bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Training Camps
            </motion.a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';

export default function Shop() {
  const products = [
    { id: 1, name: "Custom Team Rashguard", price: "$45", image: "/images/BlackRashgaurdMockup.png" },
    { id: 2, name: "Wrestling Shorts", price: "$35", image: "/images/ClassicRashguardMockup.png" },
    { id: 3, name: "Team Hoodie", price: "$55", image: "/images/BlueRashguardMockup.png" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Custom Wrestling Apparel</h1>
          <p className="text-lg text-gray-600">Premium wrestling gear and custom team apparel designed for champions.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-4">{product.price}</p>
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                  Customize & Order
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 bg-blue-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Need Custom Team Gear?</h2>
          <p className="text-lg mb-6">We create custom apparel for wrestling teams, schools, and clubs.</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Get Custom Quote
          </button>
        </div>
      </div>
    </div>
  );
}
