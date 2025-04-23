import { db } from "../server/db";
import { products, collections, events } from "../shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");

  // Delete existing data
  await db.delete(events);
  await db.delete(collections);
  await db.delete(products);

  // Add collection data
  const collectionsData = [
    {
      shopifyId: "collection_1",
      title: "Performance Collection",
      handle: "performance",
      description: "Technical fabrics for intense training",
      image: "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
      data: {}
    },
    {
      shopifyId: "collection_2",
      title: "Essentials Line",
      handle: "essentials",
      description: "Minimal design for everyday athletes",
      image: "https://images.unsplash.com/photo-1483721310020-03333e577078?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
      data: {}
    },
    {
      shopifyId: "collection_3",
      title: "Competition Series",
      handle: "competition",
      description: "Elite gear for peak performance",
      image: "https://images.unsplash.com/photo-1616257460024-b12a0c4c8333?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
      data: {}
    }
  ];

  await db.insert(collections).values(collectionsData);
  console.log("Collections seeded successfully!");

  // Add product data
  const productsData = [
    {
      shopifyId: "prod_1",
      title: "Performance Training Tee",
      handle: "performance-training-tee",
      description: "Lightweight, breathable fabric that wicks moisture away from your skin.",
      productType: "Tops",
      image: "https://images.unsplash.com/photo-1565693413579-8a73ffa6de14?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      price: "$45.00",
      collection: "performance",
      color: "Black",
      featured: true,
      availableForSale: true,
      data: {}
    },
    {
      shopifyId: "prod_2",
      title: "Minimal Track Shorts",
      handle: "minimal-track-shorts",
      description: "Four-way stretch fabric with quick-dry technology for maximum comfort.",
      productType: "Bottoms",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      price: "$38.00",
      collection: "essentials",
      color: "Slate Gray",
      featured: true,
      availableForSale: true,
      data: {}
    },
    {
      shopifyId: "prod_3",
      title: "Premium Workout Hoodie",
      handle: "premium-workout-hoodie",
      description: "Premium fleece-lined hoodie with embroidered team logo.",
      productType: "Outerwear",
      image: "https://images.unsplash.com/photo-1618354691249-18772bbac3a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      price: "$75.00",
      collection: "competition",
      color: "Deep Navy",
      featured: true,
      availableForSale: true,
      data: {}
    },
    {
      shopifyId: "prod_4",
      title: "Tech Compression Leggings",
      handle: "tech-compression-leggings",
      description: "Targeted compression to improve blood flow and reduce muscle fatigue.",
      productType: "Bottoms",
      image: "https://images.unsplash.com/photo-1525171254930-643fc658b64e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      price: "$65.00",
      collection: "performance",
      color: "Black",
      featured: true,
      availableForSale: true,
      data: {}
    },
    {
      shopifyId: "prod_5",
      title: "Athletic Performance Jacket",
      handle: "athletic-performance-jacket",
      description: "Lightweight performance jacket for training in all conditions.",
      productType: "Outerwear",
      image: "https://images.unsplash.com/photo-1519931861629-54ee7ee2ec4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      price: "$120.00",
      collection: "essentials",
      color: "Gray",
      featured: false,
      availableForSale: true,
      data: {}
    },
    {
      shopifyId: "prod_6",
      title: "Training Sweatpants",
      handle: "training-sweatpants",
      description: "Tapered fit joggers with stretch waistband and ankle cuffs.",
      productType: "Bottoms",
      image: "https://images.unsplash.com/photo-1552902881-3a2dd2c0eeab?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      price: "$65.00",
      collection: "essentials",
      color: "Black",
      featured: false,
      availableForSale: true,
      data: {}
    }
  ];

  await db.insert(products).values(productsData);
  console.log("Products seeded successfully!");

  // Add event data
  const eventsData = [
    {
      title: "Elite Point Guard Clinic",
      category: "Basketball",
      date: "2023-08-15",
      time: "9:00 AM - 2:00 PM",
      location: "Downtown Sports Complex",
      description: "Intensive training for high school point guards focusing on ball handling, vision, and leadership.",
      price: "$89.00",
      maxParticipants: 25,
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Speed & Agility Camp",
      category: "Football",
      date: "2023-09-03",
      time: "10:00 AM - 3:00 PM",
      location: "Eastside Athletic Fields",
      description: "Professional training methods to improve acceleration, lateral movement, and game speed.",
      price: "$125.00",
      maxParticipants: 30,
      image: "https://images.unsplash.com/photo-1605627079912-97c3810a11a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "College Recruiting Workshop",
      category: "Multi-Sport",
      date: "2023-10-12",
      time: "6:00 PM - 8:30 PM",
      location: "Community Center - Main Hall",
      description: "Essential guidance for athletes and parents navigating the college recruitment process.",
      price: "$45.00",
      maxParticipants: 100,
      image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ];

  await db.insert(events).values(eventsData);
  console.log("Events seeded successfully!");

  console.log("Database seeding complete!");
}

seedDatabase()
  .catch(console.error)
  .finally(() => {
    process.exit(0);
  });