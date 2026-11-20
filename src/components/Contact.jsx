import SectionHead from './SectionHead';

const EMAIL = 'berkanhergul@hotmail.com';

const links = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/berkanhergul/' },
  { label: 'GitHub', href: 'https://github.com/BerkanHRGL' },
];

export default function Contact() {
  return (
    <section className="section container contact-section" id="contact">
      <SectionHead number="03" label="Contact" title="Let's make something together">
        Got an internship, a project or a question about my work? Send me a message.
        I usually reply within 24 hours.
      </SectionHead>

      <div className="contact" data-reveal>
        <p className="label contact-kicker">Write me at</p>
        <a className="contact-mail" href={`mailto:${EMAIL}`} data-scramble-hover>
          {EMAIL}<span className="contact-mail-arrow" aria-hidden="true"> ↗</span>
        </a>
        <ul className="contact-links">
          <li>
            <a className="btn btn-primary" href={`mailto:${EMAIL}`} data-magnetic>
              Send an email <span aria-hidden="true">↗</span>
            </a>
          </li>
          {links.map(link => (
            <li key={link.label}>
              <a className="btn" href={link.href} target="_blank" rel="noreferrer" data-magnetic>
                {link.label} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
