import { useEffect, useState } from 'react';

// Context & Hooks
import { AudioFlowProvider } from './context/audio-flow-provider';
import { useAudioFlow } from './hooks/use-audio-flow';
import { usePermission } from './hooks/use-permission';
import { useBrowserInfo } from './hooks/use-browser-info';
import { useMediaDevices } from './hooks/use-media-devices';

// Components
import PermissionStep from './components/flow/permission-step';
import DeviceSelect from './components/flow/device-select';
import TestingPhase from './components/flow/testing-phase';
import ResultsPanel from './components/flow/results-panel';
import PermissionStatusBadge from './components/common/permission-status-badge';
import BrowserInfoCard from './components/common/browser-info-card';
import ErrorBanner from './components/common/error-banner';

// Types
import type { TestMetrics, AudioCapabilities } from './types/audio';

/**
 * Main flow router component
 * Renders the appropriate step based on context state
 */
function FlowRouter() {
  const { state, dispatch } = useAudioFlow();
  const { status, isLoading, requestPermission } = usePermission();
  const browserInfo = useBrowserInfo();
  const { devices, selectedDevice, setSelectedDevice, refreshDevices } = useMediaDevices();
  
  const [capabilities, setCapabilities] = useState<AudioCapabilities | null>(null);

  // Sync permission status to context
  useEffect(() => {
    dispatch({ type: 'SET_PERMISSION_STATUS', payload: status });
  }, [status, dispatch]);

  // Sync devices to context
  useEffect(() => {
    dispatch({ type: 'SET_DEVICES', payload: devices });
  }, [devices, dispatch]);

  // Sync selected device to context
  useEffect(() => {
    if (selectedDevice) {
      dispatch({ type: 'SELECT_DEVICE', payload: selectedDevice });
    }
  }, [selectedDevice, dispatch]);

  // Handle permission request
  const handleRequestPermission = async () => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const stream = await requestPermission();
      // Close stream immediately after permission grant
      stream.getTracks().forEach((track) => track.stop());
      // Refresh devices to get labels
      await refreshDevices();
      // Advance to device select
      dispatch({ type: 'GRANT_PERMISSION' });
    } catch (err) {
      // Map error to user-friendly message
      let errorMessage = 'An unexpected error occurred.';
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            errorMessage = 'Microphone access denied. Check browser settings.';
            break;
          case 'NotFoundError':
            errorMessage = 'No microphone found. Connect a mic and try again.';
            break;
          case 'NotReadableError':
            errorMessage = 'Mic is in use by another app. Close it and try again.';
            break;
          default:
            errorMessage = 'Something went wrong. Please try again.';
        }
      }
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Handle permission continue (when already granted)
  const handlePermissionContinue = async () => {
    await refreshDevices();
    dispatch({ type: 'GRANT_PERMISSION' });
  };

  // Handle device selection continue
  const handleContinue = () => {
    dispatch({ type: 'START_TEST' });
  };

  // Handle test complete
  const handleTestComplete = (metrics: TestMetrics, recordingUrl: string | null, caps: AudioCapabilities) => {
    setCapabilities(caps);
    
    dispatch({ type: 'STOP_TEST', payload: metrics });
    if (recordingUrl) {
      dispatch({ type: 'SET_RECORDING_URL', payload: recordingUrl });
    }
  };

  // Handle back from testing
  const handleBackToDeviceSelect = () => {
    dispatch({ type: 'SET_STEP', payload: 'device-select' });
  };

  // Handle test again
  const handleTestAgain = () => {
    dispatch({ type: 'RESET' });
    dispatch({ type: 'SET_STEP', payload: 'device-select' });
  };

  // Render appropriate step
  switch (state.step) {
    case 'permission':
      return (
        <PermissionStep
          status={status}
          onRequestPermission={handleRequestPermission}
          onContinue={handlePermissionContinue}
          error={state.error}
          isLoading={isLoading}
        />
      );

    case 'device-select':
      return (
        <DeviceSelect
          devices={devices}
          selected={selectedDevice}
          onSelect={setSelectedDevice}
          onContinue={handleContinue}
        />
      );

    case 'testing':
      return (
        <TestingPhase
          deviceId={selectedDevice?.deviceId}
          onTestComplete={handleTestComplete}
          onBack={handleBackToDeviceSelect}
        />
      );

    case 'results':
      if (!state.testMetrics || !capabilities) {
        return <div>Loading results...</div>;
      }
      return (
        <ResultsPanel
          metrics={state.testMetrics}
          recordingUrl={state.recordingUrl}
          capabilities={capabilities}
          browserInfo={browserInfo}
          permissionStatus={state.permissionStatus}
          onTestAgain={handleTestAgain}
        />
      );

    default:
      return null;
  }
}

/**
 * App root component with provider
 */
function AppContent() {
  const { state, dispatch } = useAudioFlow();
  const { status } = usePermission();
  const browserInfo = useBrowserInfo();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header with persistent permission badge */}
      <header className="border-b border-slate-300 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4 max-w-3xl flex items-center justify-between">
          <h1 className="text-2xl font-bold">Microphone Test</h1>
          <PermissionStatusBadge status={status} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Browser info card */}
        <BrowserInfoCard browserInfo={browserInfo} />

        {/* Error banner */}
        {state.error && (
          <ErrorBanner
            message={state.error}
            onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })}
          />
        )}

        {/* Flow router */}
        <FlowRouter />
      </main>
    </div>
  );
}

/**
 * App with provider wrapper
 */
function App() {
  return (
    <AudioFlowProvider>
      <AppContent />
    </AudioFlowProvider>
  );
}

export default App;
