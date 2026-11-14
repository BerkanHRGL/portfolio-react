import { useEffect, useRef, useState } from 'react';
import { reducedMotion } from '../utils/motion';

const NAME = 'Berkan Hergül';
const NOISE = '█▓▒░';
const BAR = 24;
const DURATION = 1100;

// Only on the first page of a visit, and never for reduced motion.
function shouldPlay() {
  if (reducedMotion()) return false;
  try { return !sessionStorage.getItem('intro'); } catch { return true; }
}

/**
 * Short intro: the name decodes while a character bar fills, then the cover lifts.
 * Adds `loaded` to <html> when done, which starts the hero animations.
 */
export default function Loader() {
  const [show, setShow] = useState(shouldPlay);
  const rootRef = useRef(null);
  const nameRef = useRef(null);
  const barRef = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    const html = document.documentElement;
    if (!show) {
      html.classList.add('loaded');
      return;
    }
    try { sessionStorage.setItem('intro', '1'); } catch { /* storage unavailable */ }

    const start = performance.now();
    let raf = 0;
    let finished = false;
    let lastDraw = 0;
    let unmountTimer = 0;

    const paint = progress => {
      const eased = 1 - Math.pow(1 - progress, 2);
      const filled = Math.round(eased * BAR);
      barRef.current.textContent = '█'.repeat(filled) + '░'.repeat(BAR - filled);
      countRef.current.textContent = String(Math.round(eased * 100)).padStart(3, '0');
      const done = Math.floor(eased * NAME.length);
      let name = NAME.slice(0, done);
      for (let i = done; i < NAME.length; i++) {
        name += NAME[i] === ' ' ? ' ' : NOISE[(Math.random() * NOISE.length) | 0];
      }
      nameRef.current.textContent = name;
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      paint(1);
      rootRef.current.classList.add('done');
      html.classList.add('loaded');
      unmountTimer = setTimeout(() => setShow(false), 700);
    };
    const tick = now => {
      const progress = Math.min(1, (now - start) / DURATION);
      if (progress === 1) return finish();
      if (now - lastDraw > 45) {
        lastDraw = now;
        paint(progress);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Frames stop in a background tab; never leave the cover up because of that.
    const fallback = setTimeout(finish, DURATION + 400);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
      clearTimeout(unmountTimer);
    };
  }, [show]);

  if (!show) return null;
  return (
    <div className="loader" ref={rootRef} aria-hidden="true">
      <div className="loader-inner">
        <p className="loader-name" ref={nameRef}>{NAME}</p>
        <p className="loader-bar"><span ref={barRef}>{'░'.repeat(BAR)}</span> <span ref={countRef}>000</span></p>
      </div>
    </div>
  );
}
