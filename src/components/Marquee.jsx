import { useEffect, useRef } from 'react';

const items = ['UX/UI design', 'Branding', 'Front-end development', 'User research', 'Prototyping', 'Accessibility'];

// A looping strip of disciplines. It speeds up while the page is being scrolled.
export default function Marquee() {
  const trackRef = useRef(null);

  useEffect(() => {
    const animation = trackRef.current?.getAnimations?.()[0];
    if (!animation) return; // no CSS animation: reduced motion

    let lastY = window.scrollY;
    let boost = 0;
    let raf = 0;

    const settle = () => {
      boost *= 0.92;
      if (boost < 0.02) {
        animation.playbackRate = 1;
        raf = 0;
        return;
      }
      animation.playbackRate = 1 + boost;
      raf = requestAnimationFrame(settle);
    };
    const onScroll = () => {
      const y = window.scrollY;
      boost = Math.min(6, boost + Math.abs(y - lastY) / 40);
      lastY = y;
      if (!raf) raf = requestAnimationFrame(settle);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const group = (
    <div className="marquee-group">
      {items.map((item, i) => (
        <span key={item} className={`marquee-item${i % 2 ? ' outline' : ''}`}>
          {item}
          <span className="marquee-sep"> * </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" ref={trackRef}>
        {group}
        {group}
      </div>
    </div>
  );
}
