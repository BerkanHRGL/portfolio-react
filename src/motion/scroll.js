import { gsap, ScrollTrigger } from './gsap';
import { EASE } from './gsap';

// Reveal a set of targets in a choreographed stagger the first time their
// trigger enters a (possibly custom) scroll container. Returns the
// ScrollTrigger so the caller can clean it up.
export function revealOnScroll(
  trigger,
  targets,
  { scroller, y = 26, stagger = 0.08, duration = 0.7, start = 'top 82%' } = {}
) {
  const els = gsap.utils.toArray(targets);
  if (!els.length) return null;

  gsap.set(els, { y, opacity: 0 });
  const tween = gsap.to(els, {
    y: 0,
    opacity: 1,
    duration,
    stagger,
    ease: EASE.reveal,
    paused: true,
  });

  return ScrollTrigger.create({
    trigger,
    scroller,
    start,
    once: true,
    onEnter: () => tween.play(),
  });
}

// Batch reveal for long content streams (detail pages): elements that come
// into view together animate together, with a gentle stagger.
export function batchReveal(
  targets,
  { scroller, y = 22, stagger = 0.07, duration = 0.65, start = 'top 88%' } = {}
) {
  const els = gsap.utils.toArray(targets);
  if (!els.length) return [];

  gsap.set(els, { y, opacity: 0 });
  return ScrollTrigger.batch(els, {
    scroller,
    start,
    once: true,
    onEnter: batch =>
      gsap.to(batch, { y: 0, opacity: 1, duration, stagger, ease: EASE.reveal }),
  });
}

// Gentle image parallax: the image drifts slower than its container as the
// container scrolls past. Scaled up slightly so the drift never reveals an
// edge. Transform-only, scrubbed. Returns the ScrollTrigger for cleanup.
export function parallaxImage(
  img,
  { scroller, range = 10, scale = 1.14, start = 'top bottom', end = 'bottom top' } = {}
) {
  const wrap = img?.parentElement;
  if (!wrap) return null;

  wrap.classList.add('parallax-wrap');
  gsap.set(img, { scale, willChange: 'transform' });
  const tween = gsap.fromTo(
    img,
    { yPercent: -range },
    {
      yPercent: range,
      ease: 'none',
      scrollTrigger: { trigger: wrap, scroller, start, end, scrub: true },
    }
  );
  return tween.scrollTrigger;
}

export { ScrollTrigger };
