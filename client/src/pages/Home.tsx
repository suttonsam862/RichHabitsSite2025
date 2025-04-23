import { Hero } from "@/components/home/Hero";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { CustomClothingService } from "@/components/home/CustomClothingService";
import { EventsSection } from "@/components/home/EventsSection";
import { GallerySection } from "@/components/home/GallerySection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Newsletter } from "@/components/home/Newsletter";
import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Rich Habits - Premium Athletic Apparel</title>
        <meta name="description" content="Premium athletic apparel for high-performing athletes who demand quality and style." />
      </Helmet>
      
      <Hero />
      <FeaturedCollections />
      <CustomClothingService />
      <EventsSection />
      <GallerySection />
      <FeaturedProducts />
      <Newsletter />
    </>
  );
}
