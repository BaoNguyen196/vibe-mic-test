# Phase 2C: UI Components

## Context

- **Parent:** [phase-02-implementation-plan.md](./phase-02-implementation-plan.md)
- **Parallelization:** Can run with 2A, 2B simultaneously
- **Duration:** ~25 minutes

## Overview

| Field | Value |
|-------|-------|
| Phase | 2C - UI Components |
| Executor | fullstack-developer agent |
| Files Created | 4 components |
| Dependencies | Types only (Phase 01) |
| Blocks | Phase 2D (App Integration) |

## Exclusive File Ownership

**This phase ONLY modifies:**
- `src/components/flow/permission-step.tsx` (create)
- `src/components/flow/device-select.tsx` (create)
- `src/components/common/permission-status-badge.tsx` (create)
- `src/components/common/browser-info-card.tsx` (create)

**No other files touched.**

## Requirements

### File 1: `src/components/flow/permission-step.tsx`

**Purpose:** Permission request UI with 4 states

**Props Interface:**
```typescript
interface PermissionStepProps {
  status: PermissionStatus;
  onRequestPermission: () => void;
  error: string | null;
  isLoading: boolean;
}
```

**Component Structure:**
```tsx
function PermissionStep({ status, onRequestPermission, error, isLoading }: PermissionStepProps) {
  // Render based on status
  if (isLoading) return <LoadingSpinner />;

  if (status === 'granted') {
    return <div className="text-green-600">✓ Microphone access granted</div>;
  }

  if (status === 'denied') {
    return (
      <div className="border border-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded">
        <h3>Microphone Blocked</h3>
        <p>To unblock:</p>
        <ul>
          <li>Chrome: Click lock icon in address bar → Site settings</li>
          <li>Safari: Safari menu → Settings → Websites → Microphone</li>
          <li>Firefox: Click shield icon → Permissions</li>
        </ul>
      </div>
    );
  }

  // status === 'prompt' or 'unknown'
  return (
    <div className="border border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
      <h3>Test Your Microphone</h3>
      <p>Click the button below to grant microphone access.</p>
      <button
        onClick={onRequestPermission}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Test My Microphone
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
```

**Styling:**
- Tailwind CSS classes
- Dark mode support (`dark:` prefix)
- Status colors: blue (prompt), green (granted), red (denied)
- Responsive padding and borders

### File 2: `src/components/flow/device-select.tsx`

**Purpose:** Device selection dropdown

**Props Interface:**
```typescript
interface DeviceSelectProps {
  devices: AudioDeviceInfo[];
  selected: AudioDeviceInfo | null;
  onSelect: (device: AudioDeviceInfo) => void;
  onContinue: () => void;
}
```

**Component Structure:**
```tsx
function DeviceSelect({ devices, selected, onSelect, onContinue }: DeviceSelectProps) {
  if (devices.length === 0) {
    return (
      <div className="text-yellow-600">
        No microphones found. Please connect a microphone and refresh.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="device-select" className="block text-sm font-medium mb-2">
          Select Microphone ({devices.length} found)
        </label>
        <select
          id="device-select"
          value={selected?.deviceId ?? ''}
          onChange={(e) => {
            const device = devices.find((d) => d.deviceId === e.target.value);
            if (device) onSelect(device);
          }}
          className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={onContinue}
        disabled={!selected}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        Continue to Test
      </button>
    </div>
  );
}
```

### File 3: `src/components/common/permission-status-badge.tsx`

**Purpose:** Persistent permission status indicator (always visible in header)

**Props Interface:**
```typescript
interface PermissionStatusBadgeProps {
  status: PermissionStatus;
}
```

**Component Structure:**
```tsx
function PermissionStatusBadge({ status }: PermissionStatusBadgeProps) {
  const config = {
    prompt: {
      label: 'Mic: Not requested',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      dotColor: 'bg-amber-500',
    },
    unknown: {
      label: 'Mic: Unknown',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      dotColor: 'bg-amber-500',
    },
    granted: {
      label: 'Mic: Allowed',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      dotColor: 'bg-green-500',
    },
    denied: {
      label: 'Mic: Blocked',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      dotColor: 'bg-red-500',
    },
  };

  const { label, color, dotColor } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}
      role="status"
      aria-live="polite"
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}
```

**Accessibility:**
- `role="status"` for screen readers
- `aria-live="polite"` announces state changes

### File 4: `src/components/common/browser-info-card.tsx`

**Purpose:** Display browser/OS/platform + API support

**Props Interface:**
```typescript
interface BrowserInfoCardProps {
  browserInfo: BrowserInfo;
}
```

**Component Structure:**
```tsx
function BrowserInfoCard({ browserInfo }: BrowserInfoCardProps) {
  const { name, version, os, platform, supportsGetUserMedia, supportsPermissionsApi, supportsMediaRecorder } = browserInfo;

  return (
    <div className="border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Your Device</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600 dark:text-slate-400">Browser:</dt>
          <dd className="font-medium">{name} {version}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600 dark:text-slate-400">OS:</dt>
          <dd className="font-medium">{os}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600 dark:text-slate-400">Platform:</dt>
          <dd className="font-medium">{platform}</dd>
        </div>
        <hr className="border-slate-300 dark:border-slate-600" />
        <div className="flex justify-between items-center">
          <dt className="text-slate-600 dark:text-slate-400">getUserMedia:</dt>
          <dd>{supportsGetUserMedia ? '✅ Supported' : '❌ Not supported'}</dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-slate-600 dark:text-slate-400">Permissions API:</dt>
          <dd>{supportsPermissionsApi ? '✅ Supported' : '⚠️ Limited (Safari)'}</dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-slate-600 dark:text-slate-400">MediaRecorder:</dt>
          <dd>{supportsMediaRecorder ? '✅ Supported' : '❌ Not supported'}</dd>
        </div>
      </dl>
      {!supportsGetUserMedia && (
        <div className="mt-3 text-xs text-red-600">
          Your browser cannot access the microphone. Please upgrade to a modern browser.
        </div>
      )}
    </div>
  );
}
```

**Styling:**
- Definition list (`<dl>`) for semantic HTML
- Striped layout with flexbox
- Dark mode support
- Warning message if getUserMedia unsupported

## Type Dependencies

**Import from Phase 01:**
```typescript
import type { PermissionStatus } from '../../types/state';
import type { AudioDeviceInfo, BrowserInfo } from '../../types/audio';
```

**No hook or service imports** (props passed from parent).

## Implementation Checklist

- [x] Create `src/components/flow/` directory if not exists
- [x] Create `src/components/common/` directory if not exists
- [x] Create `permission-step.tsx` with 4-state UI
- [x] Implement loading, granted, denied, prompt states
- [x] Add browser-specific unblock instructions for denied state
- [x] Create `device-select.tsx` with dropdown
- [x] Implement device selection change handler
- [x] Implement empty state (no devices found)
- [x] Add continue button with disabled state
- [x] Create `permission-status-badge.tsx` with colored dot
- [x] Implement status config mapping
- [x] Add ARIA attributes (role, aria-live)
- [x] Create `browser-info-card.tsx` with definition list
- [x] Display browser/OS/platform info
- [x] Display API support status with checkmarks/warnings
- [x] Add warning for unsupported getUserMedia
- [x] Verify TypeScript compilation
- [x] Verify ESLint passes

## Success Criteria

- All 4 components compile without errors
- Props interfaces properly typed
- Tailwind classes applied correctly
- Dark mode styles included
- Accessibility attributes present
- No hook or service imports (pure presentational components)
- Components ready to receive props from Phase 2D

## Conflict Prevention

- Uses only type imports from `src/types/*`
- No hook imports (will be wired in Phase 2D)
- No service imports
- Pure presentational components
- Can be developed completely independently

## Styling Guidelines

Follow Tailwind CSS conventions:
- Use `dark:` prefix for dark mode
- Semantic color classes (blue=info, green=success, red=error, amber=warning)
- Consistent spacing (`space-y-4`, `gap-1.5`)
- Responsive padding (`px-4 py-2`)
- Hover states on buttons (`hover:bg-*-700`)
