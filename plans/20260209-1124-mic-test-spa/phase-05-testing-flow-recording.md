# Phase 05: Testing Flow & Recording

## Context

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** [Phase 02](./phase-02-permission-device-management.md) (permission/device), [Phase 03](./phase-03-audio-engine-hooks.md) (audio hooks), [Phase 04](./phase-04-audio-visualizations.md) (visualizations)
- **Research:** [MediaRecorder API](./research/researcher-01-web-audio-permissions.md), [Flow UI Patterns](./research/researcher-02-react-spa-architecture.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-09 |
| Description | Orchestrate the complete microphone test flow (permission -> device select -> testing -> results). Integrate MediaRecorder for audio recording/playback. Build mic info display and comprehensive error handling UI. |
| Priority | High (integrates all previous phases into usable product) |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

- Flow is linear: Permission -> Device Select -> Testing -> Results; user can restart from any point
- MediaRecorder MIME type varies: `audio/webm;codecs=opus` (Chrome/Firefox), `audio/mp4` (Safari)
- Must check `MediaRecorder.isTypeSupported()` before creating recorder
- Blob URL from recording must be revoked with `URL.revokeObjectURL()` on cleanup
- Test duration: configurable (default 10s); show countdown timer during recording
- AudioContext provider wraps the flow to share analyser/stream state across visualization + recording

## Requirements

1. `AudioFlowProvider` - Context provider managing the full flow state via useReducer
2. `TestingPhase` component - active test view with visualizations + recording + timer
3. `ResultsPanel` component - test results with playback, mic info table, retest button
4. `useRecorder` hook - MediaRecorder wrapper with start/stop/playback URL
5. `MicInfoTable` component - display device capabilities (sample rate, channels, etc.)
6. `ErrorBanner` component - dismissible error display with user-friendly messages
7. App.tsx wired up with full flow

## Architecture

### Flow State Machine

```
┌──────────────┐    grant    ┌───────────────┐   select   ┌──────────┐   done   ┌─────────┐
│  permission  │───────────>│ device-select  │──────────>│ testing  │────────>│ results │
└──────────────┘            └───────────────┘           └──────────┘        └─────────┘
       ^                          ^                          |                    |
       |                          |                          | stop               | retest
       |                          └──────────────────────────┘                    |
       └──────────────────────────────────────────────────────────────────────────┘
```

### Context Provider Structure

```typescript
// AudioFlowProvider wraps App content
// useReducer handles state transitions
// Actions: GRANT_PERMISSION, SELECT_DEVICE, START_TEST, STOP_TEST, SET_RESULTS, RESET, SET_ERROR

// Children access state via useAudioFlow() hook
```

### Recording Pipeline

```
MediaStream (from useMicrophone)
  |
  ├── AnalyserNode (visualizations - Phase 03/04)
  |
  └── MediaRecorder
       ├── ondataavailable -> chunks[]
       └── onstop -> Blob -> URL.createObjectURL -> <audio> playback
```

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `src/context/audio-flow-provider.tsx` | Create | Flow state context with useReducer |
| `src/hooks/use-audio-flow.ts` | Create | Context consumer hook |
| `src/hooks/use-recorder.ts` | Create | MediaRecorder wrapper |
| `src/components/flow/testing-phase.tsx` | Create | Active test view with viz + recording |
| `src/components/flow/results-panel.tsx` | Create | Results display with playback |
| `src/components/flow/mic-info-table.tsx` | Create | Device capabilities table |
| `src/components/common/error-banner.tsx` | Create | Dismissible error display |
| `src/App.tsx` | Modify | Wire up AudioFlowProvider + step rendering |

## Implementation Steps

### Step 1: Create AudioFlowProvider with useReducer

```typescript
// src/context/audio-flow-provider.tsx
import { createContext, useReducer, type ReactNode } from 'react';
import type { AudioFlowState, FlowStep } from '../types/state';

type Action =
  | { type: 'GRANT_PERMISSION' }
  | { type: 'SELECT_DEVICE'; payload: AudioDeviceInfo }
  | { type: 'START_TEST' }
  | { type: 'STOP_TEST'; payload: TestMetrics }
  | { type: 'SET_RECORDING_URL'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

const initialState: AudioFlowState = {
  step: 'permission',
  permissionStatus: 'unknown',
  stream: null,
  selectedDevice: null,
  devices: [],
  testMetrics: null,
  recordingUrl: null,
  error: null,
};

function reducer(state: AudioFlowState, action: Action): AudioFlowState {
  switch (action.type) {
    case 'GRANT_PERMISSION':
      return { ...state, step: 'device-select', permissionStatus: 'granted' };
    case 'SELECT_DEVICE':
      return { ...state, selectedDevice: action.payload };
    case 'START_TEST':
      return { ...state, step: 'testing', testMetrics: null, recordingUrl: null };
    case 'STOP_TEST':
      return { ...state, step: 'results', testMetrics: action.payload };
    case 'SET_RECORDING_URL':
      return { ...state, recordingUrl: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET':
      return { ...initialState, permissionStatus: state.permissionStatus };
    default:
      return state;
  }
}

// Export context + provider component
// Provider wraps children with <AudioFlowContext.Provider value={{ state, dispatch }}>
```

### Step 2: Create useAudioFlow Hook

```typescript
// src/hooks/use-audio-flow.ts
import { useContext } from 'react';
import { AudioFlowContext } from '../context/audio-flow-provider';

export function useAudioFlow() {
  const context = useContext(AudioFlowContext);
  if (!context) throw new Error('useAudioFlow must be used within AudioFlowProvider');
  return context;
}
```

### Step 3: Create useRecorder Hook

```typescript
// src/hooks/use-recorder.ts
import { useState, useRef, useCallback, useEffect } from 'react';

function getSupportedMimeType(): string {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
}

export function useRecorder(stream: MediaStream | null) {
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);

  const start = useCallback(() => {
    if (!stream) return;
    // Revoke previous recording URL
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
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
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  return { recordingUrl, isRecording, start, stop };
}
```

### Step 4: Create TestingPhase Component

```tsx
// src/components/flow/testing-phase.tsx
// Responsibilities:
// 1. Start useMicrophone with selected deviceId
// 2. Feed stream to useAudioAnalyser
// 3. Feed stream to useRecorder
// 4. Render WaveformViz, VolumeMeter, SpectrumViz with analyser data
// 5. Show countdown timer (configurable, default 10s)
// 6. Show recording indicator (red dot + "Recording...")
// 7. "Stop Test" button to end early
// 8. On timer end or stop: stop recorder, stop mic, dispatch STOP_TEST with metrics

// Timer implementation:
// - useEffect with setInterval(1000ms)
// - Count down from duration to 0
// - On 0: auto-stop

// Layout (mobile-first):
// <div class="space-y-4">
//   <RecordingIndicator />
//   <Timer />
//   <WaveformViz />
//   <VolumeMeter />
//   <SpectrumViz />
//   <StopButton />
// </div>
```

### Step 5: Create ResultsPanel Component

```tsx
// src/components/flow/results-panel.tsx
// Responsibilities:
// 1. Display test results summary (peak level, avg level, duration)
// 2. Audio playback via <audio> element with recordingUrl
// 3. MicInfoTable with device capabilities
// 4. "Test Again" button -> dispatch RESET or go back to device-select

// Layout:
// <div class="space-y-6">
//   <ResultsSummary metrics={testMetrics} />
//   <AudioPlayback url={recordingUrl} />
//   <MicInfoTable capabilities={capabilities} />
//   <RetestButton />
// </div>
```

### Step 6: Create MicInfoTable Component

```tsx
// src/components/flow/mic-info-table.tsx
import type { AudioCapabilities, BrowserInfo } from '../../types/audio';

interface MicInfoTableProps {
  capabilities: AudioCapabilities;
  browserInfo: BrowserInfo;
  permissionStatus: PermissionStatus;
}

// Renders two sections in a single info panel:
//
// === Microphone Information ===
// - Device Name: capabilities.label
// - Sample Rate: capabilities.sampleRate Hz
// - Channels: capabilities.channelCount
// - Echo Cancellation: Yes/No
// - Noise Suppression: Yes/No
// - Auto Gain Control: Yes/No
// - Permission Status: Granted/Denied/Prompt (color-coded)
//
// === Your Device ===
// - Browser: Chrome 120.0
// - Operating System: macOS
// - Platform: Desktop
// - getUserMedia: ✅ Supported
// - Permissions API: ✅ Supported
// - MediaRecorder: ✅ Supported
//
// Styling: striped rows, dark mode support, two-section layout
// <table className="w-full text-sm">
//   <thead><tr><th colSpan={2}>Microphone Information</th></tr></thead>
//   <tbody>
//     <tr className="border-b"><td>Device</td><td>{label}</td></tr>
//     ...
//   </tbody>
//   <thead><tr><th colSpan={2}>Your Device</th></tr></thead>
//   <tbody>
//     <tr className="border-b"><td>Browser</td><td>{name} {version}</td></tr>
//     ...
//   </tbody>
// </table>
```

### Step 7: Create ErrorBanner Component

```tsx
// src/components/common/error-banner.tsx
interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

// Red banner at top of flow area
// Includes dismiss (X) button
// Icon + message text
// Role="alert" for screen readers
```

### Step 8: Wire Up App.tsx

```tsx
// src/App.tsx
import { AudioFlowProvider } from './context/audio-flow-provider';
// Import step components

function App() {
  return (
    <AudioFlowProvider>
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <h1 className="text-3xl font-bold text-center mb-8">Microphone Test</h1>
          <ErrorBanner />
          <FlowRouter />
          {/* FlowRouter reads step from context and renders appropriate component */}
        </main>
      </div>
    </AudioFlowProvider>
  );
}

// FlowRouter component:
function FlowRouter() {
  const { state } = useAudioFlow();
  switch (state.step) {
    case 'permission': return <PermissionStep />;
    case 'device-select': return <DeviceSelect />;
    case 'testing': return <TestingPhase />;
    case 'results': return <ResultsPanel />;
  }
}
```

## Todo List

- [ ] Create `src/context/audio-flow-provider.tsx` with useReducer state machine
- [ ] Create `src/hooks/use-audio-flow.ts` context consumer hook
- [ ] Create `src/hooks/use-recorder.ts` with MediaRecorder wrapper
- [ ] Create `src/components/flow/testing-phase.tsx` with timer + viz + recording
- [ ] Create `src/components/flow/results-panel.tsx` with playback + summary
- [ ] Create `src/components/flow/mic-info-table.tsx` with capabilities table
- [ ] Create `src/components/common/error-banner.tsx` with dismissible alert
- [ ] Update `src/App.tsx` to use AudioFlowProvider and FlowRouter
- [ ] Test complete flow: permission -> device select -> testing -> results
- [ ] Test recording playback works in Chrome, Firefox, Safari
- [ ] Test "Test Again" button resets flow correctly
- [ ] Verify blob URLs are revoked on cleanup
- [ ] Test error banner appears for permission denied, no mic found, etc.

## Success Criteria

1. Complete flow works end-to-end: permission prompt -> device selection -> mic test with visualizations -> results
2. Audio is recorded during test and plays back correctly in results
3. Mic info table shows accurate device capabilities
4. Timer counts down and auto-stops test at 0
5. "Stop Test" button ends test early and shows results
6. "Test Again" button restarts flow (keeping permission state)
7. Error banner shows for all error types with user-friendly messages
8. Recording works in Chrome (`audio/webm`), Firefox (`audio/webm`), Safari (`audio/mp4`)
9. Blob URLs cleaned up on unmount (no memory leaks)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| MediaRecorder MIME type unsupported | Low | Medium | Feature-detect with isTypeSupported(); graceful fallback |
| Safari audio/mp4 recording quality | Medium | Low | Users can still hear playback; quality is acceptable |
| State machine edge cases (rapid clicking) | Medium | Medium | Disable buttons during transitions; guard reducer actions |
| Recording blob grows large (long test) | Low | Low | Default 10s limit; max 30s configurable |
| AudioContext not closed on flow reset | Medium | High | Ensure cleanup in useEffect and reducer RESET action |

## Security Considerations

- Audio recording stored only in-memory as Blob; never uploaded or persisted
- Blob URLs scoped to page session; revoked on cleanup
- No audio data leaves the browser

## Next Steps

Proceed to [Phase 06: UI Polish & Theme](./phase-06-ui-polish-theme.md) for dark/light theme toggle, responsive layout, accessibility, and final styling.
