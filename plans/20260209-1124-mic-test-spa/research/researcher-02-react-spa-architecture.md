# Research Report: Microphone Test SPA Architecture & Implementation
**Date:** February 9, 2026 | **Focus:** React + Vite + Tailwind CSS + Web Audio APIs

---

## 1. Project Setup (React + Vite + TypeScript + Tailwind v4)

### Vite Configuration (2026 Best Practices)
- **Performance:** Vite delivers 40x faster builds than CRA; supports fast HMR with TypeScript out-of-box
- **Config Pattern:** Use `vite.config.ts` with `defineConfig()` helper; ESM-native configuration
- **React 18+ Support:** No special config needed; Vite auto-detects React via plugin
- **Key Dev Optimizations:** SWC/esbuild for near-instant transpilation; tree-shaking for production bundles

### Tailwind CSS v4 Integration
- **Zero-Config Approach:** Single CSS import `@import "tailwindcss"` replaces v3's `@tailwind` directives
- **Vite Plugin:** Add `@tailwindcss/vite` plugin to `vite.config.ts` (no separate `tailwind.config.js` required)
- **Performance Gains:** Full builds 5x faster; incremental builds 100x+ faster (microseconds)
- **Installation:** `npm install -D tailwindcss @tailwindcss/vite`

### Folder Structure (SPA Best Practices)
```
src/
├── components/
│   ├── common/           (Button, Modal, Tooltip)
│   ├── audio/            (WaveformViz, SpectrumViz, VolumeMeter)
│   └── flow/             (PermissionStep, DeviceSelect, TestingPhase, Results)
├── hooks/                (useMicrophone, useAudioAnalyser, useCanvasAnimation)
├── services/             (audioService.ts, permissionService.ts)
├── context/              (AudioContext, ThemeContext)
├── types/                (audio.ts, state.ts)
├── styles/               (index.css)
└── App.tsx
```
**Naming Convention:** kebab-case for files/folders (case-sensitive FS compatibility); PascalCase for components

### Code Quality Setup (2026)
- **ESLint:** Flat Config system (eslint.config.js); @typescript-eslint now optional for React 19+
- **Prettier:** Install `eslint-config-prettier` to avoid conflicts; format on save via IDE
- **Recommended Packages:**
  - `eslint-plugin-react-hooks` (enforce Rules of Hooks)
  - `eslint-plugin-react-refresh` (HMR safety)
  - `prettier` + IDE integration (VS Code Prettier extension)
- **Pre-commit Hooks:** Husky + lint-staged for automated code checks

---

## 2. React Architecture for Audio Applications

### Custom Hooks Design

**`useMicrophone` Hook**
- Wraps `navigator.mediaDevices.getUserMedia()` with permission handling
- Returns: `{ stream, error, isLoading, requestPermission(), stopStream() }`
- Manages MediaStream lifecycle within useEffect cleanup
- Handles iOS Safari quirks (permission state persistence)

**`useAudioAnalyser` Hook**
- Initializes `AudioContext`, `AnalyserNode`, `MediaStreamAudioSourceNode`
- Provides frequency/time domain data via `getByteFrequencyData()` / `getByteTimeDomainData()`
- Returns: `{ analyser, dataArray, cleanup() }`
- Essential cleanup: disconnect nodes, close AudioContext (if state !== 'closed')

**`useCanvasAnimation` Hook**
- Manages `requestAnimationFrame` loop for 60fps rendering
- Accepts canvas ref and draw function: `useCanvasAnimation(canvasRef, (ctx, data) => {...})`
- Auto-cancels animation on unmount; handles DPI scaling for crisp visuals

### State Management Strategy
**Flow:** Permission → Device Select → Testing → Results

**Recommended Approach:** Use `useState` + `useCallback` for local component state; Context API for shared audio state (analyser, stream, selectedDevice)

**State Structure:**
```typescript
interface AudioFlowState {
  step: 'permission' | 'device-select' | 'testing' | 'results';
  permissionStatus: 'pending' | 'granted' | 'denied';
  stream: MediaStream | null;
  selectedDevice: MediaDeviceInfo | null;
  testMetrics: { peakLevel: number; avgLevel: number; duration: number };
}
```

**Context Setup:** Avoid prop drilling; use `AudioContext` provider at App root with reducer pattern for complex flows

### Component Composition Patterns
- **Container Pattern:** `<AudioTestFlow>` manages state, orchestrates sub-steps
- **Presentation Pattern:** `<PermissionPrompt>`, `<DeviceSelector>`, `<TestingArea>` receive props/callbacks
- **Separation:** Logic in hooks/services; rendering in components
- **Reusability:** Extract visualization components (`<WaveformCanvas>`, `<VolumeBar>`) for test/demo purposes

---

## 3. Audio Visualization Techniques

### Real-Time Waveform Rendering
- **Data Source:** `getByteTimeDomainData()` returns 8-bit PCM samples (0-255 range)
- **Canvas Drawing:** Scale samples to canvas height; use `strokeStyle` + `lineTo()` path for smooth curves
- **Pattern:** Shift canvas left via `drawImage(canvas, offsetX, 0)` to create scrolling effect (efficient; avoids full redraw)
- **Optimization:** Use `clearRect()` only on the new segment area, not entire canvas

### Volume Meter (Color Coded)
- **Data:** Average of `getByteFrequencyData()` determines overall level
- **Thresholds (dB scale):**
  - Green: -40 to -20dB (idle/quiet)
  - Yellow: -20 to -10dB (speaking level)
  - Red: -10dB+ (loud/clipping risk)
- **Animation:** Smooth decay using `currentLevel = currentLevel * 0.9 + newLevel * 0.1` (exponential smoothing)

### Frequency Spectrum Visualization
- **Data Source:** `getByteFrequencyData()` (1024-point default FFT)
- **Bar Chart Approach:** Divide canvas width by buffer length; bar height = dataArray[i] normalized
- **Performance:** Canvas-based rendering (not SVG) for 60fps; use `fillRect()` batching
- **Smoothing:** Apply logarithmic binning (map linear FFT bins to perceptual frequency scale)

### requestAnimationFrame Pattern
```typescript
useEffect(() => {
  let animationId: number;

  const draw = () => {
    analyser.getByteFrequencyData(dataArray);
    // Draw on canvas
    canvasRef.current?.drawImage(...)
    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(animationId);
}, [analyser, dataArray]);
```
- **Key:** Call `requestAnimationFrame()` at end of draw function for continuous loop
- **Cleanup:** Always `cancelAnimationFrame()` in return statement

---

## 4. Audio Resource Cleanup (Critical)

### MediaStream Cleanup
```typescript
const stopAudio = (stream: MediaStream) => {
  stream.getTracks().forEach(track => track.stop());
};
```
- Stop individual tracks (audio + video) explicitly
- Triggers OS permission revocation UI on some platforms

### AudioContext Cleanup
```typescript
useEffect(() => {
  return () => {
    if (source) source.disconnect();
    if (analyser) analyser.disconnect();
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close(); // Only close if not already closing
    }
  };
}, []);
```
- Check state before closing (prevents "InvalidStateError")
- Disconnect all nodes in dependency order: source → analyser → destination

### Combined Cleanup Pattern
```typescript
const cleanup = useCallback(() => {
  try {
    // Stop media stream
    stream?.getTracks().forEach(track => track.stop());

    // Close audio context
    if (audioContext?.state !== 'closed') {
      audioContext.close();
    }
  } catch (error) {
    console.warn('Cleanup error:', error);
  }
}, [stream, audioContext]);
```

---

## 5. UI/UX Patterns for Mic Test Apps

### Step-by-Step Flow UI
1. **Permission Screen:** Clear explanation ("We need mic access"); single CTA button
2. **Device Selector:** Dropdown/list of available `inputDevices`; preview selected device
3. **Testing Phase:** Real-time visualizations; countdown timer (10-15s); large RED recording indicator
4. **Results Summary:** Peak level, avg level, device name, replay audio clip

### Dark/Light Theme (Tailwind v4)
- **Config:** Set `darkMode: 'class'` (not 'media') in Vite plugin config
- **Pattern:** Add/remove 'dark' class on `<html>` element
- **Hook Implementation:**
  ```typescript
  const [isDark, setIsDark] = useState(() =>
    localStorage.getItem('theme') === 'dark' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  ```
- **Styling:** Use `dark:` prefix for dark mode variants (e.g., `bg-white dark:bg-slate-900`)

### Responsive Design (Mobile-First)
- **Breakpoints:** sm: 640px | md: 768px | lg: 1024px | xl: 1280px
- **Audio App Specifics:**
  - Mobile: Stack visualizations vertically; full-width controls
  - Tablet+: Side-by-side waveform + spectrum; compact controls
  - Usage: `flex flex-col md:flex-row`, `w-full md:w-1/2`

### Accessibility Considerations
- **Screen Readers:** Use semantic HTML (`<button>`, `<label>`); ARIA labels for visualizations
- **Focus Management:** Keyboard navigation for device selector; focus indicator on buttons
- **Color Contrast:** Ensure 4.5:1 ratio; don't rely solely on color (red/green) for feedback
- **Audio Cues:** Optional sound feedback for recording start/stop; caption for real-time levels

### iOS Safari Quirks & Mobile Handling
- **Permission Model:** iOS requires explicit user gesture (click) to call `getUserMedia()`; permissions persist in Settings
- **AudioContext:** May require `resume()` after user interaction (`audioContext.resume()` on first click)
- **HTTPS Requirement:** getUserMedia only works on HTTPS (or localhost)
- **Background Audio:** App may be suspended if backgrounded; pause visualization to conserve battery
- **Bluetooth Devices:** Test with external mics; iOS handles audio routing automatically

---

## 6. Key Implementation Checklist

- [x] Vite config with React + TypeScript + Tailwind v4 plugin
- [x] Folder structure with kebab-case files, PascalCase components
- [x] ESLint (Flat Config) + Prettier setup
- [x] Custom hooks: `useMicrophone`, `useAudioAnalyser`, `useCanvasAnimation`
- [x] State management: Context API for audio flow
- [x] Canvas visualizations: Waveform (scrolling), spectrum (bars), volume meter (color-coded)
- [x] requestAnimationFrame cleanup pattern
- [x] MediaStream + AudioContext cleanup in useEffect
- [x] Dark/light theme toggle with localStorage persistence
- [x] Responsive design (mobile-first) for audio tools
- [x] Accessibility: ARIA labels, keyboard nav, color contrast
- [x] iOS Safari handling: Gesture requirement, HTTPS, audioContext.resume()

---

## 7. Recommended Libraries (Optional Dependencies)

- **Audio Analysis:** No external lib needed; Web Audio API is sufficient
- **Canvas Animation:** Custom hook recommended over libraries (minimal overhead)
- **State Management:** Context API recommended; Zustand if state complexity grows
- **UI Components:** Headless UI (Radix UI) if complex dropdowns/dialogs needed
- **Testing:** Vitest (Vite-optimized); Mock Web Audio API with Jest

---

## 8. Performance Benchmarks & Goals

- **Canvas FPS:** Target 60fps on desktop, 30fps minimum on mobile
- **AudioContext:** Minimal latency (<50ms) for real-time feedback
- **Bundle Size:** <150KB (gzipped) for React + Vite + Tailwind v4
- **Memory:** <50MB RAM during active testing (with cleanup)

---

## Sources

- [Complete Guide to Setting Up React with TypeScript and Vite (2026) | Medium](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2)
- [How to Set Up a Production-Ready React Project with TypeScript and Vite](https://oneuptime.com/blog/post/2026-01-08-react-typescript-vite-production-setup/view)
- [Configuring Vite | Vite](https://vite.dev/config/)
- [How to build a React + TypeScript app with Vite - LogRocket Blog](https://blog.logrocket.com/how-to-build-react-typescript-app-vite/)
- [Installation of tailwind 4.0 + vite | Medium](https://medium.com/@npguapo/installation-of-tailwind-vite-react-javascript-or-typescript-ec1abdfa56b2)
- [Installing Tailwind CSS with Vite - Tailwind CSS](https://tailwindcss.com/docs)
- [Camera & Microphone - React Video and Audio Docs](https://getstream.io/video/docs/react/guides/camera-and-microphone/)
- [GitHub - dcollien/react-media-hooks: Using MediaDevice, WebAudio in React hooks](https://github.com/dcollien/react-media-hooks)
- [Publishing my first React library (useHook for mic volume) | Medium](https://nikhilsachdeva57.medium.com/publishing-my-first-react-library-a-custom-hook-to-get-mics-input-volume-ebe3d5598a4e)
- [Visualizations with Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
- [Visualizing Audio as a Waveform in React - DEV Community](https://dev.to/ssk14/visualizing-audio-as-a-waveform-in-react-o67)
- [Adding Audio Visualization to a React App With Web Audio API - Telerik](https://www.telerik.com/blogs/adding-audio-visualization-react-app-using-web-audio-api)
- [React useEffect Cleanup Function | Refine](https://refine.dev/blog/useeffect-cleanup/)
- [Building an audio player in React | LogRocket Blog](https://blog.logrocket.com/building-audio-player-react/)
- [useEffect – React](https://react.dev/reference/react/useEffect)
- [Setting Up ESLint and Prettier for a TypeScript Project | Medium](https://medium.com/@robinviktorsson/setting-up-eslint-and-prettier-for-a-typescript-project-aa2434417b8f)
- [React + TypeScript + ESLint + Prettier Full Setup | DEV Community](https://dev.to/suchintan/reacttypescripteslint-prettier-full-setup-p7j)
- [Bulletproof React: Automating Code Quality with ESLint, Prettier, and Husky (2026) | Medium](https://victorbruce82.medium.com/bulletproof-react-automating-code-quality-with-eslint-prettier-and-husky-2026-2f28b23cec99)
- [Dark mode - Core concepts - Tailwind CSS](https://tailwindcss.com/docs/dark-mode)
- [How to implement dark mode using Tailwind and React JS? - DEV Community](https://dev.to/cristianmontoya98/how-to-implement-dark-mode-using-tailwind-and-react-js-4mmj)
- [Responsive design - Core concepts - Tailwind CSS](https://tailwindcss.com/docs/responsive-design)
- [20 Tips for Designing Mobile-First with Tailwind CSS - DEV Community](https://dev.to/hitesh_developer/20-tips-for-designing-mobile-first-with-tailwind-css-36km)
- [Building a Real-Time Spectrum Analyzer Plot using HTML5 Canvas, Web Audio API & React | Medium](https://abarrafato.medium.com/building-a-real-time-spectrum-analyzer-plot-using-html5-canvas-web-audio-api-46a495a06cbf)
- [GitHub - adobe/react-spectrum-charts: Declarative React visualization](https://github.com/adobe/react-spectrum-charts)
- [Mic Test - Instant Audio Check App - App Store](https://apps.apple.com/in/app/mic-test-instant-audio-check/id6447490663)
- [How to Test Audio on iOS - Mobot App Testing Platform](https://www.mobot.io/blog/how-to-test-audio-on-ios)
- [Performing accessibility testing for your app | Apple Developer Documentation](https://developer.apple.com/documentation/Accessibility/performing-accessibility-testing-for-your-app)

---

**Report Generated:** 2026-02-09 | **Status:** Complete | **Unresolved Questions:** None
