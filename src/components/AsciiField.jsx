import { useEffect, useRef } from 'react';
import { reducedMotion } from '../utils/motion';

const RAMP = ' .:-=+*#%@';
const FONT_SIZE = 14;
const CELL_W = FONT_SIZE * 0.6; // monospace advance
const CELL_H = 15;

const clamp01 = n => Math.min(1, Math.max(0, n));
const smooth = (a, b, n) => {
  const t = clamp01((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * The page background: slow blobs of ASCII characters drawn on a fixed canvas.
 * They drift over time, slide with the scroll position and swell under the pointer.
 * On wide screens they keep to the right so they stay out of the way of the text.
 */
export default function AsciiField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const still = reducedMotion();
    let width = 0, height = 0, cols = 0, rows = 0;
    let raf = 0;
    let lastDraw = 0;
    let frame = 0;
    let colour = '#888';
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const draw = now => {
      if (frame++ % 20 === 0) colour = getComputedStyle(canvas).color;
      const t = still ? 0 : now / 1000;
      const scroll = still ? 0 : (window.scrollY * 0.35) / CELL_H;
      const wide = width > 900;
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = colour;
      ctx.font = `${FONT_SIZE}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = 'top';

      for (let y = 0; y < rows; y++) {
        const ny = (y + scroll) * 0.075;
        const dy = y * CELL_H - pointer.y;
        let line = '';
        let empty = true;
        for (let x = 0; x < cols; x++) {
          const nx = x * 0.045;
          let v =
            Math.sin(nx + t * 0.25 + Math.sin(ny * 1.3 - t * 0.18) * 1.4) *
            Math.cos(ny * 0.9 - t * 0.2 + Math.sin(nx * 0.7 + t * 0.12) * 1.2) +
            Math.sin((nx + ny) * 1.7 + t * 0.3) * 0.35;
          const dx = x * CELL_W - pointer.x;
          v += Math.exp(-(dx * dx + dy * dy) / 16000) * 0.9;
          // Higher threshold on the left = fewer characters behind the text
          const threshold = wide ? 1.05 - smooth(0.3, 0.85, x / cols) * 0.8 : 0.45;
          const level = clamp01((v - threshold) / 0.9);
          const char = RAMP[Math.round(level * (RAMP.length - 1))];
          if (char !== ' ') empty = false;
          line += char;
        }
        if (!empty) ctx.fillText(line, 0, y * CELL_H);
      }
    };

    const loop = now => {
      raf = requestAnimationFrame(loop);
      if (now - lastDraw < 33) return;
      lastDraw = now;
      draw(now);
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      cols = Math.ceil(width / CELL_W);
      rows = Math.ceil(height / CELL_H);
      draw(performance.now());
    };

    const onMove = event => {
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (!document.hidden && !still) raf = requestAnimationFrame(loop);
    };
    // A static field still has to follow the light/dark toggle.
    const themeWatcher = new MutationObserver(() => { frame = 0; if (still) draw(0); });
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    if (!still) {
      window.addEventListener('pointermove', onMove, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      themeWatcher.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas className="field" ref={canvasRef} aria-hidden="true" />;
}
