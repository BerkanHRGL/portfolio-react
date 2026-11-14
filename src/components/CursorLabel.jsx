import { useEffect, useRef } from 'react';
import { reducedMotion } from '../utils/motion';

// A small label that trails the pointer over elements with a `data-cursor` attribute.
// Mouse only; the normal cursor stays visible.
export default function CursorLabel() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let x = 0, y = 0, targetX = 0, targetY = 0;
    let shown = false;
    let raf = 0;

    const loop = () => {
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const moving = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.3;
      raf = shown && moving ? requestAnimationFrame(loop) : 0;
    };
    const hide = () => {
      shown = false;
      el.classList.remove('on');
    };
    const onMove = event => {
      const host = event.target.closest?.('[data-cursor]');
      if (!host) {
        if (shown) hide();
        return;
      }
      targetX = event.clientX;
      targetY = event.clientY;
      if (!shown) {
        x = targetX;
        y = targetY;
        el.textContent = host.dataset.cursor;
        el.classList.add('on');
        shown = true;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('hashchange', hide);
    document.documentElement.addEventListener('pointerleave', hide);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', hide);
      window.removeEventListener('hashchange', hide);
      document.documentElement.removeEventListener('pointerleave', hide);
    };
  }, []);

  return <div className="cursor-label" aria-hidden="true" ref={ref} />;
}
