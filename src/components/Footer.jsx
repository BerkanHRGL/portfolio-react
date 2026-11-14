export default function Footer() {
  return (
    <footer className="site-footer container label">
      <span>© {new Date().getFullYear()} Berkan Hergül</span>
      <span>Designed &amp; built by me, with React</span>
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        Back to top ↑
      </button>
    </footer>
  );
}
