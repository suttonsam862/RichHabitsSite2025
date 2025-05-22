import React from "react";

export default function Shop() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Shop</h1>
      <p className="text-lg mb-8">Browse our selection of premium wrestling gear and apparel.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
          <p>Our shop is currently under development. Check back soon!</p>
        </div>
      </div>
    </div>
  );
}