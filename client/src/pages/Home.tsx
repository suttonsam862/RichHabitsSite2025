import React from "react";
import { Hero } from "../components/home/Hero";

export default function Home() {
  return (
    <div>
      <Hero />
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Rich Habits</h2>
        <p className="text-lg text-center mb-8">
          Premium athletic apparel for high-performing athletes who demand quality and style.
        </p>
      </div>
    </div>
  );
}