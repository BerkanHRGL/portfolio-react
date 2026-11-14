const facts = [
  { label: 'Based in', value: 'The Netherlands' },
  { label: 'Studying', value: 'Media Design, Fontys University' },
  { label: 'Focus', value: 'UX/UI design & front-end' },
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
      <header className="section-head" data-reveal>
        <p className="eyebrow">02 · About</p>
        <h2>A designer who also builds</h2>
      </header>

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

        <dl className="facts" data-reveal>
          {facts.map(fact => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="skills" data-reveal>
        {skills.map(skill => (
          <div key={skill.group} className="skill-group">
            <h3>{skill.group}</h3>
            <ul>
              {skill.items.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
