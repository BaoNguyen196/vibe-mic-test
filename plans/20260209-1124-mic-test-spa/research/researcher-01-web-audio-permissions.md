# Research Report: Web Audio API, Permissions & MediaRecorder
**Date:** February 9, 2026 | **Focus:** Browser APIs for Microphone Testing

---

## 1. Web Audio API for Microphone Testing

### AudioContext & AnalyserNode Pipeline
```
getUserMedia() → MediaStream → MediaStreamAudioSourceNode → AnalyserNode → (visualization)
```
- Create `AudioContext`, connect `createMediaStreamSource(stream)` to `AnalyserNode`
- Set `analyser.fftSize` (default 2048; use 256-2048 for real-time viz)
- `analyser.smoothingTimeConstant` (0-1): controls temporal smoothing of frequency data

### Time Domain vs Frequency Domain
- **`getByteTimeDomainData()`**: Returns 8-bit PCM waveform (0-255, 128=silence). Use for oscilloscope/waveform display
- **`getByteFrequencyData()`**: Returns frequency magnitude in dB scale (0-255). Use for spectrum analyzer / volume meter
- Buffer length = `analyser.frequencyBinCount` (half of fftSize)

### Volume Level (RMS Calculation)
```typescript
const rms = Math.sqrt(dataArray.reduce((sum, v) => {
  const normalized = (v - 128) / 128;
  return sum + normalized * normalized;
}, 0) / dataArray.length);
const volumeDb = 20 * Math.log10(rms); // Convert to dB
```
- Peak detection: track max amplitude per frame
- Smoothing: exponential moving average for visual decay

### Audio Properties Detection
- `audioContext.sampleRate` — typically 44100 or 48000 Hz
- `stream.getAudioTracks()[0].getSettings()` — returns channelCount, sampleRate, deviceId, echoCancellation, etc.
- `stream.getAudioTracks()[0].getCapabilities()` — returns supported ranges/values

---

## 2. Microphone Permission State Management

### Permissions API
```typescript
const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
// status.state: 'prompt' | 'granted' | 'denied'
status.addEventListener('change', () => {
  console.log('New state:', status.state);
});
```

### Browser Support Matrix
| Browser | Permissions API (mic) | onchange event |
|---------|----------------------|----------------|
| Chrome 43+ | Yes | Yes |
| Edge 79+ | Yes | Yes |
| Firefox 46+ | Yes | Yes |
| Safari 16+ | Partial (no mic query) | No |
| iOS Safari | No | No |

### Fallback for Safari/iOS
- Cannot query mic permission proactively — must attempt `getUserMedia()` and handle errors
- Use feature detection: `if (navigator.permissions?.query) { ... } else { /* fallback */ }`
- Track permission state locally after first `getUserMedia()` attempt

### Permission State Display
- **prompt**: "Click to test your microphone" — neutral/blue indicator
- **granted**: "Microphone access allowed" — green indicator
- **denied**: "Microphone blocked. Open browser settings to enable" — red indicator with instructions

---

## 3. getUserMedia & Device Enumeration

### getUserMedia Constraints
```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: { ideal: 48000 }
  }
});
```

### Error Types Catalog
| Error | Cause | User Message |
|-------|-------|--------------|
| `NotAllowedError` | User denied permission or policy | "Microphone access denied. Check browser settings" |
| `NotFoundError` | No mic device available | "No microphone found. Connect a mic and try again" |
| `NotReadableError` | Mic in use by another app | "Mic in use. Close other apps using it" |
| `OverconstrainedError` | Requested constraints unsatisfiable | "Selected mic unavailable. Try another" |
| `AbortError` | Hardware/OS error | "Something went wrong. Try again" |
| `TypeError` | Invalid constraints | Internal error — should not reach user |

### Device Enumeration
```typescript
const devices = await navigator.mediaDevices.enumerateDevices();
const mics = devices.filter(d => d.kind === 'audioinput');
```
- **Before permission**: device labels are empty strings (privacy)
- **After permission**: labels populated (e.g., "Blue Yeti Stereo")
- Re-enumerate after `getUserMedia()` grant to get labels

### Device Change Detection
```typescript
navigator.mediaDevices.addEventListener('devicechange', async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  // Update device list
});
```

---

## 4. MediaRecorder API

### Recording Audio
```typescript
const recorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus' // Chrome/Firefox
  // Safari: 'audio/mp4' or 'audio/aac'
});
const chunks: Blob[] = [];
recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = () => {
  const blob = new Blob(chunks, { type: recorder.mimeType });
  const url = URL.createObjectURL(blob);
  // Use url in <audio> element for playback
};
recorder.start(); // or start(timeslice) for periodic chunks
```

### MIME Type Support
- Chrome/Firefox: `audio/webm;codecs=opus` (preferred)
- Safari: `audio/mp4` (fallback)
- Check: `MediaRecorder.isTypeSupported(mimeType)`

### Cleanup
```typescript
// Stop recording
recorder.stop();
// Stop all tracks
stream.getTracks().forEach(track => track.stop());
// Revoke blob URL when done
URL.revokeObjectURL(audioUrl);
```

---

## 5. Browser Quirks Summary

- **Safari**: No Permissions API for mic; AudioContext requires user gesture to resume; `audio/mp4` for MediaRecorder
- **Firefox**: Permissions API works; may prompt per-tab; supports `audio/webm`
- **Chrome**: Full support; remembers permission per-origin
- **iOS Safari**: getUserMedia requires HTTPS; AudioContext auto-suspended (needs `resume()` on tap)
- **All browsers**: HTTPS required for getUserMedia (except localhost)

---

## Sources
- [MDN: getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MDN: Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
- [MDN: Web Audio API Visualizations](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
- [MDN: MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Getting Started with getUserMedia (2025)](https://blog.addpipe.com/getusermedia-getting-started/)
- [Building Real-time Mic Level Meter](https://dev.to/tooleroid/building-a-real-time-microphone-level-meter-using-web-audio-api-a-complete-guide-1e0b)
- [Understanding Permissions API](https://fsjs.dev/understanding-permissions-api/)

---

**Report Generated:** 2026-02-09 | **Status:** Complete | **Unresolved Questions:** None
