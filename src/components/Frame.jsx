// A bordered box with "+" corners, like a frame drawn in a text file.
export default function Frame({ title, hint, className = '', children }) {
  return (
    <div className={`frame ${className}`}>
      <span className="corner tl" aria-hidden="true">+</span>
      <span className="corner tr" aria-hidden="true">+</span>
      <span className="corner bl" aria-hidden="true">+</span>
      <span className="corner br" aria-hidden="true">+</span>
      {title && (
        <div className="frame-bar">
          <span className="frame-title">{title}</span>
          {hint && <span className="frame-hint" aria-hidden="true">{hint}</span>}
        </div>
      )}
      <div className="frame-body">{children}</div>
    </div>
  );
}
