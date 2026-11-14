// A horizontal line made of real characters that fills the remaining width.
export default function Rule({ char = '─' }) {
  return <span className="rule" aria-hidden="true">{char.repeat(240)}</span>;
}
