import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';

// Attach Lenis smooth scrolling to an inner scroll container (wrapper) whose
// scrollable content is `content`. Synced to GSAP's ticker and ScrollTrigger.
// Returns { lenis, cleanup }.
export function attachLenis(wrapper, content) {
  const lenis = new Lenis({
    wrapper,
    content,
    duration: 1.05,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  const raf = time => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    cleanup() {
      gsap.ticker.remove(raf);
      lenis.destroy();
    },
  };
}
