# Phase 02: Permission & Device Management

## Context

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** [Phase 01](./phase-01-project-scaffolding.md) (project setup, base types)
- **Research:** [Web Audio & Permissions](./research/researcher-01-web-audio-permissions.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-09 |
| Description | Implement microphone permission state detection (with Safari fallback), device enumeration, and UI components for permission prompts and device selection |
| Priority | High (blocks audio testing phases) |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

- Permissions API (`navigator.permissions.query({ name: 'microphone' })`) works in Chrome/Firefox/Edge but NOT Safari/iOS
- Safari fallback: attempt `getUserMedia()` and infer permission state from success/error
- Device labels are empty strings until permission is granted (browser privacy)
- Must re-enumerate devices after granting permission to get labels
- `devicechange` event fires when mics are plugged/unplugged

## Requirements

1. `permission-service.ts` - encapsulate Permissions API with Safari fallback
2. `browser-detect-service.ts` - detect browser name, version, OS, platform, API support
3. `usePermission` hook - reactive permission state (prompt/granted/denied/unknown)
4. `useBrowserInfo` hook - detect and expose user's browser/device info
5. `useMediaDevices` hook - enumerate audio input devices, handle devicechange events
6. `PermissionStep` component - visual permission state with CTA button
7. **`PermissionStatusBadge` component** - persistent badge showing current mic permission state, visible across ALL flow steps (not just permission step)
8. **`BrowserInfoCard` component** - display detected browser, OS, platform, and API support status
9. `DeviceSelect` component - dropdown of available microphones
10. Real-time permission change detection via `status.addEventListener('change', ...)`

## Architecture

```
User clicks "Test My Mic"
  -> usePermission checks Permissions API (or fallback)
  -> If 'prompt': show PermissionStep with CTA
  -> If 'granted': skip to DeviceSelect
  -> If 'denied': show blocked message with instructions

PermissionStep triggers getUserMedia
  -> On success: update permission to 'granted', enumerate devices
  -> On error: map error type to user message

DeviceSelect
  -> useMediaDevices provides device list
  -> User picks device -> stored in flow state
  -> devicechange listener updates list in real-time
```

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `src/services/permission-service.ts` | Create | Permission API wrapper with Safari fallback |
| `src/services/browser-detect-service.ts` | Create | Browser/OS/platform detection from userAgent |
| `src/hooks/use-permission.ts` | Create | Reactive permission state hook |
| `src/hooks/use-browser-info.ts` | Create | Browser/device info detection hook |
| `src/hooks/use-media-devices.ts` | Create | Device enumeration hook |
| `src/components/flow/permission-step.tsx` | Create | Permission prompt UI |
| `src/components/flow/device-select.tsx` | Create | Device selector dropdown |
| `src/components/common/permission-status-badge.tsx` | Create | Persistent permission state indicator (always visible) |
| `src/components/common/browser-info-card.tsx` | Create | Browser/OS/platform info display |
| `src/types/state.ts` | Modify | Add any missing permission types |

## Implementation Steps

### Step 1: Create Permission Service

```typescript
// src/services/permission-service.ts
import type { PermissionStatus } from '../types/state';

export async function queryMicPermission(): Promise<PermissionStatus> {
  try {
    if (!navigator.permissions?.query) {
      return 'unknown'; // Safari fallback
    }
    const result = await navigator.permissions.query({
      name: 'microphone' as PermissionName,
    });
    return result.state as PermissionStatus;
  } catch {
    return 'unknown'; // Permission query not supported for mic
  }
}

export function onPermissionChange(
  callback: (state: PermissionStatus) => void,
): (() => void) | null {
  // Returns cleanup function or null if not supported
  // Uses navigator.permissions.query + addEventListener('change', ...)
}

export function getPermissionErrorMessage(error: unknown): string {
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
  return 'An unexpected error occurred.';
}
```

### Step 1b: Create Browser Detection Service

```typescript
// src/services/browser-detect-service.ts
import type { BrowserInfo } from '../types/audio';

export function detectBrowser(): BrowserInfo {
  const ua = navigator.userAgent;

  // Browser detection (order matters: Edge contains Chrome, Chrome contains Safari)
  let name = 'Unknown';
  let version = '';
  if (/Edg\//i.test(ua)) {
    name = 'Edge';
    version = ua.match(/Edg\/([\d.]+)/)?.[1] ?? '';
  } else if (/OPR\//i.test(ua)) {
    name = 'Opera';
    version = ua.match(/OPR\/([\d.]+)/)?.[1] ?? '';
  } else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) {
    name = 'Chrome';
    version = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? '';
  } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    name = 'Safari';
    version = ua.match(/Version\/([\d.]+)/)?.[1] ?? '';
  } else if (/Firefox\//i.test(ua)) {
    name = 'Firefox';
    version = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? '';
  }

  // OS detection
  let os = 'Unknown';
  if (/iPad|iPhone|iPod/.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Platform detection
  let platform: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  if (/iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    platform = 'Tablet';
  } else if (/Mobile|iPhone|iPod|Android.*Mobile/i.test(ua)) {
    platform = 'Mobile';
  }

  // API support detection
  const supportsGetUserMedia = !!(navigator.mediaDevices?.getUserMedia);
  const supportsPermissionsApi = !!(navigator.permissions?.query);
  const supportsMediaRecorder = typeof MediaRecorder !== 'undefined';

  return { name, version, os, platform, supportsGetUserMedia, supportsPermissionsApi, supportsMediaRecorder };
}
```

### Step 1c: Create useBrowserInfo Hook

```typescript
// src/hooks/use-browser-info.ts
import { useMemo } from 'react';
import { detectBrowser } from '../services/browser-detect-service';
import type { BrowserInfo } from '../types/audio';

export function useBrowserInfo(): BrowserInfo {
  return useMemo(() => detectBrowser(), []);
}
```

### Step 2: Create usePermission Hook

```typescript
// src/hooks/use-permission.ts
import { useState, useEffect, useCallback } from 'react';
import { queryMicPermission, onPermissionChange } from '../services/permission-service';
import type { PermissionStatus } from '../types/state';

export function usePermission() {
  const [status, setStatus] = useState<PermissionStatus>('unknown');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Query initial permission state
    queryMicPermission().then((s) => { setStatus(s); setIsLoading(false); });
    // Subscribe to changes (Chrome/Firefox)
    const cleanup = onPermissionChange(setStatus);
    return () => cleanup?.();
  }, []);

  const requestPermission = useCallback(async () => {
    // Attempt getUserMedia to trigger browser prompt
    // On success: setStatus('granted'), return stream
    // On error: setStatus('denied'), throw mapped error
  }, []);

  return { status, isLoading, requestPermission };
}
```

### Step 3: Create useMediaDevices Hook

```typescript
// src/hooks/use-media-devices.ts
import { useState, useEffect, useCallback } from 'react';
import type { AudioDeviceInfo } from '../types/audio';

export function useMediaDevices() {
  const [devices, setDevices] = useState<AudioDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<AudioDeviceInfo | null>(null);

  const enumerateDevices = useCallback(async () => {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const mics = allDevices
      .filter((d) => d.kind === 'audioinput')
      .map((d) => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${d.deviceId.slice(0, 5)}`,
        groupId: d.groupId,
      }));
    setDevices(mics);
    // Auto-select first device if none selected
    if (!selectedDevice && mics.length > 0) {
      setSelectedDevice(mics[0]!);
    }
  }, [selectedDevice]);

  useEffect(() => {
    enumerateDevices();
    // Listen for device changes (plug/unplug)
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
    };
  }, [enumerateDevices]);

  return { devices, selectedDevice, setSelectedDevice, refreshDevices: enumerateDevices };
}
```

### Step 4: Create PermissionStep Component

```tsx
// src/components/flow/permission-step.tsx
// Props: { status: PermissionStatus, onRequestPermission: () => void, error: string | null }
// Renders:
//   - 'unknown'/'prompt': Blue info box + "Test My Microphone" button
//   - 'granted': Green success indicator (auto-advance to next step)
//   - 'denied': Red warning box with instructions to unblock in browser settings
//   - Loading spinner while permission is being requested
```

Key UI elements:
- Status icon (info/check/x circle)
- Status message text
- CTA button (only for prompt state)
- Error message display
- Browser-specific unblock instructions for denied state

### Step 5: Create DeviceSelect Component

```tsx
// src/components/flow/device-select.tsx
// Props: { devices: AudioDeviceInfo[], selected: AudioDeviceInfo | null,
//          onSelect: (device: AudioDeviceInfo) => void, onContinue: () => void }
// Renders:
//   - <select> dropdown with device labels
//   - Device count indicator ("3 microphones found")
//   - "Continue" button to advance to testing phase
//   - Empty state if no devices found
```

### Step 6: Create PermissionStatusBadge Component (Persistent, Always Visible)

```tsx
// src/components/common/permission-status-badge.tsx
// This component is shown at ALL times in the app header/toolbar area,
// NOT just during the permission step. It gives users constant awareness of mic permission state.

interface PermissionStatusBadgeProps {
  status: PermissionStatus;
}

// Renders a small inline badge/chip:
//   - 'prompt' / 'unknown': Yellow dot + "Mic: Not requested" or "Mic: Unknown"
//   - 'granted': Green dot + "Mic: Allowed"
//   - 'denied': Red dot + "Mic: Blocked"
//
// Visual: <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ...">
//           <span className="w-2 h-2 rounded-full bg-{color}" /> {label}
//         </span>
//
// Color mapping:
//   prompt/unknown -> bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300
//   granted        -> bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300
//   denied         -> bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300
//
// ARIA: role="status" aria-live="polite" so screen readers announce state changes
```

### Step 7: Create BrowserInfoCard Component

```tsx
// src/components/common/browser-info-card.tsx
import type { BrowserInfo } from '../../types/audio';

interface BrowserInfoCardProps {
  browserInfo: BrowserInfo;
}

// Renders a compact info card showing the user's environment:
//
// ┌─────────────────────────────────────┐
// │ Your Device                         │
// │ Browser:  Chrome 120.0              │
// │ OS:       macOS                     │
// │ Platform: Desktop                   │
// │ getUserMedia:    ✅ Supported       │
// │ Permissions API: ✅ Supported       │
// │ MediaRecorder:   ✅ Supported       │
// └─────────────────────────────────────┘
//
// For unsupported APIs, show ❌ with warning text explaining impact:
//   - No getUserMedia: "Your browser cannot access the microphone"
//   - No Permissions API: "Permission state detection limited (Safari)"
//   - No MediaRecorder: "Audio recording/playback unavailable"
//
// Layout: <dl> definition list or <table> with striped rows
// Styling: rounded-lg border bg-slate-50 dark:bg-slate-800 p-4
```

### Step 8: Wire Components into App Flow

Update `App.tsx` to:
1. Include `<PermissionStatusBadge>` in the header area (visible on ALL steps)
2. Include `<BrowserInfoCard>` below the header or in a collapsible section
3. Manage flow step state and render PermissionStep or DeviceSelect based on current step
4. Use a simple `useState<FlowStep>` for now (Context provider added in Phase 05)

```tsx
// In App.tsx or Header:
<header className="flex items-center justify-between py-4">
  <h1>Microphone Test</h1>
  <div className="flex items-center gap-3">
    <PermissionStatusBadge status={permissionStatus} />
    <ThemeToggle />  {/* Added in Phase 06 */}
  </div>
</header>
<BrowserInfoCard browserInfo={browserInfo} />
```

## Todo List

- [ ] Create `src/services/permission-service.ts` with query, change listener, error mapper
- [ ] Create `src/services/browser-detect-service.ts` with browser/OS/platform detection
- [ ] Create `src/hooks/use-permission.ts` with reactive state and requestPermission
- [ ] Create `src/hooks/use-browser-info.ts` with memoized browser detection
- [ ] Create `src/hooks/use-media-devices.ts` with enumeration and devicechange listener
- [ ] Create `src/components/flow/permission-step.tsx` with 3-state UI
- [ ] Create `src/components/flow/device-select.tsx` with dropdown and continue CTA
- [ ] Create `src/components/common/permission-status-badge.tsx` — persistent badge in header
- [ ] Create `src/components/common/browser-info-card.tsx` — browser/OS/platform + API support display
- [ ] Wire PermissionStatusBadge into header (visible across all flow steps)
- [ ] Wire BrowserInfoCard below header
- [ ] Wire permission and device steps into App.tsx flow
- [ ] Test Safari fallback path (unknown -> attempt getUserMedia)
- [ ] Test device plug/unplug updates device list
- [ ] Verify denied state shows correct unblock instructions
- [ ] Verify PermissionStatusBadge updates in real-time when permission changes
- [ ] Verify BrowserInfoCard correctly detects Chrome, Safari, Firefox, Edge on desktop/mobile

## Success Criteria

1. Permission state correctly detected on page load (Chrome: prompt/granted/denied; Safari: unknown)
2. **PermissionStatusBadge visible in header on ALL flow steps** — updates in real-time when permission state changes
3. **BrowserInfoCard correctly identifies** Chrome/Safari/Firefox/Edge, macOS/Windows/iOS/Android, Desktop/Mobile/Tablet
4. **BrowserInfoCard shows API support** status (getUserMedia, Permissions API, MediaRecorder) with clear supported/unsupported indicators
5. Clicking "Test My Microphone" triggers browser permission dialog
6. After granting permission, device list populates with labeled microphones
7. Selecting a device and clicking "Continue" advances to next step
8. Denied permission shows red warning with browser-specific unblock instructions
9. Plugging/unplugging mic updates device list without refresh
10. Error messages are user-friendly (no raw DOMException text)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Safari Permissions API not available | Certain | Medium | Fallback path via getUserMedia attempt; 'unknown' state handled |
| Device labels empty before permission grant | Certain | Low | Re-enumerate after getUserMedia success; show fallback labels |
| iOS Safari blocks getUserMedia without user gesture | High | Medium | Ensure requestPermission only called from button click handler |
| Permission state change event not firing | Low | Low | Polling fallback on re-focus; re-query on visibility change |

## Security Considerations

- Never store or transmit audio streams
- getUserMedia requires secure context (HTTPS or localhost)
- Permission state is privacy-sensitive; don't log device IDs externally

## Next Steps

Proceed to [Phase 03: Audio Engine & Hooks](./phase-03-audio-engine-hooks.md) to build the AudioContext/AnalyserNode pipeline and useMicrophone hook.
