import { useEffect } from 'react';

export default function ImagePopup({ src, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="image-popup-overlay"
      id="imagePopup"
      style={{ display: 'flex' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="image-popup-content">
        <div className="image-popup-close" onClick={onClose}>✕</div>
        <img id="popupImage" src={src} alt="Enlarged view" />
      </div>
    </div>
  );
}
