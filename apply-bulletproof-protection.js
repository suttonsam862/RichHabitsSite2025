import fs from 'fs';

// Universal bulletproof fallback that never fails
const fallbackSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';

// Apply bulletproof protection to all vulnerable components
const components = [
  'client/src/components/home/CustomApparelShowcase.tsx',
  'client/src/components/home/ApparelShowcase.tsx',
  'client/src/components/home/CampSlideshow.tsx',
  'client/src/components/home/FeaturedProducts.tsx',
  'client/src/components/home/Testimonials.tsx',
  'client/src/components/home/GallerySection.tsx',
  'client/src/components/home/SlamCampVideo.tsx',
  'client/src/components/home/Collaborations.tsx',
  'client/src/components/event/FloatingSchoolLogos.tsx',
  'client/src/pages/retail/Cart.tsx',
  'client/src/pages/events/EventsSimple.tsx',
  'client/src/pages/events/EventDetail.tsx'
];

console.log('Applying bulletproof image protection...');

for (const component of components) {
  if (fs.existsSync(component)) {
    let content = fs.readFileSync(component, 'utf8');
    
    // Replace all weak onError handlers with bulletproof ones
    content = content.replace(
      /onError=\{[^}]*e\.currentTarget\.onerror[^}]*\}/g,
      `onError={(e) => {
        const img = e.target as HTMLImageElement;
        if (img.dataset.fallbackAttempted !== 'true') {
          img.dataset.fallbackAttempted = 'true';
          img.src = '${fallbackSvg}';
        }
      }}`
    );
    
    // Add bulletproof protection to unprotected img tags
    content = content.replace(
      /<img([^>]*src=[^>]*?)(?!.*onError)([^>]*?)>/g,
      `<img$1$2 onError={(e) => {
        const img = e.target as HTMLImageElement;
        if (img.dataset.fallbackAttempted !== 'true') {
          img.dataset.fallbackAttempted = 'true';
          img.src = '${fallbackSvg}';
        }
      }}>`
    );
    
    fs.writeFileSync(component, content);
    console.log('✅ Protected:', component.split('/').pop());
  }
}

console.log('Bulletproof protection complete');