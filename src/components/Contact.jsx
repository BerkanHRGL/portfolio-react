import AsciiWave from './AsciiWave';
import Rule from './Rule';
import SectionHead from './SectionHead';

const EMAIL = 'berkanhergul@hotmail.com';

const links = [
  { label: 'Email', text: EMAIL, href: `mailto:${EMAIL}` },
  { label: 'LinkedIn', text: 'linkedin.com/in/berkanhergul', href: 'https://www.linkedin.com/in/berkanhergul/' },
  { label: 'GitHub', text: 'github.com/BerkanHRGL', href: 'https://github.com/BerkanHRGL' },
];

export default function Contact() {
  return (
    <section className="section container" id="contact">
      <SectionHead number="03" label="contact" title="Let's make something together">
        Got an internship, a project or a question about my work? Send me a message.
        I usually reply within 24 hours.
      </SectionHead>

      <div className="contact-grid" data-reveal>
        <ul className="leaders contact-links">
          {links.map(link => {
            const external = link.href.startsWith('http');
            return (
              <li key={link.label}>
                <span className="leader-label">{link.label}</span>
                <Rule char="." />
                <a
                  href={link.href}
                  {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {link.text}
                </a>
              </li>
            );
          })}
        </ul>
        <a className="btn btn-primary" href={`mailto:${EMAIL}`} data-scramble-hover>Send an email</a>
      </div>

      <AsciiWave />
    </section>
  );
}
