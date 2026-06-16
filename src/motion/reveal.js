import { gsap } from './gsap';
import { EASE } from './gsap';

// Line-mask reveal: inner spans rise "out of an invisible box".
// Expects markup shaped as <... class="reveal-line"><span>text</span></...>.
// Pass the inner <span> nodes (or a parent to query within).
export function lineMaskIn(target, { delay = 0, stagger = 0.12, duration = 0.9 } = {}) {
  const els =
    typeof target === 'string' || target instanceof Element
      ? gsap.utils.toArray(target).flatMap(el =>
          el.matches?.('.reveal-line > span')
            ? [el]
            : gsap.utils.toArray(el.querySelectorAll('.reveal-line > span'))
        )
      : gsap.utils.toArray(target);

  gsap.set(els, { yPercent: 115 });
  return gsap.to(els, {
    yPercent: 0,
    duration,
    delay,
    stagger,
    ease: EASE.reveal,
  });
}

// Generic weighted rise for non-masked elements (subtitles, meta, etc.).
export function riseIn(target, { delay = 0, stagger = 0.1, duration = 0.8, y = 24 } = {}) {
  const els = gsap.utils.toArray(target);
  gsap.set(els, { y, opacity: 0 });
  return gsap.to(els, {
    y: 0,
    opacity: 1,
    duration,
    delay,
    stagger,
    ease: EASE.reveal,
  });
}
