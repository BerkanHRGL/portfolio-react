import { useEffect, useState } from 'react';

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
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 2.5v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500z"
            fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="wordmark" href="#top">
          <span className="wordmark-mark" aria-hidden="true" />
          Berkan Hergül
        </a>
        <nav className="site-nav" aria-label="Main">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="header-tools">
          <Clock />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
