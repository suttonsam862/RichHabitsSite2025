/**
 * Event Media Mapping
 * 
 * This file provides a centralized mapping of all media assets for each event.
 * When adding a new event, create a new entry in the eventMediaMap with the event ID
 * and populate all required media assets.
 */

// Define the structure of media assets for each event
export interface EventMedia {
  // Banner images
  banner: string;
  
  // Primary videos
  mainVideo: string;
  highlightVideo: string;
  featureVideo: string;
  promoVideo: string;
  
  // Image galleries
  galleryImages: string[];
  
  // Thumbnail image
  thumbnailImage: string;
  
  // Mobile-specific media (optional)
  mobileVideo?: string;
  mobileBanner?: string;
  
  // Additional meta information
  isVideoRequired?: boolean;
  fallbackYoutubeId?: string;
}

/**
 * Complete media mapping for all events
 * 
 * When adding a new event:
 * 1. Add a new entry with the event ID as the key
 * 2. Fill in all required media paths
 * 3. Test the media on the event detail page to ensure proper display
 */
const eventMediaMap: Record<number, EventMedia> = {
  // Event ID 1: Birmingham Slam Camp
  1: {
    banner: "/assets/SlamCampSiteBanner.png",
    mainVideo: "/assets/slamcamp.mp4",
    highlightVideo: "/assets/0331.mp4",
    featureVideo: "/assets/0405.mp4",
    promoVideo: "/assets/0425.mp4",
    galleryImages: [
      "/assets/DSC08460--.jpg",
      "/assets/DSC08612.JPG",
      "/assets/DSC08615.JPG",
      "/assets/DSC08631.JPG"
    ],
    thumbnailImage: "/assets/SlamCampSiteBanner.png",
    fallbackYoutubeId: "luouX84juYU", // YouTube fallback for mobile
    mobileBanner: "/assets/SlamCampSiteBanner.png" // Mobile-optimized banner
  },
  
  // Event ID 2: National Champ Camp
  2: {
    banner: "/assets/LongSitePhotovegas.png",
    mainVideo: "/assets/0424.mp4",
    highlightVideo: "/assets/04243.mp4", 
    featureVideo: "/assets/0405.mp4",
    promoVideo: "/assets/0425.mp4",
    galleryImages: [
      "/assets/DSC00423.JPG",
      "/assets/DSC00521--.JPG",
      "/assets/DSC09295--.JPG",
      "/assets/DSC09299.JPG"
    ],
    thumbnailImage: "/assets/Title Card Slam Camp.png",
    fallbackYoutubeId: "luouX84juYU", // YouTube fallback for mobile
    mobileBanner: "/assets/LongSitePhotovegas.png" // Mobile-optimized banner
  },
  
  // Event ID 3: Texas Recruiting Clinic
  3: {
    banner: "/assets/RecruitingWebsiteimage4.png",
    mainVideo: "/assets/trcvid.mp4",
    highlightVideo: "/assets/trcvid-new.mp4",
    featureVideo: "/assets/0405.mp4",
    promoVideo: "/assets/0331.mp4",
    galleryImages: [
      "/assets/DSC09353.JPG",
      "/assets/DSC09354.JPG",
      "/assets/DSC09355.JPG",
      "/assets/DSC09374--.JPG"
    ],
    thumbnailImage: "/assets/Headerbannersiterecruiting page.png",
    fallbackYoutubeId: "luouX84juYU", // YouTube fallback for mobile
    mobileBanner: "/assets/RecruitingWebsiteimage4.png" // Mobile-optimized banner
  },
  
  // Event ID 4: Cory Land Tour
  4: {
    banner: "/assets/Zahid Website Image.png",
    mainVideo: "/assets/corylandloopvide.mp4",
    highlightVideo: "/assets/0424.mp4",
    featureVideo: "/assets/0331.mp4",
    promoVideo: "/assets/0405.mp4",
    galleryImages: [
      "/assets/DSC07337--.jpg",
      "/assets/DSC07386.JPG",
      "/assets/DSC09488.JPG",
      "/assets/DSC09491.JPG"
    ],
    thumbnailImage: "/assets/Zahid Website Image.png",
    fallbackYoutubeId: "luouX84juYU", // YouTube fallback for mobile
    mobileBanner: "/assets/Zahid Website Image.png" // Mobile-optimized banner
  }
};

/**
 * Get media assets for a specific event
 * 
 * @param eventId - The ID of the event
 * @returns The media assets for the event or a fallback if not found
 */
export function getEventMedia(eventId: number): EventMedia {
  // Check if the event has defined media
  if (eventMediaMap[eventId]) {
    return eventMediaMap[eventId];
  }
  
  // Fallback for events without defined media
  console.warn(`No media defined for event ID ${eventId}, using fallback media`);
  return {
    banner: "/assets/SlamCampSiteBanner.png",
    mainVideo: "/assets/slamcamp.mp4",
    highlightVideo: "/assets/0331.mp4",
    featureVideo: "/assets/0405.mp4",
    promoVideo: "/assets/0425.mp4",
    galleryImages: [
      "/assets/DSC08631.JPG",
      "/assets/DSC09295--.JPG",
      "/assets/DSC09299.JPG",
      "/assets/DSC09353.JPG"
    ],
    thumbnailImage: "/assets/SlamCampSiteBanner.png"
  };
}

export default eventMediaMap;