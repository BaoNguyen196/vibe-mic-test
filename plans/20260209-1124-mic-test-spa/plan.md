# Microphone Test SPA - Implementation Plan

**Date:** 2026-02-09 | **Status:** Pending | **Type:** Greenfield SPA

## Overview

Client-side single-page application for microphone testing. Users can check mic permissions, select audio input devices, run real-time audio tests with visual feedback (waveform, volume meter, spectrum), record/playback audio, and view device capabilities. No backend required.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18+ (TypeScript strict) |
| Bundler | Vite |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| Audio | Web Audio API (AudioContext, AnalyserNode) |
| Recording | MediaRecorder API |
| Visualization | Canvas API (2D context) |
| Linting | ESLint flat config + Prettier |

## Key Architectural Decisions

1. **No state management library** - Context API + useReducer for shared audio state; local useState for component state
2. **Custom hooks over libraries** - useMicrophone, useAudioAnalyser, useCanvasAnimation provide thin wrappers over browser APIs
3. **Canvas over SVG** - 60fps real-time rendering requirement; Canvas is more performant for continuous animation
4. **Safari fallback pattern** - Permissions API unavailable; detect via feature check, fall back to getUserMedia attempt
5. **Step-based flow** - Permission -> Device Select -> Testing -> Results; linear progression simplifies state management
6. **Service layer** - audio-service.ts, permission-service.ts, browser-detect-service.ts encapsulate browser API calls; hooks consume services
7. **Persistent PermissionStatusBadge** - Always-visible badge in header showing mic permission state (prompt/granted/denied) across ALL flow steps
8. **Browser/Device detection** - Detect and display browser name+version, OS (macOS/Windows/iOS/Android), platform (Desktop/Mobile/Tablet), and Web API support status

## Implementation Phases

| # | Phase | File | Status |
|---|-------|------|--------|
| 01 | Project Scaffolding & Configuration | [phase-01](./phase-01-project-scaffolding.md) | Pending |
| 02 | Permission & Device Management | [phase-02](./phase-02-permission-device-management.md) | Pending |
| 03 | Audio Engine & Hooks | [phase-03](./phase-03-audio-engine-hooks.md) | Pending |
| 04 | Audio Visualizations | [phase-04](./phase-04-audio-visualizations.md) | Pending |
| 05 | Testing Flow & Recording | [phase-05](./phase-05-testing-flow-recording.md) | Pending |
| 06 | UI Polish & Theme | [phase-06](./phase-06-ui-polish-theme.md) | Pending |

## Folder Structure

```
src/
  components/
    common/        # Button, ThemeToggle, ErrorBanner, PermissionStatusBadge, BrowserInfoCard, Header, Footer
    audio/         # WaveformViz, SpectrumViz, VolumeMeter
    flow/          # PermissionStep, DeviceSelect, TestingPhase, ResultsPanel, MicInfoTable
  hooks/           # useMicrophone, useAudioAnalyser, useCanvasAnimation, usePermission, useBrowserInfo, useTheme
  services/        # audio-service.ts, permission-service.ts, browser-detect-service.ts
  types/           # audio.ts (incl. BrowserInfo), state.ts
  context/         # audio-context-provider.tsx
  styles/          # index.css
  App.tsx
  main.tsx
```

## Research References

- [Web Audio & Permissions Research](./research/researcher-01-web-audio-permissions.md)
- [React SPA Architecture Research](./research/researcher-02-react-spa-architecture.md)
