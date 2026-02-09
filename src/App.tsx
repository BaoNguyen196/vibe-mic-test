import { useState } from 'react';
import type { FlowStep } from './types/state';

// Hooks from Phase 2B
import { usePermission } from './hooks/use-permission';
import { useBrowserInfo } from './hooks/use-browser-info';
import { useMediaDevices } from './hooks/use-media-devices';

// Components from Phase 2C & Phase 3
import PermissionStep from './components/flow/permission-step';
import DeviceSelect from './components/flow/device-select';
import TestingStep from './components/flow/testing-step';
import PermissionStatusBadge from './components/common/permission-status-badge';
import BrowserInfoCard from './components/common/browser-info-card';

function App() {
  // Flow state
  const [step, setStep] = useState<FlowStep>('permission');
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { status, isLoading, requestPermission } = usePermission();
  const browserInfo = useBrowserInfo();
  const { devices, selectedDevice, setSelectedDevice, refreshDevices } = useMediaDevices();

  // Handle permission continue (when already granted)
  const handlePermissionContinue = async () => {
    await refreshDevices();
    setStep('device-select');
  };

  // Handle permission request
  const handleRequestPermission = async () => {
    try {
      setError(null);
      const stream = await requestPermission();
      // Close stream immediately after permission grant
      stream.getTracks().forEach((track) => track.stop());
      // Refresh devices to get labels
      await refreshDevices();
      // Advance to device select
      setStep('device-select');
    } catch (err) {
      // Map error to user-friendly message
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            setError('Microphone access denied. Check browser settings.');
            break;
          case 'NotFoundError':
            setError('No microphone found. Connect a mic and try again.');
            break;
          case 'NotReadableError':
            setError('Mic is in use by another app. Close it and try again.');
            break;
          default:
            setError('Something went wrong. Please try again.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  // Handle device selection continue
  const handleContinue = () => {
    setStep('testing');
  };

  // Handle back from testing
  const handleBackToDeviceSelect = () => {
    setStep('device-select');
  };

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

        {/* Flow steps */}
        {step === 'permission' && (
          <PermissionStep
            status={status}
            onRequestPermission={handleRequestPermission}
            onContinue={handlePermissionContinue}
            error={error}
            isLoading={isLoading}
          />
        )}

        {step === 'device-select' && (
          <DeviceSelect
            devices={devices}
            selected={selectedDevice}
            onSelect={setSelectedDevice}
            onContinue={handleContinue}
          />
        )}

        {step === 'testing' && (
          <TestingStep
            deviceId={selectedDevice?.deviceId}
            onBack={handleBackToDeviceSelect}
          />
        )}
      </main>
    </div>
  );
}

export default App;
