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