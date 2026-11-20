import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import AsciiImage from './AsciiImage';
import ProjectStage from './ProjectStage';
import SectionHead from './SectionHead';
import { showcaseProjects } from '../data/showcaseProjects';

const projects = showcaseProjects;
const STAGE_QUERY = '(min-width: 900px) and (prefers-reduced-motion: no-preference)';

function useMedia(query) {
  return useSyncExternalStore(
    onChange => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches
  );
}

const pad = n => String(n).padStart(2, '0');
const fileName = (project, i) => `${pad(i + 1)}_${project.type.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;

// Words slide up one after another each time the title changes.
function words(text) {
  return text.split(' ').flatMap((word, i) => [
    <span className="word" key={word + i}><span style={{ '--i': i }}>{word}</span></span>,
    ' ',
  ]);
}

/**
 * Wide screens: the section pins to the viewport while you scroll through it.
 * Every stretch of scroll selects the next project, and the ASCII screen dissolves to it.
 */
function Showcase() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const project = projects[active];

  useEffect(() => {
    const track = trackRef.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const progress = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
      setActive(Math.min(projects.length - 1, Math.floor(progress * projects.length)));
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

  function jumpTo(index) {
    const track = trackRef.current;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const span = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((index + 0.5) / projects.length) * span, behavior: 'smooth' });
  }

  const href = project.comingSoon ? undefined : `#/work/${project.key}`;
  const Screen = href ? 'a' : 'div';

  return (
    <div className="showcase" ref={trackRef} style={{ '--count': projects.length }}>
      <div className="stage">
        <div className="stage-info">
          <p className="label stage-count" aria-hidden="true">
            <span>{'█'.repeat(active + 1)}{'░'.repeat(projects.length - active - 1)}</span>
            {' '}{pad(active + 1)} / {pad(projects.length)}
          </p>

          <div className="stage-copy" key={project.key}>
            <p className="label">{project.type} / {project.year}</p>
            <h3>{words(project.title)}</h3>
            <p className="stage-desc">{project.desc}</p>
            {href ? (
              <a className="btn btn-primary" href={href} data-magnetic>
                Open case study <span aria-hidden="true">→</span>
              </a>
            ) : (
              <p className="label stage-soon">Case study coming soon</p>
            )}
          </div>

          <ol className="stage-index">
            {projects.map((item, i) => (
              <li key={item.key}>
                <button
                  type="button"
                  className="label"
                  aria-current={i === active ? 'true' : undefined}
                  onClick={() => jumpTo(i)}
                >
                  <span>{pad(i + 1)}</span>
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
        </div>

        <Screen className="stage-screen" href={href} tabIndex={href ? -1 : undefined} aria-hidden="true">
          <div className="frame-bar">
            <span>{fileName(project, active)}</span>
            <span>{project.thumbnail ? 'hover to view' : 'no preview yet'}</span>
          </div>
          <div className="stage-view">
            <ProjectStage projects={projects} active={active} />
            {project.thumbnail && (
              <img
                className={`stage-real${project.fit === 'contain' ? ' contain' : ''}`}
                src={project.thumbnail}
                alt=""
                decoding="async"
              />
            )}
          </div>
        </Screen>
      </div>
    </div>
  );
}

// Phones, tablets and reduced motion: plain cards, ASCII turning into the real image.
function Cards() {
  const ref = useRef(null);

  // The page-level reveal only sees what exists on load; these cards can also
  // appear later (window resized below the stage breakpoint), so they watch themselves.
  useEffect(() => {
    const items = ref.current.querySelectorAll('[data-reveal]:not(.in)');
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach(item => io.observe(item));
    return () => io.disconnect();
  }, []);

  return (
    <div className="cards" ref={ref}>
      {projects.map((project, i) => {
        const body = (
          <>
            <div className="card-media">
              <div className="frame-bar">
                <span>{fileName(project, i)}</span>
                <span>{project.comingSoon ? 'soon' : 'ascii'}</span>
              </div>
              {project.thumbnail ? (
                <AsciiImage src={project.thumbnail} fit={project.fit} flat={project.fit === 'contain'} />
              ) : (
                <div className="card-empty" aria-hidden="true"><span className="label">Coming soon</span></div>
              )}
            </div>
            <p className="label card-meta">{project.type} / {project.year}</p>
            <h3>
              {project.title}
              {!project.comingSoon && <span aria-hidden="true"> →</span>}
            </h3>
            <p className="card-desc">{project.desc}</p>
          </>
        );
        return project.comingSoon ? (
          <div className="card card-soon" key={project.key} data-reveal>{body}</div>
        ) : (
          <a className="card reveal-host" key={project.key} href={`#/work/${project.key}`} data-reveal>
            {body}
          </a>
        );
      })}
    </div>
  );
}

export default function Work() {
  const pinned = useMedia(STAGE_QUERY);

  return (
    <section className="section work" id="work">
      <div className="container">
        <SectionHead number="01" label="Work" title="Selected *projects*">
          Branding, UX research and front-end builds from my studies and my own time.
          Each one opens a full case study with the process behind it.
        </SectionHead>
      </div>
      <div className="container">
        {pinned ? <Showcase /> : <Cards />}
      </div>
    </section>
  );
}
