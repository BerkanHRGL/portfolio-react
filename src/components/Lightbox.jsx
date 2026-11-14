import { useEffect, useRef } from 'react';

export default function Lightbox({ image, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!image) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || 'Enlarged image'}
      onClick={onClose}
    >
      <button ref={closeRef} type="button" className="lightbox-close" aria-label="Close image">
        ✕
      </button>
      <img src={image.src} alt={image.alt || ''} onClick={e => e.stopPropagation()} />
    </div>
  );
}
