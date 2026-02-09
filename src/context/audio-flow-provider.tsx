/* eslint-disable react-refresh/only-export-components */
import { createContext, useReducer, type ReactNode } from 'react';
import type { AudioFlowState, FlowStep, PermissionStatus } from '../types/state';
import type { AudioDeviceInfo, TestMetrics } from '../types/audio';

// Action types
type Action =
  | { type: 'GRANT_PERMISSION' }
  | { type: 'SELECT_DEVICE'; payload: AudioDeviceInfo }
  | { type: 'SET_DEVICES'; payload: AudioDeviceInfo[] }
  | { type: 'START_TEST' }
  | { type: 'STOP_TEST'; payload: TestMetrics }
  | { type: 'SET_RECORDING_URL'; payload: string }
  | { type: 'SET_STREAM'; payload: MediaStream | null }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_PERMISSION_STATUS'; payload: PermissionStatus }
  | { type: 'SET_STEP'; payload: FlowStep }
  | { type: 'RESET' };

// Initial state
const initialState: AudioFlowState = {
  step: 'permission',
  permissionStatus: 'unknown',
  stream: null,
  selectedDevice: null,
  devices: [],
  testMetrics: null,
  recordingUrl: null,
  error: null,
};

// Reducer
function reducer(state: AudioFlowState, action: Action): AudioFlowState {
  switch (action.type) {
    case 'GRANT_PERMISSION':
      return { ...state, step: 'device-select', permissionStatus: 'granted' };
    
    case 'SELECT_DEVICE':
      return { ...state, selectedDevice: action.payload };
    
    case 'SET_DEVICES':
      return { ...state, devices: action.payload };
    
    case 'START_TEST':
      return { ...state, step: 'testing', testMetrics: null, recordingUrl: null };
    
    case 'STOP_TEST':
      return { ...state, step: 'results', testMetrics: action.payload };
    
    case 'SET_RECORDING_URL':
      return { ...state, recordingUrl: action.payload };
    
    case 'SET_STREAM':
      return { ...state, stream: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_PERMISSION_STATUS':
      return { ...state, permissionStatus: action.payload };
    
    case 'SET_STEP':
      return { ...state, step: action.payload };
    
    case 'RESET':
      // Keep permission status when resetting
      return { ...initialState, permissionStatus: state.permissionStatus };
    
    default:
      return state;
  }
}

// Context type
interface AudioFlowContextValue {
  state: AudioFlowState;
  dispatch: React.Dispatch<Action>;
}

// Create context
export const AudioFlowContext = createContext<AudioFlowContextValue | null>(null);

// Export context display name for fast refresh
AudioFlowContext.displayName = 'AudioFlowContext';

// Provider component
interface AudioFlowProviderProps {
  children: ReactNode;
}

export function AudioFlowProvider({ children }: AudioFlowProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AudioFlowContext.Provider value={{ state, dispatch }}>
      {children}
    </AudioFlowContext.Provider>
  );
}

// Fast refresh support
if (import.meta.hot) {
  import.meta.hot.accept();
}
