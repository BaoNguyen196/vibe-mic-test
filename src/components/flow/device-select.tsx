import { useEffect, useRef } from 'react';
import type { AudioDeviceInfo } from '../../types/audio';

interface DeviceSelectProps {
  devices: AudioDeviceInfo[];
  selected: AudioDeviceInfo | null;
  onSelect: (device: AudioDeviceInfo) => void;
  onContinue: () => void;
}

function DeviceSelect({ devices, selected, onSelect, onContinue }: DeviceSelectProps) {
  const ctaRef = useRef<HTMLButtonElement>(null);

  // Auto-focus CTA button on mount
  useEffect(() => {
    ctaRef.current?.focus();
  }, []);
  // No devices found state
  if (devices.length === 0) {
    return (
      <div className="border border-amber-500 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-amber-600 dark:text-amber-400 text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
              No Microphones Found
            </h3>
            <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
              Please connect a microphone and refresh the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <label
          htmlFor="device-select"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          Select Microphone
          <span className="text-slate-500 dark:text-slate-400 ml-2">
            ({devices.length} device{devices.length !== 1 ? 's' : ''} found)
          </span>
        </label>
        <select
          id="device-select"
          value={selected?.deviceId ?? ''}
          onChange={(e) => {
            const device = devices.find((d) => d.deviceId === e.target.value);
            if (device) {
              onSelect(device);
            }
          }}
          className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>
      <button
        ref={ctaRef}
        onClick={onContinue}
        disabled={!selected}
        className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed 
                   text-white font-medium px-6 py-3 rounded-lg 
                   transition-colors duration-200 disabled:opacity-50
                   focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Continue to Test
      </button>
    </div>
  );
}

export default DeviceSelect;
