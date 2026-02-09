# Phase 03: Audio Engine & Hooks

## Context

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** [Phase 01](./phase-01-project-scaffolding.md) (types), [Phase 02](./phase-02-permission-device-management.md) (permission/device hooks)
- **Research:** [Web Audio & Permissions](./research/researcher-01-web-audio-permissions.md), [SPA Architecture](./research/researcher-02-react-spa-architecture.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-09 |
| Description | Build the core audio processing pipeline: useMicrophone hook (getUserMedia wrapper), useAudioAnalyser hook (AudioContext + AnalyserNode), and useCanvasAnimation hook (requestAnimationFrame loop). Establish cleanup patterns for all audio resources. |
| Priority | High (blocks visualization and recording phases) |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

- Audio pipeline: `getUserMedia() -> MediaStream -> MediaStreamAudioSourceNode -> AnalyserNode -> visualization`
- `AnalyserNode.fftSize` controls resolution: 2048 default; 256 for lightweight meters, 1024 for spectrum
- iOS Safari requires `audioContext.resume()` after user gesture (AudioContext starts suspended)
- Cleanup order matters: stop tracks -> disconnect nodes -> close AudioContext
- `AudioContext.state` must be checked before `close()` to avoid InvalidStateError
- `requestAnimationFrame` must be cancelled on unmount to prevent memory leaks

## Requirements

1. `audio-service.ts` - audio pipeline creation, RMS calculation, capability detection
2. `useMicrophone` hook - getUserMedia wrapper with device selection, stream lifecycle
3. `useAudioAnalyser` hook - AudioContext + AnalyserNode setup, data extraction
4. `useCanvasAnimation` hook - requestAnimationFrame loop with canvas ref
5. Proper cleanup on unmount for all audio resources
6. iOS Safari AudioContext resume handling

## Architecture

```
useMicrophone(deviceId?)
  -> getUserMedia({ audio: { deviceId } })
  -> Returns: { stream, error, isActive, start(), stop() }

useAudioAnalyser(stream)
  -> Creates: AudioContext -> MediaStreamSourceNode -> AnalyserNode
  -> Returns: { analyser, frequencyData, timeDomainData, volume, sampleRate }
  -> Cleanup: disconnect nodes, close context

useCanvasAnimation(canvasRef, drawFn, isActive)
  -> requestAnimationFrame loop
  -> Calls drawFn(canvasContext, frameData) each frame
  -> Auto-cancels on unmount or isActive=false
```

### Data Flow Diagram

```
[User clicks Start]
       |
  useMicrophone.start()
       |
  MediaStream ──> useAudioAnalyser(stream)
       |                    |
       |         AudioContext + AnalyserNode
       |                    |
       |         getByteTimeDomainData() ──> WaveformViz
       |         getByteFrequencyData()  ──> SpectrumViz
       |         RMS calculation         ──> VolumeMeter
       |
  useCanvasAnimation(canvasRef, drawFn)
       |
  requestAnimationFrame loop @ 60fps
```

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `src/services/audio-service.ts` | Create | Audio pipeline factory, RMS calc, capabilities |
| `src/hooks/use-microphone.ts` | Create | getUserMedia wrapper with lifecycle management |
| `src/hooks/use-audio-analyser.ts` | Create | AudioContext + AnalyserNode hook |
| `src/hooks/use-canvas-animation.ts` | Create | requestAnimationFrame loop hook |
| `src/types/audio.ts` | Modify | Add AnalyserConfig, VolumeData types |

## Implementation Steps

### Step 1: Extend Audio Types

```typescript
// src/types/audio.ts (additions)
export interface AnalyserConfig {
  fftSize: number;             // 256 | 512 | 1024 | 2048
  smoothingTimeConstant: number; // 0-1, default 0.8
}

export interface VolumeData {
  rms: number;     // 0-1 normalized
  peak: number;    // 0-1 normalized
  db: number;      // decibels (negative, -Infinity to 0)
}

export interface AudioCapabilities {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  deviceId: string;
  label: string;
}
```

### Step 2: Create Audio Service

```typescript
// src/services/audio-service.ts

/** Create AudioContext + AnalyserNode from MediaStream */
export function createAudioPipeline(
  stream: MediaStream,
  config?: Partial<AnalyserConfig>,
): { audioContext: AudioContext; analyser: AnalyserNode; source: MediaStreamAudioSourceNode } {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = config?.fftSize ?? 2048;
  analyser.smoothingTimeConstant = config?.smoothingTimeConstant ?? 0.8;
  source.connect(analyser);
  return { audioContext, analyser, source };
}

/** Calculate RMS volume from time domain data */
export function calculateVolume(timeDomainData: Uint8Array): VolumeData {
  let sumSquares = 0;
  let peak = 0;
  for (let i = 0; i < timeDomainData.length; i++) {
    const normalized = (timeDomainData[i]! - 128) / 128;
    sumSquares += normalized * normalized;
    peak = Math.max(peak, Math.abs(normalized));
  }
  const rms = Math.sqrt(sumSquares / timeDomainData.length);
  const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
  return { rms, peak, db };
}

/** Extract audio track capabilities */
export function getTrackCapabilities(stream: MediaStream): AudioCapabilities {
  const track = stream.getAudioTracks()[0]!;
  const settings = track.getSettings();
  return {
    sampleRate: settings.sampleRate ?? 0,
    channelCount: settings.channelCount ?? 1,
    echoCancellation: settings.echoCancellation ?? false,
    noiseSuppression: settings.noiseSuppression ?? false,
    autoGainControl: settings.autoGainControl ?? false,
    deviceId: settings.deviceId ?? '',
    label: track.label,
  };
}

/** Cleanup all audio resources */
export function cleanupAudio(
  stream: MediaStream | null,
  audioContext: AudioContext | null,
): void {
  try {
    stream?.getTracks().forEach((track) => track.stop());
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
    }
  } catch (error) {
    console.warn('Audio cleanup error:', error);
  }
}
```

### Step 3: Create useMicrophone Hook

```typescript
// src/hooks/use-microphone.ts
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
```

### Step 4: Create useAudioAnalyser Hook

```typescript
// src/hooks/use-audio-analyser.ts
import { useState, useEffect, useRef, useCallback } from 'react';
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
```

### Step 5: Create useCanvasAnimation Hook

```typescript
// src/hooks/use-canvas-animation.ts
import { useEffect, useRef } from 'react';

type DrawFunction = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

export function useCanvasAnimation(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  drawFn: DrawFunction,
  isActive: boolean,
) {
  const animationRef = useRef<number>(0);
  const drawFnRef = useRef(drawFn);
  drawFnRef.current = drawFn; // Always use latest draw function

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle DPI scaling for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const animate = () => {
      drawFnRef.current(ctx, rect.width, rect.height);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [canvasRef, isActive]);
}
```

### Step 6: Verify iOS Safari AudioContext Resume

Ensure that `audioContext.resume()` is called within the same call stack as a user gesture. The `useMicrophone.start()` is called from a button click, and `useAudioAnalyser` receives the stream in the same render cycle, so the resume in the useEffect should work. However, if issues arise, move resume into `createAudioPipeline` and call it synchronously.

## Todo List

- [ ] Extend `src/types/audio.ts` with AnalyserConfig, VolumeData
- [ ] Create `src/services/audio-service.ts` (pipeline, volume calc, capabilities, cleanup)
- [ ] Create `src/hooks/use-microphone.ts` (getUserMedia wrapper)
- [ ] Create `src/hooks/use-audio-analyser.ts` (AudioContext + AnalyserNode)
- [ ] Create `src/hooks/use-canvas-animation.ts` (requestAnimationFrame loop)
- [ ] Test that audio pipeline creates and connects correctly
- [ ] Verify cleanup runs on unmount (no orphaned AudioContexts)
- [ ] Test iOS Safari AudioContext resume behavior
- [ ] Verify volume data updates at ~60fps

## Success Criteria

1. `useMicrophone.start()` successfully obtains a MediaStream from selected device
2. `useAudioAnalyser` creates AudioContext + AnalyserNode and extracts live volume data
3. Volume data updates continuously while stream is active (verify with console.log)
4. `useMicrophone.stop()` stops all tracks; audio resources cleaned up
5. Component unmount triggers full cleanup (no console warnings about leaked resources)
6. Canvas animation hook runs draw function at ~60fps when active, stops when inactive
7. DPI scaling produces crisp rendering on Retina displays

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| iOS AudioContext suspended state | High | High | Call resume() in pipeline creation; test on real device |
| Memory leak from orphaned AudioContext | Medium | High | Ref-based cleanup in useEffect; verify with DevTools |
| requestAnimationFrame not cancelled | Medium | Medium | animationRef pattern with cleanup return |
| Config changes recreating pipeline | Medium | Low | Exclude config from useEffect deps; document limitation |
| Stream ends unexpectedly (device unplug) | Low | Medium | Track 'ended' event listener; update state accordingly |

## Security Considerations

- AudioContext has fingerprinting potential (sampleRate, latency); no data is sent externally
- MediaStream is never recorded in this phase (recording in Phase 05)
- All audio processing is local; no network calls

## Next Steps

Proceed to [Phase 04: Audio Visualizations](./phase-04-audio-visualizations.md) to build Canvas-based waveform, volume meter, and spectrum visualizations using the analyser data from this phase.
