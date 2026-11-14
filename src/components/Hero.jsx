import AsciiBanner from './AsciiBanner';
import AsciiImage from './AsciiImage';
import Frame from './Frame';

// Each word sits in a clipped box so it can slide up into place on load.
function words(text, offset = 0) {
  return text.split(' ').flatMap((word, i) => [
    <span className="word" key={word + i}><span style={{ '--i': offset + i }}>{word}</span></span>,
    ' ',
  ]);
}

export default function Hero() {
  return (
    <section className="hero container" id="top">
      <AsciiBanner />

      <div className="hero-grid">
        <div className="hero-text">
          <p className="eyebrow">Media Design student @ Fontys, the Netherlands</p>
          <h1>
            {words('Design that looks good')}
            <em className="word"><span style={{ '--i': 4 }}>and</span></em>{' '}
            {words('works for the people using', 5)}
            <span className="word"><span style={{ '--i': 10 }}>it</span></span>
            <span className="cursor" aria-hidden="true">_</span>
          </h1>
          <p className="lead">
            I&apos;m Berkan Hergül. I combine UX/UI design, branding and front-end development,
            and I start every project by finding out what people actually need.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#work" data-scramble-hover>View my work</a>
            <a className="btn" href="#contact" data-scramble-hover>Get in touch</a>
          </div>
        </div>

        <div className="hero-side reveal-host" data-reveal>
          <Frame title="berkan.txt" hint="ascii" className="hero-portrait">
            <AsciiImage
              src="imgs/portrait.png"
              alt="Portrait of Berkan, drawn in ASCII characters"
              cols={64}
              ratio={1}
              flat
              eager
            />
          </Frame>
          <p className="status">
            <span className="status-dot" aria-hidden="true">●</span>
            Open to internships &amp; projects
          </p>
        </div>
      </div>
    </section>
  );
}
