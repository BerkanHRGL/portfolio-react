import WindowFrame from './WindowFrame';
import { showcaseProjects } from '../data/showcaseProjects';

function Cover({ project }) {
  if (!project.thumbnail) {
    return <div className="cover cover-empty" aria-hidden="true">{project.title}</div>;
  }
  return (
    <img
      className={`cover${project.fit === 'contain' ? ' cover-contain' : ''}`}
      src={project.thumbnail}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}

function ProjectCard({ project, index }) {
  const number = String(index + 1).padStart(2, '0');
  const body = (
    <>
      <WindowFrame title={`${number} · ${project.type}`}>
        <Cover project={project} />
      </WindowFrame>
      <div className="card-text">
        <h3>
          {project.title}
          {!project.comingSoon && <span className="card-arrow" aria-hidden="true">→</span>}
        </h3>
        <p>{project.desc}</p>
        <p className="card-meta">
          {project.comingSoon ? 'Case study coming soon' : `${project.client} · ${project.year}`}
        </p>
      </div>
    </>
  );

  if (project.comingSoon) {
    return <div className="card card-soon" data-reveal>{body}</div>;
  }
  return (
    <a className="card" href={`#/work/${project.key}`} data-reveal>
      {body}
    </a>
  );
}

export default function Work() {
  return (
    <section className="section container" id="work">
      <header className="section-head" data-reveal>
        <p className="eyebrow">01 · Work</p>
        <h2>Selected projects</h2>
        <p className="section-intro">
          Branding, UX research and front-end builds from my studies and my own time.
          Each one opens a full case study with the process behind it.
        </p>
      </header>
      <div className="work-grid">
        {showcaseProjects.map((project, i) => (
          <ProjectCard key={project.key} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
