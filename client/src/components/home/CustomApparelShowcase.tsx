import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../layout/Container';

export default function CustomApparelShowcase() {
  const [selectedCategory] = useState('all');

  const apparelItems = [
    {
      id: 1,
      name: "Championship Tee",
      category: "shirts",
      image: "/apparel-1.jpg",
      price: "$29.99"
    },
    {
      id: 2,
      name: "Wrestling Shorts",
      category: "shorts", 
      image: "/apparel-2.jpg",
      price: "$39.99"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Custom Apparel</h2>
          <p className="text-xl text-gray-600">
            High-quality wrestling gear designed for champions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {apparelItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-2xl font-bold text-blue-600">{item.price}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}