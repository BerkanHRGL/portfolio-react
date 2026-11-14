import { useEffect, useRef, useState } from 'react';

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Amsterdam',
});

function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="clock" title="Local time in the Netherlands">
      <span className="clock-label">NL</span>
      <time dateTime={now.toISOString()}>{timeFormat.format(now)}</time>
    </span>
  );
}

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
      {theme === 'dark' ? 'light' : 'dark'}
    </button>
  );
}

export default function Header() {
  const headerRef = useRef(null);

  // Drives the reading-progress line under the header.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      headerRef.current?.style.setProperty('--progress', progress.toFixed(4));
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
    <header className="site-header" ref={headerRef}>
      <div className="container header-inner">
        <a className="wordmark" href="#top">
          <span className="wordmark-mark" aria-hidden="true">~/</span>
          berkan<span className="wordmark-rest">-hergul</span>
        </a>
        <nav className="site-nav" aria-label="Main">
          <a href="#work" data-scramble-hover>work</a>
          <a href="#about" data-scramble-hover>about</a>
          <a href="#contact" data-scramble-hover>contact</a>
        </nav>
        <div className="header-tools">
          <Clock />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
