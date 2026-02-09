# Phase 04: Audio Visualizations

## Context

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** [Phase 03](./phase-03-audio-engine-hooks.md) (useAudioAnalyser, useCanvasAnimation)
- **Research:** [Web Audio Visualizations](./research/researcher-01-web-audio-permissions.md), [Canvas Techniques](./research/researcher-02-react-spa-architecture.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-09 |
| Description | Build three Canvas-based real-time audio visualizations: oscilloscope waveform, color-coded volume meter bar, and frequency spectrum bar chart. All driven by AnalyserNode data via useCanvasAnimation. |
| Priority | High (core visual feedback for mic testing) |
| Implementation Status | ✅ Complete (2026-02-09) |
| Review Status | Pending |

## Key Insights

- `getByteTimeDomainData()`: 8-bit PCM waveform (0-255, 128=silence) for oscilloscope
- `getByteFrequencyData()`: frequency magnitude in dB scale (0-255) for spectrum bars
- Volume meter driven by RMS from time domain data (already computed in useAudioAnalyser)
- Canvas `fillRect()` batching is fastest for bar charts; `lineTo()` paths for waveform curves
- DPI scaling handled in useCanvasAnimation hook (Phase 03)
- Target: 60fps desktop, 30fps+ mobile; Canvas is performant enough for all three

## Requirements

1. `WaveformViz` component - oscilloscope-style line drawing from time domain data
2. `VolumeMeter` component - vertical/horizontal bar with green/yellow/red color zones
3. `SpectrumViz` component - frequency bar chart from frequency domain data
4. All visualizations accept an AnalyserNode and render via useCanvasAnimation
5. Responsive canvas sizing (fill parent container)
6. Smooth animation with exponential decay for volume meter

## Architecture

```
AnalyserNode (from useAudioAnalyser)
  |
  |-- getByteTimeDomainData() --> WaveformViz (Canvas lineTo path)
  |-- getByteFrequencyData()  --> SpectrumViz (Canvas fillRect bars)
  |-- VolumeData (from hook)  --> VolumeMeter (Canvas fillRect + gradient)
```

Each viz component:
1. Receives `analyser: AnalyserNode | null` and `isActive: boolean` as props
2. Creates internal canvas ref
3. Defines draw function that reads analyser data and renders to canvas
4. Passes canvas ref + draw fn + isActive to `useCanvasAnimation`

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `src/components/audio/waveform-viz.tsx` | Create | Oscilloscope waveform visualization |
| `src/components/audio/volume-meter.tsx` | Create | Color-coded volume bar |
| `src/components/audio/spectrum-viz.tsx` | Create | Frequency spectrum bar chart |

## Implementation Steps

### Step 1: Create WaveformViz Component

```tsx
// src/components/audio/waveform-viz.tsx
import { useRef, useCallback } from 'react';
import { useCanvasAnimation } from '../../hooks/use-canvas-animation';

interface WaveformVizProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

export function WaveformViz({ analyser, isActive }: WaveformVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!analyser) return;

    // Lazy-init data array
    if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.frequencyBinCount) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
    analyser.getByteTimeDomainData(dataArrayRef.current);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw waveform line
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3b82f6'; // blue-500
    ctx.beginPath();

    const sliceWidth = width / dataArrayRef.current.length;
    let x = 0;

    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const v = dataArrayRef.current[i]! / 255.0;
      const y = v * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }, [analyser]);

  useCanvasAnimation(canvasRef, draw, isActive);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-lg bg-slate-100 dark:bg-slate-800"
      aria-label="Audio waveform visualization"
      role="img"
    />
  );
}
```

### Step 2: Create VolumeMeter Component

```tsx
// src/components/audio/volume-meter.tsx
import { useRef, useCallback } from 'react';
import { useCanvasAnimation } from '../../hooks/use-canvas-animation';
import type { VolumeData } from '../../types/audio';

interface VolumeMeterProps {
  volume: VolumeData;
  isActive: boolean;
}

// Color thresholds (normalized 0-1):
// Green: 0 - 0.4 (quiet)
// Yellow: 0.4 - 0.7 (speaking)
// Red: 0.7 - 1.0 (loud/clipping)

export function VolumeMeter({ volume, isActive }: VolumeMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smoothedRef = useRef(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Exponential smoothing for decay
    smoothedRef.current = smoothedRef.current * 0.85 + volume.rms * 0.15;
    const level = Math.min(smoothedRef.current, 1);

    ctx.clearRect(0, 0, width, height);

    // Background track
    ctx.fillStyle = '#e2e8f0'; // slate-200
    ctx.fillRect(0, 0, width, height);

    // Colored fill based on level
    const fillWidth = level * width;
    if (level < 0.4) {
      ctx.fillStyle = '#22c55e'; // green-500
    } else if (level < 0.7) {
      ctx.fillStyle = '#eab308'; // yellow-500
    } else {
      ctx.fillStyle = '#ef4444'; // red-500
    }
    ctx.fillRect(0, 0, fillWidth, height);

    // Peak indicator line
    const peakX = Math.min(volume.peak, 1) * width;
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(peakX - 1, 0, 2, height);
  }, [volume]);

  useCanvasAnimation(canvasRef, draw, isActive);

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full h-6 rounded-full"
        aria-label={`Volume level: ${Math.round(volume.rms * 100)}%`}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(volume.rms * 100)}
      />
      <p className="text-xs text-slate-500 mt-1 text-center">
        {volume.db > -Infinity ? `${volume.db.toFixed(1)} dB` : 'Silent'}
      </p>
    </div>
  );
}
```

### Step 3: Create SpectrumViz Component

```tsx
// src/components/audio/spectrum-viz.tsx
import { useRef, useCallback } from 'react';
import { useCanvasAnimation } from '../../hooks/use-canvas-animation';

interface SpectrumVizProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

export function SpectrumViz({ analyser, isActive }: SpectrumVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!analyser) return;

    if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.frequencyBinCount) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
    analyser.getByteFrequencyData(dataArrayRef.current);

    ctx.clearRect(0, 0, width, height);

    // Draw frequency bars
    const barCount = 64; // Reduce bins for visual clarity
    const binSize = Math.floor(dataArrayRef.current.length / barCount);
    const barWidth = (width / barCount) - 1; // 1px gap

    for (let i = 0; i < barCount; i++) {
      // Average the bins for this bar
      let sum = 0;
      for (let j = 0; j < binSize; j++) {
        sum += dataArrayRef.current[i * binSize + j]!;
      }
      const avg = sum / binSize;
      const barHeight = (avg / 255) * height;

      // Color gradient: blue -> purple -> pink based on frequency
      const hue = 220 + (i / barCount) * 60; // 220 (blue) to 280 (purple)
      ctx.fillStyle = `hsl(${hue}, 70%, 55%)`;
      ctx.fillRect(i * (barWidth + 1), height - barHeight, barWidth, barHeight);
    }
  }, [analyser]);

  useCanvasAnimation(canvasRef, draw, isActive);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-40 rounded-lg bg-slate-100 dark:bg-slate-800"
      aria-label="Audio frequency spectrum visualization"
      role="img"
    />
  );
}
```

### Step 4: Handle Responsive Canvas Sizing

Canvas dimensions are set in `useCanvasAnimation` via `getBoundingClientRect()`. To handle window resize:

```typescript
// Inside useCanvasAnimation, add resize observer:
useEffect(() => {
  if (!canvasRef.current) return;
  const observer = new ResizeObserver(() => {
    // Canvas will be re-sized on next animation frame
    // The draw loop already reads getBoundingClientRect
  });
  observer.observe(canvasRef.current);
  return () => observer.disconnect();
}, [canvasRef]);
```

Alternatively, keep it simple: set canvas CSS size via Tailwind classes (`w-full h-32`), and the DPI scaling in useCanvasAnimation handles the rest. Re-create animation on resize events if needed.

### Step 5: Dark Mode Canvas Colors

Visualizations should adapt to dark/light theme. Options:
- **Simple:** Use CSS `currentColor` and detect via `getComputedStyle` in draw function
- **Recommended:** Accept optional `colors` prop or use a theme context to pass colors

For KISS, hardcode two color sets and toggle based on a `isDark` prop:

```typescript
const bgColor = isDark ? '#1e293b' : '#f1f5f9'; // slate-800 / slate-100
const lineColor = isDark ? '#60a5fa' : '#3b82f6'; // blue-400 / blue-500
```

## Todo List

- [x] Create `src/components/audio/waveform-viz.tsx` with oscilloscope drawing
- [x] Create `src/components/audio/volume-meter.tsx` with color-coded bar + peak indicator
- [x] Create `src/components/audio/spectrum-viz.tsx` with frequency bar chart
- [x] Add responsive canvas sizing (CSS width + DPI scaling)
- [x] Add dark mode color support to all three visualizations
- [x] Test all three visualizations render with live mic input
- [ ] Verify 60fps performance on desktop (Chrome DevTools Performance tab)
- [x] Verify smooth volume meter decay animation
- [x] Add ARIA attributes for accessibility

## Success Criteria

1. Waveform shows real-time oscilloscope line that responds to voice/sound
2. Volume meter bar fills proportionally with green/yellow/red color zones
3. Volume meter has smooth decay (not jumpy)
4. Spectrum shows frequency distribution with bars rising/falling in real-time
5. All three render at 60fps on desktop without jank
6. Canvas is crisp on Retina/HiDPI displays
7. Visualizations adapt to dark/light theme
8. ARIA labels present on all canvas elements

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Canvas performance on low-end mobile | Medium | Medium | Reduce barCount/fftSize on mobile; throttle to 30fps |
| Blurry canvas on HiDPI | Low | Medium | DPI scaling in useCanvasAnimation handles this |
| Color accessibility (red/green) | Medium | Medium | Don't rely solely on color; volume meter has dB text label |
| Draw function recreated every render | Medium | Low | useCallback + ref pattern for stable draw fn reference |

## Security Considerations

- Canvas rendering is purely local; no data leaves the browser
- Canvas `toDataURL()` not used; no image export of audio data

## Next Steps

Proceed to [Phase 05: Testing Flow & Recording](./phase-05-testing-flow-recording.md) to orchestrate the complete test flow, add MediaRecorder support, and build the results display.
