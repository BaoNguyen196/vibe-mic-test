import { useRef } from 'react';
import { useMicrophone } from '../hooks/use-microphone';
import { useAudioAnalyser } from '../hooks/use-audio-analyser';
import { useCanvasAnimation } from '../hooks/use-canvas-animation';

/**
 * Test component to verify Phase 3 implementation
 * Tests: useMicrophone, useAudioAnalyser, useCanvasAnimation hooks
 */
export default function Phase3Test() {
  const { stream, error, isActive, start, stop } = useMicrophone();
  const { analyser, volume } = useAudioAnalyser(stream);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple waveform visualization
  const drawWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!analyser) return;

    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // Get time domain data
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    // Draw waveform
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i]! / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  useCanvasAnimation(canvasRef, drawWaveform, isActive && analyser !== null);

  const volumePercent = Math.round(volume.rms * 100);
  const dbDisplay = volume.db === -Infinity ? '-∞' : volume.db.toFixed(1);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Phase 3: Audio Engine Test</h1>

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

        {/* Waveform */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Waveform</h2>
          <canvas ref={canvasRef} className="w-full h-32 bg-slate-800 rounded-lg" />
        </div>

        {/* Volume Meters */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Volume Levels</h2>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>RMS Level</span>
              <span className="font-mono">{volumePercent}%</span>
            </div>
            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-100"
                style={{ width: `${volumePercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Peak Level</span>
              <span className="font-mono">{Math.round(volume.peak * 100)}%</span>
            </div>
            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-100"
                style={{ width: `${Math.round(volume.peak * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span>Volume (dB)</span>
            <span className="font-mono">{dbDisplay} dB</span>
          </div>
        </div>

        {/* Success Criteria Checklist */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Phase 3 Success Criteria</h2>
          <ul className="space-y-2">
            <li className={isActive ? 'text-green-400' : 'text-slate-400'}>
              {isActive ? '✓' : '○'} useMicrophone.start() obtains MediaStream
            </li>
            <li className={analyser ? 'text-green-400' : 'text-slate-400'}>
              {analyser ? '✓' : '○'} useAudioAnalyser creates AudioContext + AnalyserNode
            </li>
            <li className={volume.rms > 0 ? 'text-green-400' : 'text-slate-400'}>
              {volume.rms > 0 ? '✓' : '○'} Volume data updates continuously (speak into mic!)
            </li>
            <li className="text-slate-400">○ Click Stop to test cleanup</li>
            <li className="text-slate-400">○ Canvas animation runs at ~60fps</li>
            <li className="text-slate-400">○ DPI scaling for crisp rendering</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
