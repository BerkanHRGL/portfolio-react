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
export default function Header() {
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

  return (
    <header className="dock">
      <div className="progress" ref={progressRef} aria-hidden="true" />
      <nav className="pill" aria-label="Main">
        <a className="pill-name" href="#top">
          <span className="pill-dot" aria-hidden="true" />
          Berkan
        </a>
        <a href="#work" data-scramble-hover>Work</a>
        <a href="#about" data-scramble-hover>About</a>
        <a href="#contact" data-scramble-hover>Contact</a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
