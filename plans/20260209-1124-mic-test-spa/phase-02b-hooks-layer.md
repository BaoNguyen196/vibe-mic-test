# Phase 2B: Hooks Layer

## Context

- **Parent:** [phase-02-implementation-plan.md](./phase-02-implementation-plan.md)
- **Parallelization:** Can run with 2A, 2C simultaneously
- **Duration:** ~20 minutes

## Overview

| Field | Value |
|-------|-------|
| Phase | 2B - Hooks Layer |
| Executor | fullstack-developer agent |
| Files Created | 3 hooks |
| Dependencies | Types only (Phase 01) |
| Blocks | Phase 2D (App Integration) |

## Exclusive File Ownership

**This phase ONLY modifies:**
- `src/hooks/use-permission.ts` (create)
- `src/hooks/use-browser-info.ts` (create)
- `src/hooks/use-media-devices.ts` (create)

**No other files touched.**

## Requirements

### File 1: `src/hooks/use-permission.ts`

**Purpose:** Reactive microphone permission state management

**Export:**
```typescript
export function usePermission(): {
  status: PermissionStatus;
  isLoading: boolean;
  requestPermission: () => Promise<MediaStream>;
}
```

**Implementation:**
```typescript
import { useState, useEffect, useCallback } from 'react';
import type { PermissionStatus } from '../types/state';

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
```

**Key Patterns:**
- Inline permission query (no service import for parallel execution)
- Cleanup function returned from useEffect
- useCallback for requestPermission stability
- Re-throw error for component error handling

**Research Reference:** [researcher-03-react-hooks-audio.md](./research/researcher-03-react-hooks-audio.md)

### File 2: `src/hooks/use-browser-info.ts`

**Purpose:** Memoized browser detection hook

**Export:**
```typescript
export function useBrowserInfo(): BrowserInfo
```

**Implementation:**
```typescript
import { useMemo } from 'react';
import type { BrowserInfo } from '../types/audio';

export function useBrowserInfo(): BrowserInfo {
  return useMemo(() => {
    // Inline browser detection (no service import for parallel execution)
    const ua = navigator.userAgent;

    // Browser detection
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

    // API support
    const supportsGetUserMedia = !!(navigator.mediaDevices?.getUserMedia);
    const supportsPermissionsApi = !!(navigator.permissions?.query);
    const supportsMediaRecorder = typeof MediaRecorder !== 'undefined';

    return {
      name,
      version,
      os,
      platform,
      supportsGetUserMedia,
      supportsPermissionsApi,
      supportsMediaRecorder,
    };
  }, []);
}
```

**Key Patterns:**
- useMemo with empty dependency array (runs once)
- Inline detection logic (no service import)
- Returns complete BrowserInfo object

### File 3: `src/hooks/use-media-devices.ts`

**Purpose:** Audio device enumeration with devicechange listener

**Export:**
```typescript
export function useMediaDevices(): {
  devices: AudioDeviceInfo[];
  selectedDevice: AudioDeviceInfo | null;
  setSelectedDevice: (device: AudioDeviceInfo) => void;
  refreshDevices: () => Promise<void>;
}
```

**Implementation:**
```typescript
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

    // Listen for device changes
    const handleDeviceChange = () => {
      enumerateDevices();
    };
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [enumerateDevices]);

  return { devices, selectedDevice, setSelectedDevice, refreshDevices: enumerateDevices };
}
```

**Key Patterns:**
- useCallback for enumerateDevices (used in useEffect dependency)
- devicechange event listener with cleanup
- Auto-select first device
- Fallback labels for unnamed devices

**Research Reference:** [researcher-03-react-hooks-audio.md](./research/researcher-03-react-hooks-audio.md)

## Type Dependencies

**Import from Phase 01:**
```typescript
import type { PermissionStatus } from '../types/state';
import type { AudioDeviceInfo, BrowserInfo } from '../types/audio';
```

**React imports:**
```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';
```

**No service imports** (inline logic for parallel execution).

## Implementation Checklist

- [x] Create `src/hooks/` directory if not exists
- [x] Create `use-permission.ts` with permission state logic
- [x] Implement permission query with Safari fallback inline
- [x] Implement permission change listener with cleanup
- [x] Implement requestPermission with useCallback
- [x] Create `use-browser-info.ts` with memoized detection
- [x] Inline browser detection logic (duplicate from service for now)
- [x] Create `use-media-devices.ts` with enumeration logic
- [x] Implement devicechange listener with cleanup
- [x] Implement auto-select first device
- [x] Add JSDoc comments for all hooks
- [x] Verify TypeScript compilation
- [x] Verify ESLint passes

## Success Criteria

- All 3 hooks compile without errors
- usePermission correctly tracks permission state
- useBrowserInfo detects browser/OS/platform
- useMediaDevices enumerates audio inputs
- devicechange listener updates device list
- Cleanup functions prevent memory leaks
- No imports from services (inline logic)
- No imports from components

## Conflict Prevention

- Uses only type imports from `src/types/*`
- Inline logic instead of service imports
- No component imports
- Can be developed completely independently
- Phase 2D will wire these hooks to components

## Note on Code Duplication

Browser detection logic duplicated from Phase 2A service. This is intentional to enable parallel execution without cross-dependencies. Phase 2D can optionally refactor to use service imports if desired.
