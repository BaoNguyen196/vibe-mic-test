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
  deviceId: string;
  label: string;
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

export interface AnalyserConfig {
  fftSize: number; // 256 | 512 | 1024 | 2048
  smoothingTimeConstant: number; // 0-1, default 0.8
}

export interface VolumeData {
  rms: number; // 0-1 normalized
  peak: number; // 0-1 normalized
  db: number; // decibels (negative, -Infinity to 0)
}

export type MimeType = 'audio/webm;codecs=opus' | 'audio/mp4';
