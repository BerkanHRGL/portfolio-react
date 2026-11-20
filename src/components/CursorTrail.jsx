import { useEffect, useRef } from 'react';
import { reducedMotion } from '../utils/motion';

const CHARS = '.:+*#';
const LIFE = 650; // ms a character lives
const SPACING = 16; // px of pointer travel per new character

/**
 * A short trail of characters behind the mouse, in the accent colour.
 * Mouse only, and nothing at all for reduced motion.
 */
export default function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || reducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const bits = [];
    let raf = 0;
    let last = null;
    let accent = '#c2410c';
    let width = 0, height = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = now => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = '600 13px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = accent;
      for (let i = bits.length - 1; i >= 0; i--) {
        const bit = bits[i];
        const age = (now - bit.born) / LIFE;
        if (age >= 1) {
          bits.splice(i, 1);
          continue;
        }
        bit.x += bit.vx;
        bit.y += bit.vy;
        bit.vy += 0.05;
        ctx.globalAlpha = (1 - age) * 0.9;
        ctx.fillText(CHARS[Math.min(CHARS.length - 1, (age * CHARS.length) | 0)], bit.x, bit.y);
      }
      ctx.globalAlpha = 1;
      raf = bits.length ? requestAnimationFrame(draw) : 0;
      if (!raf) ctx.clearRect(0, 0, width, height);
    };

    const onMove = event => {
      const point = { x: event.clientX, y: event.clientY };
      if (!last) {
        last = point;
        accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || accent;
        return;
      }
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      const distance = Math.hypot(dx, dy);
      if (distance < SPACING) return;
      const now = performance.now();
      const count = Math.min(4, Math.floor(distance / SPACING));
      for (let i = 1; i <= count; i++) {
        bits.push({
          x: last.x + (dx * i) / count,
          y: last.y + (dy * i) / count,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          born: now,
        });
      }
      if (bits.length > 80) bits.splice(0, bits.length - 80);
      last = point;
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const onLeave = () => { last = null; };
    const onTheme = () => { last = null; };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    const themeWatcher = new MutationObserver(onTheme);
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      cancelAnimationFrame(raf);
      themeWatcher.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas className="trail" ref={canvasRef} aria-hidden="true" />;
}
