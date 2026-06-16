import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../motion/gsap';
import { isTouchDevice, prefersReducedMotion } from '../../motion/env';

// Selector → label shown inside the ring on hover. Growing is the base
// reaction for anything interactive; labels are a bonus for key targets.
const LABELS = [
  { sel: '.card-view-btn', label: 'VIEW' },
  { sel: '.clickable-image, .cursor-zoom-in', label: 'ZOOM' },
  { sel: '.navbar-icon', label: 'OPEN' },
];
const INTERACTIVE =
  'a, button, .navbar-icon, .showcase-card, .clickable-image, .cursor-zoom-in, [data-cursor]';

export default function CustomCursor() {
  const [enabled] = useState(() => !isTouchDevice() && !prefersReducedMotion());
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.classList.add('cursor-none');

    // Dot tracks tightly, ring trails with weight for that liquid feel.
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3' });

    let visible = false;
    const onMove = e => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);

      const target = e.target;
      const interactive = target.closest?.(INTERACTIVE);
      setHovering(!!interactive);
      if (interactive) {
        const match = LABELS.find(l => target.closest(l.sel));
        setLabel(target.getAttribute?.('data-cursor-label') || match?.label || '');
      } else {
        setLabel('');
      }
    };

    const onLeave = () => gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.body.classList.remove('cursor-none');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div
        ref={ringRef}
        className={`cursor-ring${hovering ? ' is-hover' : ''}${label ? ' has-label' : ''}`}
      >
        <span className="cursor-label">{label}</span>
      </div>
    </>
  );
}
