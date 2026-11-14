import AsciiImage from './AsciiImage';
import Frame from './Frame';
import SectionHead from './SectionHead';
import { showcaseProjects } from '../data/showcaseProjects';

function ProjectCard({ project, index }) {
  const number = String(index + 1).padStart(2, '0');
  const fileName = `${number}_${project.type.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  const body = (
    <>
      <Frame title={fileName} hint={project.comingSoon ? 'soon' : 'ascii'}>
        {project.thumbnail ? (
          <AsciiImage src={project.thumbnail} fit={project.fit} flat={project.fit === 'contain'} />
        ) : (
          <div className="cover-empty" aria-hidden="true"><span>coming soon</span></div>
        )}
      </Frame>
      <div className="card-text">
        <h3>
          <span className="card-title">{project.title}</span>
          {!project.comingSoon && <span className="card-arrow" aria-hidden="true">-&gt;</span>}
        </h3>
        <p>{project.desc}</p>
        <p className="card-meta">
          {project.comingSoon ? 'Case study coming soon' : `${project.client} / ${project.year}`}
        </p>
      </div>
    </>
  );

  if (project.comingSoon) {
    return <div className="card card-soon" data-reveal>{body}</div>;
  }
  return (
    <a className="card reveal-host" href={`#/work/${project.key}`} data-reveal>
      {body}
    </a>
  );
}

export default function Work() {
  return (
    <section className="section container" id="work">
      <SectionHead number="01" label="work" title="Selected projects">
        Branding, UX research and front-end builds from my studies and my own time.
        Each one opens a full case study with the process behind it.
      </SectionHead>
      <div className="work-grid">
        {showcaseProjects.map((project, i) => (
          <ProjectCard key={project.key} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
