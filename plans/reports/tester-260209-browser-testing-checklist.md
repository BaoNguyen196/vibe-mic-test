# Browser Testing Checklist - Phase 02: Permission & Device Management

**Date:** February 9, 2026
**Project:** Vibe Mic Test
**Manual Testing Scope:** Real browser testing with live browser APIs
**Status:** READY FOR MANUAL TESTING

---

## Overview

This document provides specific manual testing procedures for Phase 02. All tests use real browser APIs (no mocks) and require actual browser permissions and microphone hardware.

**Prerequisites:**
- Local microphone hardware connected
- Browser launched with `npm run dev`
- Server running at http://localhost:5173

---

## Test Environment Setup

### Starting the Dev Server

```bash
npm run dev
```

**Expected Output:**
```
VITE v7.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

**Verify:**
- ✅ Dev server starts without errors
- ✅ No console errors in browser DevTools
- ✅ Page loads without blank screen
- ✅ HMR (Hot Module Replacement) working

---

## Test Case 1: Initial Load & Badge State

**Objective:** Verify application loads correctly and displays permission status badge

### Test Steps

1. Open http://localhost:5173 in fresh browser tab/window
2. Wait for full page load
3. Check header for permission badge

### Expected Results

- ✅ Page loads without console errors
- ✅ Badge visible in top-right corner
- ✅ Badge shows one of: "Mic: Not requested" or "Mic: Unknown"
- ✅ Badge color: Amber background with amber dot indicator
- ✅ Badge text centered and readable
- ✅ Dark mode badge visible if dark mode enabled

### Acceptance Criteria

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Page loads successfully | No errors | | ☐ |
| Badge displays | Visible in header | | ☐ |
| Badge text correct | "Mic: Not requested" or "Mic: Unknown" | | ☐ |
| Badge color amber | Yellow/amber tone | | ☐ |
| Badge dot visible | Amber circle indicator | | ☐ |

---

## Test Case 2: BrowserInfoCard Display

**Objective:** Verify browser detection and capabilities display

### Test Steps

1. Look below header at BrowserInfoCard
2. Check all displayed values
3. Verify API support flags

### Expected Results

- ✅ Card displays "Your Device" heading
- ✅ Browser name detected correctly (e.g., "Chrome", "Firefox", "Safari", "Edge")
- ✅ Browser version displays (e.g., "120.0")
- ✅ OS detected correctly (Windows, macOS, Linux, iOS, Android)
- ✅ Platform detected correctly (Desktop, Mobile, Tablet)
- ✅ getUserMedia support: Shows ✅ Supported or ❌ Not supported
- ✅ Permissions API: Shows ✅ Supported or ⚠️ Limited (Safari)
- ✅ MediaRecorder: Shows ✅ Supported or ❌ Not supported
- ✅ Card styling matches light/dark mode

### Acceptance Criteria

| Item | Expected | Actual | Status |
|------|----------|--------|--------|
| Browser name | Correct for browser used | | ☐ |
| Browser version | Correct version | | ☐ |
| OS | Correct OS name | | ☐ |
| Platform | Desktop/Mobile/Tablet | | ☐ |
| getUserMedia | ✅ Supported | | ☐ |
| Permissions API | ✅ or ⚠️ | | ☐ |
| MediaRecorder | ✅ or ❌ | | ☐ |
| Dark mode styles | Proper contrast | | ☐ |

### Browser-Specific Notes

**Chrome/Edge/Firefox:** All three APIs supported (✅ ✅ ✅)
**Safari:** getUserMedia ✅, Permissions ⚠️ Limited, MediaRecorder ✅
**Mobile:** getUserMedia ✅, others depend on browser

---

## Test Case 3: Permission Button Interaction

**Objective:** Verify permission request button is clickable and functional

### Test Steps

1. Look for blue "Test My Microphone" button
2. Check button styling and accessibility
3. Hover over button
4. Click the button
5. Browser permission dialog should appear

### Expected Results

**Before Click:**
- ✅ Button visible with blue background
- ✅ Button text reads "Test My Microphone"
- ✅ Button cursor changes to pointer on hover
- ✅ Button background darkens on hover (darker blue)
- ✅ Loading message absent

**After Click:**
- ✅ Browser permission dialog appears
- ✅ Dialog asks for microphone access permission
- ✅ Two options available: "Block" and "Allow"
- ✅ Loading spinner appears in app while dialog open

### Acceptance Criteria

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Button visible | Yes | | ☐ |
| Button clickable | Yes | | ☐ |
| Hover effect | Color darkens | | ☐ |
| Browser dialog | Appears on click | | ☐ |
| Dialog options | Block & Allow | | ☐ |
| Loading state | Spinner visible | | ☐ |
| No console errors | Zero errors | | ☐ |

---

## Test Case 4: Permission Grant Flow

**Objective:** Verify complete permission grant flow and UI updates

### Test Steps

1. Click "Test My Microphone" button
2. Browser permission dialog appears
3. Click "Allow" in browser dialog
4. Wait for app to respond

### Expected Results

**During Request (Loading):**
- ✅ Spinner animation visible
- ✅ Text shows "Requesting permission..."
- ✅ Button not clickable

**After Grant (Success):**
- ✅ Loading disappears
- ✅ Permission badge changes to "Mic: Allowed"
- ✅ Badge background turns green
- ✅ Badge dot turns green
- ✅ Permission step shows success message with checkmark
- ✅ Message text: "Microphone Access Granted"
- ✅ Subtitle: "You can now proceed to select your microphone device."
- ✅ Auto-advances to device selection step

### Acceptance Criteria

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Loading shows | Yes | | ☐ |
| Badge updates | Green "Mic: Allowed" | | ☐ |
| Success message | Visible with checkmark | | ☐ |
| Auto-advance | Device select appears | | ☐ |
| No console errors | Zero errors | | ☐ |

---

## Test Case 5: Device List Population

**Objective:** Verify microphone devices enumerated and displayed after permission

### Test Steps

1. After grant, look at device selection dropdown
2. Check number of devices listed
3. Verify device labels

### Expected Results

- ✅ Device dropdown visible with label "Select Microphone"
- ✅ Device count shows in parentheses (e.g., "(1 device found)" or "(2 devices found)")
- ✅ At least 1 microphone listed (default or connected mic)
- ✅ Device labels show meaningful names (e.g., "Built-in Microphone", "USB Mic", etc.)
- ✅ If no label available, shows "Microphone [ID prefix]"
- ✅ First device auto-selected (option highlighted)
- ✅ Device count pluralization correct ("1 device" vs "2 devices")

### Acceptance Criteria

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Dropdown visible | Yes | | ☐ |
| Device count shown | (1 device) or (N devices) | | ☐ |
| At least 1 device | Yes | | ☐ |
| Labels meaningful | Readable device name | | ☐ |
| First auto-selected | Yes | | ☐ |
| No empty options | All populated | | ☐ |
| No console errors | Zero errors | | ☐ |

**Note:** Device count depends on hardware. Single built-in mic is typical for laptops.

---

## Test Case 6: Device Selection

**Objective:** Verify device selection functionality

### Test Steps

1. Open device dropdown
2. See list of available microphones
3. Select different device (if multiple available)
4. Verify selection updates

### Expected Results

**Multiple Devices Scenario:**
- ✅ Dropdown shows all devices
- ✅ Selection changes when option clicked
- ✅ Selected device highlights
- ✅ Selection persists in UI

**Single Device Scenario:**
- ✅ Dropdown shows single device
- ✅ Device auto-selected
- ✅ Selection cannot be changed (only one option)

### Acceptance Criteria

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Dropdown opens | Yes | | ☐ |
| Options clickable | Yes | | ☐ |
| Selection updates | Selected option highlighted | | ☐ |
| Selection persists | Remains selected on close | | ☐ |
| No console errors | Zero errors | | ☐ |

---

## Test Case 7: Continue Button Functionality

**Objective:** Verify Continue button enables only when device selected

### Test Steps

1. Look at "Continue to Test" button
2. Verify button state (enabled/disabled)
3. Verify button functionality

### Expected Results

**Before Device Selected:**
- ✅ Button appears disabled (grayed out)
- ✅ Button text shows "Continue to Test"
- ✅ Cursor shows "not-allowed" on hover
- ✅ Button not clickable
- ✅ Opacity reduced (50%)

**After Device Selected:**
- ✅ Button appears enabled (green background)
- ✅ Button cursor shows "pointer" on hover
- ✅ Button background darkens on hover
- ✅ Button clickable
- ✅ Full opacity

**After Clicking:**
- ✅ Step advances to "testing" placeholder
- ✅ Message shows: "Testing step will be implemented in Phase 03."
- ✅ No console errors

### Acceptance Criteria

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Disabled initially | Yes (if no selection) | | ☐ |
| Enabled after select | Yes | | ☐ |
| Cursor changes | pointer/not-allowed | | ☐ |
| Click works | App advances | | ☐ |
| Advance to testing | Placeholder shows | | ☐ |
| No console errors | Zero errors | | ☐ |

---

## Test Case 8: Dark Mode Styling

**Objective:** Verify dark mode styles apply correctly

### Test Steps

1. Check current mode (app loads in dark mode by default)
2. Verify all component colors
3. Check contrast ratios
4. Verify readability

### Expected Results

- ✅ Background: Dark slate (slate-900 or similar)
- ✅ Text: Light slate (slate-100 or similar)
- ✅ Cards: Dark background with light borders
- ✅ Inputs/Selects: Dark backgrounds with light text
- ✅ Buttons: Appropriate dark mode colors
- ✅ Badges: Dark mode color variants
- ✅ All text readable with sufficient contrast
- ✅ No white backgrounds unless intentional
- ✅ Border colors appropriately dark

### Acceptance Criteria

| Element | Expected | Actual | Status |
|---------|----------|--------|--------|
| Background | Dark slate | | ☐ |
| Text | Light slate | | ☐ |
| Cards | Dark with light borders | | ☐ |
| Inputs | Dark bg, light text | | ☐ |
| Buttons | Proper dark colors | | ☐ |
| Contrast | Readable (WCAG AA) | | ☐ |
| Consistency | All components match | | ☐ |

---

## Test Case 9: Permission Denied Scenario

**Objective:** Verify error handling when permission denied

### Prerequisites

Must test in fresh browser context where permission can be denied.

### Test Steps

1. Clear browser site permissions (optional)
2. Reload page
3. Click "Test My Microphone"
4. Click "Block" in permission dialog
5. Verify error handling

### Expected Results

- ✅ Loading state shows briefly
- ✅ Badge changes to "Mic: Blocked" (red)
- ✅ Red denied card displays
- ✅ Denied message shows: "Microphone Blocked"
- ✅ Instructions for each browser:
  - Chrome: "Click lock icon → Site settings → Microphone → Allow"
  - Safari: "Safari menu → Settings → Websites → Microphone → Allow"
  - Firefox: "Click shield → Permissions → Microphone → Allow"
  - Edge: "Click lock icon → Permissions → Microphone → Allow"
- ✅ Message: "After updating permissions, please refresh the page."
- ✅ No crashing or errors

### Acceptance Criteria

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Badge updates | Red "Mic: Blocked" | | ☐ |
| Denied card shows | Yes | | ☐ |
| Instructions present | For user's browser | | ☐ |
| Helpful message | Clear next steps | | ☐ |
| No crashes | App stable | | ☐ |
| No console errors | Zero errors | | ☐ |

---

## Test Case 10: Error Handling (Missing Microphone)

**Objective:** Verify error when no microphone connected

### Prerequisites

This test requires either:
1. No microphone hardware connected, OR
2. Microphone disabled in system settings

### Test Steps

1. Disconnect or disable microphone
2. Grant permission when requested
3. Observe error handling

### Expected Results

- ✅ Permission granted successfully
- ✅ Device enumeration returns empty list
- ✅ Device select shows warning: "No Microphones Found"
- ✅ Warning message: "Please connect a microphone and refresh the page"
- ✅ Amber warning icon (⚠️) displays
- ✅ No crash or console errors

### Acceptance Criteria

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Permission granted | Yes | | ☐ |
| Empty device list | Zero devices | | ☐ |
| Warning displays | "No Microphones Found" | | ☐ |
| Helpful message | Next steps clear | | ☐ |
| No crashes | App stable | | ☐ |
| Console errors | Zero | | ☐ |

---

## Test Case 11: Hot Module Replacement (HMR)

**Objective:** Verify dev server HMR works correctly

### Test Steps

1. With dev server running, edit a component file
2. Save the file
3. Observe browser auto-refresh
4. Verify app state preserved or reset appropriately

### Expected Results

- ✅ Browser auto-refreshes without manual reload
- ✅ No console errors
- ✅ HMR speed < 1 second
- ✅ Styles update immediately
- ✅ Component updates correctly

### Acceptance Criteria

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Auto-refresh | Instant | | ☐ |
| No console errors | Zero errors | | ☐ |
| HMR fast | <1 second | | ☐ |
| State management | Appropriate behavior | | ☐ |
| No broken UI | App functional | | ☐ |

---

## Test Case 12: Console Error Check

**Objective:** Verify no runtime console errors during normal flow

### Test Steps

1. Open browser DevTools (F12 or Cmd+Opt+I)
2. Go to Console tab
3. Clear console
4. Execute complete flow:
   - Load page
   - Click permission button
   - Grant permission
   - Select device
   - Click continue
5. Check console for errors

### Expected Results

- ✅ Zero red error messages
- ✅ Zero unhandled promise rejections
- ✅ Possible info/log messages (acceptable)
- ✅ No deprecation warnings from user code
- ✅ React DevTools info (acceptable)

### Acceptance Criteria

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Error count | 0 | | ☐ |
| Warning count | 0 or acceptable | | ☐ |
| Promise rejections | 0 unhandled | | ☐ |
| Network errors | 0 | | ☐ |
| React errors | 0 | | ☐ |

---

## Test Case 13: Responsive Design (Desktop)

**Objective:** Verify desktop layout works correctly

### Test Steps

1. View on desktop browser (1920x1080 or larger)
2. Check layout and spacing
3. Verify no horizontal scrolling
4. Check button/input sizing

### Expected Results

- ✅ Content centered with max-width container
- ✅ No horizontal scrolling
- ✅ Padding appropriate on all sides
- ✅ Cards have adequate spacing
- ✅ Buttons appropriately sized (not tiny or huge)
- ✅ Text readable at normal distance
- ✅ All form elements properly aligned

### Acceptance Criteria

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Centered layout | Yes | | ☐ |
| No scroll | Horizontal | | ☐ |
| Padding | Adequate | | ☐ |
| Spacing | Consistent | | ☐ |
| Button size | Appropriate | | ☐ |
| Text readability | Good | | ☐ |

---

## Test Case 14: Browser Compatibility

**Objective:** Verify app works in multiple browsers

### Browser Test Matrix

Test on available browsers. Record results:

| Browser | Version | Permission Flow | Device List | Dark Mode | Status |
|---------|---------|-----------------|-------------|-----------|--------|
| Chrome | Latest | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | |
| Firefox | Latest | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | |
| Safari | Latest | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | |
| Edge | Latest | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | |

### Expected Results

- ✅ App functions in all modern browsers
- ✅ No critical layout issues
- ✅ All APIs supported or gracefully degraded
- ✅ Permissions API: Supported in Chrome/Firefox/Edge, Limited in Safari

---

## Test Case 15: Mobile Responsiveness (Optional)

**Objective:** Verify layout works on mobile devices

### Prerequisites

Optional test on mobile device or mobile emulation.

### Test Steps

1. View on mobile browser (iPhone or Android)
2. Verify layout adapts
3. Check touch interactions
4. Verify readability

### Expected Results

- ✅ Layout adapts to small screen
- ✅ Touch targets appropriately sized (min 44x44px)
- ✅ Text readable on small screen
- ✅ Buttons clickable without zooming
- ✅ No horizontal scrolling
- ✅ Vertical scrolling only when necessary

### Acceptance Criteria

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Responsive layout | Yes | | ☐ |
| Touch targets | 44x44px+ | | ☐ |
| Text readable | Yes | | ☐ |
| No h-scroll | Correct | | ☐ |
| Full functionality | Yes | | ☐ |

---

## Test Summary Template

Use this template to document overall testing results:

```
TESTING SUMMARY - Phase 02 Browser Testing

Date: _______________
Tester: ______________
Browser: _____ Version: _____
OS: __________ Microphone: ___________

Test Results:
- Initial Load & Badge: ☐ Pass ☐ Fail
- BrowserInfoCard: ☐ Pass ☐ Fail
- Permission Button: ☐ Pass ☐ Fail
- Permission Grant: ☐ Pass ☐ Fail
- Device Population: ☐ Pass ☐ Fail
- Device Selection: ☐ Pass ☐ Fail
- Continue Button: ☐ Pass ☐ Fail
- Dark Mode: ☐ Pass ☐ Fail
- Error Handling: ☐ Pass ☐ Fail
- Console Errors: ☐ Pass ☐ Fail

Issues Found:
[List any bugs or problems discovered]

Overall Status: ☐ Pass ☐ Fail ☐ Conditional

Notes:
[Additional observations]
```

---

## Key Testing Notes

### Environment Requirements
- Real microphone hardware or mock audio device
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Localhost access to dev server
- Permission to grant microphone access

### What NOT to Test (Phase 03+)
- Audio recording functionality
- Visualization/waveform display
- Audio metrics collection
- Recording file download
- Microphone level monitoring

### Performance Expectations
- Page load: < 2 seconds
- Permission grant: < 3 seconds
- Device enumeration: < 1 second
- Device selection: Instant

### Known Limitations
- Permissions API not available in Safari (shows ⚠️)
- Device labels only available after permission granted
- Multiple devices only testable with actual hardware
- Mobile permissions may work differently than desktop

---

## Report Generation

After completing testing, create a summary report:

**File Location:** `/plans/reports/tester-YYMMDD-phase02-browser-testing-results.md`

**Include:**
- Browser and OS tested
- Each test case status (Pass/Fail)
- Any issues encountered
- Screenshots of failures
- Overall pass/fail status

---

Generated: 2026-02-09
Version: 1.0
Status: Ready for Manual Testing
