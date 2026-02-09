# Vibe Mic Test - Codebase Summary

**Project:** Vibe Mic Test SPA
**Version:** 0.0.0
**Phase:** 01 - Project Scaffolding & Configuration (Complete)
**Last Updated:** 2026-02-09

## Overview

Vibe Mic Test is a React-based Single Page Application (SPA) designed for comprehensive microphone testing with real-time audio visualization, device selection, and recording capabilities. Phase 01 establishes the project foundation with modern tooling, strict TypeScript configuration, and a scalable folder structure.

## Technology Stack

### Core Framework
- **React 19.2.0** - UI library with latest features
- **React DOM 19.2.0** - DOM rendering for React
- **TypeScript 5.9.3** - Strict static typing with advanced features

### Build & Bundling
- **Vite 7.2.4** - Lightning-fast build tool with HMR
- **@vitejs/plugin-react 5.1.1** - Babel-based React JSX transformation
- **@tailwindcss/vite 4.1.18** - Tailwind CSS v4 with Vite integration

### Styling
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **PostCSS** - CSS transformations (via Tailwind)

### Linting & Formatting
- **ESLint 9.39.1** - JavaScript/TypeScript linting
- **@eslint/js 9.39.1** - Core ESLint rules
- **typescript-eslint 8.46.4** - TypeScript-specific linting rules
- **eslint-plugin-react-hooks 7.0.1** - React Hooks best practices
- **eslint-plugin-react-refresh 0.4.24** - React Fast Refresh validation
- **eslint-config-prettier 10.1.8** - Prettier compatibility
- **Prettier 3.8.1** - Code formatter
- **globals 16.5.0** - Global variable definitions

### Development Tools
- **@types/react 19.2.5** - React type definitions
- **@types/react-dom 19.2.3** - React DOM type definitions
- **@types/node 24.10.1** - Node.js type definitions

## Project Structure

```
vibe-mic-test/
├── docs/                          # Documentation (Phase 01+)
│   ├── codebase-summary.md       # This file
│   ├── code-standards.md         # Code standards & patterns
│   ├── system-architecture.md    # Architecture & design
│   ├── project-overview-pdr.md   # Product requirements
│   └── deployment-guide.md       # Deployment instructions
├── src/
│   ├── components/               # React components (future)
│   │   ├── common/              # Shared components
│   │   ├── audio/               # Audio-specific components
│   │   └── flow/                # Flow/step components
│   ├── hooks/                    # Custom React hooks (future)
│   ├── services/                 # Business logic & API services (future)
│   ├── context/                  # React Context providers (future)
│   ├── types/
│   │   ├── audio.ts             # Audio interfaces & types
│   │   └── state.ts             # Application state types
│   ├── styles/
│   │   └── index.css            # Global Tailwind imports
│   ├── main.tsx                 # Application entry point
│   └── App.tsx                  # Root component
├── public/                        # Static assets
├── index.html                     # HTML entry point
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript root config
├── tsconfig.app.json            # TypeScript app config
├── tsconfig.node.json           # TypeScript node config
├── eslint.config.js             # ESLint configuration (flat config)
├── .prettierrc                  # Prettier configuration
├── package.json                 # Dependencies & scripts
└── README.md                    # Initial project template
```

## Key Files

### Configuration Files

**vite.config.ts**
- Configures Vite build tool
- Plugins: React, Tailwind CSS
- HMR enabled for development

**tsconfig.app.json**
- Strict TypeScript mode enabled
- Target: ES2022
- Module resolution: bundler
- Strict linting: noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch
- Advanced: noUncheckedIndexedAccess, noUncheckedSideEffectImports

**eslint.config.js**
- Flat config format (ESLint v9+)
- Extends: ESLint recommended, TypeScript-ESLint recommended, React Hooks, React Refresh, Prettier
- Global ignores: dist/

**.prettierrc**
- Print width: 100 characters
- Single quotes: enabled
- Tab width: 2 spaces
- Trailing commas: all
- Semicolons: enabled

### Source Files

**src/types/audio.ts**
- AudioDeviceInfo - Microphone device information
- AudioCapabilities - Audio feature support matrix
- TestMetrics - Audio test measurements
- BrowserInfo - Browser detection & capability info
- MimeType - Supported audio codecs

**src/types/state.ts**
- PermissionStatus - Microphone permission states
- FlowStep - Application workflow steps
- AudioFlowState - Complete application state interface

**src/App.tsx**
- Root component
- Shell UI ready for Phase 02+ functionality
- Dark mode support via Tailwind

**src/main.tsx**
- React entry point
- Strict mode enabled
- Mounts React to DOM #root element

**src/styles/index.css**
- Tailwind CSS imports

## Package Scripts

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # TypeScript check + Vite production build
npm run lint       # Run ESLint on all files
npm run preview    # Preview production build locally
```

## Build Output

- **Bundle Size:** 60.81 KB (gzipped)
- **Build Time:** 356ms
- **Format:** ES modules
- **Output Dir:** dist/

## Development Workflow

1. **Local Development**
   - `npm run dev` - Start HMR server at localhost:5173
   - Code changes auto-refresh browser
   - Type checking on save (if IDE configured)

2. **Linting & Formatting**
   - `npm run lint` - Check code style compliance
   - Prettier formats automatically (IDE integration recommended)
   - No configuration needed - ESLint + Prettier integrated

3. **Production Build**
   - `npm run build` - TypeScript check + minification + bundling
   - Output in dist/ folder
   - Ready for deployment

## Browser Support

Targets modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires Microphone API support (getUserMedia)

## Phase 01 Completion Status

**All Tests Passing:** 10/10
**Build Status:** Verified (60.81 KB gzipped, 356ms build time)
**Code Review:** Zero critical issues
**ESLint:** Zero violations
**TypeScript:** Zero compilation errors

### Completed Deliverables

✓ Vite + React 19 + TypeScript project scaffold
✓ Strict TypeScript configuration (ES2022 target)
✓ Tailwind CSS v4 integration
✓ ESLint flat config with TypeScript rules
✓ Prettier code formatter integration
✓ Folder structure for scalable growth
✓ Type definitions for audio and state management
✓ Shell App component with dark mode support
✓ HTML entry point with proper metadata
✓ Build pipeline verification
✓ 10/10 test suite passing

### Next Phase Goals (Phase 02)

- Microphone permission handling
- Audio device detection & selection
- Permission state management
- Error handling for device access

## Dependencies Overview

### Production Dependencies
- react@19.2.0
- react-dom@19.2.0

### Dev Dependencies
- **Build:** vite, @vitejs/plugin-react, @tailwindcss/vite
- **Styling:** tailwindcss
- **Type Checking:** typescript
- **Linting:** eslint, typescript-eslint, react plugins
- **Formatting:** prettier, eslint-config-prettier
- **Types:** @types/react, @types/react-dom, @types/node

## Notes

- Strict mode enabled in both TypeScript and React
- No external UI component libraries (Phase 02+ consideration)
- Dark mode ready via Tailwind dark: prefix
- Service Worker not included (Phase 02+ if needed)
- Testing framework selection deferred to Phase 02+
