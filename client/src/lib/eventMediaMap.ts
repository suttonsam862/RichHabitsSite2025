export const eventMediaMap = {
  'birmingham-slam-camp': {
    heroImage: '/assets/events/SlamCampSiteBanner.png',
    bannerImage: '/assets/events/SlamCampSiteBanner.png',
    video: '/videos/slamcamp.webm',
    fallbackVideo: '/videos/slamcamp.mp4',
    coaches: [
      {
        name: 'Michael McGee',
        image: '/Michael_McGee_JouQS.jpg',
        role: 'Head Coach'
      },
      {
        name: 'Zahid Valencia', 
        image: '/VALENCIA_Zahid-headshot.jpg',
        role: 'Assistant Coach'
      }
    ]
  },
  'national-champ-camp': {
    heroImage: '/assets/events/LongSitePhotovegas.png',
    bannerImage: '/assets/events/LongSitePhotovegas.png',
    video: '/videos/national-champ-camp.webm',
    coaches: [
      {
        name: 'Michael McGee',
        image: '/Michael_McGee_JouQS.jpg',
        role: 'Lead Instructor'
      }
    ]
  },
  'texas-recruiting-clinic': {
    heroImage: '/assets/events/RecruitingWebsiteimage4.png',
    bannerImage: '/assets/events/RecruitingWebsiteimage4.png',
    video: '/videos/texas-recruiting-clinic.webm',
    coaches: [
      {
        name: 'Zahid Valencia',
        image: '/VALENCIA_Zahid-headshot.jpg',
        role: 'Recruiting Specialist'
      }
    ]
  },
  'panther-train-tour': {
    heroImage: '/assets/events/CenzoSite.png',
    bannerImage: '/assets/events/CenzoSite.png',
    video: '/videos/panther-train-tour.webm',
    coaches: [
      {
        name: 'Brandon Courtney',
        image: '/client/src/assets/coaches/brandon_courtney.webp',
        role: 'Tour Director'
      }
    ]
  }
};

export function getEventMedia(eventSlug: string) {
  return eventMediaMap[eventSlug as keyof typeof eventMediaMap] || {
    heroImage: '/placeholder.svg',
    bannerImage: '/placeholder.svg',
    video: null,
    coaches: []
  };
}