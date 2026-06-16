import { useState, useCallback, useLayoutEffect, useEffect, useRef } from 'react';
import { playCrtIntro } from '../motion/intro';
import { magnetize } from '../motion/magnetic';
import { prefersReducedMotion } from '../motion/env';
import Navbar from './Navbar';
import DateTime from './ui/DateTime';
import CdPlayer from './ui/CdPlayer';
import MapleLeaf from './ui/MapleLeaf';
import ImagePopup from './ui/ImagePopup';
import CustomCursor from './ui/CustomCursor';
import AboutWindow from './windows/AboutWindow';
import FullAboutWindow from './windows/FullAboutWindow';
import ContactWindow from './windows/ContactWindow';
import ProjectsWindow from './windows/ProjectsWindow';
import LearningOutcomesWindow from './windows/LearningOutcomesWindow';
import ProjectsShowcase from './showcase/ProjectsShowcase';
import ProjectDetail from './showcase/ProjectDetail';

export default function Desktop() {
  const [openWindows, setOpenWindows] = useState(['about']);
  const [activeWindow, setActiveWindow] = useState('about');
  const [showShowcase, setShowShowcase] = useState(false);
  const [detailKey, setDetailKey] = useState(null);
  const [imagePopupSrc, setImagePopupSrc] = useState(null);
  const rootRef = useRef(null);

  // Signature moment: CRT power-on into the desktop. Plays on each load,
  // user-skippable, instant-static under reduced motion.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    const tl = playCrtIntro({ root });

    // Attach skip listeners on the *next* frame so the click / Enter that
    // brought us into the desktop can't immediately fast-forward the intro.
    let skip;
    const raf = requestAnimationFrame(() => {
      skip = () => tl.progress(1);
      window.addEventListener('keydown', skip);
      window.addEventListener('pointerdown', skip);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (skip) {
        window.removeEventListener('keydown', skip);
        window.removeEventListener('pointerdown', skip);
      }
      tl.kill();
      document.querySelectorAll('.crt-overlay, .crt-backdrop').forEach(n => n.remove());
    };
  }, []);

  // Magnetic pull on the bottom navbar icons.
  useEffect(() => magnetize(rootRef.current, '.navbar-icon', { strength: 0.25, max: 10 }), []);

  const openWindow = useCallback(id => {
    setOpenWindows(prev => prev.includes(id) ? prev : [...prev, id]);
    setActiveWindow(id);
  }, []);

  const closeWindow = useCallback(id => {
    setOpenWindows(prev => prev.filter(w => w !== id));
  }, []);

  const focusWindow = useCallback(id => {
    setActiveWindow(id);
  }, []);

  function handleNav(section) {
    if (section === 'projects') {
      setShowShowcase(true);
      setDetailKey(null);
      closeWindow('about');
    } else if (section === 'learning-outcomes') {
      openWindow('learning-outcomes');
    } else if (section === 'about-me') {
      openWindow('full-about');
    } else if (section === 'contact') {
      openWindow('contact');
    }
  }

  function handleImageClick(e) {
    if (e.target.classList.contains('clickable-image') || e.target.classList.contains('cursor-zoom-in')) {
      setImagePopupSrc(e.target.src);
    }
  }

  const isOpen = id => openWindows.includes(id);
  const isActive = id => activeWindow === id;

  return (
    <div id="main-content" ref={rootRef} style={{ display: 'block' }} onClick={handleImageClick}>
      <div className="header-title">
        <div className="student-title" data-intro>STUDENT MEDIA DESIGN</div>
      </div>
      <div className="name-container">
        <img src="imgs/logo.png" alt="Berkan" className="name-logo" data-intro />
        <div className="subtitle" data-intro>Based in The Netherlands</div>
      </div>

      {!showShowcase && !detailKey && <DateTime />}
      <MapleLeaf />
      <CdPlayer />

      <Navbar onNav={handleNav} />

      {/* Windows */}
      {isOpen('about') && (
        <AboutWindow
          active={isActive('about')}
          onClose={() => closeWindow('about')}
          onFocus={() => focusWindow('about')}
          onMoreAbout={() => openWindow('full-about')}
        />
      )}
      {isOpen('full-about') && (
        <FullAboutWindow
          active={isActive('full-about')}
          onClose={() => closeWindow('full-about')}
          onFocus={() => focusWindow('full-about')}
        />
      )}
      {isOpen('contact') && (
        <ContactWindow
          active={isActive('contact')}
          onClose={() => closeWindow('contact')}
          onFocus={() => focusWindow('contact')}
        />
      )}
      {isOpen('projects') && (
        <ProjectsWindow
          active={isActive('projects')}
          onClose={() => closeWindow('projects')}
          onFocus={() => focusWindow('projects')}
        />
      )}
      {isOpen('learning-outcomes') && (
        <LearningOutcomesWindow
          active={isActive('learning-outcomes')}
          onClose={() => closeWindow('learning-outcomes')}
          onFocus={() => focusWindow('learning-outcomes')}
        />
      )}

      {/* Full-screen overlays */}
      {showShowcase && (
        <ProjectsShowcase
          onClose={() => setShowShowcase(false)}
          onViewProject={key => setDetailKey(key)}
        />
      )}
      {detailKey && (
        <ProjectDetail
          projectKey={detailKey}
          onBack={() => { setDetailKey(null); setShowShowcase(true); }}
        />
      )}

      {/* Image popup */}
      <ImagePopup src={imagePopupSrc} onClose={() => setImagePopupSrc(null)} />

      <CustomCursor />
    </div>
  );
}
