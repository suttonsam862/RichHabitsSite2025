# Video Asset Configuration for Rich Habits

## Overview
This document explains how video assets are configured and served in the Rich Habits website.

## Directory Structure
- Event video assets are stored in `public/assets/` directory
- Both MP4 and MOV formats are supported (MP4 preferred for better browser compatibility)

## Implementation Details

### Server Configuration
The server has a dedicated media handler that ensures proper MIME types:
- MP4 files are served with `video/mp4` content type
- MOV files are served with `video/quicktime` content type
- WebM files are served with `video/webm` content type

This handler is defined in `server/index.ts` and takes precedence over the default static file serving.

### Video Component
The `EventVideo` component has enhanced error handling and diagnostics:
- Browser compatibility detection for different video formats
- Detailed error reporting with specific codes and recommendations
- Automatic retry capabilities for failed video loading
- Fallback UI with relevant error information

### Usage in Event Pages
Videos are embedded in the event pages using the `EventVideo` component:

```jsx
<EventVideo
  src="/assets/0424.mp4"
  className="w-full h-auto object-cover"
  autoplay={true}
  loop={true}
  muted={true}
  controls={false}
  title="Event Highlight Video"
/>
```

## Best Practices
1. Always use the MP4 format for best cross-browser compatibility
2. Add both width and height attributes to reduce layout shift
3. Use `autoplay` and `muted` attributes together for videos that play automatically
4. Provide a meaningful `title` attribute for accessibility
5. Enable `controls` when users need to control playback

# Diagnostics Test Trigger

## Troubleshooting
If videos stop working in the future:
1. Check that the server is serving the correct MIME types (test with `curl -I http://localhost:5000/assets/video-name.mp4`)
2. Verify the file paths are correct in the event page components
3. Ensure video file extensions match their actual format
4. Check browser console for any media errors
