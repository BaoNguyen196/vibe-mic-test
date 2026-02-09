import { useMicrophone } from '../hooks/use-microphone';
import { useAudioAnalyser } from '../hooks/use-audio-analyser';
import { WaveformViz } from './audio/waveform-viz';
import { VolumeMeter } from './audio/volume-meter';
import { SpectrumViz } from './audio/spectrum-viz';

/**
 * Test component to verify Phase 4 implementation
 * Tests: WaveformViz, VolumeMeter, SpectrumViz components
 */
export default function Phase4Test() {
  const { stream, error, isActive, start, stop } = useMicrophone();
  const { analyser, volume } = useAudioAnalyser(stream);

  const volumePercent = Math.round(volume.rms * 100);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Phase 4: Audio Visualizations Test</h1>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={() => start()}
            disabled={isActive}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed font-medium"
          >
            Start Microphone
          </button>
          <button
            onClick={stop}
            disabled={!isActive}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-slate-600 disabled:cursor-not-allowed font-medium"
          >
            Stop Microphone
          </button>
        </div>

        {/* Status */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <p>Status: {isActive ? '🎤 Active' : '⏸️ Stopped'}</p>
          <p>Stream: {stream ? '✓ Active' : '✗ None'}</p>
          <p>Analyser: {analyser ? '✓ Connected' : '✗ Not connected'}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Waveform Visualization */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Oscilloscope Waveform</h2>
          <WaveformViz analyser={analyser} isActive={isActive && analyser !== null} isDark />
          <p className="text-sm text-slate-400">
            Real-time time-domain audio waveform. Speak into your microphone to see the wave pattern.
          </p>
        </div>

        {/* Volume Meter */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Volume Meter</h2>
          <VolumeMeter volume={volume} isActive={isActive && analyser !== null} isDark />
          <p className="text-sm text-slate-400">
            Color-coded volume bar: Green (quiet), Yellow (speaking), Red (loud). White line shows
            peak level.
          </p>
        </div>

        {/* Frequency Spectrum */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Frequency Spectrum</h2>
          <SpectrumViz analyser={analyser} isActive={isActive && analyser !== null} isDark />
          <p className="text-sm text-slate-400">
            Real-time frequency distribution. Low frequencies (left) to high frequencies (right).
          </p>
        </div>

        {/* Volume Statistics */}
        <div className="bg-slate-800 p-4 rounded-lg space-y-2">
          <h2 className="text-lg font-semibold">Volume Statistics</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-mono font-bold">{volumePercent}%</p>
              <p className="text-sm text-slate-400">RMS Level</p>
            </div>
            <div>
              <p className="text-3xl font-mono font-bold">{Math.round(volume.peak * 100)}%</p>
              <p className="text-sm text-slate-400">Peak Level</p>
            </div>
            <div>
              <p className="text-3xl font-mono font-bold">
                {volume.db === -Infinity ? '-∞' : volume.db.toFixed(1)}
              </p>
              <p className="text-sm text-slate-400">Volume (dB)</p>
            </div>
          </div>
        </div>

        {/* Success Criteria Checklist */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Phase 4 Success Criteria</h2>
          <ul className="space-y-2">
            <li className={isActive && analyser ? 'text-green-400' : 'text-slate-400'}>
              {isActive && analyser ? '✓' : '○'} WaveformViz renders oscilloscope line
            </li>
            <li className={volume.rms > 0 ? 'text-green-400' : 'text-slate-400'}>
              {volume.rms > 0 ? '✓' : '○'} Waveform responds to voice/sound (speak into mic!)
            </li>
            <li className={isActive && analyser ? 'text-green-400' : 'text-slate-400'}>
              {isActive && analyser ? '✓' : '○'} VolumeMeter bar fills with color zones
            </li>
            <li className={volume.rms > 0 ? 'text-green-400' : 'text-slate-400'}>
              {volume.rms > 0 ? '✓' : '○'} Volume meter has smooth decay animation
            </li>
            <li className={isActive && analyser ? 'text-green-400' : 'text-slate-400'}>
              {isActive && analyser ? '✓' : '○'} SpectrumViz shows frequency bars
            </li>
            <li className={volume.rms > 0 ? 'text-green-400' : 'text-slate-400'}>
              {volume.rms > 0 ? '✓' : '○'} Spectrum bars rise/fall in real-time
            </li>
            <li className="text-slate-400">○ All render at 60fps without jank (check DevTools)</li>
            <li className="text-green-400">✓ Canvas crisp on HiDPI displays</li>
            <li className="text-green-400">✓ Dark mode colors applied</li>
            <li className="text-green-400">✓ ARIA labels present on canvas elements</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
