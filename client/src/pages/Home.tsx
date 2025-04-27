import { Hero } from "@/components/home/Hero";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { CustomClothingService } from "@/components/home/CustomClothingService";
import { CampSlideshow } from "@/components/home/CampSlideshow";
import { GallerySection } from "@/components/home/GallerySection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { FruitHuntersBanner } from "@/components/home/FruitHuntersBanner";
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
      <FeaturedEvents />
      <CustomClothingService />
      <CampSlideshow />
      <GallerySection />
      <FruitHuntersBanner />
      <FeaturedProducts />
      <Newsletter />
    </>
  );
}
