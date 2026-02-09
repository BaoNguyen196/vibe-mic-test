import { useState, useEffect, useCallback } from 'react';
import type { PermissionStatus } from '../types/state';

/**
 * Custom hook for managing microphone permission state.
 *
 * Queries initial permission status on mount, listens for changes,
 * and provides a callback to request permission via getUserMedia.
 *
 * @returns Permission state and request function
 */
export function usePermission() {
  const [status, setStatus] = useState<PermissionStatus>('unknown');
  const [isLoading, setIsLoading] = useState(true);

  // Query initial permission on mount
  useEffect(() => {
    // Inline permission query logic (Safari fallback)
    const queryPermission = async () => {
      try {
        if (!navigator.permissions?.query) {
          setStatus('unknown');
          setIsLoading(false);
          return;
        }
        const result = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        setStatus(result.state as PermissionStatus);
        setIsLoading(false);

        // Listen for changes
        const handleChange = () => setStatus(result.state as PermissionStatus);
        result.addEventListener('change', handleChange);
        return () => result.removeEventListener('change', handleChange);
      } catch {
        setStatus('unknown');
        setIsLoading(false);
      }
    };

    let cleanup: (() => void) | void;
    queryPermission().then((fn) => { cleanup = fn; });
    return () => cleanup?.();
  }, []);

  // Request permission via getUserMedia
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus('granted');
      return stream;
    } catch (error) {
      setStatus('denied');
      throw error; // Re-throw for component-level handling
    }
  }, []);

  return { status, isLoading, requestPermission };
}
