import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Detects the best supported MIME type for MediaRecorder
 * Tries in order: audio/webm with opus codec, audio/webm, audio/mp4 (Safari)
 */
function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4'
  ];
  
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

/**
 * Hook for recording audio from a MediaStream
 * Handles MediaRecorder lifecycle, blob creation, and URL management
 */
export function useRecorder(stream: MediaStream | null) {
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);

  const start = useCallback(() => {
    if (!stream) return;
    
    // Revoke previous recording URL to prevent memory leaks
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(
      stream, 
      mimeType ? { mimeType } : undefined
    );
    
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setRecordingUrl(url);
      setIsRecording(false);
    };

    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);
  }, [stream]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);

  return { recordingUrl, isRecording, start, stop };
}
