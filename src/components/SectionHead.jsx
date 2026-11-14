import Rule from './Rule';

export default function SectionHead({ number, label, title, children }) {
  return (
    <header className="section-head" data-reveal>
      <p className="section-tag">
        <span className="section-number">{number}</span>
        <span>{label}</span>
        <Rule />
      </p>
      <h2 data-scramble>{title}</h2>
      {children && <p className="section-intro">{children}</p>}
    </header>
  );
}
