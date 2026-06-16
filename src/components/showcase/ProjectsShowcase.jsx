import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { showcaseProjects } from '../../data/showcaseProjects';
import { playGlitchTransition } from '../../utils/glitchTransition';
import { lineMaskIn, riseIn } from '../../motion/reveal';
import { revealOnScroll, ScrollTrigger } from '../../motion/scroll';
import { magnetize } from '../../motion/magnetic';
import { prefersReducedMotion } from '../../motion/env';

const CARD_PARTS =
  '.card-titlebar, .card-num, .card-title, .card-meta, .card-desc, .card-view-btn, .card-coming-soon';

export default function ProjectsShowcase({ onClose, onViewProject }) {
  const [previewSrc, setPreviewSrc] = useState(showcaseProjects[0].thumbnail);
  const [fading, setFading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rightRef = useRef(null);
  const rootRef = useRef(null);

  // Entrance choreography: headline rises out of its box, then the support
  // copy and preview settle in on offset timing so it reads as designed.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const q = sel => root.querySelectorAll(sel);
    lineMaskIn(q('.showcase-title .reveal-line > span'), { stagger: 0.13, duration: 0.95 });
    riseIn(q('.showcase-subtitle'), { delay: 0.32, duration: 0.8 });
    riseIn(q('.showcase-categories span'), { delay: 0.42, stagger: 0.06, duration: 0.7 });
    riseIn(q('.preview-bar'), { delay: 0.5, y: 16, duration: 0.7 });
    riseIn(q('.preview-img-wrapper'), { delay: 0.46, y: 34, duration: 1 });
  }, []);

  // Scroll-triggered card reveals: each card's content staggers in as it
  // enters the scroll column, with timing varied per card so it reads
  // choreographed rather than mechanical.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const scroller = rightRef.current;
    if (!root || !scroller || prefersReducedMotion()) return;

    root.classList.add('js-reveal');
    const cards = root.querySelectorAll('.showcase-card');
    const triggers = [];
    cards.forEach((card, i) => {
      const st = revealOnScroll(card, card.querySelectorAll(CARD_PARTS), {
        scroller,
        start: 'top 78%',
        // Alternate the weight so consecutive cards don't feel identical.
        y: i % 2 ? 34 : 24,
        stagger: i % 2 ? 0.09 : 0.07,
        duration: 0.6 + (i % 3) * 0.07,
      });
      if (st) triggers.push(st);
    });

    ScrollTrigger.refresh();
    return () => {
      triggers.forEach(t => t.kill());
      root.classList.remove('js-reveal');
    };
  }, []);

  // Magnetic pull on the close button and the per-project view buttons.
  useEffect(
    () => magnetize(rootRef.current, '.showcase-back-btn, .card-view-btn', { strength: 0.3, max: 12 }),
    []
  );

  useEffect(() => {
    const right = rightRef.current;
    if (!right) return;

    right.querySelector('.showcase-card')?.classList.add('in-view');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          const thumb = entry.target.getAttribute('data-thumb');
          const idx = Number(entry.target.getAttribute('data-idx'));
          setActiveIndex(idx);
          setFading(true);
          setTimeout(() => {
            setPreviewSrc(thumb);
            setFading(false);
          }, 350);
        }
      });
    }, { root: right, threshold: 0.45 });

    right.querySelectorAll('.showcase-card').forEach(c => observer.observe(c));

    return () => observer.disconnect();
  }, []);

  function handleView(key) {
    playGlitchTransition(
      () => onViewProject(key),
      () => {}
    );
  }

  return (
    <div id="projects-showcase" ref={rootRef} style={{ display: 'flex' }}>
      <button className="showcase-back-btn" onClick={onClose}>&#x2715; CLOSE</button>

      <div className="showcase-left">
        <div className="showcase-header-text">
          <h1 className="showcase-title">
            <span className="reveal-line"><span>SELECTED</span></span>
            <span className="reveal-line"><span>WORKS</span></span>
          </h1>
          <div className="showcase-header-right">
            <p className="showcase-subtitle">
              featuring projects from 2025, including branding, UX, and development work.
            </p>
            <div className="showcase-categories">
              {['BRANDING', 'UX DESIGN', 'DEVELOPMENT', 'PORTFOLIO', 'PERSONAL'].map(c => (
                <span key={c}>{c}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="preview-bar">PREVIEW</div>
        <div className="preview-img-wrapper">
          <img
            id="showcase-preview-img"
            src={previewSrc}
            alt="Project Preview"
            className={fading ? 'fading' : ''}
          />
          {showcaseProjects[activeIndex]?.comingSoon && (
            <div className="preview-coming-soon">
              <span>COMING SOON</span>
            </div>
          )}
        </div>
      </div>

      <div className="showcase-dots">
        {showcaseProjects.map((p, i) => (
          <div key={p.key} className={`showcase-dot${i === activeIndex ? ' active' : ''}`} />
        ))}
      </div>

      <div className="showcase-right" id="showcase-right" ref={rightRef}>
        {showcaseProjects.map((p, i) => (
          <div key={p.key} className="showcase-card" data-key={p.key} data-thumb={p.thumbnail} data-idx={i}>
            <div className="card-inner">
              <div className="card-titlebar">
                <span>{p.title}</span>
                <span className="card-titlebar-arrow">&#x2197;</span>
              </div>
              <div className="card-body">
                <div className="card-num">{p.num}</div>
                <h2 className="card-title">{p.title}</h2>
                <div className="card-meta">
                  <span>{p.client}</span>
                  <span>{p.type}</span>
                  <span>{p.year}</span>
                </div>
                <p className="card-desc">{p.desc}</p>
                {p.comingSoon ? (
                  <span className="card-coming-soon">COMING SOON</span>
                ) : (
                  <button className="card-view-btn" onClick={() => handleView(p.key)}>
                    VIEW &#x2192;
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
