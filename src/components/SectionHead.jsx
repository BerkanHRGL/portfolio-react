export default function SectionHead({ number, label, title, children }) {
  return (
    <header className="section-head" data-reveal>
      <p className="label section-label">
        <span className="section-number">{number}</span>
        <span data-scramble>{label}</span>
      </p>
      <h2>{title}</h2>
      {children && <p className="section-intro">{children}</p>}
    </header>
  );
}
