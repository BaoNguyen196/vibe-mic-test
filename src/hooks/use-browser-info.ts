import { useMemo } from 'react';
import type { BrowserInfo } from '../types/audio';

/**
 * Custom hook for browser/OS/platform detection.
 *
 * Performs detection once on mount using useMemo with empty dependencies.
 * Inline logic enables parallel execution without service dependencies.
 *
 * @returns Browser information including API support flags
 */
export function useBrowserInfo(): BrowserInfo {
  return useMemo(() => {
    // Inline browser detection (no service import for parallel execution)
    const ua = navigator.userAgent;

    // Browser detection
    let name = 'Unknown';
    let version = '';
    if (/Edg\//i.test(ua)) {
      name = 'Edge';
      version = ua.match(/Edg\/([\d.]+)/)?.[1] ?? '';
    } else if (/OPR\//i.test(ua)) {
      name = 'Opera';
      version = ua.match(/OPR\/([\d.]+)/)?.[1] ?? '';
    } else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) {
      name = 'Chrome';
      version = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? '';
    } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
      name = 'Safari';
      version = ua.match(/Version\/([\d.]+)/)?.[1] ?? '';
    } else if (/Firefox\//i.test(ua)) {
      name = 'Firefox';
      version = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? '';
    }

    // OS detection
    let os = 'Unknown';
    if (/iPad|iPhone|iPod/.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Linux/i.test(ua)) os = 'Linux';

    // Platform detection
    let platform: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
    if (/iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
      platform = 'Tablet';
    } else if (/Mobile|iPhone|iPod|Android.*Mobile/i.test(ua)) {
      platform = 'Mobile';
    }

    // API support
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
  }, []);
}
