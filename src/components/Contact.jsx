const EMAIL = 'berkanhergul@hotmail.com';

const links = [
  { label: 'Email', text: EMAIL, href: `mailto:${EMAIL}` },
  { label: 'LinkedIn', text: 'linkedin.com/in/berkanhergul', href: 'https://www.linkedin.com/in/berkanhergul/' },
  { label: 'GitHub', text: 'github.com/BerkanHRGL', href: 'https://github.com/BerkanHRGL' },
];

export default function Contact() {
  return (
    <section className="section container" id="contact">
      <header className="section-head" data-reveal>
        <p className="eyebrow">03 · Contact</p>
        <h2>Let&apos;s make something together</h2>
        <p className="section-intro">
          Got an internship, a project or a question about my work? Send me a message.
          I usually reply within 24 hours.
        </p>
      </header>

      <div className="contact-grid" data-reveal>
        <a className="btn btn-primary btn-large" href={`mailto:${EMAIL}`}>Send an email</a>
        <ul className="contact-links">
          {links.map(link => {
            const external = link.href.startsWith('http');
            return (
              <li key={link.label}>
                <span className="contact-label">{link.label}</span>
                <a
                  href={link.href}
                  {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {link.text}
                  {external && <span aria-hidden="true"> ↗</span>}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
