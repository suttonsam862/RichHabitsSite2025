import React from "react";
import { motion } from 'framer-motion';
import Container from '../layout/Container';

export default function Collaborations() {
  const collaborations = [
    {
      name: "Wrestling Federation",
      logo: "/logo-placeholder.svg",
      description: "Official wrestling organization partner"
    },
    {
      name: "Athletic Brands",
      logo: "/logo-placeholder.svg", 
      description: "Equipment and apparel sponsor"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Partners</h2>
          <p className="text-xl text-gray-600">
            Working with industry leaders to provide the best experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collaborations.map((collab, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm text-center"
            >
              <img
                src={collab.logo}
                alt={collab.name}
                className="w-24 h-24 mx-auto mb-4 object-contain"
              />
              <h3 className="text-xl font-semibold mb-2">{collab.name}</h3>
              <p className="text-gray-600">{collab.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}