import { useState, useEffect, useCallback } from 'react';
import type { AudioDeviceInfo } from '../types/audio';

/**
 * Custom hook for audio device enumeration with devicechange listener.
 *
 * Enumerates audio input devices on mount and whenever the device list changes.
 * Auto-selects first device if none is selected. Provides manual refresh capability.
 *
 * @returns Audio devices list, selected device, and setter/refresh functions
 */
export function useMediaDevices() {
  const [devices, setDevices] = useState<AudioDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<AudioDeviceInfo | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refreshDevices = useCallback(async () => {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const mics = allDevices
      .filter((d) => d.kind === 'audioinput')
      .map((d) => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${d.deviceId.slice(0, 5)}`,
        groupId: d.groupId,
      }));
    setDevices(mics);

    // Auto-select first device if none selected
    if (!selectedDevice && mics.length > 0) {
      setSelectedDevice(mics[0]!);
    }
  }, [selectedDevice]);

  // Subscribe to device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      setTrigger((prev) => prev + 1);
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  // Enumerate devices on trigger change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshDevices();
  }, [trigger, refreshDevices]);

  return { devices, selectedDevice, setSelectedDevice, refreshDevices };
}
