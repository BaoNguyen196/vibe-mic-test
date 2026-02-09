import { useState, useEffect, useRef } from 'react';
import { createAudioPipeline, calculateVolume, cleanupAudio } from '../services/audio-service';
import type { VolumeData, AnalyserConfig } from '../types/audio';

export function useAudioAnalyser(stream: MediaStream | null, config?: Partial<AnalyserConfig>) {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [volume, setVolume] = useState<VolumeData>({ rms: 0, peak: 0, db: -Infinity });
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!stream) return;

    const pipeline = createAudioPipeline(stream, config);
    audioContextRef.current = pipeline.audioContext;
    setAnalyser(pipeline.analyser);

    // iOS Safari: resume AudioContext after user gesture
    if (pipeline.audioContext.state === 'suspended') {
      pipeline.audioContext.resume();
    }

    // Volume monitoring loop
    const dataArray = new Uint8Array(pipeline.analyser.frequencyBinCount);
    const updateVolume = () => {
      pipeline.analyser.getByteTimeDomainData(dataArray);
      setVolume(calculateVolume(dataArray));
      animationRef.current = requestAnimationFrame(updateVolume);
    };
    animationRef.current = requestAnimationFrame(updateVolume);

    return () => {
      cancelAnimationFrame(animationRef.current);
      cleanupAudio(null, pipeline.audioContext); // Don't stop stream here; useMicrophone owns it
    };
  }, [stream]); // config intentionally excluded to avoid recreating pipeline

  return { analyser, volume };
}
