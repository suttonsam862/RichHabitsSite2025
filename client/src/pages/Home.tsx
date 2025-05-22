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
  // Structured data for organization (Rich Habits)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "name": "Rich Habits",
    "url": "https://rich-habits.com",
    "logo": "https://rich-habits.com/logo.png",
    "description": "Premium athletic apparel for high-performing athletes who demand quality and style.",
    "sameAs": [
      "https://instagram.com/richhabits",
      "https://facebook.com/richhabits"
    ]
  };

  // Structured data for the website
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Rich Habits",
    "url": "https://rich-habits.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://rich-habits.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Helmet>
        <title>Rich Habits - Premium Athletic Apparel</title>
        <meta name="description" content="Premium athletic apparel for high-performing athletes who demand quality and style." />
        <meta name="keywords" content="wrestling apparel, athletic clothing, custom wrestling gear, wrestling camps" />
        <meta property="og:title" content="Rich Habits - Premium Athletic Apparel" />
        <meta property="og:description" content="Premium athletic apparel for high-performing athletes who demand quality and style." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rich-habits.com" />
        <meta property="og:image" content="https://rich-habits.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rich Habits - Premium Athletic Apparel" />
        <meta name="twitter:description" content="Premium athletic apparel for high-performing athletes who demand quality and style." />
        <meta name="twitter:image" content="https://rich-habits.com/twitter-image.jpg" />
        <link rel="canonical" href="https://rich-habits.com" />
        
        {/* Structured data JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
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
