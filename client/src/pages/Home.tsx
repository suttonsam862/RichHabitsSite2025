import { Hero } from "@/components/home/Hero";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { SlamCampVideo } from "@/components/home/SlamCampVideo";
import { CampSlideshow } from "@/components/home/CampSlideshow";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { FruitHuntersBanner } from "@/components/home/FruitHuntersBanner";
import { Collaborations } from "@/components/home/Collaborations";
import { Newsletter } from "@/components/home/Newsletter";
import { CustomApparelShowcase } from "@/components/home/CustomApparelShowcase";
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
      <CustomApparelShowcase />
      <Collaborations />
      <FruitHuntersBanner />
      <FeaturedProducts />
      <Newsletter />
    </>
  );
}
