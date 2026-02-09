import { useEffect, useRef } from 'react';

type DrawFunction = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

export function useCanvasAnimation(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  drawFn: DrawFunction,
  isActive: boolean,
) {
  const animationRef = useRef<number>(0);
  const drawFnRef = useRef(drawFn);
  drawFnRef.current = drawFn; // Always use latest draw function

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle DPI scaling for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const animate = () => {
      drawFnRef.current(ctx, rect.width, rect.height);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [canvasRef, isActive]);
}
