# System Architecture

**Project:** Vibe Mic Test SPA
**Phase:** 01 - Project Scaffolding & Configuration
**Last Updated:** 2026-02-09
**Architecture Maturity:** Foundation

## Architecture Overview

Vibe Mic Test follows a layered architecture pattern optimized for real-time audio processing in the browser. Phase 01 establishes the foundation with clean separation of concerns through type-driven design.

### High-Level Layers

```
┌─────────────────────────────────────────────┐
│         React UI Layer (Components)         │
│    ├─ Flow Components (permission→results) │
│    ├─ Audio Components (visualizers)       │
│    └─ Common Components (buttons, panels)  │
├─────────────────────────────────────────────┤
│         State Management Layer               │
│    ├─ React Context (global state)         │
│    ├─ Custom Hooks (logic extraction)      │
│    └─ Reducer Patterns (complex flows)     │
├─────────────────────────────────────────────┤
│         Service Layer                       │
│    ├─ AudioService (Web Audio API)        │
│    ├─ DeviceService (getUserMedia)        │
│    ├─ RecordingService (MediaRecorder)   │
│    └─ BrowserService (capability detection)│
├─────────────────────────────────────────────┤
│         Type Layer                          │
│    ├─ audio.ts (audio domain types)        │
│    ├─ state.ts (state management types)    │
│    └─ Component-level interfaces           │
├─────────────────────────────────────────────┤
│         Browser APIs                        │
│    ├─ getUserMedia (device enumeration)   │
│    ├─ Web Audio API (analysis)            │
│    ├─ MediaRecorder (audio recording)     │
│    └─ Permissions API (device access)     │
└─────────────────────────────────────────────┘
```

## Directory Architecture

### Root Level Files

```
vibe-mic-test/
├── vite.config.ts                # Build configuration
├── tsconfig.json                 # TypeScript root config
├── tsconfig.app.json             # App-specific TypeScript
├── tsconfig.node.json            # Node tools TypeScript
├── eslint.config.js              # Linting rules
├── .prettierrc                   # Code formatting
├── package.json                  # Dependencies & scripts
├── index.html                    # HTML entry point
└── README.md                     # Project introduction
```

### Source Code Structure

#### `/src` - Application Source

```
src/
├── main.tsx                      # React root initialization
├── App.tsx                       # Root component (shell)
├── components/                   # React components
├── hooks/                        # Custom React hooks
├── services/                     # Business logic services
├── context/                      # React Context providers
├── types/                        # TypeScript type definitions
└── styles/                       # Global stylesheets
```

#### `/src/components` - UI Components

```
components/
├── common/                       # Reusable UI primitives
│   ├── Button.tsx               # Button component
│   ├── Card.tsx                 # Card layout
│   ├── Badge.tsx                # Status badge
│   ├── Alert.tsx                # Error/info alerts
│   └── index.ts                 # Barrel export
├── audio/                       # Audio-specific components
│   ├── Visualizer.tsx           # Real-time waveform
│   ├── SpectrumDisplay.tsx      # Frequency spectrum
│   ├── LevelMeter.tsx           # Audio level indicator
│   ├── DeviceSelect.tsx         # Microphone selector
│   └── index.ts                 # Barrel export
└── flow/                        # Step/workflow components
    ├── PermissionStep.tsx       # Permission request UI
    ├── DeviceSelectStep.tsx     # Device selection UI
    ├── TestingStep.tsx          # Testing UI
    ├── ResultsStep.tsx          # Results display
    └── index.ts                 # Barrel export
```

#### `/src/hooks` - Custom Hooks

```
hooks/
├── useAudioContext.ts           # Web Audio API hook
├── useAudioDevices.ts           # Device enumeration
├── useAudioLevel.ts             # Real-time level analysis
├── usePermissions.ts            # Permissions API integration
├── useMediaRecorder.ts          # Recording logic
├── useAudioFlow.ts              # Step management
└── index.ts                     # Barrel export
```

#### `/src/services` - Business Logic

```
services/
├── AudioService.ts              # Web Audio API wrapper
├── DeviceService.ts             # getUserMedia wrapper
├── RecordingService.ts          # MediaRecorder wrapper
├── PermissionService.ts         # Permissions API wrapper
├── BrowserService.ts            # Browser detection
├── StorageService.ts            # localStorage wrapper
└── index.ts                     # Barrel export
```

#### `/src/context` - State Management

```
context/
├── AudioFlowContext.tsx         # Main flow state context
├── AudioCapabilitiesContext.tsx # Browser capabilities
├── RecordingContext.tsx         # Recording state
└── index.ts                     # Barrel export
```

#### `/src/types` - Type Definitions

```
types/
├── audio.ts                     # Audio domain types
├── state.ts                     # State management types
├── browser.ts                   # Browser capability types (future)
├── recording.ts                 # Recording types (future)
└── index.ts                     # Barrel export
```

## Data Flow Architecture

### Application State Machine

```
                    ┌──────────────┐
                    │   START      │
                    └──────┬───────┘
                           │
                           ▼
              ┌────────────────────────┐
              │    PERMISSION STEP     │
              │ (Request microphone)   │
              └──────┬────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    DENIED               GRANTED (proceed)
     (error)                     │
                                 ▼
                  ┌──────────────────────────┐
                  │  DEVICE SELECT STEP      │
                  │ (Enumerate & select mic) │
                  └──────┬───────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   TESTING STEP         │
            │ (Analyze audio level)  │
            └──────┬────────────────┘
                   │
                   ▼
          ┌────────────────────┐
          │  RESULTS STEP      │
          │ (Display metrics)  │
          └────────────────────┘
```

### State Flow

```
User Action
    ↓
Component Event Handler
    ↓
Hook/Service Call
    ↓
State Update (Context/useState)
    ↓
Component Re-render
    ↓
UI Update
```

### Type-Safe Data Propagation

```typescript
// Phase 01: Type Definitions (Foundation)
interface AudioFlowState {
  step: FlowStep;
  permissionStatus: PermissionStatus;
  stream: MediaStream | null;
  selectedDevice: AudioDeviceInfo | null;
  devices: AudioDeviceInfo[];
  testMetrics: TestMetrics | null;
  recordingUrl: string | null;
  error: string | null;
}

// Phase 02+: Context Provider wraps state
const [state, dispatch] = useReducer(flowReducer, initialState);
<AudioFlowContext.Provider value={state}>
  {children}
</AudioFlowContext.Provider>

// Phase 02+: Components consume typed state
const { step, permissionStatus } = useContext(AudioFlowContext);
```

## Build & Deployment Architecture

### Development Pipeline

```
Source Code (src/)
    ↓
TypeScript Compiler (tsc -b)
    ↓
ESLint & Prettier Check (npm run lint)
    ↓
Vite Build (vite build)
    ├─ React JSX Transform (@vitejs/plugin-react)
    ├─ Tailwind CSS Processing (@tailwindcss/vite)
    ├─ Module Bundling (Vite)
    ├─ Code Minification
    └─ Output: dist/
    ↓
Production Bundle (dist/)
```

### Build Configuration

**vite.config.ts**
```typescript
- React Plugin: Fast Refresh during dev, JSX transform
- Tailwind Plugin: CSS processing via PostCSS
- Output: ES modules for modern browsers
```

**tsconfig.app.json**
```typescript
- Target: ES2022 (modern browser features)
- Module: ESNext (browser native modules)
- Strict: All strict checks enabled
- jsx: react-jsx (new JSX transform)
```

### Optimization Strategy

**Code Splitting:** Vite automatically handles
**Tree Shaking:** Enabled via ESM modules
**CSS Optimization:** Tailwind purges unused utilities
**Asset Optimization:** Images/fonts to be added in Phase 02+

## Technology Decisions

### Why React 19?

- Latest features and performance improvements
- Excellent TypeScript support
- Large ecosystem for audio visualization libraries
- Strong community support

### Why Vite?

- Lightning-fast dev server with HMR
- Native ES modules in development
- Optimized production builds
- Superior developer experience vs Webpack

### Why Tailwind CSS v4?

- Utility-first CSS for rapid UI development
- No CSS-in-JS runtime overhead
- Dark mode support built-in
- Excellent PostCSS integration with Vite

### Why TypeScript Strict Mode?

- Catches errors at compile time
- Self-documenting code via types
- Better IDE autocomplete
- Prevents whole categories of runtime bugs

### Why ESLint Flat Config?

- Modern, simplified configuration format
- Better performance
- Aligned with ESLint v9+ direction
- Easier integration with TypeScript

## Security Architecture

### Content Security Policy (Phase 02)

- Media streams only from user device (no remote URLs)
- Recording stored in browser memory or localStorage
- No server transmission without explicit user consent

### Permissions & User Consent

- Explicit permission request via Permissions API
- User can revoke access at any time
- Clear communication about mic access scope
- HTTPS required for getUserMedia in production

### Type Safety Benefits

- No accidental type coercion
- Strict null checks prevent null pointer errors
- Indexed access validation prevents out-of-bounds
- Unused variable detection prevents dead code

## Scalability Considerations

### Component Composition

Current 2-3 level component tree scales to arbitrary depth:
```
App
└── Flow Step Component
    └── Feature Components
        └── Common Components
```

### State Management

Current context-based approach suitable for:
- Single user application (no multi-user state)
- < 20KB total application state
- < 5 major state updates per second

### Service Layer Abstraction

Services abstract browser APIs, allowing:
- Easy testing via mocks
- Browser API version changes
- Feature flag implementation
- Graceful fallbacks

### Type System Flexibility

TypeScript enables:
- Interface extension without code changes
- Type-safe feature flags
- Compile-time feature elimination
- Easy refactoring

## Performance Targets (Phase 01 Baseline)

**Bundle Size:** 60.81 KB (gzipped)
**Build Time:** 356ms
**Dev Server:** < 100ms HMR updates
**Runtime Memory:** < 10 MB with stream active

## Future Architecture Additions (Phase 02+)

### Phase 02: Permissions & Device Management
- Permission context & state management
- Device enumeration service
- Error boundary components
- Loading states

### Phase 03: Audio Engine & Hooks
- Web Audio API integration
- Real-time analysis (analyser node)
- Custom hooks for audio processing
- Level/frequency detection

### Phase 04: Visualizations
- Canvas-based waveform visualizer
- Frequency spectrum display
- Peak level indicator
- Recording timeline

### Phase 05: Recording & Flow
- MediaRecorder integration
- Recording service
- Audio playback preview
- Flow completion handling

### Phase 06: UI Polish & Theme
- Theme context & provider
- Light/dark mode toggle
- Accessibility improvements
- Mobile-responsive design

## Dependency Architecture

```
Direct Dependencies (production):
├─ react@19.2.0
└─ react-dom@19.2.0

Dev Dependencies (organized by purpose):
├─ Build Tools
│  ├─ vite@7.2.4
│  ├─ @vitejs/plugin-react@5.1.1
│  └─ @tailwindcss/vite@4.1.18
├─ Styling
│  └─ tailwindcss@4.1.18
├─ Type Checking
│  └─ typescript@5.9.3
├─ Linting
│  ├─ eslint@9.39.1
│  ├─ typescript-eslint@8.46.4
│  ├─ eslint-plugin-react-hooks@7.0.1
│  ├─ eslint-plugin-react-refresh@0.4.24
│  └─ eslint-config-prettier@10.1.8
├─ Formatting
│  └─ prettier@3.8.1
└─ Type Definitions
   ├─ @types/react@19.2.5
   ├─ @types/react-dom@19.2.3
   └─ @types/node@24.10.1
```

## Code Organization Principles

1. **Single Responsibility:** Each module has one reason to change
2. **Type Safety:** Leverage TypeScript for compile-time safety
3. **DRY (Don't Repeat Yourself):** Extract common patterns to utilities/hooks
4. **SOLID Principles:** Applied through service abstraction
5. **Progressive Enhancement:** Core functionality → enhancement features
6. **Accessibility First:** Built into components from Phase 02+

## Testing Architecture (Phase 03+)

Planned testing structure:

```
tests/
├── unit/
│   ├── services/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── components/
│   └── flows/
├── e2e/
│   └── user-flows/
└── __mocks__/
    ├── services/
    └── browser-apis/
```

## Error Handling Strategy

### Development
- TypeScript compile-time errors
- ESLint rule violations
- Runtime errors logged to console

### Production
- Error boundary components (Phase 02+)
- User-friendly error messages
- Graceful degradation for unsupported features
- Error telemetry (Phase 03+)
