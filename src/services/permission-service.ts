import type { PermissionStatus } from '../types/state';

/**
 * Query the microphone permission state using the Permissions API.
 * Falls back to 'unknown' for browsers without Permissions API support (Safari).
 *
 * @returns Promise resolving to permission status ('prompt', 'granted', 'denied', or 'unknown')
 */
export async function queryMicPermission(): Promise<PermissionStatus> {
  try {
    // Check if Permissions API is available
    if (!navigator.permissions?.query) {
      // Safari doesn't support Permissions API
      return 'unknown';
    }

    // Query microphone permission
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return result.state as PermissionStatus;
  } catch (error) {
    // Handle errors gracefully, return unknown state
    console.warn('Failed to query microphone permission:', error);
    return 'unknown';
  }
}

/**
 * Listen for microphone permission changes.
 * Only works in browsers that support the Permissions API (Chrome, Firefox).
 *
 * @param callback - Function to call when permission state changes
 * @returns Cleanup function to remove the listener, or null if not supported
 */
export function onPermissionChange(
  callback: (state: PermissionStatus) => void
): (() => void) | null {
  try {
    // Check if Permissions API is available
    if (!navigator.permissions?.query) {
      return null;
    }

    // Query permission object and add listener
    navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
      const handler = () => {
        callback(result.state as PermissionStatus);
      };

      result.addEventListener('change', handler);

      // Return cleanup function
      return () => {
        result.removeEventListener('change', handler);
      };
    });

    return null;
  } catch (error) {
    console.warn('Failed to set up permission change listener:', error);
    return null;
  }
}

/**
 * Map DOMException errors to user-friendly messages.
 *
 * @param error - Error object from getUserMedia or related APIs
 * @returns User-friendly error message
 */
export function getPermissionErrorMessage(error: unknown): string {
  // Check if error is a DOMException
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
        return 'Microphone access denied. Check browser settings.';
      case 'NotFoundError':
        return 'No microphone found. Connect a mic and try again.';
      case 'NotReadableError':
        return 'Mic is in use by another app. Close it and try again.';
      case 'OverconstrainedError':
        return 'Selected mic unavailable. Try another device.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  // Non-DOMException errors
  return 'An unexpected error occurred.';
}
