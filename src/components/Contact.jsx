import SectionHead from './SectionHead';

const EMAIL = 'berkanhergul@hotmail.com';

const links = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/berkanhergul/' },
  { label: 'GitHub', href: 'https://github.com/BerkanHRGL' },
];

export default function Contact() {
  return (
    <section className="section container" id="contact">
      <SectionHead number="03" label="Contact" title="Let's make something together">
        Got an internship, a project or a question about my work? Send me a message.
        I usually reply within 24 hours.
      </SectionHead>

      <div className="contact" data-reveal>
        <a className="contact-mail" href={`mailto:${EMAIL}`}>
          {EMAIL} <span aria-hidden="true">↗</span>
        </a>
        <ul className="contact-links">
          {links.map(link => (
            <li key={link.label}>
              <a className="btn" href={link.href} target="_blank" rel="noreferrer">
                {link.label} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
