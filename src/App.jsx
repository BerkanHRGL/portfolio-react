import { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Work from './components/Work';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProjectPage from './components/ProjectPage';
import Lightbox from './components/Lightbox';
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

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Scroll handling when switching between home and a case study.
  useEffect(() => {
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
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        {route.page === 'project' ? (
          <ProjectPage key={route.key} projectKey={route.key} onImage={setLightbox} />
        ) : (
          <>
            <Hero />
            <Work />
            <About />
            <Contact />
          </>
        )}
      </main>
      <Footer />
      <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
