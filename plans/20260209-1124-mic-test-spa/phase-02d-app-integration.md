# Phase 2D: App Integration

## Context

- **Parent:** [phase-02-implementation-plan.md](./phase-02-implementation-plan.md)
- **Parallelization:** SEQUENTIAL - Depends on 2A + 2B + 2C
- **Duration:** ~10 minutes

## Overview

| Field | Value |
|-------|-------|
| Phase | 2D - App Integration |
| Executor | fullstack-developer agent |
| Files Modified | 1 file |
| Dependencies | Phases 2A, 2B, 2C complete |
| Blocks | None (final phase) |

## Exclusive File Ownership

**This phase ONLY modifies:**
- `src/App.tsx` (modify existing)

**No other files touched.**

## Requirements

Wire all Phase 2A/2B/2C components together in App.tsx.

### Current App.tsx State

```tsx
function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8">Microphone Test</h1>
        <p className="text-center text-slate-500">
          App shell ready. Phases 02+ will add functionality.
        </p>
      </main>
    </div>
  );
}
```

### Target App.tsx Implementation

```tsx
import { useState } from 'react';
import type { FlowStep } from './types/state';
import type { AudioDeviceInfo } from './types/audio';

// Hooks from Phase 2B
import { usePermission } from './hooks/use-permission';
import { useBrowserInfo } from './hooks/use-browser-info';
import { useMediaDevices } from './hooks/use-media-devices';

// Components from Phase 2C
import PermissionStep from './components/flow/permission-step';
import DeviceSelect from './components/flow/device-select';
import PermissionStatusBadge from './components/common/permission-status-badge';
import BrowserInfoCard from './components/common/browser-info-card';

function App() {
  // Flow state
  const [step, setStep] = useState<FlowStep>('permission');
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { status, isLoading, requestPermission } = usePermission();
  const browserInfo = useBrowserInfo();
  const { devices, selectedDevice, setSelectedDevice, refreshDevices } = useMediaDevices();

  // Handle permission request
  const handleRequestPermission = async () => {
    try {
      setError(null);
      const stream = await requestPermission();
      // Close stream immediately after permission grant
      stream.getTracks().forEach((track) => track.stop());
      // Refresh devices to get labels
      await refreshDevices();
      // Advance to device select
      setStep('device-select');
    } catch (err) {
      // Map error to user-friendly message
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            setError('Microphone access denied. Check browser settings.');
            break;
          case 'NotFoundError':
            setError('No microphone found. Connect a mic and try again.');
            break;
          case 'NotReadableError':
            setError('Mic is in use by another app. Close it and try again.');
            break;
          default:
            setError('Something went wrong. Please try again.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  // Handle device selection continue
  const handleContinue = () => {
    setStep('testing'); // Phase 03+ will implement testing step
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header with persistent permission badge */}
      <header className="border-b border-slate-300 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4 max-w-3xl flex items-center justify-between">
          <h1 className="text-2xl font-bold">Microphone Test</h1>
          <PermissionStatusBadge status={status} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Browser info card */}
        <BrowserInfoCard browserInfo={browserInfo} />

        {/* Flow steps */}
        {step === 'permission' && (
          <PermissionStep
            status={status}
            onRequestPermission={handleRequestPermission}
            error={error}
            isLoading={isLoading}
          />
        )}

        {step === 'device-select' && (
          <DeviceSelect
            devices={devices}
            selected={selectedDevice}
            onSelect={setSelectedDevice}
            onContinue={handleContinue}
          />
        )}

        {step === 'testing' && (
          <div className="text-center text-slate-500">
            Testing step will be implemented in Phase 03.
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
```

### Key Integration Points

1. **Header Layout:**
   - Fixed header with border
   - Title + PermissionStatusBadge in flex layout
   - Badge always visible regardless of flow step

2. **Main Content:**
   - BrowserInfoCard always visible at top
   - Conditional rendering based on `step` state
   - Flow: permission → device-select → testing

3. **Permission Flow:**
   - Request permission on button click
   - Close stream after grant (just need permission, not active stream yet)
   - Refresh devices to populate labels
   - Advance to device-select step

4. **Error Handling:**
   - Map DOMException to user messages
   - Display error in PermissionStep
   - Clear error on retry

5. **Device Selection:**
   - Pass devices from useMediaDevices hook
   - Update selected device via setSelectedDevice
   - Continue button advances to testing step

## Implementation Checklist

- [x] Import hooks from Phase 2B
- [x] Import components from Phase 2C
- [x] Import types from Phase 01
- [x] Add useState for step and error
- [x] Initialize all hooks (usePermission, useBrowserInfo, useMediaDevices)
- [x] Create header with PermissionStatusBadge
- [x] Add BrowserInfoCard below header
- [x] Implement handleRequestPermission function
- [x] Handle getUserMedia error mapping
- [x] Close stream tracks after permission grant
- [x] Refresh devices after permission
- [x] Advance to device-select step on success
- [x] Render PermissionStep for permission step
- [x] Render DeviceSelect for device-select step
- [x] Add placeholder for testing step
- [x] Verify TypeScript compilation
- [x] Verify ESLint passes
- [x] Test in browser (permission flow, device selection)

## Success Criteria

- App compiles without errors
- Header displays with persistent badge
- BrowserInfoCard shows correct browser/OS info
- Permission request triggers browser dialog
- After grant, badge updates to "Mic: Allowed"
- After grant, advances to device-select step
- Device dropdown populates with microphone labels
- Selecting device updates state
- Continue button advances to testing step (placeholder)
- Error messages display correctly for denied permission
- No console errors
- Dark mode styles work correctly

## Testing Steps

1. **Initial Load:**
   - Badge shows "Mic: Not requested" or "Mic: Unknown" (Safari)
   - BrowserInfoCard identifies browser correctly
   - PermissionStep displays with "Test My Microphone" button

2. **Grant Permission:**
   - Click button → browser permission dialog
   - Grant → badge changes to "Mic: Allowed"
   - Flow advances to device-select step
   - Device dropdown shows microphones with labels

3. **Deny Permission:**
   - Click button → browser permission dialog
   - Deny → error message displays
   - Badge changes to "Mic: Blocked"
   - Instructions shown for unblocking

4. **Device Selection:**
   - Select different microphone from dropdown
   - Click "Continue to Test" button
   - Advances to testing placeholder

5. **Device Change:**
   - Plug/unplug microphone
   - Device list updates automatically

## Conflict Resolution

If integration issues arise:

1. **Type mismatches:** Verify Phase 01 types match hook/component expectations
2. **Import errors:** Check file paths (relative imports)
3. **Hook errors:** Ensure hooks called at top level (not conditionally)
4. **Component errors:** Verify all required props passed

## Rollback Strategy

If Phase 2D fails:
1. Revert `src/App.tsx` to Phase 01 state
2. Phases 2A/2B/2C remain intact
3. Debug integration issues
4. Retry Phase 2D

## Next Steps

After Phase 2D complete:
- Test full permission flow in Chrome, Safari, Firefox
- Verify dark mode works
- Verify responsive layout on mobile
- Proceed to Phase 03: Audio Engine & Hooks
