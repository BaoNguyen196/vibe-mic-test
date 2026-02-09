# Phase 2A: Services Layer

## Context

- **Parent:** [phase-02-implementation-plan.md](./phase-02-implementation-plan.md)
- **Parallelization:** Can run with 2B, 2C simultaneously
- **Duration:** ~15 minutes

## Overview

| Field | Value |
|-------|-------|
| Phase | 2A - Services Layer |
| Executor | fullstack-developer agent |
| Files Created | 2 services |
| Dependencies | Types only (Phase 01) |
| Blocks | Phase 2D (App Integration) |

## Exclusive File Ownership

**This phase ONLY modifies:**
- `src/services/permission-service.ts` (create)
- `src/services/browser-detect-service.ts` (create)

**No other files touched.**

## Requirements

### File 1: `src/services/permission-service.ts`

**Purpose:** Encapsulate Permissions API with Safari fallback

**Exports:**
```typescript
// Query microphone permission state
export async function queryMicPermission(): Promise<PermissionStatus>

// Listen for permission changes (Chrome/Firefox only)
export function onPermissionChange(
  callback: (state: PermissionStatus) => void
): (() => void) | null

// Map DOMException to user-friendly messages
export function getPermissionErrorMessage(error: unknown): string
```

**Implementation Details:**
1. `queryMicPermission`:
   - Check if `navigator.permissions?.query` exists
   - If exists: query `{ name: 'microphone' }`, return state
   - If not (Safari): return `'unknown'`
   - Handle errors gracefully, return `'unknown'`

2. `onPermissionChange`:
   - Query permission object
   - Add `'change'` event listener
   - Return cleanup function that removes listener
   - Return `null` if Permissions API unavailable

3. `getPermissionErrorMessage`:
   - Check `error instanceof DOMException`
   - Map error names to messages:
     - `NotAllowedError`: "Microphone access denied. Check browser settings."
     - `NotFoundError`: "No microphone found. Connect a mic and try again."
     - `NotReadableError`: "Mic is in use by another app. Close it and try again."
     - `OverconstrainedError`: "Selected mic unavailable. Try another device."
     - Default: "Something went wrong. Please try again."
   - Non-DOMException: "An unexpected error occurred."

**Research Reference:** [researcher-04-browser-compatibility.md](./research/researcher-04-browser-compatibility.md)

### File 2: `src/services/browser-detect-service.ts`

**Purpose:** Detect browser, OS, platform, API support

**Export:**
```typescript
export function detectBrowser(): BrowserInfo
```

**Implementation Details:**
- Parse `navigator.userAgent` string
- Detect browser (order matters):
  1. Edge: `/Edg\//i`
  2. Opera: `/OPR\//i`
  3. Chrome: `/Chrome\//i` (exclude Chromium)
  4. Safari: `/Safari\//i` (exclude Chrome)
  5. Firefox: `/Firefox\//i`
- Extract version numbers with regex captures
- Detect OS: iOS, Android, macOS, Windows, Linux
- Detect platform: Mobile, Tablet, Desktop
- Check API support:
  - `supportsGetUserMedia`: `!!(navigator.mediaDevices?.getUserMedia)`
  - `supportsPermissionsApi`: `!!(navigator.permissions?.query)`
  - `supportsMediaRecorder`: `typeof MediaRecorder !== 'undefined'`

**Research Reference:** [researcher-04-browser-compatibility.md](./research/researcher-04-browser-compatibility.md)

## Type Dependencies

**Import from Phase 01:**
```typescript
import type { PermissionStatus } from '../types/state';
import type { BrowserInfo } from '../types/audio';
```

**No other imports allowed** (to prevent circular dependencies during parallel execution).

## Implementation Checklist

- [x] Create `src/services/` directory if not exists
- [x] Create `permission-service.ts` with 3 exports
- [x] Implement `queryMicPermission` with Safari fallback
- [x] Implement `onPermissionChange` with cleanup function
- [x] Implement `getPermissionErrorMessage` with all error types
- [x] Create `browser-detect-service.ts` with 1 export
- [x] Implement browser detection (Edge → Opera → Chrome → Safari → Firefox)
- [x] Implement OS detection (iOS, Android, macOS, Windows, Linux)
- [x] Implement platform detection (Mobile, Tablet, Desktop)
- [x] Implement API support detection (3 checks)
- [x] Add JSDoc comments for all exported functions
- [x] Verify TypeScript compilation (`npx tsc -b`)
- [x] Verify ESLint passes (for phase-owned files)

## Success Criteria

- Both service files compile without errors
- All functions properly typed
- Safari fallback returns `'unknown'`
- Permission change listener returns cleanup function or null
- Error messages are user-friendly
- Browser detection identifies Chrome, Safari, Firefox, Edge correctly
- API support flags accurate
- No external dependencies added
- No imports from hooks or components

## Testing Notes

Manual testing in Phase 2D after integration.

## Conflict Prevention

- Uses only type imports from `src/types/*`
- No imports from hooks (`src/hooks/*`)
- No imports from components (`src/components/*`)
- Pure functions with no side effects
- Can be developed completely independently
