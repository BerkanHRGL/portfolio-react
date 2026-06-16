import { useLayoutEffect } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import { gsap } from '../motion/gsap';
import { prefersReducedMotion } from '../motion/env';

export default function Window({ title, children, onClose, active, onFocus, footer, style, windowClassName }) {
  const { elementRef, headerRef } = useDraggable();

  // Windows pop open with a weighted scale/fade. left/top drive position
  // (drag), so transform is free; cleared afterward to not affect dragging.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const el = elementRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { scale: 0.94, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.42, ease: 'expo.out', clearProps: 'transform,opacity,visibility' }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={elementRef}
      className={`${windowClassName || ''} ${active ? 'window-active' : 'window-inactive'}`}
      style={{ zIndex: active ? 3500 : 3000, ...style }}
      onMouseDown={onFocus}
    >
      <div ref={headerRef} className="window-header">
        <div className="window-title">{title}</div>
        <div
          className="window-close"
          onClick={e => { e.stopPropagation(); onClose(); }}
        >
          ✕
        </div>
      </div>
      <div className="window-content">{children}</div>
      {footer && <div className="window-footer">{footer}</div>}
    </div>
  );
}
