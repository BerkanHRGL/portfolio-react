import Window from '../Window';

export default function ContactWindow({ active, onClose, onFocus }) {
  return (
    <Window title="CONTACT" windowClassName="contact-window" active={active} onClose={onClose} onFocus={onFocus}>
      <div className="contact-header">
        <div className="contact-picture-section">
          <div className="contact-picture-frame">
            <img src="imgs/portrait.png" alt="Berkan Hergul" className="contact-picture" />
          </div>
          <div className="availability-status">● AVAILABLE</div>
        </div>
        <div className="contact-info-header">
          <h1 className="contact-name">LET&apos;S CONNECT!</h1>
          <div className="contact-subtitle">ALWAYS OPEN FOR NEW OPPORTUNITIES</div>
        </div>
      </div>

      <div className="contact-stats">
        {[
          { label: 'RESPONSE TIME', value: '24H' },
          { label: 'AVAILABILITY', value: 'OPEN' },
          { label: 'LOCATION', value: 'NL' },
          { label: 'TIME ZONE', value: 'GMT+2' },
        ].map(s => (
          <div key={s.label} className="contact-stat-item">
            <div className="contact-stat-label">{s.label}</div>
            <div className="contact-stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="contact-about-section">
        <h2 className="contact-section-title">WHY GET IN TOUCH?</h2>
        <p>I&apos;m always interested in new projects or internships, whether you have a question about my work, want to give feedback, or maybe collaborate on something cool, feel free to send me a message!</p>
        <p>I usually respond within 24 hours and I&apos;m always open to new opportunities to learn and grow in the media design world.</p>
      </div>

      <div className="contact-methods-section">
        <h2 className="contact-section-title">HOW TO REACH ME?</h2>
        {[
          { title: 'EMAIL', desc: 'BEST WAY FOR BUSINESS INQUIRIES', action: 'berkanhergul@hotmail.com', href: 'mailto:berkanhergul@hotmail.com' },
          { title: 'LINKEDIN', desc: 'FOR PROFESSIONAL NETWORKING', action: 'linkedin.com/in/berkanhergul', href: 'https://www.linkedin.com/in/berkanhergul/' },
          { title: 'GITHUB', desc: 'CHECK OUT MY CODE AND PROJECTS', action: 'github.com/BerkanHRGL', href: 'https://github.com/BerkanHRGL' },
        ].map(m => (
          <div key={m.title} className="contact-method contact-method-link" onClick={() => window.open(m.href, '_blank')}>
            <div className="method-info">
              <div className="method-title">{m.title}</div>
              <div className="method-description">{m.desc}</div>
              <div className="method-action">{m.action}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="looking-for-section">
        <h2 className="contact-section-title">WHAT AM I LOOKING FOR?</h2>
        <div className="opportunity-grid">
          {[
            { title: 'INTERNSHIP OPPORTUNITIES', desc: 'Looking for a cool internship where I can learn and contribute' },
            { title: 'FREELANCE PROJECTS', desc: 'Small projects where I can put my skills to good use' },
            { title: 'COLLABORATION', desc: 'Always open for creative collaborations with other designers' },
            { title: 'FEEDBACK', desc: 'Constructive feedback on my work is always welcome' },
          ].map(o => (
            <div key={o.title} className="opportunity-item">
              <div className="opportunity-title">{o.title}</div>
              <div className="opportunity-description">{o.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="contact-cta-section">
        <h2 className="contact-section-title">LET&apos;S MAKE SOMETHING COOL!</h2>
        <div className="cta-content">
          <p>Got a cool project, internship opportunity, or just want to chat about design? Send me a message!</p>
          <div className="cta-button-container">
            <button className="cta-button" onClick={() => window.location.href = 'mailto:berkanhergul@hotmail.com'}>
              SEND AN EMAIL
            </button>
          </div>
        </div>
      </div>
    </Window>
  );
}
