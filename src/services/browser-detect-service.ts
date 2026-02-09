import type { BrowserInfo } from '../types/audio';

/**
 * Detect browser, OS, platform, and API support capabilities.
 * Parses user agent string and checks for Web API availability.
 *
 * @returns BrowserInfo object with detection results
 */
export function detectBrowser(): BrowserInfo {
  const ua = navigator.userAgent;

  // Detect browser (order matters: Edge, Opera, Chrome, Safari, Firefox)
  let name = 'Unknown';
  let version = '';

  if (/Edg\//i.test(ua)) {
    name = 'Edge';
    const match = ua.match(/Edg\/(\d+\.\d+)/);
    version = match?.[1] ?? '';
  } else if (/OPR\//i.test(ua)) {
    name = 'Opera';
    const match = ua.match(/OPR\/(\d+\.\d+)/);
    version = match?.[1] ?? '';
  } else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) {
    name = 'Chrome';
    const match = ua.match(/Chrome\/(\d+\.\d+)/);
    version = match?.[1] ?? '';
  } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    name = 'Safari';
    const match = ua.match(/Version\/(\d+\.\d+)/);
    version = match?.[1] ?? '';
  } else if (/Firefox\//i.test(ua)) {
    name = 'Firefox';
    const match = ua.match(/Firefox\/(\d+\.\d+)/);
    version = match?.[1] ?? '';
  }

  // Detect OS
  let os = 'Unknown';
  if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
  } else if (/Android/i.test(ua)) {
    os = 'Android';
  } else if (/Mac/i.test(ua)) {
    os = 'macOS';
  } else if (/Win/i.test(ua)) {
    os = 'Windows';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // Detect platform
  let platform = 'Desktop';
  if (/Mobile/i.test(ua)) {
    platform = 'Mobile';
  } else if (/Tablet|iPad/i.test(ua)) {
    platform = 'Tablet';
  }

  // Check API support
  const supportsGetUserMedia = !!(navigator.mediaDevices?.getUserMedia);
  const supportsPermissionsApi = !!(navigator.permissions?.query);
  const supportsMediaRecorder = typeof MediaRecorder !== 'undefined';

  return {
    name,
    version,
    os,
    platform,
    supportsGetUserMedia,
    supportsPermissionsApi,
    supportsMediaRecorder,
  };
}
