import { useRef, useCallback } from 'react';
import { useCanvasAnimation } from '../../hooks/use-canvas-animation';

interface SpectrumVizProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  isDark?: boolean;
}

export function SpectrumViz({ analyser, isActive, isDark = false }: SpectrumVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!analyser) return;

      if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.frequencyBinCount) {
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      }
      const dataArray = dataArrayRef.current;
      // @ts-expect-error - TypeScript has issues with Uint8Array<ArrayBufferLike> vs Uint8Array<ArrayBuffer>
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);

      // Draw frequency bars
      const barCount = 64; // Reduce bins for visual clarity
      const binSize = Math.floor(dataArray.length / barCount);
      const barWidth = width / barCount - 1; // 1px gap

      for (let i = 0; i < barCount; i++) {
        // Average the bins for this bar
        let sum = 0;
        for (let j = 0; j < binSize; j++) {
          sum += dataArray[i * binSize + j]!;
        }
        const avg = sum / binSize;
        const barHeight = (avg / 255) * height;

        // Color gradient: blue -> purple -> pink based on frequency
        const hue = 220 + (i / barCount) * 60; // 220 (blue) to 280 (purple)
        const lightness = isDark ? 55 : 50;
        ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`;
        ctx.fillRect(i * (barWidth + 1), height - barHeight, barWidth, barHeight);
      }
    },
    [analyser, isDark],
  );

  useCanvasAnimation(canvasRef, draw, isActive);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 sm:h-40 rounded-lg bg-slate-100 dark:bg-slate-800"
      aria-label="Audio frequency spectrum visualization"
      role="img"
    />
  );
}
