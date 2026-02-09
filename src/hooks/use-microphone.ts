import { useState, useCallback, useRef, useEffect } from 'react';
import { getPermissionErrorMessage } from '../services/permission-service';

export function useMicrophone() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async (deviceId?: string) => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsActive(true);
    } catch (err) {
      setError(getPermissionErrorMessage(err));
      setIsActive(false);
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    setIsActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { stream, error, isActive, start, stop };
}
