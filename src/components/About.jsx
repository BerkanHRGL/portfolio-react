import Frame from './Frame';
import Rule from './Rule';
import SectionHead from './SectionHead';

const facts = [
  { label: 'Based in', value: 'The Netherlands' },
  { label: 'Studying', value: 'Media Design, Fontys' },
  { label: 'Focus', value: 'UX/UI & front-end' },
  { label: 'Looking for', value: 'Internships & projects' },
];

const skills = [
  { group: 'design', items: ['Figma', 'Photoshop', 'Illustrator', 'UI/UX design', 'Prototyping'] },
  { group: 'development', items: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'] },
  { group: 'research', items: ['User research', 'Interviews', 'A/B testing', 'Accessibility'] },
];

export default function About() {
  return (
    <section className="section container" id="about">
      <SectionHead number="02" label="about" title="A designer who also builds" />

      <div className="about-grid">
        <div className="about-text" data-reveal>
          <p>
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

        <div data-reveal>
          <Frame title="about.txt">
            <dl className="leaders">
              {facts.map(fact => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <Rule char="." />
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Frame>
        </div>
      </div>

      <div className="skills" data-reveal>
        {skills.map(skill => (
          <div key={skill.group} className="tree">
            <h3>{skill.group}/</h3>
            <ul>
              {skill.items.map((item, i) => (
                <li key={item}>
                  <span className="branch" aria-hidden="true">
                    {i === skill.items.length - 1 ? '└── ' : '├── '}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
