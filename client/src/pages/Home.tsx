import { Hero } from "@/components/home/Hero";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { SlamCampVideo } from "@/components/home/SlamCampVideo";
import { CampSlideshow } from "@/components/home/CampSlideshow";
import { GallerySection } from "@/components/home/GallerySection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { FruitHuntersBanner } from "@/components/home/FruitHuntersBanner";
import { Collaborations } from "@/components/home/Collaborations";
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
      <SlamCampVideo />
      <CampSlideshow />
      <GallerySection />
      <Collaborations />
      <FruitHuntersBanner />
      <FeaturedProducts />
      <Newsletter />
    </>
  );
}
