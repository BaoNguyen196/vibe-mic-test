import { useRef, useCallback } from 'react';
import { useCanvasAnimation } from '../../hooks/use-canvas-animation';

interface WaveformVizProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  isDark?: boolean;
}

export function WaveformViz({ analyser, isActive, isDark = false }: WaveformVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!analyser) return;

      // Lazy-init data array
      if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.frequencyBinCount) {
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      }
      const dataArray = dataArrayRef.current;
      // @ts-expect-error - TypeScript has issues with Uint8Array<ArrayBufferLike> vs Uint8Array<ArrayBuffer>
      analyser.getByteTimeDomainData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw waveform line
      ctx.lineWidth = 2;
      ctx.strokeStyle = isDark ? '#60a5fa' : '#3b82f6'; // blue-400 / blue-500
      ctx.beginPath();

      const sliceWidth = width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i]! / 255.0;
        const y = v * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    },
    [analyser, isDark],
  );

  useCanvasAnimation(canvasRef, draw, isActive);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-lg bg-slate-100 dark:bg-slate-800"
      aria-label="Audio waveform visualization"
      role="img"
    />
  );
}
