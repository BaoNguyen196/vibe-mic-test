import type { AudioDeviceInfo, TestMetrics } from './audio';

export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unknown';

export type FlowStep = 'permission' | 'device-select' | 'testing' | 'results';

export interface AudioFlowState {
  step: FlowStep;
  permissionStatus: PermissionStatus;
  stream: MediaStream | null;
  selectedDevice: AudioDeviceInfo | null;
  devices: AudioDeviceInfo[];
  testMetrics: TestMetrics | null;
  recordingUrl: string | null;
  error: string | null;
}
