import { useState } from "react";

interface FruitItemProps {
  src: string;
  alt: string;
  title: string;
}

const FruitItem = ({ src, alt, title }: FruitItemProps) => {
  return (
    <div className="flex-shrink-0 relative overflow-hidden rounded-md w-16 h-16 border border-gray-100 shadow-sm">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transform transition-transform hover:scale-110 duration-300"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-70 py-1 px-1">
        <p className="text-white text-[8px] font-medium text-center leading-tight">{title}</p>
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
    <div className="my-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <div className="bg-gray-700 h-8 w-1 rounded-full mr-3"></div>
        <h3 className="text-lg font-bold text-gray-800">Exclusive Fruit Hunters Partnership</h3>
      </div>
      
      <p className="text-gray-700 text-sm mb-4">
        All camp participants receive daily exotic fruit nutrition packs designed for optimal performance and recovery. Taste the difference of America's premier exotic fruit company.
      </p>
      
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
        {fruitItems.map((fruit, index) => (
          <FruitItem key={index} src={fruit.src} alt={fruit.alt} title={fruit.title} />
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">Rich in antioxidants, vitamins & recovery nutrients</span>
        <button className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors">
          Learn More →
        </button>
      </div>
    </div>
  );
}