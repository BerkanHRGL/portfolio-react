import { useEffect, useRef, useState } from 'react';

function currentTheme() {
  const set = document.documentElement.dataset.theme;
  if (set) return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* storage unavailable */ }
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}

// The navigation floats as a pill at the bottom of the screen;
// a thin line at the very top shows how far down the page you are.
export default function Header({ page }) {
  const progressRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      progressRef.current?.style.setProperty('--progress', progress.toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Highlight the section you are in.
  const [current, setCurrent] = useState(null);
  useEffect(() => {
    const sections = ['work', 'about', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setCurrent(entry.target.id);
        else setCurrent(id => (id === entry.target.id ? null : id));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(section => io.observe(section));
    return () => {
      io.disconnect();
      setCurrent(null);
    };
  }, [page]);

  const link = (id, text) => (
    <a href={`#${id}`} data-scramble-hover aria-current={current === id ? 'true' : undefined}>{text}</a>
  );

  return (
    <header className="dock">
      <div className="progress" ref={progressRef} aria-hidden="true" />
      <nav className="pill" aria-label="Main">
        <a className="pill-name" href="#top">
          <span className="pill-dot" aria-hidden="true" />
          Berkan
        </a>
        {link('work', 'Work')}
        {link('about', 'About')}
        {link('contact', 'Contact')}
        <ThemeToggle />
      </nav>
    </header>
  );
}
