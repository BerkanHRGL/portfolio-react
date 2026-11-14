import { useEffect, useRef } from 'react';
import SectionHead from './SectionHead';
import { showcaseProjects } from '../data/showcaseProjects';

const openProjects = showcaseProjects.filter(project => !project.comingSoon);

function Thumb({ project, className }) {
  return (
    <img
      className={`${className}${project.fit === 'contain' ? ' contain' : ''}`}
      src={project.thumbnail}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}

export default function Work() {
  const listRef = useRef(null);
  const previewRef = useRef(null);

  // With a mouse, a preview card trails the pointer and shows the hovered project.
  // Touch screens get the thumbnails inline instead (see the CSS).
  useEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const items = [...preview.children];
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let active = -1;
    let raf = 0;

    const loop = () => {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      preview.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = active >= 0 ? requestAnimationFrame(loop) : 0;
    };
    const setActive = index => {
      if (index === active) return;
      active = index;
      items.forEach((item, i) => item.classList.toggle('on', i === index));
      preview.classList.toggle('on', index >= 0);
    };
    const hide = () => setActive(-1);
    const onMove = event => {
      const row = event.target.closest('[data-row]');
      if (!row) return hide();
      const { offsetWidth: w, offsetHeight: h } = preview;
      targetX = Math.min(event.clientX + 28, window.innerWidth - w - 16);
      targetY = Math.max(16, Math.min(event.clientY - h / 2, window.innerHeight - h - 16));
      if (active < 0) {
        x = targetX;
        y = targetY;
      }
      setActive(Number(row.dataset.row));
      if (!raf) raf = requestAnimationFrame(loop);
    };

    list.addEventListener('pointermove', onMove);
    list.addEventListener('pointerleave', hide);
    window.addEventListener('scroll', hide, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      list.removeEventListener('pointermove', onMove);
      list.removeEventListener('pointerleave', hide);
      window.removeEventListener('scroll', hide);
    };
  }, []);

  return (
    <section className="section container" id="work">
      <SectionHead number="01" label="Work" title="Selected projects">
        Branding, UX research and front-end builds from my studies and my own time.
        Each one opens a full case study with the process behind it.
      </SectionHead>

      <ol className="rows" ref={listRef}>
        {showcaseProjects.map((project, i) => {
          const number = String(i + 1).padStart(2, '0');
          const content = (
            <>
              {project.thumbnail && <Thumb project={project} className="row-thumb" />}
              <span className="row-num label">{number}</span>
              <span className="row-title">{project.title}</span>
              <span className="row-desc">{project.desc}</span>
              <span className="row-type label">{project.comingSoon ? 'Coming soon' : project.type}</span>
              <span className="row-year label">{project.year}</span>
              {!project.comingSoon && <span className="row-arrow" aria-hidden="true">↗</span>}
            </>
          );
          return (
            <li key={project.key} data-reveal>
              {project.comingSoon ? (
                <div className="row row-soon">{content}</div>
              ) : (
                <a className="row" href={`#/work/${project.key}`} data-row={openProjects.indexOf(project)}>
                  {content}
                </a>
              )}
            </li>
          );
        })}
      </ol>

      <div className="preview" ref={previewRef} aria-hidden="true">
        {openProjects.map(project => (
          <div className="preview-item" key={project.key}>
            <Thumb project={project} className="preview-img" />
            <p>{project.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
