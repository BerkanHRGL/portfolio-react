import { useEffect } from 'react';
import { reducedMotion } from '../utils/motion';

/**
 * The risograph print layer.
 * - An SVG filter (#ink) that roughens the edges of big type, like ink soaking into paper.
 * - A scroll listener that pushes the two ink layers further out of register while you
 *   scroll, the way a print drum shifts, then lets them settle back (--mis on <html>).
 * The paper grain itself is pure CSS (body::after in site.css).
 */
export default function Riso() {
  useEffect(() => {
    if (reducedMotion()) return;
    const html = document.documentElement;
    let lastY = window.scrollY;
    let shift = 0;
    let raf = 0;

    const settle = () => {
      shift *= 0.88;
      html.style.setProperty('--mis', (1 + shift).toFixed(3));
      raf = shift > 0.02 ? requestAnimationFrame(settle) : 0;
      if (!raf) html.style.removeProperty('--mis');
    };
    const onScroll = () => {
      const y = window.scrollY;
      shift = Math.min(3.5, shift + Math.abs(y - lastY) / 60);
      lastY = y;
      if (!raf) raf = requestAnimationFrame(settle);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      html.style.removeProperty('--mis');
    };
  }, []);

  return (
    <svg className="riso-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <filter id="ink" x="-2%" y="-10%" width="104%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
