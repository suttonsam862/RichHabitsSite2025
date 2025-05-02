/**
 * Device Detection Utilities
 * 
 * This file provides utilities for detecting device types, capabilities,
 * and browser features to optimize media playback.
 */

// Check if running in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Detect if the current device is a mobile device based on user agent
 * and screen size heuristics
 */
export function isMobileDevice(): boolean {
  if (!isBrowser) return false;
  
  // User agent detection - not 100% reliable but useful as a starting point
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  
  // Test for typical mobile device patterns in user agent
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i;
  
  // Screen size heuristic - typically mobile devices have smaller viewport width
  const smallScreen = window.innerWidth <= 768;
  
  // Combined detection approach for more accurate results
  return mobileRegex.test(userAgent) || smallScreen;
}

/**
 * More specifically check if the device is running iOS
 */
export function isIOSDevice(): boolean {
  if (!isBrowser) return false;
  
  const userAgent = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
}

/**
 * Check if the browser supports video playback
 */
export function supportsVideoPlayback(): boolean {
  if (!isBrowser) return false;
  
  const video = document.createElement('video');
  return typeof video.canPlayType === 'function';
}

/**
 * Check if a specific video file type is supported
 */
export function canBrowserPlayFileType(fileExtension: string): { canPlay: boolean, supportLevel: string } {
  if (!isBrowser || !supportsVideoPlayback()) {
    return { canPlay: false, supportLevel: '' };
  }
  
  const video = document.createElement('video');
  
  // Map extensions to MIME types
  const extensionToMime: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    mov: 'video/quicktime',
  };
  
  const mimeType = extensionToMime[fileExtension] || '';
  if (!mimeType) return { canPlay: false, supportLevel: '' };
  
  const supportLevel = video.canPlayType(mimeType);
  const canPlay = supportLevel !== '';
  
  return { canPlay, supportLevel };
}

/**
 * Get all supported video formats for current browser
 */
export function getSupportedVideoFormats(): string[] {
  if (!isBrowser || !supportsVideoPlayback()) return [];
  
  const video = document.createElement('video');
  
  // Test common video formats
  const formats = [
    { type: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', shortName: 'mp4 (H.264)' },
    { type: 'video/webm; codecs="vp8, vorbis"', shortName: 'webm (VP8)' },
    { type: 'video/webm; codecs="vp9"', shortName: 'webm (VP9)' },
    { type: 'video/ogg; codecs="theora"', shortName: 'ogg' },
    { type: 'video/quicktime', shortName: 'mov (QuickTime)' }
  ];
  
  return formats
    .filter(format => video.canPlayType(format.type) !== '')
    .map(format => format.shortName);
}

/**
 * Check if the video file exists (HTTP HEAD request)
 */
export async function checkVideoExists(url: string): Promise<boolean> {
  try {
    // Use HEAD request to check existence without downloading the whole file
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`[deviceDetection] Error checking video existence: ${error}`);
    return false;
  }
}

/**
 * Detect browser name and version
 */
export function getBrowserInfo(): { name: string, version: string } {
  if (!isBrowser) return { name: 'unknown', version: 'unknown' };
  
  const userAgent = navigator.userAgent;
  let name = 'unknown';
  let version = 'unknown';
  
  // Safari
  if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
    name = 'Safari';
    version = userAgent.match(/Version\/(\d+(\.\d+)?)/)?.[1] || 'unknown';
  }
  // Chrome
  else if (userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Edg') === -1) {
    name = 'Chrome';
    version = userAgent.match(/Chrome\/(\d+(\.\d+)?)/)?.[1] || 'unknown';
  }
  // Edge
  else if (userAgent.indexOf('Edg') !== -1) {
    name = 'Edge';
    version = userAgent.match(/Edg\/(\d+(\.\d+)?)/)?.[1] || 'unknown';
  }
  // Firefox
  else if (userAgent.indexOf('Firefox') !== -1) {
    name = 'Firefox';
    version = userAgent.match(/Firefox\/(\d+(\.\d+)?)/)?.[1] || 'unknown';
  }
  
  return { name, version };
}

/**
 * Get connection speed estimation (rough approximation)
 */
export function getConnectionSpeed(): 'slow' | 'medium' | 'fast' | 'unknown' {
  if (!isBrowser || !('connection' in navigator)) return 'unknown';
  
  const conn = (navigator as any).connection;
  
  if (!conn) return 'unknown';
  
  // Use Network Information API if available
  if (conn.effectiveType) {
    switch (conn.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'slow';
      case '3g':
        return 'medium';
      case '4g':
        return 'fast';
      default:
        return 'unknown';
    }
  }
  
  // Fallback to bandwidth estimation if available
  if (typeof conn.downlink === 'number') {
    if (conn.downlink < 1) return 'slow';
    if (conn.downlink < 5) return 'medium';
    return 'fast';
  }
  
  return 'unknown';
}

export default {
  isMobileDevice,
  isIOSDevice,
  supportsVideoPlayback,
  canBrowserPlayFileType,
  getSupportedVideoFormats,
  checkVideoExists,
  getBrowserInfo,
  getConnectionSpeed
};
