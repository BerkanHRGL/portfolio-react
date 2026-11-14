import { useEffect, useRef } from 'react';
import { reducedMotion } from '../utils/motion';

const RAMP = ' .:-=+*#';
const ROWS = 7;

// A band of slowly moving ASCII waves that swells under the pointer. Decorative only.
export default function AsciiWave() {
  const preRef = useRef(null);

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;

    let cols = 0;
    let raf = 0;
    let lastDraw = 0;
    let visible = false;
    let pointer = null; // { x, y } in character cells
    const still = reducedMotion();

    const render = time => {
      const t = time / 1000;
      let out = '';
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < cols; x++) {
          let v =
            Math.sin(x * 0.09 + y * 0.35 + t * 1.1) * 0.5 +
            Math.sin(x * 0.035 - t * 0.7) * 0.35 +
            Math.sin(y * 0.9 + t * 0.5) * 0.15;
          v = (v + 1) / 2;
          if (pointer) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            v += Math.exp(-(dx * dx) / 70 - (dy * dy) / 5) * 0.6;
          }
          const level = Math.min(1, Math.max(0, v));
          out += RAMP[Math.round(Math.pow(level, 1.6) * (RAMP.length - 1))];
        }
        if (y < ROWS - 1) out += '\n';
      }
      pre.textContent = out;
    };

    const loop = now => {
      raf = 0;
      if (!visible) return;
      if (now - lastDraw >= 45) {
        lastDraw = now;
        render(now);
      }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf && visible && !still) raf = requestAnimationFrame(loop); };

    const measure = () => {
      const charWidth = parseFloat(getComputedStyle(pre).fontSize) * 0.6;
      cols = Math.max(10, Math.floor(pre.clientWidth / charWidth));
      render(performance.now());
    };
    const resizer = new ResizeObserver(measure);
    resizer.observe(pre);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      kick();
    });
    io.observe(pre);

    const onMove = event => {
      const rect = pre.getBoundingClientRect();
      pointer = {
        x: ((event.clientX - rect.left) / rect.width) * cols,
        y: ((event.clientY - rect.top) / rect.height) * ROWS,
      };
    };
    const onLeave = () => { pointer = null; };
    if (!still) {
      pre.addEventListener('pointermove', onMove);
      pre.addEventListener('pointerleave', onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      resizer.disconnect();
      io.disconnect();
      pre.removeEventListener('pointermove', onMove);
      pre.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <pre className="wave" aria-hidden="true" ref={preRef} />;
}
