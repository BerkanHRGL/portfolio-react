import { gsap } from './gsap';
import { isTouchDevice, prefersReducedMotion } from './env';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Make an element lean toward the cursor while hovered, springing back on
// leave. Transform (x/y) only. Returns a cleanup fn.
export function applyMagnetic(el, { strength = 0.32, max = 14 } = {}) {
  const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });

  const onMove = e => {
    const r = el.getBoundingClientRect();
    xTo(clamp((e.clientX - (r.left + r.width / 2)) * strength, -max, max));
    yTo(clamp((e.clientY - (r.top + r.height / 2)) * strength, -max, max));
  };
  const onLeave = () => {
    xTo(0);
    yTo(0);
  };

  el.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', onLeave);
  return () => {
    el.removeEventListener('mousemove', onMove);
    el.removeEventListener('mouseleave', onLeave);
    gsap.killTweensOf(el);
    gsap.set(el, { x: 0, y: 0 });
  };
}

// Apply magnetism to every match within a root. One cleanup fn returned.
// No-op on touch / reduced motion.
export function magnetize(root, selector, opts) {
  if (!root || isTouchDevice() || prefersReducedMotion()) return () => {};
  const cleanups = Array.from(root.querySelectorAll(selector)).map(el =>
    applyMagnetic(el, opts)
  );
  return () => cleanups.forEach(fn => fn());
}
