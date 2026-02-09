# Phase 06: UI Polish & Theme

## Context

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** [Phase 01-05](./plan.md) (all prior phases must be functional)
- **Research:** [Dark Mode & Responsive Design](./research/researcher-02-react-spa-architecture.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-09 |
| Description | Add dark/light theme toggle with localStorage persistence, make layout fully responsive (mobile-first), implement accessibility features (ARIA, keyboard nav, focus management), and apply final styling polish and micro-animations. |
| Priority | Medium (functional app exists; this is polish) |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

- Tailwind v4 dark mode: add `dark` class on `<html>` element; use `dark:` prefix for variants
- Theme preference: check `localStorage` first, then `prefers-color-scheme` media query
- Mobile-first: design for 320px+ viewport; enhance for tablet/desktop with Tailwind breakpoints
- Accessibility: semantic HTML, ARIA labels on canvas visualizations, keyboard-navigable flow, focus management on step transitions
- Canvas elements are opaque to screen readers; must provide text alternatives

## Requirements

1. `useTheme` hook - dark/light toggle with localStorage + system preference detection
2. `ThemeToggle` component - sun/moon icon button in header
3. Responsive layout for all flow steps and visualizations
4. ARIA attributes on all interactive and visual elements
5. Keyboard navigation: tab through flow controls, Enter/Space to activate buttons
6. Focus management: auto-focus primary CTA on step transitions
7. Smooth transitions for theme switch and step changes
8. Header with app title + theme toggle
9. Footer with minimal info

## Architecture

### Theme System

```
useTheme hook
  ├── Reads: localStorage 'theme' key
  ├── Fallback: window.matchMedia('(prefers-color-scheme: dark)')
  ├── Sets: document.documentElement.classList.toggle('dark', isDark)
  └── Persists: localStorage.setItem('theme', ...)

ThemeToggle button
  └── Calls useTheme().toggle()
```

### Responsive Breakpoints

| Viewport | Layout | Visualization |
|----------|--------|---------------|
| < 640px (mobile) | Single column, full-width | Stacked vertically, reduced height |
| 640-1024px (tablet) | Single column, centered max-w-2xl | Full-height visualizations |
| > 1024px (desktop) | Single column, centered max-w-3xl | Side-by-side waveform + spectrum possible |

### Accessibility Tree

```
<main role="main" aria-label="Microphone Test">
  <h1>Microphone Test</h1>
  [ErrorBanner role="alert"]
  [FlowStep region aria-live="polite"]
    <button> (CTA, auto-focused)
    <select aria-label="Select microphone">
    <canvas role="img" aria-label="Audio waveform">
    <canvas role="meter" aria-label="Volume level: X%">
    <audio controls aria-label="Recorded audio playback">
</main>
```

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/use-theme.ts` | Create | Dark/light theme hook |
| `src/components/common/theme-toggle.tsx` | Create | Theme switch button |
| `src/components/common/header.tsx` | Create | App header with title + theme toggle |
| `src/components/common/footer.tsx` | Create | Minimal footer |
| `src/App.tsx` | Modify | Add header, footer, responsive container |
| `src/styles/index.css` | Modify | Add custom Tailwind theme, transitions, animations |
| `src/components/flow/*.tsx` | Modify | Add ARIA attributes, responsive classes, focus management |
| `src/components/audio/*.tsx` | Modify | Add dark mode colors, responsive sizing |

## Implementation Steps

### Step 1: Create useTheme Hook

```typescript
// src/hooks/use-theme.ts
import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((prev) => !prev), []);

  return { isDark, toggle };
}
```

### Step 2: Create ThemeToggle Component

```tsx
// src/components/common/theme-toggle.tsx
import { useTheme } from '../../hooks/use-theme';

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sun icon for dark mode (click to go light), Moon icon for light mode (click to go dark) */}
      {/* Use inline SVG icons (no icon library dependency) */}
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

// SunIcon and MoonIcon: simple inline SVGs, ~20 lines each
// Or use a single icon component with conditional path data
```

### Step 3: Create Header Component

```tsx
// src/components/common/header.tsx
import { ThemeToggle } from './theme-toggle';
import { PermissionStatusBadge } from './permission-status-badge';
import { usePermission } from '../../hooks/use-permission';

export function Header() {
  const { status } = usePermission();

  return (
    <header className="flex items-center justify-between py-4 px-4 md:px-0">
      <h1 className="text-2xl md:text-3xl font-bold">Microphone Test</h1>
      <div className="flex items-center gap-3">
        <PermissionStatusBadge status={status} />
        <ThemeToggle />
      </div>
    </header>
  );
}

// PermissionStatusBadge is ALWAYS visible in header — provides constant
// awareness of mic permission state regardless of which flow step is active
```

### Step 4: Create Footer Component

```tsx
// src/components/common/footer.tsx
export function Footer() {
  return (
    <footer className="text-center text-xs text-slate-400 dark:text-slate-600 py-8 mt-12">
      <p>All audio processing happens locally in your browser. No data is sent to any server.</p>
    </footer>
  );
}
```

### Step 5: Add Responsive Layout to App.tsx

```tsx
// src/App.tsx
<AudioFlowProvider>
  <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                  transition-colors duration-200">
    <div className="container mx-auto px-4 max-w-3xl">
      <Header />
      <main role="main" aria-label="Microphone Test">
        <div aria-live="polite">
          <ErrorBanner />
          <FlowRouter />
        </div>
      </main>
      <Footer />
    </div>
  </div>
</AudioFlowProvider>
```

### Step 6: Add Focus Management on Step Transitions

```typescript
// In FlowRouter or each step component:
// When step changes, focus the primary CTA button
import { useEffect, useRef } from 'react';

// In each step component:
const ctaRef = useRef<HTMLButtonElement>(null);
useEffect(() => {
  ctaRef.current?.focus();
}, []);

// On the primary button:
<button ref={ctaRef} ...>Test My Microphone</button>
```

### Step 7: Add ARIA Attributes to Flow Components

- PermissionStep: `role="status"` on permission state indicator; `aria-live="polite"` on state text
- DeviceSelect: `<label htmlFor="mic-select">` on `<select>`; `aria-describedby` for help text
- TestingPhase: `role="timer"` on countdown; canvas `role="img"` with descriptive labels
- ResultsPanel: `<audio controls>` with `aria-label`; results summary as `<dl>` definition list
- ErrorBanner: `role="alert"` (already added in Phase 05)

### Step 8: Add Keyboard Navigation

- All interactive elements are native `<button>` and `<select>` (keyboard-accessible by default)
- Add visible focus indicators: `focus:ring-2 focus:ring-blue-500 focus:outline-none`
- Ensure tab order follows visual flow (natural DOM order)
- Add `Escape` key handler to dismiss error banner

### Step 9: Responsive Visualization Layout

```tsx
// In TestingPhase:
<div className="space-y-4">
  <WaveformViz className="w-full h-24 sm:h-32" />
  <VolumeMeter className="w-full h-5 sm:h-6" />
  <SpectrumViz className="w-full h-32 sm:h-40" />
</div>
```

On larger screens, optionally place waveform and spectrum side by side:
```tsx
<div className="flex flex-col lg:flex-row lg:gap-4">
  <WaveformViz className="w-full lg:w-1/2 h-32" />
  <SpectrumViz className="w-full lg:w-1/2 h-32" />
</div>
<VolumeMeter className="w-full h-6" />
```

### Step 10: Add Theme-Aware Colors to Canvas Visualizations

Pass `isDark` prop to visualization components (from `useTheme` or context). Update draw functions:

```typescript
// In waveform-viz.tsx:
const bgColor = isDark ? 'transparent' : 'transparent'; // Canvas bg via CSS
const lineColor = isDark ? '#60a5fa' : '#3b82f6';       // blue-400 / blue-500

// In volume-meter.tsx:
const trackColor = isDark ? '#334155' : '#e2e8f0';       // slate-700 / slate-200

// In spectrum-viz.tsx:
// Hue shift stays the same; works on both themes
```

### Step 11: Add Subtle Animations

```css
/* src/styles/index.css additions */
@import "tailwindcss";

/* Smooth step transitions */
@layer utilities {
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Apply `animate-fade-in` to each flow step wrapper on mount.

### Step 12: Final Styling Polish

- Consistent spacing: `space-y-4` for form elements, `space-y-6` for sections
- Card-style containers: `rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm`
- Button styles: primary (`bg-blue-600 text-white hover:bg-blue-700`), secondary (`bg-slate-100 dark:bg-slate-800`)
- Recording indicator: pulsing red dot (`animate-pulse`)
- Device selector: styled `<select>` with Tailwind

## Todo List

- [ ] Create `src/hooks/use-theme.ts` with localStorage + system preference
- [ ] Create `src/components/common/theme-toggle.tsx` with sun/moon icons
- [ ] Create `src/components/common/header.tsx` with title + theme toggle
- [ ] Create `src/components/common/footer.tsx` with privacy note
- [ ] Update `src/App.tsx` with header, footer, responsive container, ARIA
- [ ] Add focus management to each flow step (auto-focus CTA)
- [ ] Add ARIA attributes to all interactive and visual elements
- [ ] Add visible focus indicators (`focus:ring-2`) to all buttons/inputs
- [ ] Add Escape key handler for error banner
- [ ] Make visualization layout responsive (mobile stacked, desktop side-by-side optional)
- [ ] Pass isDark to canvas visualizations for theme-aware colors
- [ ] Add fadeIn animation to step transitions
- [ ] Add pulsing recording indicator animation
- [ ] Apply consistent card/button styling across all components
- [ ] Test with keyboard-only navigation (no mouse)
- [ ] Test with screen reader (VoiceOver on macOS)
- [ ] Test responsive layout at 320px, 768px, 1024px viewports
- [ ] Test dark/light theme toggle persists across refresh

## Success Criteria

1. Theme toggle switches between dark and light; persists in localStorage
2. Page loads with correct theme (localStorage > system preference)
3. All text, backgrounds, borders adapt to theme change
4. Layout works correctly at mobile (320px), tablet (768px), desktop (1024px+)
5. All buttons and controls are keyboard-accessible (Tab, Enter, Space, Escape)
6. Primary CTA auto-focuses when step changes
7. Screen reader announces step changes, error messages, and volume level
8. Canvas visualizations have descriptive ARIA labels
9. Focus indicators visible on all interactive elements
10. Animations are subtle and don't cause motion sickness (respects `prefers-reduced-motion`)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Theme flash on page load (FOUC) | Medium | Low | Inline script in index.html to set dark class before render |
| Canvas not accessible to screen readers | Certain | Medium | ARIA labels + text-based volume readout as alternative |
| Focus trap in step transitions | Low | Medium | Test tab order; ensure focus flows naturally |
| Animation causes motion sickness | Low | Low | Respect `prefers-reduced-motion` media query |
| Inline SVG icons increase bundle | Low | Low | Simple icons; <1KB total |

## Security Considerations

- localStorage for theme preference only (no sensitive data)
- No external font/icon CDN calls (self-contained)
- No third-party analytics or tracking scripts

## Next Steps

After Phase 06 is complete, the Microphone Test SPA is feature-complete. Consider:
- Adding unit tests with Vitest for hooks and services
- Performance profiling on low-end devices
- Deploying to a static hosting service (Vercel, Netlify, GitHub Pages)
- Adding PWA support (service worker for offline use)
