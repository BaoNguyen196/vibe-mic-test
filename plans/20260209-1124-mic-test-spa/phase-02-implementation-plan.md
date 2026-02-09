# Phase 02 Implementation Plan: Permission & Device Management

## Context

- **Parent Plan:** [plan.md](./plan.md)
- **Original Phase:** [phase-02-permission-device-management.md](./phase-02-permission-device-management.md)
- **Dependencies:** Phase 01 Complete (types, scaffolding)
- **Research:**
  - [Web Audio & Permissions](./research/researcher-01-web-audio-permissions.md)
  - [React SPA Architecture](./research/researcher-02-react-spa-architecture.md)
  - [React Hooks Audio](./research/researcher-03-react-hooks-audio.md)
  - [Browser Compatibility](./research/researcher-04-browser-compatibility.md)

## Parallelization Strategy

Phase 02 split into **4 independent phases** for parallel execution:

```
┌─────────────────────────────────────────────┐
│   PARALLEL GROUP 1 (Run Simultaneously)     │
├─────────────────────────────────────────────┤
│ Phase 2A: Services Layer                    │
│ Phase 2B: Hooks Layer                       │
│ Phase 2C: UI Components                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│   SEQUENTIAL (Depends on 2A + 2B + 2C)      │
├─────────────────────────────────────────────┤
│ Phase 2D: App Integration                   │
└─────────────────────────────────────────────┘
```

**Execution Strategy:**
1. Launch Phase 2A, 2B, 2C in parallel using 3 fullstack-developer agents
2. Wait for all 3 to complete
3. Launch Phase 2D sequentially

**File Ownership Matrix:**

| Phase | Files Owned | Dependencies |
|-------|-------------|--------------|
| **2A** | `src/services/permission-service.ts`<br>`src/services/browser-detect-service.ts` | None |
| **2B** | `src/hooks/use-permission.ts`<br>`src/hooks/use-browser-info.ts`<br>`src/hooks/use-media-devices.ts` | Types only |
| **2C** | `src/components/flow/permission-step.tsx`<br>`src/components/flow/device-select.tsx`<br>`src/components/common/permission-status-badge.tsx`<br>`src/components/common/browser-info-card.tsx` | Types only |
| **2D** | `src/App.tsx` (modify) | 2A + 2B + 2C |

## Success Criteria

- All 4 phases complete without conflicts
- Permission state correctly detected (Chrome/Safari)
- PermissionStatusBadge updates in real-time
- BrowserInfoCard identifies all major browsers
- Device list populates after permission grant
- devicechange updates list without refresh
- User-friendly error messages
- Denied state shows browser-specific instructions

## Implementation Phases

See detailed phase files:
- [Phase 2A: Services Layer](./phase-02a-services-layer.md)
- [Phase 2B: Hooks Layer](./phase-02b-hooks-layer.md)
- [Phase 2C: UI Components](./phase-02c-ui-components.md)
- [Phase 2D: App Integration](./phase-02d-app-integration.md)

## Timeline

| Phase | Executor | Duration | Can Run Parallel |
|-------|----------|----------|------------------|
| 2A | fullstack-developer | ~15 min | ✓ Yes (with 2B, 2C) |
| 2B | fullstack-developer | ~20 min | ✓ Yes (with 2A, 2C) |
| 2C | fullstack-developer | ~25 min | ✓ Yes (with 2A, 2B) |
| 2D | fullstack-developer | ~10 min | ✗ No (depends on 2A-2C) |

**Total Time:** ~35 min (vs ~70 min sequential)

## Conflict Prevention

- **Zero file overlap:** Each phase owns exclusive files
- **Type-only dependencies:** Phases 2A-2C only import from `src/types/*`
- **Interface contracts:** All exports strictly typed
- **No cross-imports:** 2A/2B/2C cannot import each other during implementation
- **Integration phase:** 2D wires everything together after parallel work complete

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Type mismatches between phases | Low | Types pre-defined in Phase 01 |
| Component prop interface conflicts | Low | Explicit prop interfaces in plan |
| Merge conflicts | Very Low | Exclusive file ownership |
| Integration issues in 2D | Medium | Comprehensive integration checklist in Phase 2D |
