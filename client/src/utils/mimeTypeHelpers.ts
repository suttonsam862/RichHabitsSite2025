/**
 * MIME Type Helpers for Media Content
 * 
 * This utility provides helpers for handling MIME types, especially
 * for video and audio playback with improved mobile compatibility.
 */

import React from 'react';
import { isIOSDevice, isMobileDevice } from './deviceDetection';

/**
 * Maps file extensions to their corresponding MIME types
 */
const mimeTypeMap: Record<string, string> = {
  // Video formats
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  ogv: 'video/ogg',
  mov: 'video/quicktime',
  qt: 'video/quicktime',
  avi: 'video/x-msvideo',
  flv: 'video/x-flv',
  wmv: 'video/x-ms-wmv',
  mpg: 'video/mpeg',
  mpeg: 'video/mpeg',
  '3gp': 'video/3gpp',
  
  // Audio formats
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  oga: 'audio/ogg',
  aac: 'audio/aac',
  m4a: 'audio/mp4',
  flac: 'audio/flac',
  
  // Image formats
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon'
};

/**
 * Get HTTP headers for serving video content, including
 * range support and proper caching
 */
export function getVideoHeaders(fileType: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': getMimeTypeFromExtension(fileType) || 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
  };
  
  return headers;
}

/**
 * Get the MIME type based on a file extension
 * 
 * @param filename File name or extension
 * @returns The MIME type or null if not recognized
 */
export function getMimeTypeFromExtension(filename: string): string | null {
  // Extract extension from filename if full path provided
  const extension = filename.includes('.')
    ? filename.split('.').pop()?.toLowerCase()
    : filename.toLowerCase();
    
  if (!extension) return null;
  
  return mimeTypeMap[extension] || null;
}

/**
 * Get alternative MIME types for a given source based on device capabilities
 * This helps handle different format support across browsers and devices
 */
export function getAlternativeMimeTypes(source: string): { type: string, src: string }[] {
  const extension = source.split('.').pop()?.toLowerCase();
  if (!extension) return [];
  
  const basePath = source.substring(0, source.lastIndexOf('.'));
  const alternatives: { type: string, src: string }[] = [];
  
  // Start with the original
  const originalMimeType = mimeTypeMap[extension];
  if (originalMimeType) {
    alternatives.push({ 
      type: originalMimeType,
      src: source
    });
  }
  
  // For mobile devices, prioritize certain formats
  if (isMobileDevice()) {
    // Most mobile devices prefer MP4
    if (extension !== 'mp4' && !isIOSDevice()) {
      alternatives.push({
        type: 'video/mp4',
        src: `${basePath}.mp4`
      });
    }
    
    // iOS specific formats
    if (isIOSDevice() && extension !== 'm4v') {
      alternatives.push({
        type: 'video/mp4',
        src: `${basePath}.m4v`
      });
    }
  } else {
    // Desktop browsers - add WebM as alternative
    if (extension !== 'webm') {
      alternatives.push({
        type: 'video/webm',
        src: `${basePath}.webm`
      });
    }
  }
  
  return alternatives;
}

/**
 * Generate video source elements for multiple formats
 * to improve cross-browser compatibility
 */
export function generateVideoSourceElements(source: string): React.ReactElement[] {
  const alternatives = getAlternativeMimeTypes(source);
  
  return alternatives.map(({ type, src }, index) => {
    return React.createElement('source', {
      key: `source-${index}`,
      src: src,
      type: type
    });
  });
}

/**
 * Test if a browser can play a specific MIME type
 */
export function canBrowserPlayMimeType(mimeType: string): boolean {
  // Not in browser environment
  if (typeof document === 'undefined') return false;
  
  // For video types
  if (mimeType.startsWith('video/')) {
    const video = document.createElement('video');
    return video.canPlayType(mimeType) !== '';
  }
  
  // For audio types
  if (mimeType.startsWith('audio/')) {
    const audio = document.createElement('audio');
    return audio.canPlayType(mimeType) !== '';
  }
  
  return false;
}

export default {
  getMimeTypeFromExtension,
  getAlternativeMimeTypes,
  generateVideoSourceElements,
  canBrowserPlayMimeType,
  getVideoHeaders
};
