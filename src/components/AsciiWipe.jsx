import { useEffect, useRef } from 'react';

const NOISE = '░▒▓#@%';
const FONT = 16;
const CELL_W = FONT * 0.62;

/**
 * Page transition: the screen fills with characters in a ragged sweep from the left
 * ('cover'), the page swaps underneath, then the characters clear again ('reveal').
 */
export default function AsciiWipe({ phase, duration, label }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);

  // One grid of per-cell timings for the whole transition, so the reveal mirrors the cover.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const cols = Math.ceil(width / CELL_W);
    const rows = Math.ceil(height / FONT);
    const sweep = new Float32Array(cols * rows);
    for (let i = 0; i < sweep.length; i++) {
      sweep[i] = ((i % cols) / cols) * 0.75 + Math.random() * 0.25;
    }
    const style = getComputedStyle(document.documentElement);
    stateRef.current = {
      ctx, width, height, cols, rows, sweep,
      ink: style.getPropertyValue('--ink').trim() || '#111',
      accent: style.getPropertyValue('--accent').trim() || '#c2410c',
    };
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    const { ctx, width, height, cols, rows, sweep, ink, accent } = s;
    const start = performance.now();
    let raf = 0;

    const draw = now => {
      const t = Math.min(1, Math.max(0, (now - start) / duration)) * 1.12;
      ctx.clearRect(0, 0, width, height);
      ctx.font = `600 ${FONT}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = 'top';
      ctx.fillStyle = ink;
      const front = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const edge = t - sweep[y * cols + x];
          // cover: solid behind the front; reveal: solid ahead of it
          const solid = phase === 'cover' ? edge > 0.1 : edge < 0;
          const onFront = edge >= 0 && edge <= 0.1;
          if (solid) ctx.fillRect(x * CELL_W, y * FONT, CELL_W + 0.5, FONT + 0.5);
          else if (onFront) front.push(x, y);
        }
      }
      ctx.fillStyle = accent;
      for (let i = 0; i < front.length; i += 2) {
        ctx.fillText(NOISE[(Math.random() * NOISE.length) | 0], front[i] * CELL_W, front[i + 1] * FONT);
      }
      if (t < 1.12) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [phase, duration]);

  return (
    <div className={`wipe ${phase}`} aria-hidden="true">
      <canvas ref={canvasRef} />
      <p className="wipe-label">{label}</p>
    </div>
  );
}
