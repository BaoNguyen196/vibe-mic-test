# React Hooks Best Practices for Web Audio API Integration

## Executive Summary
Research on React hooks patterns for Web Audio API integration, permission management, and memory-safe implementations. Focus on custom hooks, state patterns, error handling, and performance optimization.

---

## 1. Custom Hooks for Web Audio API

### usePermission Hook (getUserMedia)
**Pattern for requesting microphone access:**

```typescript
interface UsePermissionState {
  status: 'idle' | 'pending' | 'granted' | 'denied';
  error: Error | null;
  stream: MediaStream | null;
}

function usePermission() {
  const [state, setState] = useState<UsePermissionState>({
    status: 'idle',
    error: null,
    stream: null,
  });

  const requestPermission = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'pending' }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setState({ status: 'granted', error: null, stream });
      return stream;
    } catch (error) {
      setState({
        status: 'denied',
        error: error as Error,
        stream: null,
      });
      throw error;
    }
  }, []);

  return { ...state, requestPermission };
}
```

**Key points:**
- Must run in secure context (HTTPS or localhost)
- Use promise-based `navigator.mediaDevices.getUserMedia()` (not callback version)
- Always request user permission explicitly before accessing media
- Browser autoplay policy: user gesture required to create/resume Web Audio context

### useMediaDevices Hook (Device Enumeration)
**Pattern for listing audio input devices:**

```typescript
function useMediaDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const handleDeviceChange = () => {
      navigator.mediaDevices.enumerateDevices().then(devs => {
        setDevices(devs.filter(d => d.kind === 'audioinput'));
      });
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    handleDeviceChange(); // Initial load

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  return devices;
}
```

**Critical cleanup pattern:**
- Listener function reference must match exactly in both `addEventListener` and `removeEventListener`
- Return cleanup from useEffect to prevent memory leaks
- Event listener fires when devices connect/disconnect

### Audio Stream Cleanup
**Proper stream termination:**

```typescript
useEffect(() => {
  let stream: MediaStream | null = null;

  const setup = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Use stream...
    } catch (err) {
      // Handle error
    }
  };

  setup();

  return () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };
}, []);
```

**Best practice:** Stop all tracks in cleanup to release hardware resources and allow other apps to access microphone.

---

## 2. State Management Patterns

### useState vs useReducer Decision Tree

**Use useState when:**
- Permission state is simple (idle | pending | granted | denied)
- Each state update is independent
- No complex multi-step workflows

**Use useReducer when:**
- Multiple related states change together (status + stream + error)
- Complex permission workflows (request → analyze → record)
- Easier to test (pure functions with no side effects)

### Recommended Approach: useReducer for Permission Flow

```typescript
type PermissionAction =
  | { type: 'REQUEST' }
  | { type: 'GRANTED'; payload: MediaStream }
  | { type: 'DENIED'; payload: Error }
  | { type: 'CLEANUP' };

interface PermissionState {
  status: 'idle' | 'pending' | 'granted' | 'denied';
  stream: MediaStream | null;
  error: Error | null;
}

function permissionReducer(state: PermissionState, action: PermissionAction): PermissionState {
  switch (action.type) {
    case 'REQUEST':
      return { ...state, status: 'pending' };
    case 'GRANTED':
      return { status: 'granted', stream: action.payload, error: null };
    case 'DENIED':
      return { status: 'denied', stream: null, error: action.payload };
    case 'CLEANUP':
      state.stream?.getTracks().forEach(t => t.stop());
      return { status: 'idle', stream: null, error: null };
    default:
      return state;
  }
}
```

**Advantages:**
- Dispatch function reference is stable → easier useCallback optimization
- Related state updates atomic
- Pure function → testable without React

### Handling Multiple State Updates
React batches synchronous updates. For async callbacks (after network requests), consider batching implications or using useReducer to ensure atomic updates.

---

## 3. Error Handling in Hooks

### Pattern: Try-Catch in Async useEffect

```typescript
useEffect(() => {
  let isMounted = true; // Track component mount status
  const abortController = new AbortController();

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (isMounted) {
        setStream(stream);
        setError(null);
      }
    } catch (err) {
      // Common errors: NotAllowedError, NotFoundError, NotReadableError
      const message = getErrorMessage(err);

      if (isMounted) {
        setError(new Error(message));
        setStream(null);
      }
    }
  };

  initializeAudio();

  return () => {
    isMounted = false;
    abortController.abort();
    // Cleanup...
  };
}, []);

function getErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
        return 'Microphone permission denied by user';
      case 'NotFoundError':
        return 'No microphone device found';
      case 'NotReadableError':
        return 'Microphone in use by another application';
      default:
        return error.message;
    }
  }
  return 'Unknown error accessing microphone';
}
```

**Key patterns:**
- Try-catch must wrap async function inside useEffect (not the effect itself)
- Track mount status to prevent state updates on unmounted components
- Use AbortController to cancel pending operations
- Handle DOMException types for getUserMedia errors
- Provide user-friendly error messages

### Hook-Level vs Error Boundary

**Hook-level (useEffect try-catch):**
- Handle expected errors (permission denied, device not found)
- Set error state for component UI
- Appropriate for permission flows

**Error Boundaries:**
- Catch unexpected/fatal errors
- Cannot catch errors inside hooks (only in render)
- Use Error Boundary wrapper for safety net

---

## 4. Performance Optimization

### useCallback for Event Handlers

```typescript
const handleDeviceChange = useCallback(() => {
  navigator.mediaDevices.enumerateDevices().then(devs => {
    setDevices(devs.filter(d => d.kind === 'audioinput'));
  });
}, []); // No dependencies = stable reference

useEffect(() => {
  navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
  return () => {
    navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
  };
}, [handleDeviceChange]); // Safe to depend on
```

**When useCallback matters:**
- Function passed to child components (memo props)
- Used as dependency in useEffect
- Event listener registration (as shown)

**Caution:** Don't over-optimize. Profile first. useCallback has overhead; only use when measurements show benefit.

### useMemo for Expensive Computations

```typescript
const audioContext = useMemo(() => {
  // AudioContext creation is expensive, create once
  return new (window.AudioContext || (window as any).webkitAudioContext)();
}, []);

const analyser = useMemo(() => {
  if (!audioContext) return null;
  return audioContext.createAnalyser();
}, [audioContext]);
```

**Use for:**
- AudioContext instances (expensive to create)
- Analyser node setup
- Filter chains

**Don't use for:**
- Simple derived values (arrays, objects)
- State that changes frequently
- Callbacks that don't need memoization

---

## 5. Practical Integration Example

```typescript
function useMicrophone() {
  const [state, dispatch] = useReducer(permissionReducer, {
    status: 'idle',
    stream: null,
    error: null,
  });

  const requestMic = useCallback(async () => {
    dispatch({ type: 'REQUEST' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      dispatch({ type: 'GRANTED', payload: stream });
      return stream;
    } catch (error) {
      dispatch({ type: 'DENIED', payload: error as Error });
      throw error;
    }
  }, []);

  useEffect(() => {
    return () => {
      dispatch({ type: 'CLEANUP' });
    };
  }, []);

  return { ...state, requestMic };
}
```

---

## Key Takeaways

1. **Custom hooks encapsulate:** Permission management, device enumeration, stream lifecycle
2. **useReducer preferred:** For permission flows with related state updates
3. **Cleanup essential:** Always stop tracks, remove listeners, prevent memory leaks
4. **Error handling:** Try-catch in async functions, isMounted checks, user-friendly messages
5. **Optimize selectively:** useCallback for event listeners, useMemo for expensive context setup
6. **Security context required:** HTTPS or localhost; user gesture required for audio playback

---

## Sources

- [React Custom Hooks Guide - 2025 Best Practices](https://craftyourstartup.com/cys-docs/cookbooks/react-custom-hooks/)
- [Getting Started with getUserMedia In 2025](https://blog.addpipe.com/getusermedia-getting-started/)
- [useAudioRecorder - React Hook](https://www.usehooks.io/docs/use-audio-recorder)
- [useUserMedia - React Hook](https://www.usehooks.io/docs/use-user-media)
- [MediaDevices: getUserMedia() method - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Web Audio API Best Practices - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- [Preventing Memory Leaks in React with useEffect Hooks](https://www.c-sharpcorner.com/article/preventing-memory-leaks-in-react-with-useeffect-hooks/)
- [How to Use useEffect to Remove Event Listeners in React](https://www.dhiwise.com/post/how-to-use-useeffect-to-remove-event-listeners-in-react)
- [How to Fix Memory Leaks in React Applications](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/)
- [useState vs useReducer](https://tkdodo.eu/blog/use-state-vs-use-reducer)
- [Should I useState or useReducer?](https://kentcdodds.com/blog/should-i-usestate-or-usereducer)
- [useReducer vs useState: When to Use Each](https://react.wiki/hooks/use-reducer-vs-use-state/)
- [How to handle errors in React: full guide](https://www.developerway.com/posts/how-to-handle-errors-in-react)
- [Best Practices for Handling Errors with try/catch or Error Boundaries](https://codedamn.com/news/reactjs/try-catch-error-boundaries)
- [Handling Asynchronous Operations with React Hooks](https://moldstud.com/articles/p-handling-asynchronous-operations-with-react-hooks-complete-guide-best-practices)
- [useCallback – React Official](https://react.dev/reference/react/useCallback)
- [React Performance Optimization: useMemo vs useCallback](https://dev.to/ahmedgmurtaza/react-performance-optimization-usememo-vs-usecallback-2p2a)
- [Memoization in React - How useCallback Works](https://refine.dev/blog/react-usecallback-guide/)
- [Boosting React Performance: useCallback vs. useMemo Hooks](https://www.syncfusion.com/blogs/post/react-usecallback-vs-usememo-hooks)

---

## Unresolved Questions

- How to handle multiple simultaneous audio contexts in complex single-page apps?
- Best practice for sharing AudioContext across multiple components without prop drilling?
- Optimal refresh rate for real-time frequency analysis updates without performance degradation?
