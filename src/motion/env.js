// Environment guards shared by the whole motion layer.
// - prefersReducedMotion(): gut heavy motion, ship static fallbacks.
// - isTouchDevice(): simplify / disable the expensive desktop-only flair
//   (custom cursor, magnetic, heavy parallax) on phones and tablets.

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(max-width: 768px)').matches ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0);
