import { useRef } from 'react';
import { useMicrophone } from '../../hooks/use-microphone';
import { useAudioAnalyser } from '../../hooks/use-audio-analyser';
import { useCanvasAnimation } from '../../hooks/use-canvas-animation';

interface TestingStepProps {
  deviceId?: string;
  onBack: () => void;
}

export default function TestingStep({ deviceId, onBack }: TestingStepProps) {
  const { stream, error, isActive, start, stop } = useMicrophone();
  const { analyser, volume } = useAudioAnalyser(stream);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple waveform visualization
  const drawWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!analyser) return;

    // Clear canvas
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(0, 0, width, height);

    // Get time domain data
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    // Draw waveform
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3b82f6'; // blue-500
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

  const handleStart = () => {
    start(deviceId);
  };

  const handleStop = () => {
    stop();
  };

  // Calculate volume percentage (0-100)
  const volumePercent = Math.round(volume.rms * 100);
  const dbDisplay = volume.db === -Infinity ? '-∞' : volume.db.toFixed(1);

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

        {/* Waveform visualization */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Waveform</h3>
          <canvas
            ref={canvasRef}
            className="w-full h-32 bg-slate-800 rounded-lg border border-slate-600"
          />
        </div>

        {/* Volume meter */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Volume Levels</h3>
          
          {/* RMS level */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>RMS Level</span>
              <span className="font-mono">{volumePercent}%</span>
            </div>
            <div className="w-full h-4 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-100"
                style={{ width: `${volumePercent}%` }}
              />
            </div>
          </div>

          {/* Peak level */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Peak Level</span>
              <span className="font-mono">{Math.round(volume.peak * 100)}%</span>
            </div>
            <div className="w-full h-4 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-100"
                style={{ width: `${Math.round(volume.peak * 100)}%` }}
              />
            </div>
          </div>

          {/* Decibels */}
          <div className="flex justify-between text-sm">
            <span>Volume (dB)</span>
            <span className="font-mono">{dbDisplay} dB</span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Status: {isActive ? '🎤 Recording active' : '⏸️ Stopped'}
        </div>
      </div>
    </div>
  );
}
