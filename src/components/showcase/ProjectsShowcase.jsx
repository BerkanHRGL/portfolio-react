import { useEffect, useRef, useState } from 'react';
import { showcaseProjects } from '../../data/showcaseProjects';
import { playGlitchTransition } from '../../utils/glitchTransition';

export default function ProjectsShowcase({ onClose, onViewProject }) {
  const [previewSrc, setPreviewSrc] = useState(showcaseProjects[0].thumbnail);
  const [fading, setFading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rightRef = useRef(null);

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
    <div id="projects-showcase" style={{ display: 'flex' }}>
      <button className="showcase-back-btn" onClick={onClose}>&#x2715; CLOSE</button>

      <div className="showcase-left">
        <div className="showcase-header-text">
          <h1 className="showcase-title">SELECTED<br />WORKS</h1>
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
                <button className="card-view-btn" onClick={() => handleView(p.key)}>
                  VIEW &#x2192;
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
