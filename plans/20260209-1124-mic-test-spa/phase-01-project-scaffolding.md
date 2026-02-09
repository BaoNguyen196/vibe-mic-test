# Phase 01: Project Scaffolding & Configuration

## Context

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** None (first phase)
- **Research:** [React SPA Architecture](./research/researcher-02-react-spa-architecture.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-09 |
| Description | Bootstrap Vite + React 18 + TypeScript (strict) + Tailwind v4 project with linting, folder structure, and base type definitions |
| Priority | Critical (blocks all phases) |
| Implementation Status | ✅ Complete |
| Review Status | ✅ Approved (260209) |
| Phase Status | ✅ DONE (2026-02-09 14:30:00 UTC) |
| Completion Percentage | 100% |

## Key Insights

- Tailwind v4 uses `@import "tailwindcss"` instead of v3 directives; config via `@tailwindcss/vite` plugin (no tailwind.config.js needed)
- ESLint flat config (`eslint.config.js`) is the 2026 standard; avoid legacy `.eslintrc`
- Vite scaffolding via `npm create vite@latest` gives React+TS template out of box
- TypeScript strict mode catches null/undefined issues critical for browser API work

## Requirements

1. Vite dev server with React 18+ and TypeScript strict mode
2. Tailwind CSS v4 integrated via Vite plugin
3. ESLint flat config with react-hooks and react-refresh plugins
4. Prettier for code formatting
5. Complete folder structure matching the architecture spec
6. Base TypeScript type definitions for audio flow state
7. Clean index.html with proper meta tags (title, description, viewport)

## Architecture

```
vibe-mic-test/
  index.html
  vite.config.ts
  tsconfig.json
  tsconfig.app.json
  eslint.config.js
  .prettierrc
  package.json
  src/
    main.tsx
    App.tsx
    styles/index.css
    types/audio.ts
    types/state.ts
    components/common/.gitkeep
    components/audio/.gitkeep
    components/flow/.gitkeep
    hooks/.gitkeep
    services/.gitkeep
    context/.gitkeep
```

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Create | Dependencies and scripts |
| `vite.config.ts` | Create | Vite config with React + Tailwind plugins |
| `tsconfig.json` | Create | TypeScript strict config |
| `tsconfig.app.json` | Create | App-specific TS settings |
| `eslint.config.js` | Create | ESLint flat config |
| `.prettierrc` | Create | Prettier formatting rules |
| `index.html` | Create | HTML entry point |
| `src/main.tsx` | Create | React root mount |
| `src/App.tsx` | Create | Root component shell |
| `src/styles/index.css` | Create | Tailwind CSS entry |
| `src/types/audio.ts` | Create | Audio-related types |
| `src/types/state.ts` | Create | App/flow state types |

## Implementation Steps

### Step 1: Scaffold Vite Project

```bash
cd /Users/bao.nguyen2/Documents/ts/ts-projects/vibe-mic-test
npm create vite@latest . -- --template react-ts
```

If directory not empty, scaffold in temp dir and move files.

### Step 2: Install Dependencies

```bash
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install -D prettier eslint-config-prettier
```

ESLint + react-hooks + react-refresh plugins come with the Vite React template.

### Step 3: Configure Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### Step 4: Configure TypeScript Strict Mode

Ensure `tsconfig.app.json` has:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Step 5: Configure Tailwind CSS v4

```css
/* src/styles/index.css */
@import "tailwindcss";
```

Update `src/main.tsx` to import `./styles/index.css`.

### Step 6: Configure ESLint Flat Config

Update `eslint.config.js` to include:
- `@typescript-eslint` rules
- `eslint-plugin-react-hooks` (enforce Rules of Hooks)
- `eslint-plugin-react-refresh` (HMR safety)
- `eslint-config-prettier` (disable formatting rules)

### Step 7: Configure Prettier

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### Step 8: Create Folder Structure

```bash
mkdir -p src/{components/{common,audio,flow},hooks,services,context,types,styles}
```

### Step 9: Define Base Types

```typescript
// src/types/audio.ts
export interface AudioDeviceInfo {
  deviceId: string;
  label: string;
  groupId: string;
}

export interface AudioCapabilities {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface TestMetrics {
  peakLevel: number;
  avgLevel: number;
  duration: number;
}

export interface BrowserInfo {
  name: string;        // 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Opera' | 'Unknown'
  version: string;     // e.g. '120.0'
  os: string;          // 'Windows' | 'macOS' | 'Linux' | 'iOS' | 'Android' | 'Unknown'
  platform: string;    // 'Desktop' | 'Mobile' | 'Tablet'
  supportsGetUserMedia: boolean;
  supportsPermissionsApi: boolean;
  supportsMediaRecorder: boolean;
}

export type MimeType = 'audio/webm;codecs=opus' | 'audio/mp4';
```

```typescript
// src/types/state.ts
import type { AudioDeviceInfo, TestMetrics } from './audio';

export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unknown';

export type FlowStep = 'permission' | 'device-select' | 'testing' | 'results';

export interface AudioFlowState {
  step: FlowStep;
  permissionStatus: PermissionStatus;
  stream: MediaStream | null;
  selectedDevice: AudioDeviceInfo | null;
  devices: AudioDeviceInfo[];
  testMetrics: TestMetrics | null;
  recordingUrl: string | null;
  error: string | null;
}
```

### Step 10: Create Shell App Component

```tsx
// src/App.tsx
function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8">Microphone Test</h1>
        <p className="text-center text-slate-500">App shell ready. Phases 02+ will add functionality.</p>
      </main>
    </div>
  );
}

export default App;
```

### Step 11: Update index.html

Set proper `<title>`, `<meta name="description">`, and viewport meta tag. Add `class="dark"` support on `<html>`.

### Step 12: Verify Setup

```bash
npm run dev        # Dev server starts, page renders
npm run build      # Production build succeeds
npm run lint       # No lint errors
```

## Todo List

- [x] Scaffold Vite React+TS project
- [x] Install Tailwind v4 + Prettier
- [x] Configure vite.config.ts with React + Tailwind plugins
- [x] Enable TypeScript strict mode
- [x] Set up Tailwind CSS v4 entry file
- [x] Configure ESLint flat config
- [x] Configure Prettier
- [x] Create folder structure (components, hooks, services, context, types)
- [x] Define base types (audio.ts, state.ts)
- [x] Create shell App component
- [x] Update index.html meta tags
- [x] Verify dev server, build, and lint all pass

## Success Criteria

1. `npm run dev` starts Vite dev server; page renders with shell content
2. `npm run build` produces production bundle without errors
3. `npm run lint` passes with zero errors
4. Tailwind utility classes apply correctly (verify with a colored bg)
5. TypeScript strict mode active (test by leaving a potential null unhandled)
6. All folders created per architecture spec

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Tailwind v4 breaking changes from v3 docs | Medium | Low | Use official v4 install guide; `@import "tailwindcss"` syntax |
| ESLint flat config incompatibility with plugins | Low | Low | Pin plugin versions; test lint after setup |
| Vite template changes | Low | Low | Use `--template react-ts`; adjust if scaffold differs |

## Security Considerations

- No secrets or API keys in this phase
- Ensure `.env` files are in `.gitignore` (Vite template includes this)
- HTTPS required for getUserMedia in production (Vite dev server uses localhost, which is exempt)

## Next Steps

Proceed to [Phase 02: Permission & Device Management](./phase-02-permission-device-management.md) to implement mic permission detection and device enumeration.
