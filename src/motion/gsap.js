// Central GSAP entry point: registers plugins once and exposes shared
// easing / duration tokens so every animation in the app pulls from the
// same vocabulary. Import gsap / ScrollTrigger from here, never directly.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Weighted, intentional curves. Expo / power4 "out" for entrances,
// power3 "inOut" for transitions, power3 "out" for the magnetic spring.
export const EASE = {
  reveal: 'power4.out',
  expo: 'expo.out',
  curtain: 'power3.inOut',
  magnetic: 'power3.out',
};

export const DUR = {
  intro: 0.95,
  reveal: 0.8,
  fast: 0.4,
};

export { gsap, ScrollTrigger };
