// A light "application window" frame: the one visual nod to the old desktop concept.
export default function WindowFrame({ title, className = '', children }) {
  return (
    <div className={`win ${className}`}>
      <div className="win-bar">
        <span className="win-title">{title}</span>
        <span className="win-dots" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <div className="win-body">{children}</div>
    </div>
  );
}
