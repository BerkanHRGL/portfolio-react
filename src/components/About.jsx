import ParticleCanvas from './ParticleCanvas';
import SectionHead from './SectionHead';

const PORTRAIT = [{ image: 'imgs/portrait.png' }];

const facts = [
  { label: 'Based in', value: 'The Netherlands' },
  { label: 'Studying', value: 'Media Design, Fontys' },
  { label: 'Focus', value: 'UX/UI & front-end' },
  { label: 'Looking for', value: 'Internships & projects' },
];

const skills = [
  { group: 'Design', items: ['Figma', 'Photoshop', 'Illustrator', 'UI/UX design', 'Prototyping'] },
  { group: 'Development', items: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'] },
  { group: 'Research', items: ['User research', 'Interviews', 'A/B testing', 'Accessibility'] },
];

export default function About() {
  return (
    <section className="section container" id="about">
      <SectionHead number="02" label="About" title="A designer who also builds" />

      <div className="about-grid">
        <div className="about-text">
          <p className="about-lead" data-reveal>
            Hey, I&apos;m Berkan! I&apos;m a Media Design student from the Netherlands and I love
            making things that not only look good, but actually work well for people too.
          </p>
          <p data-reveal>
            At Fontys I&apos;m learning everything about UX/UI design, front-end development and
            visual design. What I enjoy most is combining my creativity with technical skills to
            create projects that actually help people.
          </p>
          <p data-reveal>
            Through my projects I&apos;ve learned that good design starts with good research. I
            like talking to real users to understand what they need, and I use those insights to
            make better designs.
          </p>
        </div>

        <aside className="about-side" data-reveal>
          <figure className="portrait">
            <figcaption className="frame-bar">
              <span>berkan.png</span>
              <span className="portrait-hint">move through me</span>
            </figcaption>
            <ParticleCanvas
              className="portrait-canvas"
              shapes={PORTRAIT}
              density={78}
              minFont={5}
              maxFont={9}
              dust={140}
              repel={0.55}
            />
            <span className="sr-only">Portrait of Berkan, drawn in moving characters</span>
          </figure>
          <dl className="facts">
            {facts.map(fact => (
              <div key={fact.label}>
                <dt className="label">{fact.label}</dt>
                <dd data-scramble>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      <div className="skills" data-reveal>
        {skills.map(skill => (
          <div key={skill.group}>
            <h3 className="label" data-scramble>{skill.group}</h3>
            <ul>
              {skill.items.map(item => (
                <li key={item} data-scramble data-scramble-hover>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
