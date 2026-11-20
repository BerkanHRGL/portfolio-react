import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Intro from './components/Intro';
import Work from './components/Work';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProjectPage from './components/ProjectPage';
import Lightbox from './components/Lightbox';
import Marquee from './components/Marquee';
import AsciiField from './components/AsciiField';
import Loader from './components/Loader';
import Outro from './components/Outro';
import CursorTrail from './components/CursorTrail';
import AsciiWipe from './components/AsciiWipe';
import { reducedMotion, scramble } from './utils/motion';
import { projectData } from './data/projectData';
import { showcaseProjects } from './data/showcaseProjects';

// Routes: "#/work/<key>" opens a case study, anything else is the home page
// (where "#work", "#about" and "#contact" are plain section anchors).
function readRoute() {
  const match = window.location.hash.match(/^#\/work\/([\w-]+)/);
  const key = match?.[1];
  const meta = showcaseProjects.find(p => p.key === key);
  if (key && projectData[key] && meta && !meta.comingSoon) return { page: 'project', key };
  return { page: 'home', key: null };
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [lightbox, setLightbox] = useState(null);
  const [wipe, setWipe] = useState(null); // { phase: 'cover' | 'reveal', label }
  const targetRef = useRef(route); // the route we are on, or heading to

  // Switching between home and a case study plays a short wipe:
  // characters cover the screen, the page swaps underneath, characters clear.
  useEffect(() => {
    let timers = [];
    const onHashChange = () => {
      const next = readRoute();
      const target = targetRef.current;
      if (next.page === target.page && next.key === target.key) return;
      targetRef.current = next;
      if (reducedMotion()) {
        setRoute(next);
        return;
      }
      timers.forEach(clearTimeout);
      setWipe({ phase: 'cover', label: next.key ? `> cd ~/work/${next.key}` : '> cd ~' });
      timers = [
        setTimeout(() => {
          setRoute(targetRef.current);
          setWipe(current => current && { ...current, phase: 'reveal' });
        }, 400),
        setTimeout(() => setWipe(null), 820),
      ];
    };
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      timers.forEach(clearTimeout);
    };
  }, []);

  // Text decodes on hover for anything marked data-scramble-hover.
  useEffect(() => {
    const onOver = event => {
      const host = event.target.closest?.('[data-scramble-hover]');
      if (!host || host.contains(event.relatedTarget)) return;
      scramble(host.querySelector('[data-scramble-target]') || host, 380);
    };
    document.addEventListener('pointerover', onOver);
    return () => document.removeEventListener('pointerover', onOver);
  }, []);

  // Buttons marked data-magnetic lean towards the mouse while it is over them.
  useEffect(() => {
    if (reducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let active = null;
    const release = () => {
      if (active) active.style.translate = '';
      active = null;
    };
    const onMove = event => {
      const el = event.target.closest?.('[data-magnetic]');
      if (el !== active) release();
      if (!el) return;
      active = el;
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) * 0.3;
      const y = (event.clientY - (rect.top + rect.height / 2)) * 0.4;
      el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', release);
    return () => {
      release();
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', release);
    };
  }, []);

  // Scroll handling when switching between home and a case study.
  useEffect(() => {
    document.documentElement.dataset.page = route.page;
    if (route.page === 'project') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    const id = window.location.hash.slice(1);
    const target = id && !id.startsWith('/') ? document.getElementById(id) : null;
    if (target) target.scrollIntoView({ behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [route.page, route.key]);

  // Fade sections in as they enter the viewport.
  useEffect(() => {
    const items = document.querySelectorAll('[data-reveal]:not(.in)');
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          entry.target.querySelectorAll('[data-scramble]').forEach(el => scramble(el, 700));
          io.unobserve(entry.target);
        }
      }),
      { rootMargin: '0px 0px -8% 0px' }
    );
    items.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [route.page, route.key]);

  return (
    <>
      <AsciiField />
      <Loader />
      <a className="skip-link" href="#main">Skip to content</a>
      <Header page={route.page} />
      <main id="main">
        {route.page === 'project' ? (
          <ProjectPage key={route.key} projectKey={route.key} onImage={setLightbox} />
        ) : (
          <>
            <Hero />
            <Intro />
            <Marquee />
            <Work />
            <About />
            <Contact />
            <Outro />
          </>
        )}
      </main>
      <Footer />
      <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
      <CursorTrail />
      {wipe && <AsciiWipe phase={wipe.phase} duration={wipe.phase === 'cover' ? 380 : 420} label={wipe.label} />}
    </>
  );
}
