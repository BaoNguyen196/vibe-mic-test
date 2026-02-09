import { useEffect, useState, useRef, useCallback } from 'react';
import { useMicrophone } from '../../hooks/use-microphone';
import { useAudioAnalyser } from '../../hooks/use-audio-analyser';
import { useRecorder } from '../../hooks/use-recorder';
import { useTheme } from '../../hooks/use-theme';
import { getTrackCapabilities } from '../../services/audio-service';
import { WaveformViz } from '../audio/waveform-viz';
import { VolumeMeter } from '../audio/volume-meter';
import { SpectrumViz } from '../audio/spectrum-viz';
import type { TestMetrics, AudioCapabilities } from '../../types/audio';

interface TestingPhaseProps {
  deviceId: string | undefined;
  onTestComplete: (metrics: TestMetrics, recordingUrl: string | null, capabilities: AudioCapabilities) => void;
  onBack: () => void;
  testDuration?: number; // Duration in seconds (default 10)
}

/**
 * Active microphone test phase
 * - Starts microphone with selected device
 * - Records audio with MediaRecorder
 * - Shows real-time visualizations (waveform, volume, spectrum)
 * - Displays countdown timer
 * - Collects test metrics (peak, average levels)
 * - Auto-stops after duration or manual stop
 */
export default function TestingPhase({ 
  deviceId, 
  onTestComplete, 
  onBack,
  testDuration = 10 
}: TestingPhaseProps) {
  const [timeRemaining, setTimeRemaining] = useState(testDuration);
  const [isActive, setIsActive] = useState(false);
  const { isDark } = useTheme();
  
  // Track volume metrics for test results
  const metricsRef = useRef({
    peakLevel: 0,
    totalLevel: 0,
    sampleCount: 0,
  });

  // Microphone stream
  const { stream, error: micError, start: startMic, stop: stopMic } = useMicrophone();
  
  // Audio analyser
  const { analyser, volume } = useAudioAnalyser(stream, {
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
  });
  
  // Audio recorder
  const { recordingUrl, isRecording, start: startRecording, stop: stopRecording } = useRecorder(stream);

  // Start microphone on mount
  useEffect(() => {
    startMic(deviceId);
    return () => {
      stopMic();
    };
  }, [deviceId, startMic, stopMic]);

  // Start recording when stream is ready
  useEffect(() => {
    if (stream && !isActive) {
      startRecording();
      // Use a microtask to avoid setState in effect
      Promise.resolve().then(() => setIsActive(true));
    }
  }, [stream, isActive, startRecording]);

  // Stop test handler
  const handleStopTest = useCallback(() => {
    if (!isActive) return;
    
    setIsActive(false);
    stopRecording();
    
    // Calculate metrics
    const { peakLevel, totalLevel, sampleCount } = metricsRef.current;
    const avgLevel = sampleCount > 0 ? totalLevel / sampleCount : 0;
    const duration = testDuration - timeRemaining;
    
    const metrics: TestMetrics = {
      peakLevel,
      avgLevel,
      duration,
    };
    
    // Extract capabilities from stream
    const capabilities = stream ? getTrackCapabilities(stream) : {
      sampleRate: 0,
      channelCount: 1,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      deviceId: '',
      label: 'Unknown Device',
    };
    
    // Stop mic after extracting capabilities
    stopMic();
    
    // Wait a bit for recording URL to be ready
    setTimeout(() => {
      onTestComplete(metrics, recordingUrl, capabilities);
    }, 100);
  }, [isActive, stopRecording, testDuration, timeRemaining, stream, stopMic, onTestComplete, recordingUrl]);

  // Collect metrics during recording
  useEffect(() => {
    if (volume && isRecording) {
      const { peak } = volume;
      metricsRef.current.peakLevel = Math.max(metricsRef.current.peakLevel, peak);
      metricsRef.current.totalLevel += peak;
      metricsRef.current.sampleCount += 1;
    }
  }, [volume, isRecording]);

  // Countdown timer
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleStopTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, handleStopTest]);

  // Show error if mic failed
  if (micError) {
    return (
      <div className="space-y-4">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Failed to start microphone: {micError}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
        >
          Back to Device Selection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Recording Indicator */}
      <div className="flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" aria-hidden="true" />
        <span className="text-slate-900 dark:text-slate-100 font-medium" role="status" aria-live="polite">
          Recording...
        </span>
      </div>

      {/* Timer */}
      <div className="text-center">
        <div className="text-5xl font-bold text-slate-900 dark:text-slate-100 tabular-nums" role="timer" aria-live="polite">
          {timeRemaining}s
        </div>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Time remaining
        </p>
      </div>

      {/* Visualizations */}
      {analyser && volume && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Waveform
            </h3>
            <WaveformViz analyser={analyser} isActive={isActive} isDark={isDark} />
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Volume Level
            </h3>
            <VolumeMeter volume={volume} isActive={isActive} isDark={isDark} />
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Frequency Spectrum
            </h3>
            <SpectrumViz analyser={analyser} isActive={isActive} isDark={isDark} />
          </div>
        </div>
      )}

      {/* Stop Button */}
      <button
        onClick={handleStopTest}
        disabled={!isActive}
        className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium 
                   hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed 
                   transition-colors
                   focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Stop Test
      </button>
    </div>
  );
}
