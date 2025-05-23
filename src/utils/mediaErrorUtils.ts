/**
 * Media Error Utilities
 * 
 * This file contains utilities for diagnosing and logging media-related errors
 * in React applications. Includes detailed error parsing for videos, images, and
 * audio elements.
 */

// Enum for media error types
export enum MediaErrorType {
  NETWORK = 'network',
  DECODE = 'decode',
  SOURCE_NOT_SUPPORTED = 'source_not_supported',
  ABORTED = 'aborted',
  NOT_FOUND = 'not_found',
  PERMISSIONS = 'permissions',
  TIMEOUT = 'timeout',
  FORMAT = 'format',
  UNKNOWN = 'unknown'
}

// Interface for media error data
export interface MediaErrorData {
  type: MediaErrorType;
  mediaType: 'video' | 'image' | 'audio' | 'general';
  message: string;
  technicalMessage?: string;
  timestamp: string;
  url?: string;
  errorCode?: number;
  networkState?: number;
  readyState?: number;
  errorDetails?: any;
  retryable: boolean;
  recommendations: string[];
}

/**
 * Parse video element error based on HTML5 video error code
 */
export function parseVideoError(videoElement: HTMLVideoElement): MediaErrorData {
  const error = videoElement.error;
  const timestamp = new Date().toISOString();
  
  if (!error) {
    return {
      type: MediaErrorType.UNKNOWN,
      mediaType: 'video',
      message: 'Unknown video error',
      timestamp,
      retryable: true,
      recommendations: ['Try a different video format', 'Check the video source URL']
    };
  }
  
  const errorData: MediaErrorData = {
    type: MediaErrorType.UNKNOWN,
    mediaType: 'video',
    message: 'Video failed to load',
    technicalMessage: error.message || 'No error message provided',
    timestamp,
    url: videoElement.currentSrc || videoElement.src,
    errorCode: error.code,
    networkState: videoElement.networkState,
    readyState: videoElement.readyState,
    retryable: true,
    recommendations: []
  };
  
  // Interpret error code
  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      errorData.type = MediaErrorType.ABORTED;
      errorData.message = 'Video loading was aborted';
      errorData.recommendations = ['Try refreshing the page', 'Check network connection'];
      break;
      
    case MediaError.MEDIA_ERR_NETWORK:
      errorData.type = MediaErrorType.NETWORK;
      errorData.message = 'Network error while loading video';
      errorData.recommendations = [
        'Check your internet connection',
        'Try again later',
        'The video server might be down'
      ];
      break;
      
    case MediaError.MEDIA_ERR_DECODE:
      errorData.type = MediaErrorType.DECODE;
      errorData.message = 'Video cannot be decoded';
      errorData.recommendations = [
        'The video file may be corrupted',
        'Try a different browser',
        'Contact support if problem persists'
      ];
      break;
      
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      errorData.type = MediaErrorType.SOURCE_NOT_SUPPORTED;
      errorData.message = 'Video format is not supported';
      errorData.recommendations = [
        'Try a different browser',
        'The video needs to be converted to a supported format',
        'Your device may not support this video format'
      ];
      break;
      
    default:
      errorData.type = MediaErrorType.UNKNOWN;
      errorData.message = 'Unknown video error';
      errorData.recommendations = [
        'Try refreshing the page',
        'Check if the video exists',
        'Report this issue to support'
      ];
  }
  
  return errorData;
}

/**
 * Parse image loading errors
 */
export function parseImageError(event: React.SyntheticEvent<HTMLImageElement, Event>): MediaErrorData {
  const imgElement = event.currentTarget;
  const timestamp = new Date().toISOString();
  
  // Check if error is a 404
  const url = imgElement.src;
  const isNotFound = imgElement.naturalWidth === 0 && imgElement.naturalHeight === 0;
  
  const errorData: MediaErrorData = {
    type: isNotFound ? MediaErrorType.NOT_FOUND : MediaErrorType.UNKNOWN,
    mediaType: 'image',
    message: isNotFound ? 'Image not found' : 'Image failed to load',
    timestamp,
    url,
    retryable: true,
    recommendations: []
  };
  
  // Add specific recommendations based on observed state
  if (url.startsWith('http:') && window.location.protocol === 'https:') {
    errorData.type = MediaErrorType.PERMISSIONS;
    errorData.message = 'Mixed content error: secure page cannot load insecure image';
    errorData.recommendations = [
      'Use HTTPS URL for image',
      'Check content security policy',
      'Contact the developer to fix mixed content issue'
    ];
  } else if (url.includes('data:image/')) {
    errorData.type = MediaErrorType.FORMAT;
    errorData.message = 'Data URL image failed to load';
    errorData.recommendations = [
      'The image data may be corrupted',
      'The image data may be too large',
      'Try a regular image URL instead of data URL'
    ];
  } else if (isNotFound) {
    errorData.recommendations = [
      'Check if the image URL is correct',
      'The image may have been deleted or moved',
      'Verify you have permission to access this resource'
    ];
  } else {
    errorData.recommendations = [
      'Check your internet connection',
      'The image may be in an unsupported format',
      'The image may be corrupted'
    ];
  }
  
  return errorData;
}

/**
 * Parse audio element error
 */
export function parseAudioError(audioElement: HTMLAudioElement): MediaErrorData {
  const error = audioElement.error;
  const timestamp = new Date().toISOString();
  
  if (!error) {
    return {
      type: MediaErrorType.UNKNOWN,
      mediaType: 'audio',
      message: 'Unknown audio error',
      timestamp,
      retryable: true,
      recommendations: ['Try a different audio format', 'Check the audio source URL']
    };
  }
  
  const errorData: MediaErrorData = {
    type: MediaErrorType.UNKNOWN,
    mediaType: 'audio',
    message: 'Audio failed to load',
    technicalMessage: error.message || 'No error message provided',
    timestamp,
    url: audioElement.currentSrc || audioElement.src,
    errorCode: error.code,
    networkState: audioElement.networkState,
    readyState: audioElement.readyState,
    retryable: true,
    recommendations: []
  };
  
  // Interpret error code - similar to video errors
  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      errorData.type = MediaErrorType.ABORTED;
      errorData.message = 'Audio loading was aborted';
      errorData.recommendations = ['Try refreshing the page', 'Check network connection'];
      break;
      
    case MediaError.MEDIA_ERR_NETWORK:
      errorData.type = MediaErrorType.NETWORK;
      errorData.message = 'Network error while loading audio';
      errorData.recommendations = [
        'Check your internet connection',
        'Try again later',
        'The audio server might be down'
      ];
      break;
      
    case MediaError.MEDIA_ERR_DECODE:
      errorData.type = MediaErrorType.DECODE;
      errorData.message = 'Audio cannot be decoded';
      errorData.recommendations = [
        'The audio file may be corrupted',
        'Try a different browser',
        'Contact support if problem persists'
      ];
      break;
      
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      errorData.type = MediaErrorType.SOURCE_NOT_SUPPORTED;
      errorData.message = 'Audio format is not supported';
      errorData.recommendations = [
        'Try a different browser',
        'The audio needs to be converted to a supported format',
        'Your device may not support this audio format'
      ];
      break;
      
    default:
      errorData.type = MediaErrorType.UNKNOWN;
      errorData.message = 'Unknown audio error';
      errorData.recommendations = [
        'Try refreshing the page',
        'Check if the audio exists',
        'Report this issue to support'
      ];
  }
  
  return errorData;
}

/**
 * Detect if a browser can play a specific file
 */
export function canBrowserPlayMedia(fileType: string): {canPlay: boolean, supportLevel: string} {
  const video = document.createElement('video');
  const audio = document.createElement('audio');
  let supportLevel = '';
  let canPlay = false;
  
  // Video formats
  if (fileType.match(/^video\//)) {
    supportLevel = video.canPlayType(fileType);
    canPlay = supportLevel !== '';
    return { canPlay, supportLevel };
  }
  
  // Audio formats
  if (fileType.match(/^audio\//)) {
    supportLevel = audio.canPlayType(fileType);
    canPlay = supportLevel !== '';
    return { canPlay, supportLevel };
  }
  
  // Try to infer type from extension
  if (fileType.match(/\.(mp4|webm|ogg)$/i)) {
    const mimeType = inferMimeTypeFromExtension(fileType);
    supportLevel = video.canPlayType(mimeType);
    canPlay = supportLevel !== '';
    return { canPlay, supportLevel };
  }
  
  // Special handling for MOV files (less compatible)
  if (fileType.match(/\.(mov)$/i)) {
    const mimeType = inferMimeTypeFromExtension(fileType);
    supportLevel = video.canPlayType(mimeType);
    canPlay = supportLevel !== '';
    
    // Additional warning for MOV files
    console.warn('[mediaErrorUtils] MOV files have limited browser support. Consider converting to MP4.');
    
    return { canPlay, supportLevel };
  }
  
  if (fileType.match(/\.(mp3|wav|aac|m4a|flac)$/i)) {
    const mimeType = inferMimeTypeFromExtension(fileType);
    supportLevel = audio.canPlayType(mimeType);
    canPlay = supportLevel !== '';
    return { canPlay, supportLevel };
  }
  
  return { canPlay: false, supportLevel: '' };
}

/**
 * Infer MIME type from file extension
 */
export function inferMimeTypeFromExtension(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (!extension) return '';
  
  // Video formats
  const videoFormats: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    mkv: 'video/x-matroska'
  };
  
  // Audio formats
  const audioFormats: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    aac: 'audio/aac',
    m4a: 'audio/mp4',
    flac: 'audio/flac'
  };
  
  // Image formats
  const imageFormats: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    svg: 'image/svg+xml'
  };
  
  // Return appropriate MIME type or empty string if not found
  return videoFormats[extension] || audioFormats[extension] || imageFormats[extension] || '';
}

/**
 * Log detailed media error to console and optionally to error monitoring service
 */
export function logMediaError(error: MediaErrorData): void {
  // Always log to console with details
  console.group(`Media Error: ${error.mediaType} - ${error.type}`);
  console.error(`${error.message}${error.technicalMessage ? ` (${error.technicalMessage})` : ''}`);
  console.log('Error details:', error);
  
  if (error.recommendations.length > 0) {
    console.log('Recommendations:');
    error.recommendations.forEach((rec, i) => console.log(`${i + 1}. ${rec}`));
  }
  
  console.groupEnd();
  
  // Here you could add code to send to monitoring service like Sentry
  // if (typeof window.Sentry !== 'undefined') {
  //   window.Sentry.captureMessage(`Media Error: ${error.mediaType} - ${error.type}`, {
  //     level: 'error',
  //     extra: error
  //   });
  // }
}

/**
 * Check if a network resource exists (can be used to pre-validate media URLs)
 */
export async function checkResourceExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Media format support detection
export function getSupportedMediaFormats(): {
  video: string[];
  audio: string[];
} {
  const video = document.createElement('video');
  const audio = document.createElement('audio');
  
  // Test video formats
  const videoFormats = [
    { type: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', shortName: 'mp4 (H.264)' },
    { type: 'video/webm; codecs="vp8, vorbis"', shortName: 'webm (VP8)' },
    { type: 'video/webm; codecs="vp9"', shortName: 'webm (VP9)' },
    { type: 'video/ogg; codecs="theora"', shortName: 'ogg' },
    { type: 'video/mp4; codecs="av01"', shortName: 'AV1' },
    { type: 'video/mp4; codecs="hvc1"', shortName: 'HEVC/H.265' },
    { type: 'video/quicktime', shortName: 'mov (QuickTime)' }
  ];
  
  // Test audio formats
  const audioFormats = [
    { type: 'audio/mpeg', shortName: 'mp3' },
    { type: 'audio/wav', shortName: 'wav' },
    { type: 'audio/ogg; codecs="vorbis"', shortName: 'ogg' },
    { type: 'audio/aac', shortName: 'aac' },
    { type: 'audio/flac', shortName: 'flac' },
    { type: 'audio/mp4; codecs="mp4a.40.5"', shortName: 'HE-AAC' }
  ];
  
  const supportedVideo = videoFormats
    .filter(format => video.canPlayType(format.type) !== '')
    .map(format => format.shortName);
    
  const supportedAudio = audioFormats
    .filter(format => audio.canPlayType(format.type) !== '')
    .map(format => format.shortName);
  
  return {
    video: supportedVideo,
    audio: supportedAudio
  };
}

export default {
  parseVideoError,
  parseImageError,
  parseAudioError,
  logMediaError,
  canBrowserPlayMedia,
  checkResourceExists,
  getSupportedMediaFormats
};