import { useMicrophone } from '../../hooks/use-microphone';
import { useAudioAnalyser } from '../../hooks/use-audio-analyser';
import { WaveformViz } from '../audio/waveform-viz';
import { VolumeMeter } from '../audio/volume-meter';
import { SpectrumViz } from '../audio/spectrum-viz';

interface TestingStepProps {
  deviceId?: string;
  onBack: () => void;
}

export default function TestingStep({ deviceId, onBack }: TestingStepProps) {
  const { stream, error, isActive, start, stop } = useMicrophone();
  const { analyser, volume } = useAudioAnalyser(stream);

  const handleStart = () => {
    start(deviceId);
  };

  const handleStop = () => {
    stop();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 border border-slate-300 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Audio Testing</h2>

        {/* Control buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleStart}
            disabled={isActive}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed font-medium"
          >
            Start Test
          </button>
          <button
            onClick={handleStop}
            disabled={!isActive}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-slate-400 disabled:cursor-not-allowed font-medium"
          >
            Stop Test
          </button>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 font-medium"
          >
            Back
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Status */}
        <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Status: {isActive ? '🎤 Recording active' : '⏸️ Stopped'}
        </div>

        {/* Waveform visualization */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Oscilloscope Waveform</h3>
          <WaveformViz analyser={analyser} isActive={isActive && analyser !== null} />
        </div>

        {/* Volume meter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Volume Meter</h3>
          <VolumeMeter volume={volume} isActive={isActive && analyser !== null} />
        </div>

        {/* Frequency spectrum */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Frequency Spectrum</h3>
          <SpectrumViz analyser={analyser} isActive={isActive && analyser !== null} />
        </div>
      </div>
    </div>
  );
}
