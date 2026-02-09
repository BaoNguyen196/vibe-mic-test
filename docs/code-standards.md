# Code Standards & Guidelines

**Phase:** 01 - Project Scaffolding & Configuration
**Last Updated:** 2026-02-09
**Status:** Active

## Table of Contents

1. [TypeScript Standards](#typescript-standards)
2. [Code Style](#code-style)
3. [Component Architecture](#component-architecture)
4. [Folder Structure](#folder-structure)
5. [Naming Conventions](#naming-conventions)
6. [Type Definitions](#type-definitions)
7. [ESLint Rules](#eslint-rules)
8. [Prettier Formatting](#prettier-formatting)

## TypeScript Standards

### Compiler Configuration

**File:** `tsconfig.app.json`

#### Target & Module Settings
```typescript
{
  "compilerOptions": {
    "target": "ES2022",              // Modern JavaScript features
    "module": "ESNext",              // Modern module system
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx"               // New JSX transform
  }
}
```

#### Strict Mode (All Enabled)
```typescript
{
  "compilerOptions": {
    "strict": true,                  // Enables all strict type checking options
    "noImplicitAny": true,           // No implicit any types (implicit in strict)
    "strictNullChecks": true,        // Strict null/undefined (implicit in strict)
    "strictFunctionTypes": true,     // Strict function types (implicit in strict)
    "strictBindCallApply": true,     // Strict bind/call/apply (implicit in strict)
    "strictPropertyInitialization": true,
    "noImplicitThis": true           // No implicit this (implicit in strict)
  }
}
```

#### Additional Linting Options
```typescript
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true,    // Add undefined to indexed access
    "noUnusedLocals": true,              // Error on unused local variables
    "noUnusedParameters": true,          // Error on unused parameters
    "noFallthroughCasesInSwitch": true,  // Error on switch case fallthrough
    "noUncheckedSideEffectImports": true // Error on untyped module imports
  }
}
```

#### Module Resolution
```typescript
{
  "compilerOptions": {
    "moduleResolution": "bundler",        // Bundler-style module resolution
    "allowImportingTsExtensions": true,   // Allow .ts imports
    "verbatimModuleSyntax": true,         // Preserve import/export syntax
    "moduleDetection": "force",           // Force ECM modules
    "skipLibCheck": true                  // Skip type checking of declaration files
  }
}
```

### Type Guidelines

#### 1. Explicit Type Annotations
Always provide explicit types for function parameters and return types.

```typescript
// Good
function calculateLevel(audioData: Float32Array): number {
  return Math.max(...audioData);
}

// Avoid
function calculateLevel(audioData) {
  return Math.max(...audioData);
}
```

#### 2. Interface Over Type Alias
Prefer interfaces for object shapes and types for unions/primitives.

```typescript
// Good - Interface for object
export interface AudioDeviceInfo {
  deviceId: string;
  label: string;
  groupId: string;
}

// Good - Type for union
export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unknown';
```

#### 3. Avoid Any
Never use `any` type. Use `unknown` with type guards instead.

```typescript
// Good
function processData(data: unknown): void {
  if (typeof data === 'object' && data !== null) {
    // Safe to use as object
  }
}

// Avoid
function processData(data: any): void { }
```

#### 4. Index Access Safety
Always account for undefined when accessing object/array indices.

```typescript
// Good - noUncheckedIndexedAccess catches missing undefined
const devices: AudioDeviceInfo[] = [];
const firstDevice = devices[0]; // Type: AudioDeviceInfo | undefined
if (firstDevice) {
  console.log(firstDevice.label);
}

// Avoid
const firstDevice = devices[0]!; // Don't use non-null assertion
```

## Code Style

### Indentation & Spacing
- **Indentation:** 2 spaces (not tabs)
- **Line Width:** 100 characters maximum
- **Trailing Commas:** All (objects, arrays, function parameters)
- **Semicolons:** Required at end of statements

### Prettier Configuration

File: `.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### Example Formatting

```typescript
// Function declaration
function initializeAudio(
  constraints: MediaStreamConstraints,
  onStream: (stream: MediaStream) => void,
): Promise<void> {
  // Implementation
}

// Object literal
const config = {
  sampleRate: 44100,
  channelCount: 2,
  echoCancellation: true,
};

// Import statements
import type { AudioDeviceInfo, TestMetrics } from './audio';
import { useState, useEffect } from 'react';
```

## Component Architecture

### React Component Structure

#### File Organization
```typescript
// 1. Imports
import { useState, useCallback } from 'react';
import type { AudioDeviceInfo } from '../types/audio';

// 2. Type definitions (if component-specific)
interface DeviceSelectorProps {
  devices: AudioDeviceInfo[];
  onSelect: (device: AudioDeviceInfo) => void;
}

// 3. Component
function DeviceSelector({ devices, onSelect }: DeviceSelectorProps) {
  // Component logic
  return (
    // JSX
  );
}

// 4. Export
export default DeviceSelector;
```

#### Naming Conventions
- Components: PascalCase (e.g., `DeviceSelector.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useAudioDevice.ts`)
- Services: camelCase (e.g., `audioService.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `SAMPLE_RATE`)

### Props & State Management

```typescript
// Define explicit interfaces for props
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
}

// Use destructuring in function signature
function Button({ variant, size, onClick, children }: ButtonProps) {
  return (
    <button className={cn('btn', `btn-${variant}`, `btn-${size}`)}>
      {children}
    </button>
  );
}
```

### Hooks Usage

```typescript
// Use typed state
const [devices, setDevices] = useState<AudioDeviceInfo[]>([]);
const [loading, setLoading] = useState<boolean>(false);

// Use typed callbacks
const handleSelect = useCallback(
  (device: AudioDeviceInfo): void => {
    setDevices((prev) => [...prev, device]);
  },
  [],
);
```

## Folder Structure

### Directory Organization

```
src/
├── components/          # React components
│   ├── common/         # Shared, reusable components
│   ├── audio/          # Audio-related components
│   └── flow/           # Step/workflow components
├── hooks/              # Custom React hooks
├── services/           # Business logic & API services
├── context/            # React Context providers
├── types/              # TypeScript type definitions
│   ├── audio.ts       # Audio-related types
│   └── state.ts       # Application state types
├── styles/             # Global stylesheets
│   └── index.css      # Tailwind CSS imports
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

### Import Path Guidelines

```typescript
// Relative imports for same level/nearby modules
import { Button } from '../common/Button';
import type { ButtonProps } from '../types/index';

// Avoid going up too many levels (max 3)
// Good
import { AudioService } from '../../services/AudioService';

// Avoid
import { something } from '../../../../../deeply/nested/module';
```

## Naming Conventions

### Variables & Functions
```typescript
// Descriptive, camelCase
const audioContext = new AudioContext();
const sampleRate = 44100;
const calculatePeakLevel = (data: Float32Array): number => { /* ... */ };

// Avoid abbreviations
// Good: selectedDevice
// Avoid: selDevice

// Avoid generic names
// Good: recordingUrl
// Avoid: url
```

### Constants
```typescript
// UPPER_SNAKE_CASE
const SAMPLE_RATE_HZ = 44100;
const DEFAULT_CHANNEL_COUNT = 2;
const MAX_RECORDING_DURATION_MS = 300000;
```

### Type Names
```typescript
// PascalCase for interfaces & types
interface AudioDeviceInfo { }
type PermissionStatus = 'prompt' | 'granted' | 'denied';

// Prefix boolean with 'is' or 'has'
interface AudioCapabilities {
  isSupported: boolean;
  hasEchoCancellation: boolean;
}
```

### File Naming

```
Components:           PascalCase.tsx
Hooks:               usePascalCase.ts
Services:            camelCaseService.ts
Types:               camelCase.ts
Utilities:           camelCase.ts
Styles:              camelCase.css
```

## Type Definitions

### Centralized Type Management

All shared types live in `src/types/`:

**audio.ts** - Audio-related types
```typescript
export interface AudioDeviceInfo { }
export interface AudioCapabilities { }
export interface TestMetrics { }
export interface BrowserInfo { }
export type MimeType = 'audio/webm;codecs=opus' | 'audio/mp4';
```

**state.ts** - Application state types
```typescript
export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unknown';
export type FlowStep = 'permission' | 'device-select' | 'testing' | 'results';
export interface AudioFlowState { }
```

### Type Import/Export

```typescript
// Always use 'type' imports for type-only imports
import type { AudioDeviceInfo, TestMetrics } from './audio';

// Regular imports for values
import { StrictMode } from 'react';
```

## ESLint Rules

### Configuration File

File: `eslint.config.js` (Flat Config Format)

```javascript
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,           // ESLint recommended
      tseslint.configs.recommended,     // TypeScript rules
      reactHooks.configs.flat.recommended,   // React Hooks rules
      reactRefresh.configs.vite,        // React Fast Refresh
      eslintConfigPrettier,             // Prettier compatibility
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
]);
```

### Enforced Rules

**TypeScript-ESLint**
- Disallows `any` type
- Requires explicit return types
- Enforces consistent naming conventions
- Detects unused imports/variables

**React Hooks**
- Dependencies array validation
- Hook call ordering
- Effect cleanup

**React Refresh**
- Validates exported components
- Ensures Fast Refresh compatibility

### Linting Workflow

```bash
# Run linter
npm run lint

# All issues must be resolved before committing
# Prettier can auto-fix formatting
# ESLint may require manual fixes for logic issues
```

## Prettier Formatting

### Configuration

File: `.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### IDE Integration

Recommended IDE settings:

**VS Code** `.vscode/settings.json`
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    }
  }
}
```

### Running Prettier

```bash
# Prettier auto-formats via ESLint configuration
# No separate prettier command needed during development
# Code is formatted on save with proper IDE setup
```

## Code Review Checklist

Before submitting code:

- [ ] TypeScript compilation passes (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] No `any` types used
- [ ] Functions have explicit return types
- [ ] Interfaces/types are properly exported from `src/types/`
- [ ] Props are TypeScript interfaces
- [ ] Constants use UPPER_SNAKE_CASE
- [ ] Components are PascalCase in PascalCase.tsx files
- [ ] Imports are organized (React, types, local)
- [ ] No console.log() in production code
- [ ] Lines under 100 characters
- [ ] No trailing whitespace
- [ ] All function parameters are typed

## Migration Path

When code doesn't meet standards:

1. Run `npm run lint` to identify issues
2. Prettier will auto-fix formatting issues
3. Manual fixes required for:
   - Type safety violations
   - Naming convention mismatches
   - Architectural pattern violations
4. Re-run `npm run lint` to verify
