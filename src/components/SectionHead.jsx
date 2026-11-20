// *word* in a title is set in the italic serif.
function styled(title) {
  return title.split(/\*(.+?)\*/).map((part, i) => (i % 2 ? <em key={i} className="serif">{part}</em> : part));
}

export default function SectionHead({ number, label, title, children }) {
  return (
    <header className="section-head" data-reveal>
      <p className="label section-label">
        <span className="section-number">{number}</span>
        <span data-scramble>{label}</span>
      </p>
      <h2 data-scramble>{styled(title)}</h2>
      {children && <p className="section-intro">{children}</p>}
    </header>
  );
}
