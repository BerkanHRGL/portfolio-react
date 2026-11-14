import AsciiImage from './AsciiImage';
import SectionHead from './SectionHead';

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
        <div className="about-text" data-reveal>
          <p className="about-lead">
            Hey, I&apos;m Berkan! I&apos;m a Media Design student from the Netherlands and I love
            making things that not only look good, but actually work well for people too.
          </p>
          <p>
            At Fontys I&apos;m learning everything about UX/UI design, front-end development and
            visual design. What I enjoy most is combining my creativity with technical skills to
            create projects that actually help people.
          </p>
          <p>
            Through my projects I&apos;ve learned that good design starts with good research. I
            like talking to real users to understand what they need, and I use those insights to
            make better designs.
          </p>
        </div>

        <aside className="about-side" data-reveal>
          <div className="portrait reveal-host" tabIndex={0}>
            <AsciiImage
              src="imgs/portrait.png"
              alt="Portrait of Berkan, drawn in ASCII characters"
              cols={64}
              ratio={1}
              flat
            />
          </div>
          <dl className="facts">
            {facts.map(fact => (
              <div key={fact.label}>
                <dt className="label">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      <div className="skills" data-reveal>
        {skills.map(skill => (
          <div key={skill.group}>
            <h3 className="label">{skill.group}</h3>
            <ul>
              {skill.items.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
