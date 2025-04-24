import { useState } from "react";

interface FruitItemProps {
  src: string;
  alt: string;
  title: string;
}

const FruitItem = ({ src, alt, title }: FruitItemProps) => {
  return (
    <div className="relative overflow-hidden rounded-lg h-36 group flex-1">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70"></div>
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="text-white text-sm font-medium text-center">{title}</p>
      </div>
    </div>
  );
};

export function FruitHuntersCompact() {
  // Image paths for the fruit sections
  const fruitItems = [
    {
      src: "/images/fruits/0E28DDF2-9BF4-4256-BE3B-E3D1367A5740_1_102_o.jpeg",
      alt: "Dragon fruit", 
      title: "Dragon Fruit"
    },
    {
      src: "/images/fruits/10F83FC8-8626-4870-BBD7-8A2205E5ADD1_1_102_o.jpeg",
      alt: "Mangosteen",
      title: "Mangosteen"
    },
    {
      src: "/images/fruits/50C705BD-6E71-453B-A059-36DF8A4A5E04_1_102_o.jpeg",
      alt: "Passion fruit",
      title: "Passion Fruit"
    },
    {
      src: "/images/fruits/50DE3461-8B8B-4B94-972D-99A7C403443D_1_102_o.jpeg",
      alt: "Jackfruit",
      title: "Jackfruit"
    },
    {
      src: "/images/fruits/B7585903-4E2F-40FE-AAF5-466F61CE7DB4_1_102_o.jpeg",
      alt: "Star fruit",
      title: "Star Fruit"
    },
    {
      src: "/images/fruits/F9FFD4F6-37A8-4F2B-AEEC-FF61C7E4481E_1_102_o.jpeg",
      alt: "Rambutan",
      title: "Rambutan"
    }
  ];

  return (
    <div className="my-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">FRUIT HUNTERS × RICH HABITS</h3>
      
      <div className="grid grid-cols-3 gap-2">
        {fruitItems.map((fruit, index) => (
          <FruitItem key={index} src={fruit.src} alt={fruit.alt} title={fruit.title} />
        ))}
      </div>
    </div>
  );
}