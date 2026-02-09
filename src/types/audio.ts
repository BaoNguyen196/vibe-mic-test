export interface AudioDeviceInfo {
  deviceId: string;
  label: string;
  groupId: string;
}

export interface AudioCapabilities {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface TestMetrics {
  peakLevel: number;
  avgLevel: number;
  duration: number;
}

export interface BrowserInfo {
  name: string; // 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Opera' | 'Unknown'
  version: string; // e.g. '120.0'
  os: string; // 'Windows' | 'macOS' | 'Linux' | 'iOS' | 'Android' | 'Unknown'
  platform: string; // 'Desktop' | 'Mobile' | 'Tablet'
  supportsGetUserMedia: boolean;
  supportsPermissionsApi: boolean;
  supportsMediaRecorder: boolean;
}

export type MimeType = 'audio/webm;codecs=opus' | 'audio/mp4';
