import Window from '../Window';

export default function FullAboutWindow({ active, onClose, onFocus }) {
  return (
    <Window title="ABOUT ME" windowClassName="full-about-me-window" active={active} onClose={onClose} onFocus={onFocus}>
      <div className="profile-header">
        <div className="profile-picture-section">
          <div className="profile-picture-frame">
            <img src="imgs/portrait.png" alt="Berkan Hergul" className="profile-picture" />
          </div>
          <div className="online-status">● ONLINE</div>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">BERKAN HERGUL</h1>
          <div className="profile-title">MEDIA DESIGN STUDENT</div>
        </div>
      </div>

      <div className="profile-stats">
        {[
          { label: 'AGE', value: '21' },
          { label: 'LOCATION', value: 'NETHERLANDS' },
          { label: 'EDUCATION', value: 'FONTYS UNIVERSITY' },
          { label: 'STATUS', value: 'STUDENT' },
        ].map(s => (
          <div key={s.label} className="stat-item">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="about-section">
        <h2 className="section-title">ABOUT</h2>
        <p>Hey, I&apos;m Berkan! I&apos;m a Media Design student from the Netherlands and I love making things that not only look good, but actually work well for people too.</p>
        <p>At Fontys I&apos;m learning everything about UX/UI design, front-end development and visual design. What I enjoy most is combining my creativity with technical skills to create projects that actually help people.</p>
        <p>Through my projects I&apos;ve learned that good design starts with good research. I like talking to real users to understand what they need, and use those insights to make better designs.</p>
      </div>

      <div className="skills-section">
        <h2 className="section-title">SKILLS &amp; TOOLS</h2>
        <div className="skills-grid">
          <div className="skill-category">
            <h3>DESIGN</h3>
            <div className="skill-tags">
              {['FIGMA', 'PHOTOSHOP', 'ILLUSTRATOR', 'UI/UX DESIGN', 'PROTOTYPING'].map(s => (
                <span key={s} className="skill-tag">{s}</span>
              ))}
            </div>
          </div>
          <div className="skill-category">
            <h3>DEVELOPMENT</h3>
            <div className="skill-tags">
              {['HTML', 'CSS', 'JAVASCRIPT', 'REACT', 'VS CODE', 'GIT'].map(s => (
                <span key={s} className="skill-tag">{s}</span>
              ))}
            </div>
          </div>
          <div className="skill-category">
            <h3>RESEARCH</h3>
            <div className="skill-tags">
              {['USER RESEARCH', 'A/B TESTING', 'INTERVIEWS', 'ACCESSIBILITY'].map(s => (
                <span key={s} className="skill-tag">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="current-work-section">
        <h2 className="section-title">CURRENTLY WORKING ON</h2>
        <div className="work-item">
          <div className="work-title">📱 PROJECT X</div>
          <div className="work-description">Building an innovative media project using modern web technologies</div>
        </div>
        <div className="work-item">
          <div className="work-title">🎓 PORTFOLIO</div>
          <div className="work-description">Showcasing my journey as a media design student</div>
        </div>
      </div>

      <div className="contact-section">
        <h2 className="section-title">GET IN TOUCH</h2>
        <div className="contact-info">
          <div className="contact-item">📧 AVAILABLE FOR OPPORTUNITIES</div>
          <div className="contact-item">🌐 BASED IN THE NETHERLANDS</div>
          <div className="contact-item">💼 OPEN TO INTERNSHIPS &amp; PROJECTS</div>
        </div>
      </div>
    </Window>
  );
}
