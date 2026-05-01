import { useDraggable } from '../hooks/useDraggable';

export default function Window({ title, children, onClose, active, onFocus, footer, style, windowClassName }) {
  const { elementRef, headerRef } = useDraggable();

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
