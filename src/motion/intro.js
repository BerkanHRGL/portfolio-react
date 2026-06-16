import { gsap } from './gsap';

// Signature moment: the desktop "powers on" like a CRT.
// A black screen, a bright line snaps open horizontally then vertically,
// the white fades out with a stepped flicker, and the hero (anything
// tagged [data-intro]) rises into place underneath. ~1.2s, transform /
// opacity only. Returns the timeline so the caller can skip via progress(1).
export function playCrtIntro({ root, onComplete }) {
  const heroEls = root.querySelectorAll('[data-intro]');

  const backdrop = document.createElement('div');
  backdrop.className = 'crt-backdrop';
  const line = document.createElement('div');
  line.className = 'crt-overlay';
  document.body.append(backdrop, line);

  const cleanup = () => {
    backdrop.remove();
    line.remove();
  };

  gsap.set(line, { scaleX: 0.45, scaleY: 0.004, opacity: 1 });
  gsap.set(backdrop, { opacity: 1 });
  gsap.set(heroEls, { yPercent: 55, opacity: 0 });

  const tl = gsap.timeline({
    onComplete: () => {
      cleanup();
      onComplete?.();
    },
  });

  tl
    // Hold the black "off" state for a beat with the bright line glowing.
    .to(line, { scaleX: 1, duration: 0.22, ease: 'power2.out' }, 0.18)
    // The line opens vertically — screen turns on, filling white over black.
    .to(line, { scaleY: 1, duration: 0.42, ease: 'expo.out' })
    // White flickers out (stepped) revealing the desktop; black lifts with it.
    .to(line, { opacity: 0, duration: 0.4, ease: 'steps(7)' }, '+=0.06')
    .to(backdrop, { opacity: 0, duration: 0.4, ease: 'power2.out' }, '<')
    // Hero rises into place underneath, choreographed stagger.
    .to(
      heroEls,
      { yPercent: 0, opacity: 1, duration: 0.95, stagger: 0.13, ease: 'power4.out' },
      '<0.04'
    );

  // Make absolutely sure the overlay nodes never get orphaned.
  tl.eventCallback('onInterrupt', cleanup);

  return tl;
}
