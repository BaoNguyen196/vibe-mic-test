import type { AnalyserConfig, VolumeData, AudioCapabilities } from '../types/audio';

/** Create AudioContext + AnalyserNode from MediaStream */
export function createAudioPipeline(
  stream: MediaStream,
  config?: Partial<AnalyserConfig>,
): { audioContext: AudioContext; analyser: AnalyserNode; source: MediaStreamAudioSourceNode } {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = config?.fftSize ?? 2048;
  analyser.smoothingTimeConstant = config?.smoothingTimeConstant ?? 0.8;
  source.connect(analyser);
  return { audioContext, analyser, source };
}

/** Calculate RMS volume from time domain data */
export function calculateVolume(timeDomainData: Uint8Array): VolumeData {
  let sumSquares = 0;
  let peak = 0;
  for (let i = 0; i < timeDomainData.length; i++) {
    const normalized = (timeDomainData[i]! - 128) / 128;
    sumSquares += normalized * normalized;
    peak = Math.max(peak, Math.abs(normalized));
  }
  const rms = Math.sqrt(sumSquares / timeDomainData.length);
  const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
  return { rms, peak, db };
}

/** Extract audio track capabilities */
export function getTrackCapabilities(stream: MediaStream): AudioCapabilities {
  const track = stream.getAudioTracks()[0]!;
  const settings = track.getSettings();
  return {
    sampleRate: settings.sampleRate ?? 0,
    channelCount: settings.channelCount ?? 1,
    echoCancellation: settings.echoCancellation ?? false,
    noiseSuppression: settings.noiseSuppression ?? false,
    autoGainControl: settings.autoGainControl ?? false,
    deviceId: settings.deviceId ?? '',
    label: track.label,
  };
}

/** Cleanup all audio resources */
export function cleanupAudio(
  stream: MediaStream | null,
  audioContext: AudioContext | null,
): void {
  try {
    stream?.getTracks().forEach((track) => track.stop());
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
    }
  } catch (error) {
    console.warn('Audio cleanup error:', error);
  }
}
