import { useRef, useCallback } from 'react';
import { useCanvasAnimation } from '../../hooks/use-canvas-animation';
import type { VolumeData } from '../../types/audio';

interface VolumeMeterProps {
  volume: VolumeData;
  isActive: boolean;
  isDark?: boolean;
}

// Color thresholds (normalized 0-1):
// Green: 0 - 0.4 (quiet)
// Yellow: 0.4 - 0.7 (speaking)
// Red: 0.7 - 1.0 (loud/clipping)

export function VolumeMeter({ volume, isActive, isDark = false }: VolumeMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smoothedRef = useRef(0);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Exponential smoothing for decay
      smoothedRef.current = smoothedRef.current * 0.85 + volume.rms * 0.15;
      const level = Math.min(smoothedRef.current, 1);

      ctx.clearRect(0, 0, width, height);

      // Background track
      ctx.fillStyle = isDark ? '#334155' : '#e2e8f0'; // slate-700 / slate-200
      ctx.fillRect(0, 0, width, height);

      // Colored fill based on level
      const fillWidth = level * width;
      if (level < 0.4) {
        ctx.fillStyle = '#22c55e'; // green-500
      } else if (level < 0.7) {
        ctx.fillStyle = '#eab308'; // yellow-500
      } else {
        ctx.fillStyle = '#ef4444'; // red-500
      }
      ctx.fillRect(0, 0, fillWidth, height);

      // Peak indicator line
      const peakX = Math.min(volume.peak, 1) * width;
      ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b'; // slate-100 / slate-800
      ctx.fillRect(peakX - 1, 0, 2, height);
    },
    [volume, isDark],
  );

  useCanvasAnimation(canvasRef, draw, isActive);

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full h-6 rounded-full"
        aria-label={`Volume level: ${Math.round(volume.rms * 100)}%`}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(volume.rms * 100)}
      />
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
        {volume.db > -Infinity ? `${volume.db.toFixed(1)} dB` : 'Silent'}
      </p>
    </div>
  );
}
